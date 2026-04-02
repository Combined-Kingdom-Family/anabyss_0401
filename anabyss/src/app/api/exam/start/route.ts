import { NextResponse } from "next/server";
import type { StartExamRequest } from "@/types/user";
import { validateNickname, validateUserNumber } from "@/lib/validations";
import { findOrCreateUser } from "@/lib/queries/user";
import {
  createExamSession,
  findInProgressSessionByUserId,
} from "@/lib/queries/examSession";
import { findLatestExamResultByUserId } from "@/lib/queries/examResult";

const EXAM_NUMBER = 20;
const EXAM_DURATION_SECONDS = EXAM_NUMBER * 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartExamRequest;

    const nickname = body.nickname?.trim() ?? "";
    const userNumber = body.userNumber?.trim() ?? "";
    const agreedToPolicy = body.agreedToPolicy;
    const handwritingSample = body.handwritingSample?.trim().slice(0, 200) ?? "";

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json(
        { success: false, message: nicknameError },
        { status: 400 }
      );
    }

    const userNumberError = validateUserNumber(userNumber);
    if (userNumberError) {
      return NextResponse.json(
        { success: false, message: userNumberError },
        { status: 400 }
      );
    }

    if (!agreedToPolicy) {
      return NextResponse.json(
        { success: false, message: "안내사항에 동의해주세요." },
        { status: 400 }
      );
    }

    const user = await findOrCreateUser({
      nickname,
      userNumber,
    });

    // 1. 진행 중 세션 확인
    const inProgressSession = await findInProgressSessionByUserId(user.id);

    if (inProgressSession) {
      return NextResponse.json({
        success: true,
        mode: "resume_exam",
        user,
        session: inProgressSession,
      });
    }

    // 2. 제출된 최신 결과 확인
    const latestResult = await findLatestExamResultByUserId(user.id);

    if (latestResult) {
      return NextResponse.json({
        success: true,
        mode: "go_result",
        user,
        resultPublicId: latestResult.publicId,
      });
    }

    // 3. 둘 다 없으면 새 시험 시작
    const newSession = await createExamSession({
      userId: user.id,
      remainingSeconds: EXAM_DURATION_SECONDS,
      handwritingSample,
    });

    return NextResponse.json({
      success: true,
      mode: "start_exam",
      user,
      session: newSession,
    });
  } catch (error) {
    console.error("exam/start error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "시험 시작 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}