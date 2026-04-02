// 사용자 관련 타입 
// user
// createUserPayload 
// StartExamRequest 

export type User = {
  id: number;
  nickname: string;
  userNumber: string;
  createdAt: string;
};

export type StartExamRequest = {
  nickname: string;
  userNumber: string;
  agreedToPolicy: boolean;
  handwritingSample: string;
};