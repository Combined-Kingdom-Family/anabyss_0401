export type ExamAnswerMap = Record<number, number>;

export type ExamState = {
  currentIndex: number;
  answers: ExamAnswerMap;
  remainingSeconds: number;
  hasPlayedTenMinuteWarning: boolean;
};

export type ExamStartInfo = {
  user: {
    id: number;
    nickname: string;
    userNumber: string;
    createdAt: string;
  };
  startedAt: string;
};

export type SubmitExamRequest = {
  userId: number;
  startedAt: string;
  answers: ExamAnswerMap;
  isAutoSubmit?: boolean;
};