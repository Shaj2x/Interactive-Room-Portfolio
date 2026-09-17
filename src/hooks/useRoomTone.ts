import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Room tone: soft rain plus a distant low hum. Off by default and only ever
 * started by a click, which is both the brief's requirement and what browser
 * autoplay policy allows.
 *
 * Synthesised with the Web Audio API rather than shipped as an mp3 — a loop
 * long enough not to sound like a loop is a megabyte, and this is a few
 * hundred bytes of code. Filtered white noise is a convincing rain bed.
 */
export function useRoomTone() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const build = useCallback(() => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // --- Rain: two seconds of white noise, looped and low-passed. ---------
    const frames = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.4;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.16;

    // Slow swell so the rain breathes instead of sitting flat.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(rainGain.gain);

    noise.connect(rainFilter).connect(rainGain).connect(master);

    // --- Distant hum: a quiet low sine, the building's HVAC. --------------
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 58;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.022;
    hum.connect(humGain).connect(master);

    noise.start();
    lfo.start();
    hum.start();

    ctxRef.current = ctx;
    gainRef.current = master;
    return master;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((was) => {
      const next = !was;
      const master = gainRef.current ?? build();
      const ctx = ctxRef.current;
      if (!master || !ctx) return was;
      if (ctx.state === 'suspended') void ctx.resume();
      // Ramp, never a step — a gain step is an audible click.
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(next ? 0.5 : 0, ctx.currentTime, next ? 0.6 : 0.35);
      return next;
    });
  }, [build]);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
      gainRef.current = null;
    };
  }, []);

  return { enabled, toggle };
}
