import { NextResponse } from "next/server";
import { questions } from "@/data/questions";
import type { SubmitExamRequest } from "@/types/exam";
import {
  findExamSessionById,
  markExamSessionSubmitted,
} from "@/lib/queries/examSession";
import {
  createAnswerDetails,
  createExamResult,
} from "@/lib/queries/examResult";
import { calculateOverallScore } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitExamRequest;

    const userId = body.userId;
    const sessionId = body.sessionId;
    const startedAt = body.startedAt;
    const answers = body.answers ?? {};

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "sessionId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!startedAt) {
      return NextResponse.json(
        { success: false, message: "startedAt이 필요합니다." },
        { status: 400 }
      );
    }

    const session = await findExamSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "시험 세션을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "세션 사용자 정보가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    if (session.status === "submitted") {
      return NextResponse.json(
        { success: false, message: "이미 제출된 시험입니다." },
        { status: 400 }
      );
    }

    const answerDetails = questions.map((question) => {
      const selectedAnswerRaw = answers[question.id];
      const selectedAnswer =
        typeof selectedAnswerRaw === "number" ? selectedAnswerRaw : null;

      const isCorrect = selectedAnswer === question.answer;

      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
      };
    });

    const overall = calculateOverallScore(answers);

    const totalQuestions = overall.totalQuestions;
    const correctCount = overall.correctCount;
    const score = overall.score;

    const startedAtMs = new Date(startedAt).getTime();
    const submittedAtMs = Date.now();
    const durationSeconds = Math.max(
      0,
      Math.floor((submittedAtMs - startedAtMs) / 1000)
    );

    const result = await createExamResult({
      userId,
      sessionId,
      score,
      totalQuestions,
      correctCount,
      durationSeconds,
    });

    await createAnswerDetails({
      resultId: result.id,
      details: answerDetails,
    });

    await markExamSessionSubmitted(sessionId);

    return NextResponse.json({
      success: true,
      resultId: result.id,
      resultPublicId: result.publicId,
      score,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    console.error("exam/submit error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "시험 제출 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}