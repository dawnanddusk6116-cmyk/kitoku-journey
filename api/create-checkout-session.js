/* /api/create-checkout-session.js
   プレミアム（ベース ¥500/月）のStripe Checkoutを開始する。
   - Supabaseのログイントークンを検証し、本人であることを確認してから発行する
   - subscribers に stripe_customer_id があれば再利用（顧客の二重作成を防ぐ）
   - client_reference_id / metadata に user_id を載せ、Webhook側で紐付けられるようにする */

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const PRICE_BASE = process.env.STRIPE_PRICE_BASE || 'price_1Toj6NFdxjILAghEv1wnIzbZ';
const SITE_URL   = 'https://journey6112.jp';
const ALLOW_ORIGINS = ['https://journey6112.jp', 'https://www.journey6112.jp'];

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOW_ORIGINS.indexOf(origin) >= 0) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  try {
    /* ── 1. ログイントークンの検証 ── */
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      res.status(401).json({ error: 'ログインが必要です。' });
      return;
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const userRes = await supabase.auth.getUser(token);
    const user = userRes && userRes.data ? userRes.data.user : null;
    if (!user || !user.id) {
      res.status(401).json({ error: 'ログイン情報を確認できませんでした。もう一度ログインしてください。' });
      return;
    }

    /* ── 2. 既存の加入状態と顧客IDを確認 ── */
    const rowRes = await supabase
      .from('subscribers')
      .select('stripe_customer_id, base_status')
      .eq('user_id', user.id)
      .maybeSingle();

    const row = rowRes && rowRes.data ? rowRes.data : null;

    if (row && row.base_status === 'active') {
      res.status(409).json({ error: 'すでにプレミアム会員です。' });
      return;
    }

    let customerId = row && row.stripe_customer_id ? row.stripe_customer_id : null;

    /* ── 3. Stripe顧客の用意 ── */
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;

      await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email || null,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    /* ── 4. Checkout セッションを作成 ── */
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: PRICE_BASE, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: {
        metadata: { supabase_user_id: user.id }
      },
      metadata: { supabase_user_id: user.id },
      locale: 'ja',
      allow_promotion_codes: true,
      success_url: SITE_URL + '/premium.html?checkout=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  SITE_URL + '/premium.html?checkout=cancel'
    });

    res.status(200).json({ url: session.url });

  } catch (e) {
    console.error('create-checkout-session error:', e);
    res.status(500).json({ error: '決済ページを開けませんでした。時間をおいてもう一度お試しください。' });
  }
};
