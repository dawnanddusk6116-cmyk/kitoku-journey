/* /api/create-portal-session.js
   Stripeカスタマーポータルを開く。
   ユーザー自身が解約・カード変更・請求書の確認をできるようにするためのもの。
   （Y理論：囲い込まず、いつでも自分で降りられるようにしておく）

   - Supabaseのログイントークンを検証してから発行する
   - 自分の stripe_customer_id のポータルしか開けない */

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const SITE_URL = 'https://www.journey6112.jp';
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

    /* ── 2. 本人の顧客IDを取得 ── */
    const rowRes = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const customerId = rowRes && rowRes.data ? rowRes.data.stripe_customer_id : null;
    if (!customerId) {
      res.status(404).json({ error: 'お支払い情報が見つかりませんでした。' });
      return;
    }

    /* ── 3. ポータルセッションを作成 ── */
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      locale: 'ja',
      return_url: SITE_URL + '/premium.html'
    });

    res.status(200).json({ url: session.url });

  } catch (e) {
    console.error('create-portal-session error:', e);
    res.status(500).json({ error: 'お支払い情報の画面を開けませんでした。時間をおいてもう一度お試しください。' });
  }
};
