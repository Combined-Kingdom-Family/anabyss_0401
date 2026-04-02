export type ExamArea = "설정" | "인물" | "서사" | "세부";

export type QuestionType = "multiple";

export type Question = {
  id: number;
  area: ExamArea;
  type: QuestionType;
  questionText: string;
  imageUrl?: string;
  choices: string[];
  answer: number;
};

export type PublicQuestion = Omit<Question, "answer">;

export type ExamAnswerMap = Record<number, number>;

export type AreaScoreSummary = {
  area: ExamArea;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  grade: number;
};

export type ExamSessionInfo = {
  id: number;
  userId: number;
  startedAt: string;
  currentIndex: number;
  answersJson: Record<string, number>;
  remainingSeconds: number;
  hasPlayedTenMinuteWarning: boolean;
  status: string;
  updatedAt: string;
};

export type ExamStartInfo = {
  user: {
    id: number;
    nickname: string;
    userNumber: string;
    createdAt: string;
  };
  session: ExamSessionInfo;
};

export type SubmitExamRequest = {
  userId: number;
  sessionId: number;
  startedAt: string;
  answers: Record<number, number>;
  isAutoSubmit?: boolean;
};