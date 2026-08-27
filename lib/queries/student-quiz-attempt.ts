import pool from "@/lib/db";

export async function getStudentQuizAttempt(
  quizId: string,
  attemptId: string,
  userId: string,
) {
  const result = await pool.query(
    `
      SELECT
        qa.id AS attempt_id,
        qa.quiz_id,
        qa.user_id,
        qa.started_at,
        qa.submitted_at,
        qa.score,
        qa.total_marks,
        qa.is_submitted,

        q.title,
        q.description,
        q.duration_seconds

      FROM quiz_attempts qa

      INNER JOIN quizzes q
        ON q.id = qa.quiz_id

      WHERE qa.id = $1
        AND qa.quiz_id = $2
        AND qa.user_id = $3
        AND q.status = 'live'

      LIMIT 1
    `,
    [attemptId, quizId, userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const attempt = result.rows[0];

  const questionsResult = await pool.query(
    `
      SELECT
        q.id,
        q.question_text,
        q.question_order,
        q.marks

      FROM questions q

      WHERE q.quiz_id = $1

      ORDER BY q.question_order ASC
    `,
    [quizId],
  );

  const optionsResult = await pool.query(
    `
      SELECT
        o.id,
        o.question_id,
        o.option_text,
        o.option_order

      FROM options o

      INNER JOIN questions q
        ON q.id = o.question_id

      WHERE q.quiz_id = $1

      ORDER BY
        o.question_id,
        o.option_order ASC
    `,
    [quizId],
  );

  const responsesResult = await pool.query(
    `
      SELECT
        question_id,
        selected_option_id

      FROM quiz_responses

      WHERE attempt_id = $1
    `,
    [attemptId],
  );

  const responseMap: Record<string, string | null> = {};

  for (const response of responsesResult.rows) {
    responseMap[response.question_id] = response.selected_option_id ?? null;
  }

  const questions = questionsResult.rows.map((question) => ({
    id: question.id,
    question_text: question.question_text,
    question_order: question.question_order,
    marks: question.marks,

    options: optionsResult.rows
      .filter((option) => option.question_id === question.id)
      .map((option) => ({
        id: option.id,
        option_text: option.option_text,
        option_order: option.option_order,
      })),

    selected_option_id: responseMap[question.id] ?? null,
  }));

  return {
    ...attempt,
    questions,
  };
}
