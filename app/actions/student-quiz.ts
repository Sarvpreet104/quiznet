"use server";

import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { requireStudent } from "@/lib/authorization";

function isNextRedirectError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

/* -------------------------------------------------------------------------- */
/* START QUIZ                                                                 */
/* -------------------------------------------------------------------------- */

export async function startQuiz(quizId: string) {
  const user = await requireStudent();

  if (!quizId) {
    throw new Error("Quiz ID is required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * Verify:
     * 1. Quiz exists
     * 2. Quiz is live
     * 3. Student belongs to one of its assigned lists
     */

    const quizResult = await client.query(
      `
        SELECT
          q.id,
          q.duration_seconds,
          COUNT(DISTINCT questions.id)::INTEGER AS question_count,
          COALESCE(SUM(questions.marks), 0)::INTEGER AS total_marks

        FROM quizzes q

        INNER JOIN quiz_student_lists qsl
          ON qsl.quiz_id = q.id

        INNER JOIN student_list_members slm
          ON slm.list_id = qsl.list_id
          AND slm.user_id = $2

        LEFT JOIN questions
          ON questions.quiz_id = q.id

        WHERE q.id = $1
          AND q.status = 'live'

        GROUP BY
          q.id,
          q.duration_seconds

        LIMIT 1
      `,
      [quizId, user.id],
    );

    if (quizResult.rows.length === 0) {
      await client.query("ROLLBACK");

      throw new Error(
        "Quiz not found or you are not allowed to take this quiz.",
      );
    }

    const quiz = quizResult.rows[0];

    if (Number(quiz.question_count) === 0) {
      await client.query("ROLLBACK");

      throw new Error("This quiz does not contain any questions.");
    }

    /*
     * Check existing attempt.
     */

    const existingAttempt = await client.query(
      `
        SELECT
          id,
          is_submitted

        FROM quiz_attempts

        WHERE quiz_id = $1
          AND user_id = $2

        LIMIT 1
      `,
      [quizId, user.id],
    );

    if (existingAttempt.rows.length > 0) {
      const attempt = existingAttempt.rows[0];

      await client.query("COMMIT");

      if (attempt.is_submitted) {
        redirect(`/dashboard/quizzes/${quizId}`);
      }

      redirect(`/dashboard/quizzes/${quizId}/attempt?attemptId=${attempt.id}`);
    }

    /*
     * Create the student's single attempt.
     */

    const attemptResult = await client.query(
      `
        INSERT INTO quiz_attempts (
          quiz_id,
          user_id,
          started_at,
          total_marks,
          score,
          is_submitted
        )

        VALUES (
          $1,
          $2,
          NOW(),
          $3,
          0,
          FALSE
        )

        RETURNING id
      `,
      [quizId, user.id, quiz.total_marks],
    );

    const attemptId = attemptResult.rows[0].id;

    await client.query("COMMIT");

    redirect(`/dashboard/quizzes/${quizId}/attempt?attemptId=${attemptId}`);
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors.
    }

    console.error("Start quiz error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Unable to start the quiz.",
    );
  } finally {
    client.release();
  }
}

/* -------------------------------------------------------------------------- */
/* SAVE ANSWER                                                                */
/* -------------------------------------------------------------------------- */

