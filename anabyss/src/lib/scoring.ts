import { questions } from "@/data/questions";
import type { AreaScoreSummary, ExamAnswerMap, ExamArea } from "@/types/exam";

const QUESTION_SCORE = 5;
const AREAS: ExamArea[] = ["설정", "인물", "서사", "세부"];

export function calculateAreaSummaries(
  answers: ExamAnswerMap
): AreaScoreSummary[] {
  return AREAS.map((area) => {
    const areaQuestions = questions.filter((question) => question.area === area);

    let correctCount = 0;

    for (const question of areaQuestions) {
      const selectedAnswer = answers[question.id];
      if (selectedAnswer === question.answer) {
        correctCount += 1;
      }
    }

    const totalQuestions = areaQuestions.length;
    const wrongCount = totalQuestions - correctCount;
    const score = correctCount * QUESTION_SCORE;

    // 5문제 기준:
    // 5개 맞음 -> 1등급
    // 4개 맞음 -> 2등급
    // 3개 맞음 -> 3등급
    // 2개 맞음 -> 4등급
    // 1개 맞음 -> 5등급
    // 0개 맞음 -> 6등급
    const grade = wrongCount + 1;

    return {
      area,
      totalQuestions,
      correctCount,
      wrongCount,
      score,
      grade,
    };
  });
}

export function calculateOverallScore(answers: ExamAnswerMap) {
  let correctCount = 0;

  for (const question of questions) {
    const selectedAnswer = answers[question.id];
    if (selectedAnswer === question.answer) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length;
  const score = correctCount * QUESTION_SCORE;

  return {
    totalQuestions,
    correctCount,
    score,
  };
}