"use client";

import { useEffect } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { useExamSession } from "@/hooks/exam/useExamSession";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

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

  const { audioRef, audioError, playAudio, handleEnded } = useAudioPlayer();

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
      <main className="min-h-screen bg-[#F1F3FB] px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[75rem] items-center justify-center border border-black bg-[#eef2f9] px-6 py-10">
          <p className="text-sm text-gray-700 sm:text-base">
            시험 상태를 불러오는 중입니다...
          </p>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-[#F1F3FB] px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[75rem] items-center justify-center border border-black bg-[#eef2f9] px-6 py-10">
          <p className="text-sm text-gray-700 sm:text-base">
            문제를 불러오는 중입니다...
          </p>
        </div>
      </main>
    );
  }

  const isDangerTime = remainingSeconds <= 60;
  const selectedAnswer = answers[currentQuestion.id];

  return (
    <>
      <main className="min-h-screen bg-[#F1F3FB] px-3 py-3 sm:px-5 sm:py-5">
        <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

        <div className="mx-auto w-full max-w-[75rem]">
          <section className="relative min-h-[calc(100vh-1.5rem)] border border-black bg-[#EEF2F9] px-[4.5%] py-[4.5%]">
            {/* 상단 상태 바 */}
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div
                className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold sm:text-base ${
                  isDangerTime
                    ? "border-red-700 bg-red-100 text-red-700"
                    : "border-black bg-white/70 text-black"
                }`}
              >
                남은 시간: {formatTime(remainingSeconds)}
              </div>
            </div>

            {/* 제목 */}
            <header className="mb-8 text-center sm:mb-10">
              <h1 className="font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-black tracking-[-0.04em] text-black [text-shadow:0_0_0.5px_rgba(0,0,0,0.8)]">
                검불시 영역
              </h1>
            </header>

            {/* 구분선 */}
            <div className="mb-8 border-t border-black sm:mb-10" />

            {/* 에러 */}
            {(audioError || submitError) && (
              <div className="mb-6 space-y-1">
                {audioError ? (
                  <p className="text-sm text-red-600">{audioError}</p>
                ) : null}
                {submitError ? (
                  <p className="text-sm text-red-600">{submitError}</p>
                ) : null}
              </div>
            )}

            {/* 문제 본문 */}
            <div className="mx-auto w-full max-w-[62rem]">
              <div className="mb-8 text-[clamp(1.2rem,1.8vw,1.5rem)] font-medium leading-[2.0] text-black sm:mb-10">
                <p>
                  {currentIndex + 1}. {currentQuestion.questionText}
                </p>
              </div>

                {/* 이미지 영역 */}
                {currentQuestion.imageUrl ? (
                  <div className="mb-8 border border-black bg-transparent sm:mb-10">
                    <div className="relative aspect-[16/9] min-h-[14rem] w-full sm:min-h-[18rem] lg:min-h-[22rem]">
                      <Image
                        src={currentQuestion.imageUrl}
                        alt={`question-${currentQuestion.id}`}
                        fill
                        className="object-contain p-3 sm:p-4"
                        sizes="(max-width: 768px) 100vw, 900px"
                      />
                    </div>
                  </div>
                ) : null}

                {/* 보기 */}
                <div className="space-y-4 sm:space-y-5">
                  {currentQuestion.choices.map((choice: string, index: number) => {
                    const isSelected = selectedAnswer === index;

                    return (
                    <button
                      key={`${choice}-${index}`}
                      type="button"
                      onClick={() => handleSelectAnswer(index)}
                      disabled={isSubmitting}
                      className={`flex w-full items-start gap-4 rounded-xl px-4 py-3 text-left sm:gap-5 `}
                    >
                      {/* 동그라미 */}
                      <span
                        className={`mt-[0.05em] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-semibold sm:h-11 sm:w-11 transition ${
                          isSelected
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-black bg-transparent text-black"
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* 텍스트 */}
                      <span className="pt-[0.08em] text-[clamp(1.15rem,1.6vw,1.35rem)] font-medium leading-[1.85]">
                        {choice}
                      </span>
                    </button>
                    );
                  })}
                </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="mt-10 flex flex-col items-center gap-5 sm:mt-12">
              <div className="flex w-full max-w-[62rem] items-center justify-between gap-3">
                <Button
                  type="button"
                  className="rounded-full border-[1.5px] border-black bg-transparent px-5 py-2 text-[clamp(1rem,1.35vw,1.15rem)] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5"
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0 || isSubmitting}
                >
                  이전
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="button"
                    className="rounded-full border-[1.5px] border-black bg-transparent px-5 py-2 text-[clamp(1rem,1.35vw,1.15rem)] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5"
                    onClick={handleNextQuestion}
                    disabled={isSubmitting}
                  >
                    다음
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-full border-[1.5px] border-blue-700 bg-blue-700 px-5 py-2 text-[clamp(1rem,1.35vw,1.15rem)] font-semibold text-white transition-colors duration-150 hover:bg-blue-800 hover:border-blue-800 disabled:opacity-40"
                    onClick={openSubmitModal}
                    disabled={isSubmitting}
                  >
                    제출하기
                  </Button>
                )}
              </div>

              {/* 페이지 표시 */}
              <div className="flex items-center justify-center">
                <div className="relative flex h-12 w-24 items-center justify-between border-[1.5px] border-black bg-transparent px-3 text-[1.2rem] font-medium">
                  <span className="relative z-10 -translate-y-[0.18rem]">
                    {currentIndex + 1}
                  </span>
                  <span className="relative z-10 translate-y-[0.18rem]">
                    {questions.length}
                  </span>

                  <span className="absolute inset-0">
                    <svg
                      viewBox="0 0 100 50"
                      className="h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="50"
                        x2="100"
                        y2="0"
                        stroke="black"
                        strokeWidth="1"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 제출 모달 */}
      {isSubmitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold sm:text-xl">제출 확인</h2>
            <p className="mb-2 text-sm text-gray-700 sm:text-base">
              현재 {answeredCount} / {questions.length} 문항에 답했습니다.
            </p>
            <p className="mb-6 text-sm text-gray-700 sm:text-base">
              정말 제출하시겠습니까?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="rounded-full border-[1.5px] border-black bg-transparent px-5 py-2 text-[clamp(1rem,1.35vw,1.15rem)] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5"
                onClick={closeSubmitModal}
              >
                취소
              </Button>
              <Button
                type="button"
                className="rounded-full border border-black bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                제출하기
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}