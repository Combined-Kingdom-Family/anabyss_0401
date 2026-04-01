import { sql } from "@/lib/db";
import type { User } from "@/types/user";

type UserRow = {
  id: string | number;
  nickname: string;
  user_number: string;
  created_at: string;
};

function mapUserRowToUser(row: UserRow): User {
  return {
    id: Number(row.id),
    nickname: row.nickname,
    userNumber: row.user_number,
    createdAt: row.created_at,
  };
}

export async function findUserByIdentity(params: {
  nickname: string;
  userNumber: string;
}): Promise<User | null> {
  const rows = await sql`
    SELECT id, nickname, user_number, created_at
    FROM users
    WHERE nickname = ${params.nickname}
      AND user_number = ${params.userNumber}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return mapUserRowToUser(rows[0] as UserRow);
}

export async function createUser(params: {
  nickname: string;
  userNumber: string;
}): Promise<User> {
  const rows = await sql`
    INSERT INTO users (nickname, user_number)
    VALUES (${params.nickname}, ${params.userNumber})
    RETURNING id, nickname, user_number, created_at
  `;

  return mapUserRowToUser(rows[0] as UserRow);
}

export async function findOrCreateUser(params: {
  nickname: string;
  userNumber: string;
}): Promise<User> {
  const existingUser = await findUserByIdentity(params);

  if (existingUser) {
    return existingUser;
  }

  return createUser(params);
}