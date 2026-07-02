import { createClient } from '@supabase/supabase-js';

// ── 許可するオリジン（journey6112.jp本体と、テスト用のVercelプレビューURL）
const ALLOWED_ORIGINS = [
  'https://journey6112.jp',
  'https://www.journey6112.jp',
  'https://kitoku-journey.vercel.app'
];

// ── 機能ごとの必要プラン設定
// 'free'     = 誰でも無料で使える
// 'base'     = ベースプレミアム(¥500/月)以上が必要
// 'business' = KITOKU for BUSINESS会員が必要
// ※ ここに載っていない機能名（feature未指定含む）は安全側に倒して 'free' として扱う
const FEATURE_POLICY = {
  // premium.html
  'kigaku_chat': 'base',
  'kigaku_quote': 'free',

  // business.html（候補者理解・組織編成系のAIレポート）
  'business_candidate': 'business',
  'business_leader_member': 'business',
  'business_core_support': 'business',
  'business_partner': 'business',

  // relations.html
  'relations_ai': 'base',

  // 今後接続予定（Phase③で順次追加）
  'life_rename': 'base',
  'mindmap_work': 'base',
  'scent_ai': 'base',
  'astro64_ai': 'base',

  // チーム作り機能
  'team_building_base': 'base',
  'team_building_business': 'business'
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── ユーザーのプラン確認
async function checkAccess(requiredTier, authHeader) {
  if (requiredTier === 'free') return { ok: true };

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, reason: 'no_token' };
  }
  const token = authHeader.replace('Bearer ', '');

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, reason: 'invalid_token' };
  }

  const { data: sub } = await supabase
    .from('subscribers')
    .select('base_status, business_status')
    .eq('user_id', userData.user.id)
    .single();

  if (!sub) return { ok: false, reason: 'not_subscribed' };

  if (requiredTier === 'base') {
    if (sub.base_status === 'active' || sub.business_status === 'active') {
      return { ok: true };
    }
  }
  if (requiredTier === 'business') {
    if (sub.business_status === 'active') {
      return { ok: true };
    }
  }
  return { ok: false, reason: 'not_subscribed' };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
  }

  const { prompt, feature } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  // ── プレミアム判定
  const requiredTier = FEATURE_POLICY[feature] || 'free';
  const access = await checkAccess(requiredTier, req.headers.authorization);
  if (!access.ok) {
    return res.status(402).json({
      error: 'premium_required',
      reason: access.reason,
      requiredTier
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Anthropic API error',
        status: response.status,
        body: text
      });
    }
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
