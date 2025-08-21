"use client";

import { useCallback, useEffect, useRef } from "react";

type Opts = { volume?: number };

export function useToneSfx(opts?: Opts) {
  const volumeRef = useRef(opts?.volume ?? 0.9);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    volumeRef.current = opts?.volume ?? 0.9;
  }, [opts?.volume]);

  function ensureCtx(): AudioContext {
    let ctx = ctxRef.current;
    if (!ctx) {
      // @ts-expect-error webkit
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function envGain(ctx: AudioContext, t0: number, durMs: number, peak: number) {
    const g = ctx.createGain();
    const attack = 0.006;
    const release = Math.min(0.10, Math.max(0.05, (durMs / 1000) * 0.8));
    const t1 = t0 + durMs / 1000;

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t0 + attack);
    g.gain.setValueAtTime(peak, t1 - release);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);

    return { node: g, t1 };
  }

  function scheduleTone(
    ctx: AudioContext,
    { t0, durMs, freq, type = "triangle", gainMul = 1, glideToHz }: {
      t0: number; durMs: number; freq: number; type?: OscillatorType; gainMul?: number; glideToHz?: number;
    }
  ) {
    const osc = ctx.createOscillator();
    const { node: gain, t1 } = envGain(ctx, t0, durMs, (volumeRef.current || 1) * gainMul);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideToHz && glideToHz > 0) {
      osc.frequency.exponentialRampToValueAtTime(glideToHz, t1 - 0.02);
    }
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }

  function scheduleSparkle(ctx: AudioContext, t0: number, durMs: number, baseHz: number) {
    scheduleTone(ctx, { t0, durMs, freq: baseHz * 2, type: "sine", gainMul: 0.15 });
    scheduleTone(ctx, { t0, durMs, freq: baseHz * 3, type: "sine", gainMul: 0.08 });
  }

  function noiseBurst(ctx: AudioContext, t0: number, durMs: number, gainMul = 0.06) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * (durMs / 1000)));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;

    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volumeRef.current)) * gainMul;

    src.connect(hp).connect(gain).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + durMs / 1000 + 0.01);
  }

  /** ✅ Chime brillante tipo “coin/ding” */
  const playOk = useCallback(() => {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const n1 = 1318.51, n2 = 1661.22, n3 = 1975.53;
    noiseBurst(ctx, now, 22, 0.08);
    scheduleTone(ctx, { t0: now + 0.00, durMs: 90,  freq: n1, type: "triangle", gainMul: 1.0, glideToHz: n1 * 1.05 });
    scheduleSparkle(ctx, now + 0.00, 90, n1);
    scheduleTone(ctx, { t0: now + 0.075, durMs: 95, freq: n2, type: "triangle", gainMul: 0.95, glideToHz: n2 * 1.04 });
    scheduleSparkle(ctx, now + 0.075, 95, n2);
    scheduleTone(ctx, { t0: now + 0.150, durMs: 120, freq: n3, type: "triangle", gainMul: 0.9,  glideToHz: n3 * 1.03 });
    scheduleSparkle(ctx, now + 0.150, 120, n3);
  }, []);

  /** Buzz corto para error */
  const playErr = useCallback(() => {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    scheduleTone(ctx, { t0: now + 0.00, durMs: 140, freq: 180, type: "square", gainMul: 0.9 });
    scheduleTone(ctx, { t0: now + 0.10, durMs: 130, freq: 140, type: "square", gainMul: 0.9 });
  }, []);

  return { playOk, playErr };
}
