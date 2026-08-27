import pool from "@/lib/db";

export async function getAvailableQuizzes(userId: string) {
  const result = await pool.query(
    `
      SELECT
        q.id,
        q.title,
        q.description,
        q.duration_seconds,
        q.status,
        q.published_at,
        q.created_at,

        (
          SELECT COUNT(*)::INTEGER
          FROM questions qu
          WHERE qu.quiz_id = q.id
        ) AS question_count,

        (
          SELECT COALESCE(
            SUM(qu_marks.marks),
            0
          )::INTEGER
          FROM questions qu_marks
          WHERE qu_marks.quiz_id = q.id
        ) AS total_marks,

        qa.id AS attempt_id,
        qa.is_submitted,
        qa.score,
        qa.total_marks AS attempt_total_marks

      FROM quizzes q

      LEFT JOIN quiz_attempts qa
        ON qa.quiz_id = q.id
        AND qa.user_id = $1

      WHERE q.status = 'live'

        AND EXISTS (
          SELECT 1
          FROM quiz_student_lists qsl

          INNER JOIN student_list_members slm
            ON slm.list_id = qsl.list_id

          WHERE qsl.quiz_id = q.id
            AND slm.user_id = $1
        )

      ORDER BY
        q.published_at DESC NULLS LAST,
        q.created_at DESC
    `,
    [userId],
  );

  return result.rows;
}
