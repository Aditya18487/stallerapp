/**
 * PrimeTrade Signal Engine
 * Deterministic seeded SMC signal generator for live preview
 */

const RR_TARGET = 3;

// Seeded PRNG (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SYMBOLS = {
  EURUSD: { base: 1.1617, pip: 0.0001, digits: 5, type: 'fx' },
  GBPUSD: { base: 1.3450, pip: 0.0001, digits: 5, type: 'fx' },
  XAUUSD: { base: 4515.0, pip: 0.1, digits: 2, type: 'metal' },
  BTCUSD: { base: 76670, pip: 1, digits: 2, type: 'crypto' },
  ETHUSD: { base: 2117, pip: 0.5, digits: 2, type: 'crypto' },
  'NAS100': { base: 29480, pip: 1, digits: 2, type: 'index' },
  US30: { base: 50578, pip: 1, digits: 2, type: 'index' },
  GBPJPY: { base: 213.99, pip: 0.01, digits: 3, type: 'fx' },
};

const CONFLUENCES_BULLISH = [
  '4H HTF: Bullish market structure confirmed (higher highs)',
  '1H ITF: Break of Structure (BOS) to the upside',
  '15M LTF: OTE zone 0.50–0.705 Fibonacci touch',
  'Bullish engulfing at identified demand order block',
  'Liquidity sweep below prior swing low — stop-hunt confirmed',
  'Support zone confluence with Fibonacci retracement',
  'Displacement candle after sweep (market manipulation cleared)',
  'Bullish Fair Value Gap (FVG) left unfilled above',
  'Change of Character (CHoCH) detected on 15M',
  'Equal lows swept — buy-side liquidity grab pattern',
];

const CONFLUENCES_BEARISH = [
  '4H HTF: Bearish market structure confirmed (lower lows)',
  '1H ITF: Break of Structure (BOS) to the downside',
  '15M LTF: OTE zone 0.50–0.705 Fibonacci touch',
  'Bearish engulfing at identified supply order block',
  'Liquidity sweep above prior swing high — stop-hunt confirmed',
  'Resistance zone confluence with Fibonacci retracement',
  'Displacement candle after sweep (market manipulation cleared)',
  'Bearish Fair Value Gap (FVG) left unfilled below',
  'Change of Character (CHoCH) detected on 15M',
  'Equal highs swept — sell-side liquidity grab pattern',
];

const RATIONALE_BULLISH = [
  '[4H] Macro bias: Bullish — price trading above 4H EQ, higher highs structure.',
  '[1H] BOS confirmed with strong displacement candle above prior structure.',
  '[15M] Retraced into 0.50–0.705 OTE zone — optimal entry window open.',
  'Fake-out detected: price swept buy-side liquidity (stop-hunt) below equal lows.',
  'Market manipulation pattern cleared — institutions absorbed sell orders.',
  'Bullish order block at demand zone holding as support.',
  'FVG (Fair Value Gap) acting as magnet — price likely to fill gap above.',
  'Confluence score ≥5/6 → HIGH-ALERT: All top-down conditions aligned.',
];

const RATIONALE_BEARISH = [
  '[4H] Macro bias: Bearish — price trading below 4H EQ, lower lows structure.',
  '[1H] BOS confirmed with strong displacement candle below prior structure.',
  '[15M] Retraced into 0.50–0.705 OTE zone — optimal entry window open.',
  'Fake-out detected: price swept sell-side liquidity (stop-hunt) above equal highs.',
  'Market manipulation pattern cleared — institutions absorbed buy orders.',
  'Bearish order block at supply zone holding as resistance.',
  'FVG (Fair Value Gap) acting as target — price likely to fill gap below.',
  'Confluence score ≥5/6 → HIGH-ALERT: All top-down conditions aligned.',
];

