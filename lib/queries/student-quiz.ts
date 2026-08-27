import pool from "@/lib/db";

export async function getStudentQuiz(quizId: string, userId: string) {
  const result = await pool.query(
    `
      SELECT
        q.id,
        q.title,
        q.description,
        q.duration_seconds,
        q.status,
        q.published_at,

        (
          SELECT COUNT(*)::INTEGER
          FROM questions questions_count
          WHERE questions_count.quiz_id = q.id
        ) AS question_count,

        (
          SELECT COALESCE(
            SUM(questions_marks.marks),
            0
          )::INTEGER
          FROM questions questions_marks
          WHERE questions_marks.quiz_id = q.id
        ) AS total_marks,

        qa.id AS attempt_id,
        qa.is_submitted,
        qa.score,
        qa.total_marks AS attempt_total_marks,
        qa.started_at,
        qa.submitted_at

      FROM quizzes q

      LEFT JOIN quiz_attempts qa
        ON qa.quiz_id = q.id
        AND qa.user_id = $2

      WHERE q.id = $1
        AND q.status = 'live'

        AND EXISTS (
          SELECT 1
          FROM quiz_student_lists qsl

          INNER JOIN student_list_members slm
            ON slm.list_id = qsl.list_id

          WHERE qsl.quiz_id = q.id
            AND slm.user_id = $2
        )

      LIMIT 1
    `,
    [quizId, userId],
  );

  return result.rows[0] ?? null;
}
