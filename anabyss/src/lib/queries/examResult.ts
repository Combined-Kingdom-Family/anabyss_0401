import { sql } from "@/lib/db";

type CreateExamResultParams = {
  userId: number;
  sessionId: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
};

export type ExamResult = {
  id: number;
  publicId: string;
  userId: number;
  sessionId: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  submittedAt: string;
};

type ExamResultRow = {
  id: string | number;
  public_id: string;
  user_id: string | number;
  session_id: string | number;
  score: number;
  total_questions: number;
  correct_count: number;
  duration_seconds: number;
  submitted_at: string;
};

function mapExamResultRow(row: ExamResultRow): ExamResult {
  return {
    id: Number(row.id),
    publicId: row.public_id,
    userId: Number(row.user_id),
    sessionId: Number(row.session_id),
    score: row.score,
    totalQuestions: row.total_questions,
    correctCount: row.correct_count,
    durationSeconds: row.duration_seconds,
    submittedAt: row.submitted_at,
  };
}

export async function createExamResult(
  params: CreateExamResultParams
): Promise<ExamResult> {
  const rows = await sql`
    INSERT INTO exam_results (
      public_id,
      user_id,
      session_id,
      score,
      total_questions,
      correct_count,
      duration_seconds
    )
    VALUES (
      gen_random_uuid(),
      ${params.userId},
      ${params.sessionId},
      ${params.score},
      ${params.totalQuestions},
      ${params.correctCount},
      ${params.durationSeconds}
    )
    RETURNING
      id,
      public_id,
      user_id,
      session_id,
      score,
      total_questions,
      correct_count,
      duration_seconds,
      submitted_at
  `;

  return mapExamResultRow(rows[0] as ExamResultRow);
}

export async function createAnswerDetails(params: {
  resultId: number;
  details: Array<{
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }>;
}) {
  if (params.details.length === 0) {
    return;
  }

  for (const detail of params.details) {
    await sql`
      INSERT INTO answer_details (
        result_id,
        question_id,
        selected_answer,
        is_correct
      )
      VALUES (
        ${params.resultId},
        ${detail.questionId},
        ${detail.selectedAnswer},
        ${detail.isCorrect}
      )
    `;
  }
}

type ExamResultDetailRow = {
  result_id: string | number;
  public_id: string;
  user_id: string | number;
  session_id: string | number;
  nickname: string;
  user_number: string;
  score: number;
  total_questions: number;
  correct_count: number;
  duration_seconds: number;
  submitted_at: string;
};

type AnswerDetailRow = {
  id: string | number;
  result_id: string | number;
  question_id: number;
  selected_answer: number | null;
  is_correct: boolean;
};

export type ExamResultDetail = {
  resultId: number;
  publicId: string;
  userId: number;
  sessionId: number;
  nickname: string;
  userNumber: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  submittedAt: string;
  answerDetails: Array<{
    id: number;
    resultId: number;
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }>;
};

export async function findExamResultDetailByPublicId(
  publicId: string
): Promise<ExamResultDetail | null> {
  const resultRows = await sql`
    SELECT
      er.id AS result_id,
      er.public_id,
      er.user_id,
      er.session_id,
      u.nickname,
      u.user_number,
      er.score,
      er.total_questions,
      er.correct_count,
      er.duration_seconds,
      er.submitted_at
    FROM exam_results er
    JOIN users u
      ON u.id = er.user_id
    WHERE er.public_id = ${publicId}
    LIMIT 1
  `;

  if (resultRows.length === 0) {
    return null;
  }

  const resultRow = resultRows[0] as ExamResultDetailRow;

  const answerRows = await sql`
    SELECT
      id,
      result_id,
      question_id,
      selected_answer,
      is_correct
    FROM answer_details
    WHERE result_id = ${resultRow.result_id}
    ORDER BY question_id ASC
  `;

  const answerDetails = (answerRows as AnswerDetailRow[]).map((row) => ({
    id: Number(row.id),
    resultId: Number(row.result_id),
    questionId: row.question_id,
    selectedAnswer: row.selected_answer,
    isCorrect: row.is_correct,
  }));

  return {
    resultId: Number(resultRow.result_id),
    publicId: resultRow.public_id,
    userId: Number(resultRow.user_id),
    sessionId: Number(resultRow.session_id),
    nickname: resultRow.nickname,
    userNumber: resultRow.user_number,
    score: resultRow.score,
    totalQuestions: resultRow.total_questions,
    correctCount: resultRow.correct_count,
    durationSeconds: resultRow.duration_seconds,
    submittedAt: resultRow.submitted_at,
    answerDetails,
  };
}

export async function findLatestExamResultByUserId(userId: number) {
  const rows = await sql`
    SELECT
      id,
      public_id,
      user_id,
      session_id,
      score,
      total_questions,
      correct_count,
      duration_seconds,
      submitted_at
    FROM exam_results
    WHERE user_id = ${userId}
    ORDER BY submitted_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return mapExamResultRow(rows[0] as ExamResultRow);
}