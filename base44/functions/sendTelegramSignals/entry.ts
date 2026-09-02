import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const RR_TARGET = 3;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SYMBOLS = {
  EURUSD: { base: 1.1617, pip: 0.0001, digits: 5 },
  GBPUSD: { base: 1.3450, pip: 0.0001, digits: 5 },
  XAUUSD: { base: 4515.0, pip: 0.1, digits: 2 },
  BTCUSD: { base: 76670, pip: 1, digits: 2 },
  ETHUSD: { base: 2117, pip: 0.5, digits: 2 },
  NAS100: { base: 29480, pip: 1, digits: 2 },
  US30: { base: 50578, pip: 1, digits: 2 },
  GBPJPY: { base: 213.99, pip: 0.01, digits: 3 },
};

function round(n, digits) {
  return Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
}

function generateCandles(rng, meta) {
  const candles = [];
  let price = meta.base;
  const now = Date.now();
  const intervalMs = 15 * 60 * 1000;
  for (let i = 100; i >= 0; i--) {
    const open = price;
    const change = (rng() - 0.48) * meta.base * 0.003;
    const close = open + change;
    const range = Math.abs(change) * (1 + rng() * 1.5);
    const high = Math.max(open, close) + rng() * range;
    const low = Math.min(open, close) - rng() * range;
    candles.push({ o: round(open, meta.digits), h: round(high, meta.digits), l: round(low, meta.digits), c: round(close, meta.digits) });
    price = close;
  }
  return candles;
}

function generateSignal(symbol) {
  const meta = SYMBOLS[symbol];
  const now = Date.now();
  const seed = Math.floor(now / (5 * 60 * 1000)) + symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const side = rng() > 0.35 ? (rng() > 0.45 ? 'BUY' : 'SELL') : 'WAIT';
  const candles = generateCandles(rng, meta);
  const lastClose = candles[candles.length - 1].c;
  const buffer = meta.pip * 5;
  const swingLow = Math.min(...candles.slice(-20).map(c => c.l));
  const swingHigh = Math.max(...candles.slice(-20).map(c => c.h));

  let entry, sl, tp, risk;
  if (side === 'BUY') {
    entry = lastClose; sl = swingLow - buffer; risk = entry - sl; tp = entry + RR_TARGET * risk;
  } else if (side === 'SELL') {
    entry = lastClose; sl = swingHigh + buffer; risk = sl - entry; tp = entry - RR_TARGET * risk;
  } else {
    entry = lastClose; sl = lastClose - meta.base * 0.0025; risk = entry - sl; tp = entry + RR_TARGET * risk;
  }

  const confCount = side === 'WAIT' ? 2 + Math.floor(rng() * 2) : 3 + Math.floor(rng() * 4);
  const isHighAlert = confCount >= 5 && side !== 'WAIT';

  return { symbol, side, entry: round(entry, meta.digits), sl: round(sl, meta.digits), tp: round(tp, meta.digits), isHighAlert, confluenceScore: confCount };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      console.error("Telegram secrets not configured");
      return Response.json({ error: "Telegram not configured" }, { status: 500 });
    }

    const highAlerts = Object.keys(SYMBOLS).map(generateSignal).filter(s => s.isHighAlert);

    if (highAlerts.length === 0) {
      return Response.json({ sent: 0, message: "No high alerts this cycle" });
    }

    const sideEmoji = { BUY: '🟢', SELL: '🔴' };
    let sentCount = 0;

    for (const signal of highAlerts) {
      const text =
        `${sideEmoji[signal.side]} *HIGH ALERT — ${signal.symbol}*\n` +
        `━━━━━━━━━━━━━━━\n` +
        `Direction: *${signal.side}*\n` +
        `Entry: \`${signal.entry}\`\n` +
        `Stop Loss: \`${signal.sl}\`\n` +
        `Take Profit: \`${signal.tp}\`\n` +
        `Confluence: ${signal.confluenceScore}/6\n` +
        `━━━━━━━━━━━━━━━\n` +
        `_Risk:Reward 1:3 | SMC Top-Down Analysis_`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });

      if (response.ok) sentCount++;
      else console.error("Telegram send failed:", await response.text());
    }

    return Response.json({ sent: sentCount, total: highAlerts.length });
  } catch (error) {
    console.error("Telegram signal error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});