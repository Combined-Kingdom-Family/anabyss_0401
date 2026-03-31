"use client";

import { useEffect } from "react";
import Button from "@/components/common/Button";
import { useExamSession } from "@/hooks/exam/useExamSession";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import Image from "next/image"

const AUDIO_SOURCES = {
  tenMinuteWarning: "/audio/reminding.mp3",
} as const;

function formatTime(seconds: number) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function ExamScreen() {
  const {
    questions,
    currentQuestion,
    currentIndex,
    answers,
    remainingSeconds,
    answeredCount,

    hasPlayedTenMinuteWarning,
    markTenMinuteWarningPlayed,

    isSubmitModalOpen,
    submitError,
    isSubmitting,
    isRestored,

    handleSelectAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    openSubmitModal,
    closeSubmitModal,
    handleSubmit,
  } = useExamSession();

  const {
    audioRef,
    audioError,
    playAudio,
    handleEnded,
  } = useAudioPlayer();

  // 10분 남았을 때 경고 음성 한 번 재생
  useEffect(() => {
    if (!isRestored) return;
    if (hasPlayedTenMinuteWarning) return;

    if (remainingSeconds <= 600) {
      markTenMinuteWarningPlayed();

      playAudio({
        src: AUDIO_SOURCES.tenMinuteWarning,
      });
    }
  }, [
    isRestored,
    remainingSeconds,
    hasPlayedTenMinuteWarning,
    markTenMinuteWarningPlayed,
    playAudio,
  ]);

  if (!isRestored) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center rounded-xl bg-white p-10 shadow">
        <p className="text-sm text-gray-600">시험 상태를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return <main className="p-10">문제를 불러오는 중입니다...</main>;
  }

  const isDangerTime = remainingSeconds <= 60;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

      <div className="flex items-center justify-between">
        <div
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            isDangerTime
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          남은 시간: {formatTime(remainingSeconds)}
        </div>

        <p className="text-sm text-gray-600">
          답안 수: {answeredCount}/{questions.length}
        </p>
      </div>

      {audioError ? (
        <p className="text-sm text-red-500">{audioError}</p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-red-500">{submitError}</p>
      ) : null}

      <div className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow">
        <p className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </p>

        <h2 className="text-lg font-semibold">{currentQuestion.questionText}</h2>

        {currentQuestion.imageUrl ? (
          <Image
            src={currentQuestion.imageUrl}
            alt={`question-${currentQuestion.id}`}
            className="max-h-80 rounded-lg object-contain"
            width={500}
            height={300}
          />
        ) : null}

        <div className="flex flex-col gap-3">
          {currentQuestion.choices.map((choice: string, index: number) => {
            const isSelected = answers[currentQuestion.id] === index;

            return (
              <button
                key={`${choice}-${index}`}
                type="button"
                onClick={() => handleSelectAnswer(index)}
                className={`rounded-lg border px-4 py-3 text-left ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                {index + 1}. {choice}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          className="bg-gray-500 hover:bg-gray-600"
          onClick={handlePrevQuestion}
          disabled={currentIndex === 0 || isSubmitting}
        >
          이전
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            onClick={handleNextQuestion}
            disabled={isSubmitting}
          >
            다음
          </Button>
        ) : (
          <Button
            type="button"
            onClick={openSubmitModal}
            disabled={isSubmitting}
          >
            제출하기
          </Button>
        )}
      </div>

      {isSubmitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">제출 확인</h2>
            <p className="mb-2">
              현재 {answeredCount} / {questions.length} 문항에 답했습니다.
            </p>
            <p className="mb-6">정말 제출하시겠습니까?</p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="bg-gray-500 hover:bg-gray-600"
                onClick={closeSubmitModal}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                제출하기
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}