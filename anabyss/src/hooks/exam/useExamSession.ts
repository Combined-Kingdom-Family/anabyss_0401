"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicQuestions } from "@/data/questions";
import type {
  ExamAnswerMap,
  ExamSessionInfo,
  ExamStartInfo,
  SubmitExamRequest,
} from "@/types/exam";

const EXAM_NUMBER = 20;
const EXAM_DURATION_SECONDS = EXAM_NUMBER * 60;

function toAnswerMap(
  answersJson: Record<string, number> | undefined
): ExamAnswerMap {
  return Object.fromEntries(
    Object.entries(answersJson ?? {}).map(([key, value]) => [Number(key), value])
  );
}

export function useExamSession() {
  const router = useRouter();
  const questions = useMemo(() => getPublicQuestions(), []);

  const [userId, setUserId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswerMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [hasPlayedTenMinuteWarning, setHasPlayedTenMinuteWarning] =
    useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmitTriggeredRef = useRef(false);

  const getRemainingSecondsFromStartedAt = (startedAtValue: string) => {
    const startedAtMs = new Date(startedAtValue).getTime();

    if (Number.isNaN(startedAtMs)) {
      return EXAM_DURATION_SECONDS;
    }

    const endTimeMs = startedAtMs + EXAM_DURATION_SECONDS * 1000;
    const nowMs = Date.now();
    const diffSeconds = Math.floor((endTimeMs - nowMs) / 1000);

    return Math.max(0, diffSeconds);
  };

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!userId || !sessionId || !startedAt) return false;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const payload: SubmitExamRequest = {
        userId,
        sessionId,
        startedAt,
        answers,
        isAutoSubmit,
      };

      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.message || "시험 제출에 실패했습니다.");
        autoSubmitTriggeredRef.current = false;
        return false;
      }

      sessionStorage.removeItem("examStartInfo");
      router.push(`/result/${data.resultPublicId}`);
      return true;
    } catch {
      setSubmitError("제출 중 오류가 발생했습니다.");
      autoSubmitTriggeredRef.current = false;
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, sessionId, startedAt, answers, router]);


  // 1. examStartInfo 읽어서 서버 세션 기준으로 복구
  useEffect(() => {
    const raw = sessionStorage.getItem("examStartInfo");

    if (!raw) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ExamStartInfo;
      const session: ExamSessionInfo = parsed.session;

      const restoredAnswers = toAnswerMap(session.answersJson);
      const calculatedRemainingSeconds = getRemainingSecondsFromStartedAt(
        session.startedAt
      );

      setUserId(parsed.user.id);
      setSessionId(session.id);
      setStartedAt(session.startedAt);
      setCurrentIndex(session.currentIndex ?? 0);
      setAnswers(restoredAnswers);

      // 서버 저장값보다 실제 시간 기준을 우선
      setRemainingSeconds(calculatedRemainingSeconds);

      setHasPlayedTenMinuteWarning(session.hasPlayedTenMinuteWarning ?? false);

      setIsRestored(true);
    } catch {
      router.push("/");
    }
  }, [router]);

  // 2. localStorage 보조 저장
  useEffect(() => {
    if (!isRestored) return;
    if (!userId || !sessionId) return;

    const raw = sessionStorage.getItem("examStartInfo");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ExamStartInfo;

      sessionStorage.setItem(
        "examStartInfo",
        JSON.stringify({
          ...parsed,
          session: {
            ...parsed.session,
            id: sessionId,
            userId,
            startedAt,
            currentIndex,
            answersJson: answers,
            remainingSeconds,
            hasPlayedTenMinuteWarning,
          },
        })
      );
    } catch {
      // 무시
    }
  }, [
    isRestored,
    userId,
    sessionId,
    startedAt,
    currentIndex,
    answers,
    remainingSeconds,
    hasPlayedTenMinuteWarning,
  ]);

  // 3. DB 진행 상태 저장 (너무 자주 저장하지 않도록 debounce)
  useEffect(() => {
    if (!isRestored) return;
    if (!sessionId) return;
    if (isSubmitting) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/exam/save-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            currentIndex,
            answers,
            remainingSeconds,
            hasPlayedTenMinuteWarning,
          }),
        });
      } catch (error) {
        console.error("save-progress failed:", error);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    isRestored,
    sessionId,
    currentIndex,
    answers,
    remainingSeconds,
    hasPlayedTenMinuteWarning,
    isSubmitting,
  ]);

  // 4. 정확한 타이머: startedAt 기준으로 남은 시간 재계산
  useEffect(() => {
    if (!startedAt) return;
    if (!isRestored) return;
    if (isSubmitting) return;

    const updateRemainingSeconds = () => {
      const nextRemainingSeconds = getRemainingSecondsFromStartedAt(startedAt);

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds <= 0 && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        void handleSubmit(true);
      }
    };

    updateRemainingSeconds();

    const timer = setInterval(() => {
      updateRemainingSeconds();
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, isRestored, isSubmitting, handleSubmit]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSelectAnswer = (choiceIndex: number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceIndex,
    }));
  };

  const handlePrevQuestion = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const openSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const markTenMinuteWarningPlayed = () => {
    setHasPlayedTenMinuteWarning(true);
  };

  return {
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
  };
}