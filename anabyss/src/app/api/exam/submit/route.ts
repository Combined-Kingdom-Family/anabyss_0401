// 제출 데이터 파싱 
// 답안 유효성 검사
// 서버 체점
// exam_result 저장 
// answer_detail 저장 
// resultid 반환 
// * 프론트에서 보낸 점수를 믿지 않고 서버에서 정답과 비료할 것 

import { NextResponse } from "next/server";
import { validateSubmitExamPayload } from "@/lib/validations";
import { scoreExam } from "@/lib/scoring";
import type { SubmitExamRequest } from "@/types/exam";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitExamRequest;

    const error = validateSubmitExamPayload(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    }

    const scored = scoreExam({
      userId: body.userId,
      startedAt: body.startedAt,
      answers: body.answers,
    });

    // TODO: 나중에 DB 연결 시 exam_results, answer_details 저장
    const mockResultId = Date.now();

    return NextResponse.json({
      success: true,
      resultId: mockResultId,
      ...scored,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "제출 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}