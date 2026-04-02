"use client";

import { useEffect } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { useExamSession } from "@/hooks/exam/useExamSession";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const AUDIO_SOURCES = {
  tenMinuteWarning: "/audio/reminding.mp3",
  end: "/audio/end.mp3", 
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

    if (remainingSeconds == 1) {

      playAudio({
        src: AUDIO_SOURCES.end,
      });
    }

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
      <main className="min-h-screen bg-[#F1F3FB] px-2 py-2 sm:px-5 sm:py-5">
        <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

        <div className="mx-auto w-full max-w-[75rem]">
          <section className="relative border border-black bg-[#EEF2F9] px-[3.5%] py-[3.5%] sm:min-h-[calc(100vh-1.5rem)] sm:px-[4.5%] sm:py-[4.5%]">
            <div className="flex min-h-[calc(100dvh-1rem)] flex-col sm:min-h-[calc(100vh-9rem)]">
              {/* 상단 상태 바 */}
              <div className="mb-4 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold sm:px-4 sm:py-2 sm:text-base ${
                    isDangerTime
                      ? "border-red-700 bg-red-100 text-red-700"
                      : "border-black bg-white/70 text-black"
                  }`}
                >
                  남은 시간: {formatTime(remainingSeconds)}
                </div>
              </div>

              {/* 제목 */}
              <header className="mb-4 text-center sm:mb-10">
                <h1 className="font-serif text-[2.2rem] font-black tracking-[-0.04em] text-black [text-shadow:0_0_0.5px_rgba(0,0,0,0.8)] sm:text-[clamp(2.8rem,6vw,4.8rem)]">
                  검불시 영역
                </h1>
              </header>

              {/* 구분선 */}
              <div className="mb-4 border-t border-black sm:mb-10" />

              {/* 에러 */}
              {(audioError || submitError) && (
                <div className="mb-4 space-y-1 sm:mb-6">
                  {audioError ? (
                    <p className="text-[0.82rem] text-red-600 sm:text-sm">{audioError}</p>
                  ) : null}
                  {submitError ? (
                    <p className="text-[0.82rem] text-red-600 sm:text-sm">{submitError}</p>
                  ) : null}
                </div>
              )}

              {/* 문제 본문 + 하단 네비게이션을 세로 공간 안에 배치 */}
              <div className="mx-auto flex w-full max-w-[62rem] flex-1 flex-col">
                {/* 문제 본문 */}
                <div className="flex-1">
                  <div className="mb-4 text-[0.98rem] font-medium leading-[1.65] text-black sm:mb-10 sm:text-[clamp(1.2rem,1.8vw,1.5rem)] sm:leading-[2]">
                    <p>
                      {currentIndex + 1}. {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* 이미지 영역 */}
                  {currentQuestion.imageUrl ? (
                    <div className="mb-4 overflow-hidden border sm:mb-10">
                      <div className="relative aspect-[1400/788] w-full">
                        <Image
                          src={currentQuestion.imageUrl}
                          alt={`question-${currentQuestion.id}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 900px"
                          priority={currentIndex === 0}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* 보기 */}
                  <div className="space-y-2.5 sm:space-y-5">
                    {currentQuestion.choices.map((choice: string, index: number) => {
                      const isSelected = selectedAnswer === index;

                      return (
                        <button
                          key={`${choice}-${index}`}
                          type="button"
                          onClick={() => handleSelectAnswer(index)}
                          disabled={isSubmitting}
                          className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left sm:gap-5 sm:px-4 sm:py-3"
                        >
                          <span
                            className={`mt-[0.05em] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[0.95rem] font-semibold transition sm:h-11 sm:w-11 sm:text-lg ${
                              isSelected
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-black bg-transparent text-black"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <span className="pt-[0.02em] text-[0.95rem] font-medium leading-[1.55] text-black sm:pt-[0.08em] sm:text-[clamp(1.15rem,1.6vw,1.35rem)] sm:leading-[1.85]">
                            {choice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 하단 네비게이션 */}
                <div className="mt-5 border-t border-black/20 pt-4 sm:mt-12 sm:border-t-0 sm:pt-0">
                  <div className="flex flex-col items-center gap-4 sm:gap-5">
                    <div className="flex w-full max-w-[62rem] items-center justify-between gap-2 sm:gap-3">
                      <Button
                        type="button"
                        className="rounded-full border-[1.5px] border-black bg-transparent px-4 py-2 text-[0.9rem] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5 sm:text-[clamp(1rem,1.35vw,1.15rem)]"
                        onClick={handlePrevQuestion}
                        disabled={currentIndex === 0 || isSubmitting}
                      >
                        이전
                      </Button>

                      {currentIndex < questions.length - 1 ? (
                        <Button
                          type="button"
                          className="rounded-full border-[1.5px] border-black bg-transparent px-4 py-2 text-[0.9rem] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5 sm:text-[clamp(1rem,1.35vw,1.15rem)]"
                          onClick={handleNextQuestion}
                          disabled={isSubmitting}
                        >
                          다음
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="rounded-full border-[1.5px] border-blue-700 bg-blue-700 px-4 py-2 text-[0.9rem] font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 disabled:opacity-40 sm:px-6 sm:py-2.5 sm:text-[clamp(1rem,1.35vw,1.15rem)]"
                          onClick={openSubmitModal}
                          disabled={isSubmitting}
                        >
                          제출하기
                        </Button>
                      )}
                    </div>

                    {/* 페이지 표시 */}
                    <div className="flex items-center justify-center">
                      <div className="relative flex h-11 w-24 items-center justify-between overflow-hidden border-[1.5px] border-black bg-transparent px-3 text-[1.05rem] font-semibold sm:h-12 sm:w-24 sm:px-3 sm:text-[1.2rem]">
                        <span className="relative z-10 -translate-y-[0.08rem] sm:-translate-y-[0.18rem]">
                          {currentIndex + 1}
                        </span>
                        <span className="relative z-10 translate-y-[0.08rem] sm:translate-y-[0.18rem]">
                          {questions.length}
                        </span>

                        <span className="absolute inset-0 z-0 pointer-events-none">
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
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 제출 모달 */}
      {isSubmitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-xl">제출 확인</h2>
            <p className="mb-2 text-[0.92rem] text-gray-700 sm:text-base">
              현재 {answeredCount} / {questions.length} 문항에 답했습니다.
            </p>
            <p className="mb-5 text-[0.92rem] text-gray-700 sm:mb-6 sm:text-base">
              정말 제출하시겠습니까?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="rounded-full border-[1.5px] border-black bg-transparent px-4 py-2 text-[0.9rem] font-semibold !text-black transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 hover:!text-white active:border-blue-700 active:bg-blue-700 active:!text-white focus:outline-none focus:ring-0 disabled:opacity-40 sm:px-6 sm:py-2.5 sm:text-[clamp(1rem,1.35vw,1.15rem)]"
                onClick={closeSubmitModal}
              >
                취소
              </Button>
              <Button
                type="button"
                className="rounded-full border border-black bg-black px-4 py-2 text-[0.9rem] font-semibold text-white hover:opacity-90 disabled:opacity-40 sm:px-5 sm:text-sm"
                onClick={() => 
                    handleSubmit(false)
                  }
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