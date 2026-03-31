"use client";

import { useRef, useState } from "react";

type PlayAudioOptions = {
  src: string;
  onEndedAction?: () => void;
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");

  const endedActionRef = useRef<(() => void) | null>(null);

  const playAudio = async ({ src, onEndedAction }: PlayAudioOptions) => {
    if (!audioRef.current) return false;

    try {
      setAudioError("");

      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      endedActionRef.current = onEndedAction ?? null;

      audioRef.current.src = src;

      await audioRef.current.play();
      setIsPlaying(true);

      return true;
    } catch {
      setIsPlaying(false);
      endedActionRef.current = null;
      setAudioError("음성을 재생할 수 없습니다.");
      return false;
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    endedActionRef.current = null;
  };

  const handleEnded = () => {
    setIsPlaying(false);

    const action = endedActionRef.current;
    endedActionRef.current = null;

    if (action) {
      action();
    }
  };

  return {
    audioRef,
    isPlaying,
    audioError,
    playAudio,
    pauseAudio,
    resetAudio,
    handleEnded,
  };
}