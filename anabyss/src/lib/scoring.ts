// 채점 로직 
// 정답 비교 함수 
// 점수 계산 함수 
// 정답 수 계산 
// 문항별 IsCorrect 생성 함수

import { questions } from "@/data/questions";
import type {
  AnswerDetailResult,
  ExamAnswerMap,
  SubmitExamResponse,
} from "@/types/exam";

export function buildAnswerDetails(
  answers: ExamAnswerMap,
): AnswerDetailResult[] {
  return questions.map((question) => {
    const selectedAnswer =
      answers[question.id] !== undefined ? answers[question.id] : null;

    return {
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.answer,
      isCorrect: selectedAnswer === question.answer,
    };
  });
}

export function calculateCorrectCount(
  answerDetails: AnswerDetailResult[],
): number {
  return answerDetails.filter((detail) => detail.isCorrect).length;
}

export function calculateScore(
  correctCount: number,
  totalQuestions: number,
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

export function calculateDurationInSeconds(startedAt: string): number {
  const start = new Date(startedAt).getTime();
  const end = Date.now();

  return Math.max(0, Math.floor((end - start) / 1000));
}

export function scoreExam(params: {
  userId: number;
  startedAt: string;
  answers: ExamAnswerMap;
}): Omit<SubmitExamResponse, "success" | "resultId"> {
  const answerDetails = buildAnswerDetails(params.answers);
  const totalQuestions = questions.length;
  const correctCount = calculateCorrectCount(answerDetails);
  const score = calculateScore(correctCount, totalQuestions);
  const duration = calculateDurationInSeconds(params.startedAt);

  return {
    score,
    totalQuestions,
    correctCount,
    duration,
    answerDetails,
  };
}