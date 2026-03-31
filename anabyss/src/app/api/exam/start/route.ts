import { NextResponse } from "next/server";
import type { StartExamRequest, User } from "@/types/user";
import { validateNickname, validateUserNumber } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartExamRequest;

    const nicknameError = validateNickname(body.nickname);
    if (nicknameError) {
      return NextResponse.json(
        { success: false, message: nicknameError },
        { status: 400 }
      );
    }

    const userNumberError = validateUserNumber(body.userNumber);
    if (userNumberError) {
      return NextResponse.json(
        { success: false, message: userNumberError },
        { status: 400 }
      );
    }

    if (!body.agreedToPolicy) {
      return NextResponse.json(
        { success: false, message: "안내사항에 동의해주세요." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const user: User = {
      id: Date.now(), // 나중에는 DB에서 생성된 id
      nickname: body.nickname.trim(),
      userNumber: body.userNumber.trim(),
      createdAt: now,
    };

    return NextResponse.json({
      success: true,
      user,
      startedAt: now,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
}