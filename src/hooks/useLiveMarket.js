/**
 * useLiveMarket — simulates a live market feed with tick-by-tick price action.
 * Builds OHLC candles in real-time from a synthetic price stream.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SYMBOLS } from '@/lib/signalEngine';

// Seeded PRNG for reproducible starting conditions
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function round(n, d) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

// Build historical candles seeded from current 5-min window
function buildHistoricalCandles(symbol, count = 120) {
  const meta = SYMBOLS[symbol];
  const seed = Math.floor(Date.now() / (5 * 60 * 1000)) + symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const candles = [];
  let price = meta.base * (1 + (rng() - 0.5) * 0.004);
  const intervalMs = 60 * 1000; // 1-min candles by default

  for (let i = count; i >= 1; i--) {
    const t = Date.now() - i * intervalMs;
    const open = price;
    const drift = (rng() - 0.48) * meta.base * 0.0015;
    const close = open + drift;
    const range = Math.abs(drift) * (1 + rng() * 2);
    const high = Math.max(open, close) + rng() * range * 0.6;
    const low = Math.min(open, close) - rng() * range * 0.6;
    const vol = Math.floor(rng() * 8000 + 500);
    candles.push({ t, o: round(open, meta.digits), h: round(high, meta.digits), l: round(low, meta.digits), c: round(close, meta.digits), v: vol });
    price = close;
  }
  return candles;
}

export function useLiveMarket(symbol) {
  const meta = SYMBOLS[symbol] || SYMBOLS['EURUSD'];
  const [candles, setCandles] = useState(() => buildHistoricalCandles(symbol));
  const [currentCandle, setCurrentCandle] = useState(null);
  const [tick, setTick] = useState({ bid: meta.base, ask: meta.base + meta.pip * 1.2, change: 0, changePct: 0, high24: meta.base, low24: meta.base, volume: 0 });
  const [isLive, setIsLive] = useState(true);

  const priceRef = useRef(meta.base);
  const candleRef = useRef(null);
  const openTimeRef = useRef(Date.now());
  const baselineRef = useRef(meta.base);
  const totalVolRef = useRef(0);
  const high24Ref = useRef(meta.base * 1.002);
  const low24Ref = useRef(meta.base * 0.998);

  // Reset when symbol changes
  useEffect(() => {
    const m = SYMBOLS[symbol] || SYMBOLS['EURUSD'];
    const hist = buildHistoricalCandles(symbol);
    const lastClose = hist[hist.length - 1].c;

    priceRef.current = lastClose;
    baselineRef.current = lastClose;
    candleRef.current = null;
    openTimeRef.current = Date.now();
    totalVolRef.current = 0;
    high24Ref.current = lastClose * 1.003;
    low24Ref.current = lastClose * 0.997;

    setCandles(hist);
    setCurrentCandle(null);
    setTick({
      bid: lastClose,
      ask: lastClose + m.pip * 1.2,
      change: 0,
      changePct: 0,
      high24: lastClose * 1.003,
      low24: lastClose * 0.997,
      volume: 0,
    });
  }, [symbol]);

  // Tick generator — fires every 500ms
  useEffect(() => {
    if (!isLive) return;
    const m = SYMBOLS[symbol] || SYMBOLS['EURUSD'];

    const interval = setInterval(() => {
      // Price walk with mean reversion
      const momentum = (Math.random() - 0.495) * m.base * 0.0008;
      const reversion = (baselineRef.current - priceRef.current) * 0.002;
      priceRef.current = round(priceRef.current + momentum + reversion, m.digits);

      const price = priceRef.current;
      const spread = m.pip * (1 + Math.random() * 0.4);
      const vol = Math.floor(Math.random() * 300 + 50);
      totalVolRef.current += vol;

      // Track 24h range
      high24Ref.current = Math.max(high24Ref.current, price);
      low24Ref.current = Math.min(low24Ref.current, price);

      const change = round(price - baselineRef.current, m.digits);
      const changePct = round((change / baselineRef.current) * 100, 3);

      setTick({
        bid: price,
        ask: round(price + spread, m.digits),
        change,
        changePct,
        high24: round(high24Ref.current, m.digits),
        low24: round(low24Ref.current, m.digits),
        volume: totalVolRef.current,
      });

      // Build/update current candle (1-min candles)
      const now = Date.now();
      const elapsed = now - openTimeRef.current;

      if (!candleRef.current) {
        candleRef.current = {
          t: openTimeRef.current,
          o: price, h: price, l: price, c: price, v: vol,
        };
      } else {
        candleRef.current = {
          ...candleRef.current,
          h: Math.max(candleRef.current.h, price),
          l: Math.min(candleRef.current.l, price),
          c: price,
          v: candleRef.current.v + vol,
        };
      }

      setCurrentCandle({ ...candleRef.current });

      // Close candle every 60 seconds
      if (elapsed >= 60000) {
        const closed = { ...candleRef.current };
        setCandles(prev => [...prev.slice(-199), closed]);
        candleRef.current = { t: now, o: price, h: price, l: price, c: price, v: vol };
        openTimeRef.current = now;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [symbol, isLive]);

  const toggleLive = useCallback(() => setIsLive(v => !v), []);

  // Combined candles (history + forming current candle)
  const allCandles = currentCandle ? [...candles, currentCandle] : candles;

  return { candles: allCandles, tick, isLive, toggleLive, meta };
}