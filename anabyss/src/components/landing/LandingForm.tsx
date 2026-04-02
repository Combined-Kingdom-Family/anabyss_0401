"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import Button from "@/components/common/Button";
import {
  useLandingForm,
  type StartExamFlowResult,
} from "@/hooks/useLandingForm";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const AUDIO_SOURCES = {
  guide: "/audio/guide.mp3",
  start: "/audio/start_exam.mp3",
} as const;

type AudioFlowResult =
  | { ok: false }
  | { ok: true; mode: "play_only" }
  | { ok: true; mode: "go_exam" }
  | { ok: true; mode: "go_result"; resultPublicId: string };

export default function LandingForm() {
  const router = useRouter();

  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  const [noticeAgreed, setNoticeAgreed] = useState(false);

  // 필적 확인 문구
  const [phrase, setPhrase] = useState("");

  const {
    nickname,
    userNumber,
    agreedToPolicy,

    nicknameError,
    userNumberError,
    policyError,
    submitError,

    nicknameTouched,
    userNumberTouched,

    isNicknameValid,
    isUserNumberValid,
    isSubmitting,

    handleNicknameChange,
    handleUserNumberChange,
    handleNicknameBlur,
    handleUserNumberBlur,
    handlePolicyChange,
    handleStartExam,
  } = useLandingForm();

  const {
    audioRef,
    audioError,
    isPlaying,
    playAudio,
    handleEnded,
  } = useAudioPlayer();

  /**
   * 모달을 먼저 즉시 닫고
   * 그 다음 같은 클릭 흐름 안에서 음성이 재생되도록 함
   */
  const handleNoticeConfirmBeforePlay = (): AudioFlowResult => {
    if (!noticeAgreed) {
      return { ok: false };
    }

    flushSync(() => {
      setIsNoticeOpen(false);
    });

    if (!agreedToPolicy) {
      handlePolicyChange(true);
    }

    return {
      ok: true,
      mode: "play_only",
    };
  };

  const runAudioFlow = async ({
    src,
    beforePlay,
    afterEnded,
  }: {
    src: string;
    beforePlay?: () => Promise<AudioFlowResult> | AudioFlowResult;
    afterEnded?: () => void;
  }) => {
    if (beforePlay) {
      const result = await beforePlay();

      if (!result.ok) {
        return;
      }

      if (result.mode === "go_result") {
        router.push(`/result/${result.resultPublicId}`);
        return;
      }
    }

    const played = await playAudio({
      src,
      onEndedAction: afterEnded,
    });

    if (!played && afterEnded) {
      afterEnded();
    }
  };

  return (
    <>
      {/* 안내 모달 */}
      {isNoticeOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/35 px-3 py-4 backdrop-blur-[2px] sm:px-4 sm:py-6">
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div className="w-full max-w-[44rem] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:px-7 sm:py-7">
              <div className="mb-5">
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.02em] text-slate-600">
                  안내
                </div>

                <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,1.8rem)] font-bold tracking-[-0.03em] text-slate-900">
                  시험 안내 및 정보 이용 동의
                </h2>

                <p className="mt-2 text-[clamp(1rem,1.4vw,1.15rem)] leading-6 text-slate-600 sm:text-[0.98rem]">
                  시험을 시작하기 전에 아래 내용을 반드시 확인해 주세요. 확인을 완료한 뒤에만
                  성명 및 수험번호 입력과 시험 시작이 가능합니다.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <ul className="space-y-3 text-[clamp(1rem,1.4vw,1.15rem)] leading-6 text-slate-700 sm:text-[0.98rem]">
                  <li>
                    • 입력한 성명과 수험번호는 시험 진행, 응시자 식별 및 결과 확인을 위해
                    사용됩니다.
                  </li>
                  <li>• 시험 시작 시 안내 음성이 재생될 수 있습니다.</li>
                  <li>
                    • 시험 진행 상태(문항, 답안, 남은 시간 등)는 복구를 위해 저장될 수
                    있습니다.
                  </li>
                  <li>
                    • 이미 시험을 제출한 경우, 동일한 정보로 재접속 시 결과 화면으로 이동할
                    수 있습니다.
                  </li>
                  <li>
                    • 응시 결과는 개인을 식별할 수 없는 형태로 통계 처리되어, 랭킹, 전체
                    응시자 수, 영역별 성적 요약 정보 제공에 활용될 수 있습니다.
                  </li>
                </ul>

                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                  <p className="text-[clamp(1rem,1.4vw,1.15rem)] leading-6 text-indigo-900 sm:text-[0.97rem]">
                    <span className="font-semibold">
                      ※ 본 시험은 이벤트용 서비스로 실제 개인정보 수집을 목적으로 하지
                      않습니다.
                    </span>
                    <br />
                    성명 및 수험번호에는{" "}
                    <span className="font-semibold">닉네임 또는 임의의 값 입력</span>을
                    권장합니다.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50/70">
                <input
                  type="checkbox"
                  checked={noticeAgreed}
                  onChange={(e) => setNoticeAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                <span className="text-[clamp(1rem,1.4vw,1.15rem)] leading-6 text-slate-700 sm:text-[0.98rem]">
                  위 내용을 모두 확인하였으며, 시험 진행을 위한 정보 이용 및 안내 절차,
                  그리고 통계성 정보 제공 목적의 집계 활용에 동의합니다.
                </span>
              </label>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    runAudioFlow({
                      src: AUDIO_SOURCES.guide,
                      beforePlay: handleNoticeConfirmBeforePlay,
                    })
                  }
                  disabled={!noticeAgreed || isPlaying}
                  className="inline-flex min-w-[9rem] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-[clamp(1rem,1.4vw,1.15rem)] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400 sm:text-base"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main className="min-h-screen bg-[#F1F3FB] px-2 py-2 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

        <div
          className={`mx-auto w-full max-w-[75rem] transition ${
            isNoticeOpen ? "pointer-events-none select-none blur-[1.5px]" : ""
          }`}
        >
          <section className="border-[1.5px] border-black bg-[#EEF2F9] px-[3.5%] py-[4%] sm:min-h-[calc(100vh-1.5rem)] sm:px-[4.5%] sm:py-[4.5%]">
             <div className="flex flex-col gap-5 sm:min-h-[calc(100vh-6rem)] sm:justify-between sm:gap-8">
              <div>
                {/* 상단 배지 */}
                <div className="mb-8 sm:mb-10">
                  <span className="inline-flex rounded-full border-[1.5px] border-black px-3 py-1.5 font-serif text-[0.95rem] font-black tracking-[-0.02em] text-black sm:px-4 sm:py-2 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]">
                    종합형
                  </span>
                </div>

                {/* 타이틀 */}
                <header className="mb-6 text-center sm:mb-12 lg:mb-14">
                  <p className="text-[0.9rem] font-semibold tracking-[-0.02em] text-black sm:text-[clamp(1.3rem,2.2vw,2.1rem)]">
                    2026학년도 4월 검불시 사설 모의고사 문제지
                  </p>
                  <h1 className="mt-2 font-serif text-[2.05rem] font-black tracking-[-0.04em] text-black [text-shadow:0_0_0.5px_rgba(0,0,0,0.8)] sm:mt-4 sm:text-[clamp(2.8rem,6vw,4.8rem)]">
                    검불시 영역
                  </h1>
                </header>

                {/* 입력 영역 */}
                <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:mb-10 lg:gap-8">
                  {/* 성명 */}
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex min-h-[3rem] items-stretch border-[1.5px] border-black sm:min-h-[3.55rem]">
                      <label
                        htmlFor="nickname"
                        className="flex w-[6rem] shrink-0 items-center justify-center whitespace-nowrap border-r-[1.5px] border-black bg-[#D6DAE2] px-2 text-[0.98rem] font-semibold text-black sm:w-[7rem] sm:px-3 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                      >
                        성명
                      </label>
                      <input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => handleNicknameChange(e.target.value)}
                        onBlur={handleNicknameBlur}
                        disabled={isNoticeOpen}
                        className="min-w-0 flex-1 bg-[#EEF2F9] px-3 text-[0.98rem] font-medium leading-none text-black outline-none placeholder:text-[#6B7280] sm:px-4 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                      />
                    </div>

                    {nicknameTouched ? (
                      nicknameError ? (
                        <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-red-600">{nicknameError}</p>
                      ) : isNicknameValid ? (
                        <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-green-700">
                          사용 가능한 성명입니다.
                        </p>
                      ) : null
                    ) : null}
                  </div>

                  {/* 수험번호 */}
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex min-h-[3rem] items-stretch border-[1.5px] border-black sm:min-h-[3.55rem]">
                      <label
                        htmlFor="userNumber"
                        className="flex w-[6rem] shrink-0 items-center justify-center whitespace-nowrap border-r-[1.5px] border-black bg-[#D6DAE2] px-2 text-[0.98rem] font-semibold text-black sm:w-[7rem] sm:px-3 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                      >
                        수험번호
                      </label>
                      <input
                        id="userNumber"
                        type="text"
                        value={userNumber}
                        onChange={(e) => handleUserNumberChange(e.target.value)}
                        onBlur={handleUserNumberBlur}
                        disabled={isNoticeOpen}
                        className="min-w-0 flex-1 bg-[#EEF2F9] px-3 text-[0.98rem] font-medium leading-none text-black outline-none placeholder:text-[#6B7280] sm:px-4 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                      />
                    </div>

                    {userNumberTouched ? (
                      userNumberError ? (
                        <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-red-600">{userNumberError}</p>
                      ) : isUserNumberValid ? (
                        <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-green-700">
                          사용 가능한 수험번호입니다.
                        </p>
                      ) : null
                    ) : null}
                  </div>
                </div>

                {/* 안내 박스 1 */}
                <div className="mb-4 border-[1.5px] border-black px-[4.5%] py-[4.5%] sm:mb-7 sm:px-[5.5%] sm:pt-[5%] sm:pb-[5%] lg:mb-9">
                  <ul className="space-y-5 text-[0.98rem] font-medium leading-[1.8] text-black sm:space-y-8 sm:text-[clamp(1.2rem,1.8vw,1.5rem)] sm:leading-[2.05]">
                    <li>• 문제지의 해당란에 성명과 수험 번호를 정확히 쓰시오.</li>

                    <li>
                      • 답안지의 필적 확인란에 다음의 문구를 정자로 기재하시오.
                      <div className="mt-4 flex justify-center">
                        <div className="relative w-full max-w-[30rem]">
                          <input
                            type="text"
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            disabled={isNoticeOpen}
                            className="w-full border-[1.5px] border-black bg-[#D6DAE2] px-3 py-2.5 text-[0.92rem] font-medium text-black outline-none sm:px-4 sm:py-3 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                          />

                          {!phrase && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-[0.86rem] font-medium text-[#6B7280] whitespace-nowrap overflow-hidden text-ellipsis sm:px-4 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]">
                              듀랜트가 질척하게 오웬을 핥고 있었다
                            </span>
                          )}
                        </div>
                      </div>
                    </li>

                    <li>
                      • 답안지의 해당란에 성명과 수험 번호를 쓰고, 또 수험 번호와 답을
                      정확히 표시하시오.
                    </li>

                    <li>• 총 20개 문항, 한 문항 당 5점 입니다.</li>
                  </ul>
                </div>

                {/* 안내 박스 2 */}
                <div className="border-[1.5px] border-black px-[4.5%] py-[4.5%] sm:px-[5.5%] sm:pt-[5%] sm:pb-[5%]">
                  <p className="mb-4 text-[0.98rem] font-semibold leading-[1.8] text-black sm:mb-6 sm:text-[clamp(1.2rem,1.8vw,1.5rem)] sm:leading-[2.05]">
                    ※ 공통과목 및 자신이 선택한 과목의 문제지를 확인하고, 답을 정확히 표시하시오.
                  </p>

                  <div className="space-y-5 text-[0.98rem] font-medium leading-[1.8] text-black sm:space-y-8 sm:text-[clamp(1.2rem,1.8vw,1.5rem)] sm:leading-[2.05]">
                    <div className="flex items-center gap-2 leading-none">
                      <span>• 공통과목</span>
                      <span className="min-w-0 flex-1 border-b border-dotted border-black/80" />
                      <span>1 ~ 5쪽</span>
                    </div>

                    <div className="flex items-center gap-2 leading-none">
                      <span>• 선택과목</span>
                    </div>

                    <div className="space-y-3 pl-6">
                      <div className="flex items-center gap-2 leading-none">
                        <span>1부</span>
                        <span className="min-w-0 flex-1 border-b border-dotted border-black/80" />
                        <span>6 ~ 7쪽</span>
                      </div>
                      <div className="flex items-center gap-2 leading-none">
                        <span>2부</span>
                        <span className="min-w-0 flex-1 border-b border-dotted border-black/80" />
                        <span>8 ~ 9쪽</span>
                      </div>
                      <div className="flex items-center gap-2 leading-none">
                        <span>3부</span>
                        <span className="min-w-0 flex-1 border-b border-dotted border-black/80" />
                        <span>10 ~ 20쪽</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 에러 메시지 */}
                  {(audioError || submitError || policyError) && (
                    <div className="mt-4 space-y-1">
                      {audioError ? (
                        <p className="text-[0.92rem] text-red-600 sm:text-[clamp(1rem,1.4vw,1.15rem)]">{audioError}</p>
                      ) : null}
                      {submitError ? (
                        <p className="text-[0.92rem] text-red-600 sm:text-[clamp(1rem,1.4vw,1.15rem)]">{submitError}</p>
                      ) : null}
                      {policyError ? (
                        <p className="text-[0.92rem] text-red-600 sm:text-[clamp(1rem,1.4vw,1.15rem)]">{policyError}</p>
                      ) : null}
                    </div>
                  )}
              </div>

              {/* 하단 버튼 */}
              <div className="mt-2 flex justify-center">
                <Button
                  type="button"
                  className="rounded-full border-[1.5px] border-black bg-transparent px-5 py-2.5 text-[1rem] font-semibold !text-black hover:bg-transparent hover:!text-black disabled:opacity-40 sm:px-7 sm:py-3 sm:text-[clamp(1.2rem,1.8vw,1.5rem)]"
                  onClick={() =>
                    runAudioFlow({
                      beforePlay: async () => {
                        const result =
                          (await handleStartExam()) as StartExamFlowResult;

                        if (!result.ok) {
                          return { ok: false } as AudioFlowResult;
                        }

                        if (result.mode === "go_result") {
                          return {
                            ok: true,
                            mode: "go_result",
                            resultPublicId: result.resultPublicId,
                          } as AudioFlowResult;
                        }

                        return {
                          ok: true,
                          mode: "go_exam",
                        } as AudioFlowResult;
                      },
                      src: AUDIO_SOURCES.start,
                      afterEnded: () => {
                        router.push("/exam");
                      },
                    })
                  }
                  disabled={isNoticeOpen || isSubmitting || isPlaying}
                >
                  시험 시작
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}