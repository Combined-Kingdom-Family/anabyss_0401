// 입력 검증 로직 
// 닉네임 길이, 형식 검증 
// 번호 형식 검증 
// 제출 데이터 검증 
// 시험 시작 요청 검증 

import type { StartExamRequest } from "@/types/user";
import type { SubmitExamRequest } from "@/types/exam";

const NICKNAME_LENGTH_LIMIT = 10;

export function validateNickname(nickname: string): string | null {
  const trimmed = nickname.trim();

  // console.log("닉네임:", trimmed, "길이:", trimmed.length);

  if (!trimmed) {
    return "성명을 입력해주세요.";
  }

  if (trimmed.length > NICKNAME_LENGTH_LIMIT) {
    return `성명은 ${NICKNAME_LENGTH_LIMIT}자 이하로 입력해주세요.`;
  }

  return null;
}

export function validateUserNumber(userNumber: string): string | null {
  const trimmed = userNumber.trim();

  if (!trimmed) {
    return "수험번호를 입력해주세요.";
  }

  if (!/^\d+$/.test(trimmed)) {
    return "수험번호는 숫자만 입력할 수 있습니다.";
  }

  if (trimmed.length !== 8) {
    return "수험번호는 8자리여야 합니다.";
  }

  return null;
}

export function validateStartExamPayload(
  payload: StartExamRequest,
): string | null {
  const nicknameError = validateNickname(payload.nickname);
  if (nicknameError) return nicknameError;

  const userNumberError = validateUserNumber(payload.userNumber);
  if (userNumberError) return userNumberError;

  if (!payload.agreedToPolicy) {
    return "안내사항에 동의해야 시험을 시작할 수 있습니다.";
  }

  return null;
}

export function validateSubmitExamPayload(
  payload: SubmitExamRequest,
): string | null {
  if (!payload.userId) return "유효한 사용자 정보가 없습니다.";
  if (!payload.startedAt) return "시험 시작 시간이 없습니다.";
  if (!payload.answers || typeof payload.answers !== "object") {
    return "답안 정보가 올바르지 않습니다.";
  }

  return null;
}