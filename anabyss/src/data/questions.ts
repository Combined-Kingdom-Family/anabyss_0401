// 초기 정적 데이터 
// 문제 데이터 파일 
// 20문제 원본 데이터 
// 클라이언트에는 정답 없는 버전만 내려주는 구조
// 필요시 문제 불러오는 함수

import type { Question, PublicQuestion } from "@/types/exam";

export const questions: Question[] = [
  {
    id: 1,
    type: "multiple",
    questionText: "다음 중 올바른 답을 고르세요.",
    imageUrl: "/images/questions/q1.png",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
  {
    id: 2,
    type: "multiple",
    questionText: "React에서 상태 관리를 위한 기본 훅은 무엇인가요?",
    choices: ["useFetch", "useForm", "useState", "useCss"],
    answer: 2,
  },
  // TODO: 20문제까지 채우기
  // 실제로는 json 파일로 관리하기
];

// 클라이언트에는 정답 없는 버전만 내려주는 함수
// 반환타입 : PublicQuestion[]
export function getPublicQuestions(): PublicQuestion[] {
  return questions.map(({ answer: _answer, ...publicQuestion }) => publicQuestion);
}

export function getQuestionById(id: number): Question | undefined {
  return questions.find((question) => question.id === id);
}