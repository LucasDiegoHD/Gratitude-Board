"use client";

import { useEffect, useRef } from "react";

export function useSounds() {
  const audioCtx = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
         audioCtx.current = new AudioContext();
      }
    }
  }, []);

  const playPop = () => {
    if (!audioCtx.current) return;
    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.current.currentTime + 0.1);

    gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.current.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.2);
  };

  const playCrumple = () => {
    if (!audioCtx.current) return;
    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }

    const duration = 0.35;
    const bufferSize = audioCtx.current.sampleRate * duration; 
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Ruído branco puro e contido (sem clipping digital, estritamente entre -1 e 1)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;

    // Filtro passa-alta forte (apenas frequências agudas = som de papel fino e crocante)
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 3500;

    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
    
    // Simular 5 a 6 "estalos" sucessivos da folha amassando (envelopes super rápidos)
    let t = audioCtx.current.currentTime;
    for (let i = 0; i < 6; i++) {
      gain.gain.setValueAtTime(0, t);
      // Ataque instantâneo
      gain.gain.linearRampToValueAtTime(1, t + 0.005);
      // Decaimento rápido
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      // Espaçamento aleatório até o próximo vinco do papel
      t += 0.04 + (Math.random() * 0.03);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);

    noise.start();
    noise.stop(audioCtx.current.currentTime + duration);
  };

  return { playPop, playCrumple };
}
