import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql`
      INSERT INTO users (nickname, user_number)
      VALUES ('테스트유저', '999999')
      ON CONFLICT (user_number) DO NOTHING
    `;

    const result = await sql`
      SELECT * FROM users
      ORDER BY id DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("test-db error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "DB 연결 실패",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}