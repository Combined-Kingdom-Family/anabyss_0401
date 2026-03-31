// 점수 기준 정렬 조회 
// 동점 처리 기준 반영 
// 상위 n명 반환 
// 필요시 현재 사용자 순위 포함

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: 나중에 DB 기준 랭킹 조회로 교체
  return NextResponse.json({
    success: true,
    rankings: [
      {
        rank: 1,
        nickname: "테스트유저1",
        score: 95,
        correctCount: 19,
        duration: 540,
        submittedAt: new Date().toISOString(),
      },
      {
        rank: 2,
        nickname: "테스트유저2",
        score: 90,
        correctCount: 18,
        duration: 610,
        submittedAt: new Date().toISOString(),
      },
    ],
  });
}