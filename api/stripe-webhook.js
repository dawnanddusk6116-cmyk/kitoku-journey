/* /api/stripe-webhook.js
   Stripeからの通知を受けて subscribers.base_status を更新する。

   重要：署名検証には「生のリクエストボディ」が必要なため、
   Vercelの自動JSONパースを bodyParser:false で無効化している。

   扱うイベント：
     checkout.session.completed        決済完了 → active
     customer.subscription.updated     更新・解約予約・支払い失敗 → 状態を反映
     customer.subscription.deleted     解約確定 → canceled
     invoice.payment_failed            支払い失敗 → past_due */

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

/* Stripeの購読ステータスを、アプリ側の base_status に翻訳する */
function toBaseStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due';
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired') return 'canceled';
  return 'none';
}

function periodEndISO(sub) {
  if (sub && sub.current_period_end) {
    return new Date(sub.current_period_end * 1000).toISOString();
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end('Method Not Allowed'); return; }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;

  /* ── 1. 署名検証 ── */
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      raw,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error('webhook signature error:', e.message);
    res.status(400).send('Webhook Error: ' + e.message);
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  /* user_id を特定する。metadata → client_reference_id → customer_id の順に探す */
  async function resolveUserId(obj, sub) {
    if (obj && obj.metadata && obj.metadata.supabase_user_id) return obj.metadata.supabase_user_id;
    if (sub && sub.metadata && sub.metadata.supabase_user_id) return sub.metadata.supabase_user_id;
    if (obj && obj.client_reference_id) return obj.client_reference_id;

    const customerId = (obj && obj.customer) || (sub && sub.customer) || null;
    if (customerId) {
      const r = await supabase
        .from('subscribers')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (r && r.data && r.data.user_id) return r.data.user_id;
    }
    return null;
  }

  async function applyStatus(userId, patch) {
    if (!userId) { console.error('user_id を特定できませんでした:', event.type); return; }
    patch.updated_at = new Date().toISOString();
    const r = await supabase.from('subscribers').update(patch).eq('user_id', userId);
    if (r && r.error) console.error('supabase update error:', r.error.message);
  }

  /* ── 2. イベント処理 ── */
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const userId = await resolveUserId(session, sub);
        await applyStatus(userId, {
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: sub.id,
          base_status: toBaseStatus(sub.status),
          base_period_end: periodEndISO(sub)
        });
      }

    } else if (event.type === 'customer.subscription.updated' ||
               event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = await resolveUserId(sub, sub);
      const status = (event.type === 'customer.subscription.deleted')
        ? 'canceled'
        : toBaseStatus(sub.status);
      await applyStatus(userId, {
        stripe_subscription_id: sub.id,
        base_status: status,
        base_period_end: periodEndISO(sub)
      });

    } else if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object;
      let sub = null;
      if (inv.subscription) {
        try { sub = await stripe.subscriptions.retrieve(inv.subscription); } catch (e) {}
      }
      const userId = await resolveUserId(inv, sub);
      await applyStatus(userId, { base_status: 'past_due' });
    }

    res.status(200).json({ received: true });

  } catch (e) {
    /* 500を返すとStripeが自動で再送してくれる */
    console.error('webhook handling error:', e);
    res.status(500).json({ error: 'handler failed' });
  }
};