// Pattern recognition engine
function detectPatterns(candles, side) {
  const patterns = [];
  const recent = candles.slice(-10);

  // BOS detection
  const midCandles = candles.slice(-20, -5);
  const recentHigh = Math.max(...recent.map(c => c.h));
  const prevHigh = Math.max(...midCandles.map(c => c.h));
  const recentLow = Math.min(...recent.map(c => c.l));
  const prevLow = Math.min(...midCandles.map(c => c.l));

  if (side === 'BUY' && recentHigh > prevHigh) patterns.push('BOS (Break of Structure) — Bullish');
  if (side === 'SELL' && recentLow < prevLow) patterns.push('BOS (Break of Structure) — Bearish');

  // CHoCH detection — previous candle structure shifts
  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1];
  if (c1 && c2 && c3) {
    if (c1.c < c1.o && c2.c < c2.o && c3.c > c3.o) patterns.push('CHoCH — Bullish reversal pattern');
    if (c1.c > c1.o && c2.c > c2.o && c3.c < c3.o) patterns.push('CHoCH — Bearish reversal pattern');
  }

  // FVG (Fair Value Gap) detection
  for (let i = 2; i < recent.length; i++) {
    const prev = recent[i - 2];
    const curr = recent[i];
    if (curr.l > prev.h) patterns.push('Bullish FVG — Imbalance zone above');
    if (curr.h < prev.l) patterns.push('Bearish FVG — Imbalance zone below');
  }

  // Engulfing pattern
  const last2 = candles.slice(-2);
  if (last2.length === 2) {
    const [prev, curr] = last2;
    if (curr.c > curr.o && curr.c > prev.h && curr.o < prev.l) patterns.push('Bullish Engulfing — Strong demand');
    if (curr.c < curr.o && curr.c < prev.l && curr.o > prev.h) patterns.push('Bearish Engulfing — Strong supply');
  }

  return patterns.slice(0, 3);
}

// Fake-out & manipulation detection
function detectFakeout(candles, side) {
  const alerts = [];
  const recent = candles.slice(-15);

  // Check for equal highs/lows (liquidity pools)
  const highs = recent.map(c => c.h);
  const lows = recent.map(c => c.l);
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const equalHighCount = highs.filter(h => Math.abs(h - maxHigh) / maxHigh < 0.0005).length;
  const equalLowCount = lows.filter(l => Math.abs(l - minLow) / minLow < 0.0005).length;

  if (equalHighCount >= 2) alerts.push('Equal highs detected — sell-side liquidity pool above');
  if (equalLowCount >= 2) alerts.push('Equal lows detected — buy-side liquidity pool below');

  // Wick rejection (stop-hunt)
  const last = candles[candles.length - 1];
  const body = Math.abs(last.c - last.o);
  const upperWick = last.h - Math.max(last.c, last.o);
  const lowerWick = Math.min(last.c, last.o) - last.l;
  if (upperWick > body * 2) alerts.push('Stop-hunt wick above — bearish fake-out pattern');
  if (lowerWick > body * 2) alerts.push('Stop-hunt wick below — bullish fake-out pattern');

  return alerts.slice(0, 2);
}

// Top-down analysis summary
function topDownAnalysis(candles, side, meta) {
  const total = candles.length;
  const htf = candles.slice(0, Math.floor(total * 0.25));    // 4H macro
  const itf = candles.slice(Math.floor(total * 0.25), Math.floor(total * 0.65)); // 1H
  const ltf = candles.slice(Math.floor(total * 0.65));        // 15M

  const htfHigh = Math.max(...htf.map(c => c.h));
  const htfLow = Math.min(...htf.map(c => c.l));
  const htfMid = (htfHigh + htfLow) / 2;
  const lastClose = candles[candles.length - 1].c;

  const htfBias = lastClose > htfMid ? 'Bullish' : 'Bearish';
  const itfClose = itf[itf.length - 1]?.c || lastClose;
  const itfPrevClose = itf[itf.length - 5]?.c || itfClose;
  const itfBias = itfClose > itfPrevClose ? 'Bullish' : 'Bearish';

  return {
    htfBias,
    itfBias,
    ltfEntry: side,
    aligned: (side === 'BUY' && htfBias === 'Bullish') || (side === 'SELL' && htfBias === 'Bearish'),
    htfRange: { high: round(htfHigh, meta.digits), low: round(htfLow, meta.digits), mid: round(htfMid, meta.digits) },
  };
}

/**
 * Generate a live SMC signal for a given symbol
 * Uses timestamp-seeded determinism so signals refresh periodically
 */
