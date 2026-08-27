import pool from "@/lib/db";

/* -------------------------------------------------------------------------- */
/* GET ALL STUDENT RESULTS                                                    */
/* -------------------------------------------------------------------------- */

export async function getStudentResults(userId: string) {
  const result = await pool.query(
    `
      SELECT
        qa.id AS attempt_id,
        qa.quiz_id,
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

      WHERE qa.user_id = $1
        AND qa.is_submitted = TRUE

      ORDER BY
        qa.submitted_at DESC NULLS LAST,
        qa.started_at DESC
    `,
    [userId],
  );

  return result.rows;
}

/* -------------------------------------------------------------------------- */
/* GET SINGLE STUDENT RESULT                                                  */
/* -------------------------------------------------------------------------- */

export async function getStudentResult(quizId: string, userId: string) {
  /*
   * Find the student's submitted attempt for this quiz.
   */

  const attemptResult = await pool.query(
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

      WHERE qa.quiz_id = $1
        AND qa.user_id = $2
        AND qa.is_submitted = TRUE

      ORDER BY qa.submitted_at DESC

      LIMIT 1
    `,
    [quizId, userId],
  );

  if (attemptResult.rows.length === 0) {
    return null;
  }

  const attempt = attemptResult.rows[0];

  /*
   * IMPORTANT:
   *
   * The first query aliases qa.id as "attempt_id".
   *
   * Therefore the actual attempt ID is:
   *
   *     attempt.attempt_id
   *
   * NOT:
   *
   *     attempt.id
   *
   * We use attempt.attempt_id below when looking up
   * the student's quiz responses.
   */

  const questionsResult = await pool.query(
    `
      SELECT
        q.id,
        q.question_text,
        q.question_order,
        q.marks,

        qr.selected_option_id,

        selected_option.option_text AS selected_option_text,

        correct_option.id AS correct_option_id,
        correct_option.option_text AS correct_option_text,

        CASE
          WHEN qr.selected_option_id IS NULL THEN FALSE

          WHEN qr.selected_option_id = correct_option.id THEN TRUE

          ELSE FALSE
        END AS is_correct

      FROM questions q

      LEFT JOIN quiz_responses qr
        ON qr.question_id = q.id
        AND qr.attempt_id = $1

      LEFT JOIN options selected_option
        ON selected_option.id = qr.selected_option_id
        AND selected_option.question_id = q.id

      LEFT JOIN options correct_option
        ON correct_option.question_id = q.id
        AND correct_option.is_correct = TRUE

      WHERE q.quiz_id = $2

      ORDER BY q.question_order ASC
    `,
    [attempt.attempt_id, quizId],
  );

  /*
   * Get all options belonging to this quiz.
   *
   * We need these so the result page can show:
   *
   * - every option
   * - the correct option
   * - the student's selected option
   */

  const optionsResult = await pool.query(
    `
      SELECT
        o.id,
        o.question_id,
        o.option_text,
        o.option_order,
        o.is_correct

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

  /*
   * Build the final question structure.
   */

  const questions = questionsResult.rows.map((question) => {
    const selectedOptionId = question.selected_option_id ?? null;

    const correctOptionId = question.correct_option_id ?? null;

    return {
      id: question.id,

      question_text: question.question_text,

      question_order: question.question_order,

      marks: Number(question.marks),

      /*
       * This is the student's actual selected option.
       */

      selected_option_id: selectedOptionId,

      selected_option_text: question.selected_option_text ?? null,

      /*
       * This is the correct option.
       */

      correct_option_id: correctOptionId,

      correct_option_text: question.correct_option_text ?? null,

      /*
       * PostgreSQL returns a real boolean here.
       */

      is_correct: question.is_correct === true,

      /*
       * Attach every option belonging to this question.
       */

      options: optionsResult.rows
        .filter((option) => option.question_id === question.id)
        .map((option) => ({
          id: option.id,

          option_text: option.option_text,

          option_order: Number(option.option_order),

          is_correct: option.is_correct === true,
        })),
    };
  });

  return {
    ...attempt,

    score: Number(attempt.score),

    total_marks: Number(attempt.total_marks),

    questions,
  };
}
