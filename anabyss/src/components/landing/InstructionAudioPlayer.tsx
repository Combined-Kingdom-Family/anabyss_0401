"use client";

import { useRef } from "react";
import Button from "@/components/common/Button";

export default function InstructionAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    audioRef.current?.play();
  };

  return (
    <div className="flex flex-col gap-2">
      <audio ref={audioRef} src="/audio/guide.mp3" preload="metadata" />
      <Button type="button" onClick={handlePlay}>
        시험 안내 음성 재생
      </Button>
    </div>
  );
}