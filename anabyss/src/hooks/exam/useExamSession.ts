"use client";

// <추가 항목>
// 문제 번호 목록 이동
// 임시 저장 배지
// 미응답 문제 표시
// 자동 제출 경고


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicQuestions } from "@/data/questions";
import type {
  ExamAnswerMap,
  ExamStartInfo,
  ExamState,
  SubmitExamRequest,
} from "@/types/exam";

const EXAM_NUMBER = 7;
const EXAM_DURATION_SECONDS = EXAM_NUMBER * 60 * 1.5;

export function useExamSession() {
  const router = useRouter();
  const questions = useMemo(() => getPublicQuestions(), []);

  const [userId, setUserId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswerMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [hasPlayedTenMinuteWarning, setHasPlayedTenMinuteWarning] = useState(false);


  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRestored, setIsRestored] = useState(false);

  // 1. examStartInfo 읽기
  useEffect(() => {
    const raw = localStorage.getItem("examStartInfo");

    if (!raw) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ExamStartInfo;
      setUserId(parsed.user.id);
      setStartedAt(parsed.startedAt);
    } catch {
      router.push("/");
    }
  }, [router]);

  // 2. examState 복구
  useEffect(() => {
    const raw = localStorage.getItem("examState");

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ExamState;

        setCurrentIndex(parsed.currentIndex ?? 0);
        setAnswers(parsed.answers ?? {});
        setRemainingSeconds(parsed.remainingSeconds ?? EXAM_DURATION_SECONDS);
        setHasPlayedTenMinuteWarning(parsed.hasPlayedTenMinuteWarning ?? false);
      } catch {
        // 복구 실패 시 무시
      }
    }

    // 복구 시도 자체가 끝났음을 표시
    setIsRestored(true);
  }, []);

  // 3. 복구 끝난 뒤에만 저장
  useEffect(() => {
    if (!isRestored) return;

    const state: ExamState = {
      currentIndex,
      answers,
      remainingSeconds,
      hasPlayedTenMinuteWarning, 
    };

    localStorage.setItem("examState", JSON.stringify(state));
  }, [isRestored, currentIndex, answers, remainingSeconds, hasPlayedTenMinuteWarning]);

  // 4. 타이머 시작
  useEffect(() => {
    if (!startedAt) return;
    if (!isRestored) return;
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, isRestored, isSubmitting]);

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

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!userId || !startedAt) return false;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const payload: SubmitExamRequest = {
        userId,
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
        return false;
      }

      localStorage.removeItem("examState");
      localStorage.removeItem("examStartInfo");

      router.push(`/result/${data.resultId}`);
      return true;
    } catch {
      setSubmitError("제출 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    questions,
    currentQuestion,
    currentIndex,
    answers,
    remainingSeconds,
    answeredCount,

    hasPlayedTenMinuteWarning,
    
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
    markTenMinuteWarningPlayed,
  };
}