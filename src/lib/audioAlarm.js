/**
 * PrimeTrade Audible Alert System
 * Uses Web Audio API for high-alert signal alarm
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * HIGH-ALERT: loud, long, repeated 3-pulse siren-like alarm (~2.1 seconds)
 */
export function playHighAlertBeep() {
  try {
    const ctx = getAudioContext();

    // Three rising sweeps, each with a sharp attack and tail — total ~2.1s
    const pulses = [
      { startFreq: 700,  endFreq: 1400, time: 0,    duration: 0.55 },
      { startFreq: 700,  endFreq: 1400, time: 0.75,  duration: 0.55 },
      { startFreq: 700,  endFreq: 1600, time: 1.50,  duration: 0.6  },
    ];

    pulses.forEach(({ startFreq, endFreq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime + time);
      osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + time + duration);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + time + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + time + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + time + duration);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration + 0.02);
    });
  } catch (e) {
    console.warn('Audio alarm failed:', e);
  }
}

/**
 * NORMAL SIGNAL: short clean double-beep
 * BUY = ascending two-note, SELL = descending two-note
 */
export function playSignalBeep(side) {
  try {
    const ctx = getAudioContext();

    const isBuy = side === 'BUY';
    const notes = isBuy
      ? [{ freq: 520, time: 0 }, { freq: 780, time: 0.18 }]
      : [{ freq: 780, time: 0 }, { freq: 520, time: 0.18 }];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + time + 0.14);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.16);
    });
  } catch (e) {
    console.warn('Audio alarm failed:', e);
  }
}