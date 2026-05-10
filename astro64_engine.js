const DEG_PER_ARCHETYPE = 360 / 64;

const PLANETS = [
  { key: 'sun', label: '太陽', period: 365.256, lon0: 280.147, retro: false },
  { key: 'moon', label: '月', period: 27.321582, lon0: 218.316, retro: false },
  { key: 'mercury', label: '水星', period: 87.969, lon0: 252.251, retro: false },
  { key: 'venus', label: '金星', period: 224.701, lon0: 181.979, retro: false },
  { key: 'mars', label: '火星', period: 686.980, lon0: 355.433, retro: false },
  { key: 'jupiter', label: '木星', period: 4332.589, lon0: 34.351, retro: false },
  { key: 'saturn', label: '土星', period: 10759.22, lon0: 50.077, retro: false },
  { key: 'uranus', label: '天王星', period: 30685.4, lon0: 314.055, retro: false },
  { key: 'neptune', label: '海王星', period: 60190.0, lon0: 304.348, retro: false },
  { key: 'pluto', label: '冥王星', period: 90560.0, lon0: 238.929, retro: false }
];

function normDeg(v) {
  return ((v % 360) + 360) % 360;
}

function julianDay(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60;
  let yy = y;
  let mm = m;
  if (mm <= 2) {
    yy -= 1;
    mm += 12;
  }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + B - 1524.5 + h / 24;
}

function localBirthToUTC({ year, month, day, hour, minute, timezone }) {
  const utcMs = Date.UTC(year, month - 1, day, hour || 0, minute || 0) - (timezone || 0) * 60 * 60 * 1000;
  return new Date(utcMs);
}

function approxLongitude(planet, daysFromJ2000) {
  const motion = 360 / planet.period;
  return normDeg(planet.lon0 + motion * daysFromJ2000);
}

function longitudeToArchetype(lon, offset = 0) {
  const shifted = normDeg(lon - offset);
  const index = Math.floor(shifted / DEG_PER_ARCHETYPE);
  const line = Math.floor((shifted % DEG_PER_ARCHETYPE) / (DEG_PER_ARCHETYPE / 6)) + 1;
  return {
    number: index + 1,
    line: Math.min(6, Math.max(1, line)),
    shifted
  };
}

function computeAstro64(input) {
  const birthUTC = localBirthToUTC(input);
  const jd = julianDay(birthUTC);
  const days = jd - 2451545.0;
  const offset = Number(input.offset || 0);
  return PLANETS.map((planet) => {
    const lon = approxLongitude(planet, days);
    const gate = longitudeToArchetype(lon, offset);
    const word = ASTRO64_WORDS[gate.number - 1];
    const meaning = PLANET_MEANINGS[planet.key] || { label: planet.label, role: '' };
    return {
      key: planet.key,
      planet: meaning.label,
      role: meaning.role,
      longitude: lon,
      number: gate.number,
      line: gate.line,
      archetype: word.name,
      theme: word.theme,
      light: word.light,
      shadow: word.shadow
    };
  });
}

function formatDeg(v) {
  return `${normDeg(v).toFixed(2)}°`;
}

function buildAstroPrompt(input, rows) {
  const core = rows.slice(0, 7).map((r) =>
    `・${r.planet}：${r.number}.${r.line} ${r.archetype}（${r.role}） - ${r.theme}`
  ).join('\n');
  const deep = rows.slice(7).map((r) =>
    `・${r.planet}：${r.number}.${r.line} ${r.archetype} - ${r.theme}`
  ).join('\n');

  return `あなたはKITOKUの「64象意星読みAI」です。
これは天文計算式と黄道64分割ルールを使い、天体位置を64象意に照合して、自己理解・自己受容・行動指針に翻訳するための実験レポートです。
難しい専門用語ではなく、はじめて読む人にも伝わる、やさしく具体的な言葉で説明してください。
西洋的な星読みの表現は入口として使って構いませんが、最終的にはKITOKUの世界観（自分を知る・自分を愛する・自分で動く）に戻してください。

【出生情報】
${input.year}年${input.month}月${input.day}日 ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}
タイムゾーン：UTC${input.timezone >= 0 ? '+' : ''}${input.timezone}
出生地メモ：${input.place || '未入力'}

【KITOKU OSの星情報】
${input.kitokuData || '未入力。64象意のみで自己理解の入口として読んでください。'}

【64象意クロスチェック】
${core}

【深層天体】
${deep}

【出力してほしいこと】
1. まず一言で
この人をひとことで表すなら、どんな人か。

2. 自分を好きになるための読み解き
太陽・月・金星・火星を中心に、感情・好きなもの・行動パターンをやさしく説明してください。

3. KITOKU OSへの翻訳
64象意の結果をそのまま断定せず、九星気学・納音・傾斜・同会の結果と照合するときの見方を示してください。
「同じ方向を指している点」「補助的に見える点」「少し違う角度から見える点」に分けてください。
KITOKU OSの星情報が入力されている場合は、それを主役にして、64象意は補助レイヤーとして扱ってください。

4. 恋愛・仕事・人間関係での使い方
若い女性や初めて読む人にも伝わるように、日常の場面でどう活かせるかを具体例で出してください。

5. 今日からできる小さな一手
服・香り・言葉・休み方・人との距離感など、すぐできる行動を3つ提案してください。

6. 最後に一言
「自分で選ぶための判断材料」として、あたたかく締めてください。

【大切な姿勢】
断定しすぎず、占いとして当てにいくのではなく、自己理解の鏡として扱ってください。
KITOKU独自のやさしい言葉で説明してください。`;
}