export async function saveQuizResponse(data: {
  attemptId: string;
  quizId: string;
  questionId: string;
  optionId: string | null;
}) {
  const user = await requireStudent();

  if (!data.attemptId || !data.quizId || !data.questionId) {
    return {
      success: false,
      error: "Invalid quiz response.",
    };
  }

  try {
    /*
     * Make sure this attempt belongs to the logged-in student,
     * belongs to this quiz, is still active, and the quiz is live.
     */

    const attemptResult = await pool.query(
      `
        SELECT
          qa.id,
          qa.started_at,
          qa.is_submitted,
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
      [data.attemptId, data.quizId, user.id],
    );

    if (attemptResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz attempt not found.",
      };
    }

    const attempt = attemptResult.rows[0];

    if (attempt.is_submitted) {
      return {
        success: false,
        error: "This quiz has already been submitted.",
      };
    }

    /*
     * Server-side timer check.
     */

    const expiredResult = await pool.query(
      `
        SELECT
          NOW() >= (
            $1::timestamptz
            + ($2::integer * INTERVAL '1 second')
          ) AS expired
      `,
      [attempt.started_at, Number(attempt.duration_seconds)],
    );

    if (expiredResult.rows[0].expired) {
      return {
        success: false,
        error: "The quiz time has expired.",
        expired: true,
      };
    }

    /*
     * Verify question belongs to this quiz.
     */

    const questionResult = await pool.query(
      `
        SELECT id
        FROM questions

        WHERE id = $1
          AND quiz_id = $2

        LIMIT 1
      `,
      [data.questionId, data.quizId],
    );

    if (questionResult.rows.length === 0) {
      return {
        success: false,
        error: "Invalid question.",
      };
    }

    /*
     * NULL means the student cleared their answer.
     */

    if (data.optionId === null) {
      await pool.query(
        `
          INSERT INTO quiz_responses (
            attempt_id,
            question_id,
            selected_option_id
          )

          VALUES ($1, $2, NULL)

          ON CONFLICT (attempt_id, question_id)

          DO UPDATE SET
            selected_option_id = NULL,
            updated_at = NOW()
        `,
        [data.attemptId, data.questionId],
      );

      return {
        success: true,
      };
    }

    /*
     * Verify the selected option actually belongs
     * to the question being answered.
     */

    const optionResult = await pool.query(
      `
        SELECT id
        FROM options

        WHERE id = $1
          AND question_id = $2

        LIMIT 1
      `,
      [data.optionId, data.questionId],
    );

    if (optionResult.rows.length === 0) {
      return {
        success: false,
        error: "Invalid option.",
      };
    }

    /*
     * Save / update response.
     */

    await pool.query(
      `
        INSERT INTO quiz_responses (
          attempt_id,
          question_id,
          selected_option_id
        )

        VALUES ($1, $2, $3)

        ON CONFLICT (attempt_id, question_id)

        DO UPDATE SET
          selected_option_id = EXCLUDED.selected_option_id,
          updated_at = NOW()
      `,
      [data.attemptId, data.questionId, data.optionId],
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Save quiz response error:", error);

    return {
      success: false,
      error: "Unable to save your answer.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* SUBMIT QUIZ                                                                */
/* -------------------------------------------------------------------------- */

export async function submitQuiz(data: { attemptId: string; quizId: string }) {
  const user = await requireStudent();

  if (!data.attemptId || !data.quizId) {
    return {
      success: false,
      error: "Invalid quiz submission.",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * Lock the attempt.
     *
     * This prevents two simultaneous submissions from
     * calculating different results.
     */

    const attemptResult = await client.query(
      `
        SELECT
          qa.id,
          qa.quiz_id,
          qa.user_id,
          qa.started_at,
          qa.is_submitted,
          q.duration_seconds

        FROM quiz_attempts qa

        INNER JOIN quizzes q
          ON q.id = qa.quiz_id

        WHERE qa.id = $1
          AND qa.quiz_id = $2
          AND qa.user_id = $3

        FOR UPDATE
      `,
      [data.attemptId, data.quizId, user.id],
    );

    if (attemptResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz attempt not found.",
      };
    }

    const attempt = attemptResult.rows[0];

    /*
     * Already submitted.
     */

    if (attempt.is_submitted) {
      await client.query("COMMIT");

      return {
        success: true,
        alreadySubmitted: true,
        score: null,
        totalMarks: null,
      };
    }

    /*
     * Verify quiz is still live.
     */

    if (attempt.duration_seconds == null) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Invalid quiz duration.",
      };
    }

    /*
     * Calculate score completely on the server.
     *
     * We don't trust anything from the browser.
     */

    const scoreResult = await client.query(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN o.is_correct = TRUE
                THEN q.marks
                ELSE 0
              END
            ),
            0
          )::INTEGER AS score,

          COALESCE(
            SUM(q.marks),
            0
          )::INTEGER AS total_marks

        FROM questions q

        LEFT JOIN quiz_responses qr
          ON qr.question_id = q.id
          AND qr.attempt_id = $1

        LEFT JOIN options o
          ON o.id = qr.selected_option_id
          AND o.question_id = q.id

        WHERE q.quiz_id = $2
      `,
      [data.attemptId, data.quizId],
    );

    const score = Number(scoreResult.rows[0].score);
    const totalMarks = Number(scoreResult.rows[0].total_marks);

    /*
     * Determine whether the attempt expired.
     *
     * We still allow submission after the timer has expired.
     * This is important for auto-submit.
     *
     * The difference is that the server decides the score.
     */

    await client.query(
      `
        UPDATE quiz_attempts

        SET
          score = $1,
          total_marks = $2,
          submitted_at = NOW(),
          is_submitted = TRUE

        WHERE id = $3
      `,
      [score, totalMarks, data.attemptId],
    );

    await client.query("COMMIT");

    return {
      success: true,
      alreadySubmitted: false,
      score,
      totalMarks,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors.
    }

    console.error("Submit quiz error:", error);

    return {
      success: false,
      error: "Unable to submit the quiz.",
    };
  } finally {
    client.release();
  }
}
