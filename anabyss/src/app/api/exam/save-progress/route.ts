import { NextResponse } from "next/server";
import {
  findExamSessionById,
  updateExamSessionProgress,
} from "@/lib/queries/examSession";

type SaveProgressRequest = {
  sessionId: number;
  currentIndex: number;
  answers: Record<string, number>;
  remainingSeconds: number;
  hasPlayedTenMinuteWarning: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveProgressRequest;

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, message: "sessionId가 필요합니다." },
        { status: 400 }
      );
    }

    const session = await findExamSessionById(body.sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "시험 세션을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (session.status !== "in_progress") {
      return NextResponse.json(
        { success: false, message: "진행 중인 시험만 저장할 수 있습니다." },
        { status: 400 }
      );
    }

    const updatedSession = await updateExamSessionProgress({
      sessionId: body.sessionId,
      currentIndex: body.currentIndex ?? 0,
      answersJson: body.answers ?? {},
      remainingSeconds: body.remainingSeconds ?? 0,
      hasPlayedTenMinuteWarning: body.hasPlayedTenMinuteWarning ?? false,
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("exam/save-progress error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "시험 진행 상태 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}