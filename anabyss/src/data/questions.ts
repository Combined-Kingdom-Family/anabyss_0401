import type { Question, PublicQuestion } from "@/types/exam";

export const questions: Question[] = [
  {
    id: 1,
    area: "검불시",
    type: "multiple",
    questionText: "an Abyss : 검불의詩 는 리디에서 2020년도부터 연재되고 있는 한국의 성인 BL 이다.  ",
    imageUrl: "/images/questions/q1.png",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
  {
    id: 2,
    area: "검불시",
    type: "multiple",
    questionText: "React에서 상태 관리를 위한 기본 훅은 무엇인가요?",
    choices: ["useFetch", "useForm", "useState", "useCss"],
    answer: 2,
  },
  {
    id: 3,
    area: "검불시",
    type: "multiple",
    questionText: "문제 3",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 0,
  },
  {
    id: 4,
    area: "검불시",
    type: "multiple",
    questionText: "문제 4",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 3,
  },
  {
    id: 5,
    area: "검불시",
    type: "multiple",
    questionText: "문제 5",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },

  // 1부 (6~10)
  {
    id: 6,
    area: "1부",
    type: "multiple",
    questionText: "문제 6",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 2,
  },
  {
    id: 7,
    area: "1부",
    type: "multiple",
    questionText: "문제 7",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 0,
  },
  {
    id: 8,
    area: "1부",
    type: "multiple",
    questionText: "문제 8",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
  {
    id: 9,
    area: "1부",
    type: "multiple",
    questionText: "문제 9",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 3,
  },
  {
    id: 10,
    area: "1부",
    type: "multiple",
    questionText: "문제 10",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 2,
  },

  // 2부 (11~15)
  {
    id: 11,
    area: "2부",
    type: "multiple",
    questionText: "문제 11",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 2,
  },
  {
    id: 12,
    area: "2부",
    type: "multiple",
    questionText: "문제 12",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
  {
    id: 13,
    area: "2부",
    type: "multiple",
    questionText: "문제 13",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 0,
  },
  {
    id: 14,
    area: "2부",
    type: "multiple",
    questionText: "문제 14",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 3,
  },
  {
    id: 15,
    area: "2부",
    type: "multiple",
    questionText: "문제 15",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },

  // 3부 (16~20)
  {
    id: 16,
    area: "3부",
    type: "multiple",
    questionText: "문제 16",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 2,
  },
  {
    id: 17,
    area: "3부",
    type: "multiple",
    questionText: "문제 17",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
  {
    id: 18,
    area: "3부",
    type: "multiple",
    questionText: "문제 18",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 0,
  },
  {
    id: 19,
    area: "3부",
    type: "multiple",
    questionText: "문제 19",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 3,
  },
  {
    id: 20,
    area: "3부",
    type: "multiple",
    questionText: "문제 20",
    choices: ["보기 1", "보기 2", "보기 3", "보기 4"],
    answer: 1,
  },
];

export function getPublicQuestions(): PublicQuestion[] {
  return questions.map(({ answer: _answer, ...publicQuestion }) => publicQuestion);
}

export function getQuestionById(id: number): Question | undefined {
  return questions.find((question) => question.id === id);
}