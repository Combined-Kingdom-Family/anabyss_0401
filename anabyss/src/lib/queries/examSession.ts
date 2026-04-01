// 진행 중 세션 조회 
// 세션 생성 
// 진행 상태 저장 
// 세션 종료 처리 
import { sql } from "@/lib/db";

export type ExamSession = {
  id: number;
  userId: number;
  startedAt: string;
  currentIndex: number;
  answersJson: Record<string, number>;
  remainingSeconds: number;
  hasPlayedTenMinuteWarning: boolean;
  status: string;
  updatedAt: string;
};

type ExamSessionRow = {
  id: string | number;
  user_id: string | number;
  started_at: string;
  current_index: number;
  answers_json: Record<string, number>;
  remaining_seconds: number;
  has_played_ten_minute_warning: boolean;
  status: string;
  updated_at: string;
};

function mapExamSessionRow(row: ExamSessionRow): ExamSession {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    startedAt: row.started_at,
    currentIndex: row.current_index,
    answersJson: row.answers_json ?? {},
    remainingSeconds: row.remaining_seconds,
    hasPlayedTenMinuteWarning: row.has_played_ten_minute_warning,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function findInProgressSessionByUserId(
  userId: number
): Promise<ExamSession | null> {
  const rows = await sql`
    SELECT
      id,
      user_id,
      started_at,
      current_index,
      answers_json,
      remaining_seconds,
      has_played_ten_minute_warning,
      status,
      updated_at
    FROM exam_sessions
    WHERE user_id = ${userId}
      AND status = 'in_progress'
    ORDER BY id DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return mapExamSessionRow(rows[0] as ExamSessionRow);
}

export async function createExamSession(params: {
  userId: number;
  remainingSeconds: number;
}): Promise<ExamSession> {
  const rows = await sql`
    INSERT INTO exam_sessions (
      user_id,
      remaining_seconds
    )
    VALUES (
      ${params.userId},
      ${params.remainingSeconds}
    )
    RETURNING
      id,
      user_id,
      started_at,
      current_index,
      answers_json,
      remaining_seconds,
      has_played_ten_minute_warning,
      status,
      updated_at
  `;

  return mapExamSessionRow(rows[0] as ExamSessionRow);
}

export async function findOrCreateExamSession(params: {
  userId: number;
  remainingSeconds: number;
}): Promise<ExamSession> {
  const existingSession = await findInProgressSessionByUserId(params.userId);

  if (existingSession) {
    return existingSession;
  }

  return createExamSession(params);
}

export async function updateExamSessionProgress(params: {
  sessionId: number;
  currentIndex: number;
  answersJson: Record<string, number>;
  remainingSeconds: number;
  hasPlayedTenMinuteWarning: boolean;
}) {
  const rows = await sql`
    UPDATE exam_sessions
    SET
      current_index = ${params.currentIndex},
      answers_json = ${JSON.stringify(params.answersJson)}::jsonb,
      remaining_seconds = ${params.remainingSeconds},
      has_played_ten_minute_warning = ${params.hasPlayedTenMinuteWarning},
      updated_at = NOW()
    WHERE id = ${params.sessionId}
      AND status = 'in_progress'
    RETURNING
      id,
      user_id,
      started_at,
      current_index,
      answers_json,
      remaining_seconds,
      has_played_ten_minute_warning,
      status,
      updated_at
  `;

  if (rows.length === 0) {
    throw new Error("업데이트할 시험 세션을 찾을 수 없습니다.");
  }

  return mapExamSessionRow(rows[0] as ExamSessionRow);
}

export async function markExamSessionSubmitted(sessionId: number) {
  const rows = await sql`
    UPDATE exam_sessions
    SET
      status = 'submitted',
      updated_at = NOW()
    WHERE id = ${sessionId}
    RETURNING
      id,
      user_id,
      started_at,
      current_index,
      answers_json,
      remaining_seconds,
      has_played_ten_minute_warning,
      status,
      updated_at
  `;

  if (rows.length === 0) {
    throw new Error("제출 처리할 시험을 찾을 수 없습니다.");
  }

  return mapExamSessionRow(rows[0] as ExamSessionRow);
}

export async function findExamSessionById(sessionId: number) {
  const rows = await sql`
    SELECT
      id,
      user_id,
      started_at,
      current_index,
      answers_json,
      remaining_seconds,
      has_played_ten_minute_warning,
      status,
      updated_at
    FROM exam_sessions
    WHERE id = ${sessionId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return mapExamSessionRow(rows[0] as ExamSessionRow);
}
