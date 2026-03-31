"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { useLandingForm } from "@/hooks/useLandingForm";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function LandingForm() {
  const router = useRouter();

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
    isPlaying, 
    audioError, 
    playAudio, 
    handleEnded 
  } = useAudioPlayer();

  const AUDIO_SOURCES = {
    checking: "/audio/checking.mp3",
    user_info: "/audio/writing_you.mp3",
    verification_section: "/audio/write_verification_section.mp3",
    start: "/audio/start_exam.mp3",
  } as const;

  const runAudioFlow = async ({
    src,
    beforePlay,
    afterEnded,
  }: {
    src: string;
    beforePlay?: () => Promise<boolean> | boolean;
    afterEnded?: () => void;
  }) => {
    if (beforePlay) {
      const canContinue = await beforePlay();
      if (!canContinue) {
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
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-xl bg-white p-6 shadow">
      
      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />
      
      <h2 className="text-lg font-semibold">
        2026학년도 4월 검불러 사설 모의고사 문제지
      </h2>
      <h1 className="text-2xl font-bold">검불시 영역</h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-sm font-medium">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => handleNicknameChange(e.target.value)}
          onBlur={handleNicknameBlur}
          className={`rounded border px-3 py-2 outline-none ${
            nicknameTouched
              ? nicknameError
                ? "border-red-500"
                : "border-green-500"
              : "border-gray-300"
          }`}
          placeholder="닉네임을 입력하세요"
        />
        {nicknameTouched ? (
          nicknameError ? (
            <p className="text-sm text-red-500">{nicknameError}</p>
          ) : isNicknameValid ? (
            <p className="text-sm text-green-600">사용 가능한 닉네임입니다.</p>
          ) : null
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="userNumber" className="text-sm font-medium">
          수험번호
        </label>
        <input
          id="userNumber"
          type="text"
          value={userNumber}
          onChange={(e) => handleUserNumberChange(e.target.value)}
          onBlur={handleUserNumberBlur}
          className={`rounded border px-3 py-2 outline-none ${
            userNumberTouched
              ? userNumberError
                ? "border-red-500"
                : "border-green-500"
              : "border-gray-300"
          }`}
          placeholder="수험번호를 입력하세요"
        />
        {userNumberTouched ? (
          userNumberError ? (
            <p className="text-sm text-red-500">{userNumberError}</p>
          ) : isUserNumberValid ? (
            <p className="text-sm text-green-600">
              올바른 수험번호 형식입니다.
            </p>
          ) : null
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreedToPolicy}
            onChange={(e) => handlePolicyChange(e.target.checked)}
          />
          안내사항에 동의합니다.
        </label>

        {policyError ? (
          <p className="text-sm text-red-500">{policyError}</p>
        ) : null}
      </div>

      {audioError ? (
        <p className="text-sm text-red-500">{audioError}</p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-red-500">{submitError}</p>
      ) : null}


      <Button
        type="button"
        className="bg-gray-500 hover:bg-gray-600"
        onClick={
          () => 
            runAudioFlow({
              src: AUDIO_SOURCES.start,
              beforePlay: handleStartExam,
              afterEnded: () => router.push("/exam"),
            })
        }
        disabled={isSubmitting || isPlaying}
      >
        시험 시작
      </Button>

      <Button
        type="button"
        className="bg-gray-400 hover:bg-gray-500"
        onClick={() =>
          runAudioFlow({
            src: AUDIO_SOURCES.user_info,
          })
        }
        disabled={isPlaying}
      >
        소개 음성 듣기
      </Button>

      <Button
        type="button"
        className="bg-gray-400 hover:bg-gray-500"
        onClick={() =>
          runAudioFlow({
            src: AUDIO_SOURCES.checking,
          })
        }
        disabled={isPlaying}
      >
        주의사항 음성 듣기
      </Button>

    </div>
  );
}