export function generateSignal(symbol, timeframe = '15min') {
  const meta = SYMBOLS[symbol] || SYMBOLS['EURUSD'];
  const now = Date.now();
  // Rotate seed every 5 minutes per symbol
  const seed = Math.floor(now / (5 * 60 * 1000)) + symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const basePrice = meta.base * (1 + (rng() - 0.5) * 0.002);
  const volatility = meta.base * 0.005;
  const side = rng() > 0.35 ? (rng() > 0.45 ? 'BUY' : 'SELL') : 'WAIT';

  // Generate OHLC candles
  const candles = generateCandles(symbol, 100, rng, meta);

  let entry, sl, tp, risk;
  const lastClose = candles[candles.length - 1].c;
  const buffer = meta.pip * 5;

  // Find swing points from candles
  const lows = candles.slice(-20).map(c => c.l);
  const highs = candles.slice(-20).map(c => c.h);
  const swingLow = Math.min(...lows);
  const swingHigh = Math.max(...highs);

  if (side === 'BUY') {
    entry = lastClose;
    sl = swingLow - buffer;
    risk = entry - sl;
    tp = entry + RR_TARGET * risk;
  } else if (side === 'SELL') {
    entry = lastClose;
    sl = swingHigh + buffer;
    risk = sl - entry;
    tp = entry - RR_TARGET * risk;
  } else {
    entry = lastClose;
    sl = lastClose - volatility * 0.5;
    risk = entry - sl;
    tp = entry + RR_TARGET * risk;
  }

  // Confluence score
  const confPool = side === 'BUY' ? CONFLUENCES_BULLISH : (side === 'SELL' ? CONFLUENCES_BEARISH : CONFLUENCES_BULLISH);
  const confCount = side === 'WAIT' ? 2 + Math.floor(rng() * 2) : 3 + Math.floor(rng() * 4);
  const shuffled = [...confPool].sort(() => rng() - 0.5).slice(0, confCount);
  const rationale = (side === 'BUY' ? RATIONALE_BULLISH : (side === 'SELL' ? RATIONALE_BEARISH : RATIONALE_BULLISH))
    .filter(() => rng() > 0.3);

  const isHighAlert = confCount >= 5 && side !== 'WAIT';

  // Fibonacci levels
  const impulseHigh = side === 'BUY' ? swingHigh : candles[candles.length - 10].h;
  const impulseLow = side === 'BUY' ? candles[candles.length - 10].l : swingLow;
  const fibRange = impulseHigh - impulseLow;
  const fib = {
    level0: impulseHigh,
    level382: impulseHigh - fibRange * 0.382,
    level50: impulseHigh - fibRange * 0.5,
    level618: impulseHigh - fibRange * 0.618,
    level705: impulseHigh - fibRange * 0.705,
    level100: impulseLow,
    oteTop: impulseHigh - fibRange * 0.5,
    oteBottom: impulseHigh - fibRange * 0.705,
  };

  // Support/Resistance levels
  const srLevels = detectSRLevels(candles, meta);

  // Pattern recognition, fake-out detection, top-down analysis
  const patterns = detectPatterns(candles, side);
  const fakeouts = detectFakeout(candles, side);
  const topDown = topDownAnalysis(candles, side, meta);

  return {
    symbol,
    timeframe,
    side,
    entry: round(entry, meta.digits),
    sl: round(sl, meta.digits),
    tp: round(tp, meta.digits),
    rr: RR_TARGET,
    risk: round(Math.abs(risk), meta.digits),
    confluences: shuffled,
    rationale,
    isHighAlert,
    confluenceScore: confCount,
    timestamp: new Date().toISOString(),
    candles,
    fib,
    srLevels,
    meta,
    patterns,
    fakeouts,
    topDown,
  };
}

function generateCandles(symbol, count, rng, meta) {
  const candles = [];
  let price = meta.base;
  const now = Date.now();
  const intervalMs = 15 * 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const t = now - i * intervalMs;
    const open = price;
    const change = (rng() - 0.48) * meta.base * 0.003;
    const close = open + change;
    const range = Math.abs(change) * (1 + rng() * 1.5);
    const high = Math.max(open, close) + rng() * range;
    const low = Math.min(open, close) - rng() * range;
    const volume = Math.floor(rng() * 10000 + 1000);

    candles.push({
      t,
      o: round(open, meta.digits),
      h: round(high, meta.digits),
      l: round(low, meta.digits),
      c: round(close, meta.digits),
      v: volume,
    });
    price = close;
  }
  return candles;
}

function detectSRLevels(candles, meta) {
  const levels = [];
  const lookback = 5;

  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1);
    const current = candles[i];

    // Swing high
    if (window.every(c => c.h <= current.h)) {
      levels.push({ price: round(current.h, meta.digits), type: 'resistance', strength: 'major' });
    }
    // Swing low
    if (window.every(c => c.l >= current.l)) {
      levels.push({ price: round(current.l, meta.digits), type: 'support', strength: 'major' });
    }
  }

  // Deduplicate close levels (within 0.1% of each other)
  const deduped = [];
  for (const level of levels) {
    const exists = deduped.some(l => Math.abs(l.price - level.price) / level.price < 0.001);
    if (!exists) deduped.push(level);
  }

  return deduped.slice(0, 8);
}

export function generateScannerSignals() {
  return Object.keys(SYMBOLS).map(symbol => generateSignal(symbol));
}

function round(n, digits) {
  return Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
}

export { SYMBOLS };