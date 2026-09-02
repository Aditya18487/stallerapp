import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';

const PAD = { top: 24, right: 72, bottom: 32, left: 8 };

function round(n, d) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

export default function CandlestickChart({ candles = [], signal, fib, srLevels, width = 800, height = 400 }) {
  const canvasRef = useRef(null);
  const [hover, setHover] = useState(null); // { x, y, candle }

  const chartData = useMemo(() => {
    if (!candles.length) return null;
    const visible = candles.slice(-100);
    let maxP = Math.max(...visible.map(c => c.h));
    let minP = Math.min(...visible.map(c => c.l));
    if (signal) {
      maxP = Math.max(maxP, signal.tp, signal.sl, signal.entry);
      minP = Math.min(minP, signal.tp, signal.sl, signal.entry);
    }
    const pad = (maxP - minP) * 0.1;
    return { visible, maxP: maxP + pad, minP: minP - pad };
  }, [candles, signal]);

  const getCoords = useCallback((chartData, w, h) => {
    if (!chartData) return null;
    const { visible, maxP, minP } = chartData;
    const chartW = w - PAD.left - PAD.right;
    const chartH = h - PAD.top - PAD.bottom;
    const candleW = Math.max(2, chartW / visible.length - 1.5);
    const priceToY = p => PAD.top + ((maxP - p) / (maxP - minP)) * chartH;
    const idxToX = i => PAD.left + (i / visible.length) * chartW + candleW / 2;
    return { chartW, chartH, candleW, priceToY, idxToX, visible, maxP, minP };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const c = getCoords(chartData, width, height);
    if (!c) return;
    const { chartW, chartH, candleW, priceToY, idxToX, visible, maxP, minP } = c;

    // Background
    ctx.fillStyle = 'hsl(222,47%,4%)';
    ctx.fillRect(0, 0, width, height);

    // Grid
    for (let i = 0; i <= 6; i++) {
      const y = PAD.top + (i / 6) * chartH;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
      const price = maxP - (i / 6) * (maxP - minP);
      ctx.fillStyle = 'rgba(150,165,185,0.55)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(fmtPrice(price), width - PAD.right + 4, y + 3);
    }

    // Vertical grid (time)
    const step = Math.max(1, Math.floor(visible.length / 8));
    for (let i = 0; i < visible.length; i += step) {
      const x = idxToX(i);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, height - PAD.bottom); ctx.stroke();
      const d = new Date(visible[i].t);
      ctx.fillStyle = 'rgba(130,145,165,0.5)';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`, x, height - PAD.bottom + 12);
    }

    // Fib OTE zone
    if (fib) {
      const y1 = priceToY(fib.oteTop);
      const y2 = priceToY(fib.oteBottom);
      ctx.fillStyle = 'rgba(0,230,230,0.06)';
      ctx.fillRect(PAD.left, Math.min(y1, y2), chartW, Math.abs(y2 - y1));
      [{ y: y1, label: '0.500' }, { y: y2, label: '0.705' }].forEach(({ y, label }) => {
        ctx.strokeStyle = 'rgba(0,230,230,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,230,230,0.6)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Fib ${label}`, width - PAD.right + 2, y + 3);
      });
    }

    // S/R Levels
    if (srLevels) {
      srLevels.forEach(sr => {
        const y = priceToY(sr.price);
        if (y < PAD.top || y > height - PAD.bottom) return;
        const color = sr.type === 'resistance' ? 'rgba(248,113,113,0.45)' : 'rgba(52,211,153,0.45)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Signal zones
    if (signal && signal.side !== 'WAIT') {
      const entryY = priceToY(signal.entry);
      const slY = priceToY(signal.sl);
      const tpY = priceToY(signal.tp);

      // Risk zone
      ctx.fillStyle = 'rgba(248,113,113,0.05)';
      ctx.fillRect(PAD.left, Math.min(entryY, slY), chartW, Math.abs(slY - entryY));
      // Reward zone
      ctx.fillStyle = 'rgba(52,211,153,0.05)';
      ctx.fillRect(PAD.left, Math.min(entryY, tpY), chartW, Math.abs(tpY - entryY));

      [
        { y: entryY, color: 'rgba(255,255,255,0.85)', label: 'ENTRY' },
        { y: slY, color: 'rgba(248,113,113,0.9)', label: 'SL' },
        { y: tpY, color: 'rgba(52,211,153,0.9)', label: 'TP' },
      ].forEach(({ y, color, label }) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - PAD.right + 2, y - 2);
      });
    }

    // Candles
    visible.forEach((cd, i) => {
      const x = idxToX(i);
      const openY = priceToY(cd.o);
      const closeY = priceToY(cd.c);
      const highY = priceToY(cd.h);
      const lowY = priceToY(cd.l);
      const isBull = cd.c >= cd.o;
      const bodyColor = isBull ? '#34d399' : '#f87171';

      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, highY); ctx.lineTo(x, lowY); ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillStyle = isBull ? 'rgba(52,211,153,0.85)' : 'rgba(248,113,113,0.85)';
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);

      // Highlight last (forming) candle
      if (i === visible.length - 1) {
        ctx.strokeStyle = isBull ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - candleW / 2 - 1, bodyTop - 1, candleW + 2, bodyH + 2);
      }
    });

    // Current price line
    if (visible.length > 0) {
      const last = visible[visible.length - 1];
      const y = priceToY(last.c);
      const isBull = last.c >= last.o;
      ctx.strokeStyle = isBull ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
      ctx.setLineDash([]);

      // Current price badge
      const priceLabel = fmtPrice(last.c);
      const badgeW = priceLabel.length * 7 + 8;
      ctx.fillStyle = isBull ? '#34d399' : '#f87171';
      ctx.beginPath();
      ctx.roundRect(width - PAD.right + 2, y - 8, badgeW, 16, 3);
      ctx.fill();
      ctx.fillStyle = 'hsl(222,47%,4%)';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceLabel, width - PAD.right + 5, y + 3);
    }

    // Crosshair
    if (hover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(hover.x, PAD.top); ctx.lineTo(hover.x, height - PAD.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, hover.y); ctx.lineTo(width - PAD.right, hover.y); ctx.stroke();
      ctx.setLineDash([]);

      // Price label on axis
      const hoverPrice = maxP - ((hover.y - PAD.top) / chartH) * (maxP - minP);
      const label = fmtPrice(hoverPrice);
      ctx.fillStyle = 'rgba(180,190,210,0.9)';
      ctx.beginPath();
      ctx.roundRect(width - PAD.right + 2, hover.y - 7, label.length * 7 + 8, 14, 3);
      ctx.fill();
      ctx.fillStyle = 'hsl(222,47%,4%)';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, width - PAD.right + 5, hover.y + 3);
    }

  }, [candles, signal, fib, srLevels, width, height, chartData, hover, getCoords]);

  const handleMouseMove = useCallback((e) => {
    if (!chartData) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const c = getCoords(chartData, width, height);
    if (!c) return;
    const { idxToX, visible, priceToY, maxP, minP, chartH } = c;
    const chartW = width - PAD.left - PAD.right;

    // Find nearest candle
    const idx = Math.round(((x - PAD.left) / chartW) * visible.length - 0.5);
    const candle = visible[Math.max(0, Math.min(visible.length - 1, idx))];

    setHover({ x, y, candle });
  }, [chartData, width, height, getCoords]);

  const handleMouseLeave = useCallback(() => setHover(null), []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* OHLCV tooltip */}
      {hover?.candle && (
        <div
          className="absolute top-2 left-2 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/70 border border-border/60 backdrop-blur-sm text-[11px] font-mono pointer-events-none"
        >
          {[
            { label: 'O', value: hover.candle.o, color: 'text-foreground' },
            { label: 'H', value: hover.candle.h, color: 'text-bullish' },
            { label: 'L', value: hover.candle.l, color: 'text-bearish' },
            { label: 'C', value: hover.candle.c, color: hover.candle.c >= hover.candle.o ? 'text-bullish' : 'text-bearish' },
            { label: 'V', value: hover.candle.v, color: 'text-muted-foreground' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-muted-foreground">{label}</span>
              <span className={color}>{label === 'V' ? value?.toLocaleString() : fmtPrice(value)}</span>
            </div>
          ))}
          <span className="text-muted-foreground/60">
            {hover.candle.t ? new Date(hover.candle.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      )}
    </div>
  );
}

function fmtPrice(p) {
  if (!p && p !== 0) return '—';
  return p > 10000 ? p.toFixed(2) : p > 100 ? p.toFixed(2) : p > 10 ? p.toFixed(3) : p.toFixed(5);
}