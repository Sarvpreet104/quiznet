"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/authorization";

type QuizStatus = "draft" | "live";

type SaveQuizEditorData = {
  quizId: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: {
    id: string;
    questionText: string;
    marks: number;
    options: {
      id: string;
      optionText: string;
      isCorrect: boolean;
    }[];
  }[];
};

/* -------------------------------------------------------------------------- */
/* CREATE QUIZ                                                                */
/* -------------------------------------------------------------------------- */

export async function createQuiz(data: {
  title: string;
  description?: string;
  duration_minutes: number;
}) {
  const admin = await requireAdmin();

  const title = data.title?.trim();
  const description = data.description?.trim() || null;
  const durationMinutes = Number(data.duration_minutes);

  if (!title) {
    return {
      success: false,
      error: "Quiz title is required.",
    };
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 600
  ) {
    return {
      success: false,
      error: "Duration must be between 1 and 600 minutes.",
    };
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO quizzes (
          title,
          description,
          owner_id,
          duration_seconds,
          status
        )
        VALUES ($1, $2, $3, $4, 'draft')
        RETURNING
          id,
          title,
          description,
          owner_id,
          status,
          duration_seconds,
          created_at,
          updated_at,
          published_at
      `,
      [title, description, admin.id, durationMinutes * 60],
    );

    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    console.error("Create quiz error:", error);

    return {
      success: false,
      error: "Unable to create quiz.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET ADMIN QUIZZES                                                          */
/* -------------------------------------------------------------------------- */

export async function getAdminQuizzes() {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
        SELECT
          q.id,
          q.title,
          q.description,
          q.status,
          q.duration_seconds,
          q.created_at,
          q.updated_at,
          q.published_at,
          COUNT(DISTINCT qa.id)::INTEGER AS attempt_count
        FROM quizzes q
        LEFT JOIN quiz_attempts qa
          ON qa.quiz_id = q.id
        WHERE q.owner_id = $1
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `,
      [admin.id],
    );

    return {
      success: true,
      quizzes: result.rows,
    };
  } catch (error) {
    console.error("Get admin quizzes error:", error);

    return {
      success: false,
      error: "Unable to load quizzes.",
      quizzes: [],
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET SINGLE QUIZ                                                            */
/* -------------------------------------------------------------------------- */

export async function getQuiz(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          owner_id,
          status,
          duration_seconds,
          created_at,
          updated_at,
          published_at
        FROM quizzes
        WHERE id = $1
          AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    console.error("Get quiz error:", error);

    return {
      success: false,
      error: "Unable to load quiz.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* SET QUIZ STATUS                                                            */
/* -------------------------------------------------------------------------- */

/*
 * This is the action used by the toggle on:
 *
 * /admin/quizzes/page.tsx
 *
 * Draft -> Live
 * Live  -> Draft
 *
 * The actual status change is performed on the server.
 */

export async function setQuizStatus(quizId: string, status: QuizStatus) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  if (status !== "draft" && status !== "live") {
    return {
      success: false,
      error: "Invalid quiz status.",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ------------------------------------------------------------
    // 1. Verify that the quiz belongs to this admin
    // ------------------------------------------------------------

    const quizResult = await client.query(
      `
        SELECT
          id,
          status
        FROM quizzes
        WHERE id = $1
          AND owner_id = $2
        FOR UPDATE
      `,
      [quizId, admin.id],
    );

    if (quizResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // ------------------------------------------------------------
    // 2. If publishing, validate the quiz first
    // ------------------------------------------------------------

    if (status === "live") {
      const validationResult = await client.query(
        `
          SELECT
            q.id,
            q.question_text,
            q.marks,

            COUNT(o.id)::INTEGER AS option_count,

            COUNT(o.id) FILTER (
              WHERE o.is_correct = TRUE
            )::INTEGER AS correct_count,

            COUNT(o.id) FILTER (
              WHERE NULLIF(TRIM(o.option_text), '') IS NULL
            )::INTEGER AS empty_option_count

          FROM questions q

          LEFT JOIN options o
            ON o.question_id = q.id

          WHERE q.quiz_id = $1

          GROUP BY
            q.id,
            q.question_text,
            q.marks

          ORDER BY q.question_order ASC
        `,
        [quizId],
      );

      // ----------------------------------------------------------
      // Quiz must have at least one question
      // ----------------------------------------------------------

      if (validationResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return {
          success: false,
          error: "A quiz must contain at least one question before going live.",
        };
      }

      // ----------------------------------------------------------
      // Validate every question
      // ----------------------------------------------------------

      for (const question of validationResult.rows) {
        if (!question.question_text?.trim()) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every question must contain question text.",
          };
        }

        if (
          !Number.isInteger(Number(question.marks)) ||
          Number(question.marks) <= 0
        ) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every question must have valid marks.",
          };
        }

        if (Number(question.option_count) < 2) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every live question must have at least two options.",
          };
        }

        if (Number(question.correct_count) !== 1) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every live question must have exactly one correct answer.",
          };
        }

        if (Number(question.empty_option_count) > 0) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every option must contain text.",
          };
        }
      }
    }

    // ------------------------------------------------------------
    // 3. Change the quiz status
    //
    // IMPORTANT:
    // quizzes.status is a PostgreSQL enum called quiz_status.
    //
    // Explicitly casting $1 prevents PostgreSQL from trying to
    // infer $1 as both TEXT and quiz_status.
    // ------------------------------------------------------------

    const result = await client.query(
      `
        UPDATE quizzes

        SET
          status = $1::quiz_status,

          published_at = CASE

            WHEN $1::quiz_status = 'live'::quiz_status
              THEN COALESCE(published_at, NOW())

            WHEN $1::quiz_status = 'draft'::quiz_status
              THEN NULL

            ELSE published_at

          END,

          updated_at = NOW()

        WHERE id = $2
          AND owner_id = $3

        RETURNING
          id,
          title,
          description,
          status,
          duration_seconds,
          created_at,
          updated_at,
          published_at
      `,
      [status, quizId, admin.id],
    );

    // ------------------------------------------------------------
    // 4. Make sure the update actually happened
    // ------------------------------------------------------------

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz could not be updated.",
      };
    }

    // ------------------------------------------------------------
    // 5. Commit
    // ------------------------------------------------------------

    await client.query("COMMIT");

    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Set quiz status error:", error);

    return {
      success: false,
      error: "Unable to change quiz status.",
    };
  } finally {
    client.release();
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE QUIZ                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteQuiz(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM quizzes
        WHERE id = $1
          AND owner_id = $2
        RETURNING id
      `,
      [quizId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete quiz error:", error);

    return {
      success: false,
      error:
        "Unable to delete quiz. Make sure related records allow quiz deletion.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET QUIZ EDITOR DATA                                                       */
/* -------------------------------------------------------------------------- */

export async function getQuizForEditor(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    const quizResult = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          status,
          duration_seconds,
          created_at,
          updated_at,
          published_at
        FROM quizzes
        WHERE id = $1
          AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    if (quizResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    const questionsResult = await pool.query(
      `
        SELECT
          q.id,
          q.quiz_id,
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
          o.option_order,
          o.is_correct
        FROM options o
        INNER JOIN questions q
          ON q.id = o.question_id
        WHERE q.quiz_id = $1
        ORDER BY o.question_id, o.option_order ASC
      `,
      [quizId],
    );

    return {
      success: true,
      quiz: quizResult.rows[0],
      questions: questionsResult.rows,
      options: optionsResult.rows,
    };
  } catch (error) {
    console.error("Get quiz editor error:", error);

    return {
      success: false,
      error: "Unable to load quiz.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE QUESTION                                                            */
/* -------------------------------------------------------------------------- */

export async function createQuestion(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    const quizResult = await pool.query(
      `
        SELECT
          id,
          status
        FROM quizzes
        WHERE id = $1
          AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    if (quizResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    if (quizResult.rows[0].status !== "draft") {
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    const orderResult = await pool.query(
      `
        SELECT COALESCE(MAX(question_order), 0) + 1 AS next_order
        FROM questions
        WHERE quiz_id = $1
      `,
      [quizId],
    );

    const nextOrder = Number(orderResult.rows[0].next_order);

    const result = await pool.query(
      `
        INSERT INTO questions (
          quiz_id,
          question_text,
          question_order,
          marks
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          quiz_id,
          question_text,
          question_order,
          marks,
          created_at,
          updated_at
      `,
      [quizId, "", nextOrder, 1],
    );

    return {
      success: true,
      question: result.rows[0],
    };
  } catch (error) {
    console.error("Create question error:", error);

    return {
      success: false,
      error: "Unable to create question.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE QUESTION                                                            */
/* -------------------------------------------------------------------------- */

export async function deleteQuestion(questionId: string) {
  const admin = await requireAdmin();

  if (!questionId) {
    return {
      success: false,
      error: "Question ID is required.",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ------------------------------------------------------------
    // 1. Verify question belongs to this admin's draft quiz
    // ------------------------------------------------------------

    const questionResult = await client.query(
      `
        SELECT
          q.id,
          q.quiz_id,
          q.question_order
        FROM questions q
        INNER JOIN quizzes quiz
          ON quiz.id = q.quiz_id
        WHERE q.id = $1
          AND quiz.owner_id = $2
          AND quiz.status = 'draft'
        FOR UPDATE
      `,
      [questionId, admin.id],
    );

    if (questionResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Question not found or cannot be deleted.",
      };
    }

    const quizId = questionResult.rows[0].quiz_id;

    // ------------------------------------------------------------
    // 2. Delete the question's options first
    //
    // We do this explicitly instead of relying on ON DELETE CASCADE.
    // ------------------------------------------------------------

    await client.query(
      `
        DELETE FROM options
        WHERE question_id = $1
      `,
      [questionId],
    );

    // ------------------------------------------------------------
    // 3. Delete the question
    // ------------------------------------------------------------

    await client.query(
      `
        DELETE FROM questions
        WHERE id = $1
          AND quiz_id = $2
      `,
      [questionId, quizId],
    );

    // ------------------------------------------------------------
    // 4. Re-number the remaining questions
    //
    // This keeps the UI as:
    //
    // Question 1
    // Question 2
    // Question 3
    //
    // instead of:
    //
    // Question 1
    // Question 3
    // Question 4
    // ------------------------------------------------------------

    const remainingQuestions = await client.query(
      `
        SELECT id
        FROM questions
        WHERE quiz_id = $1
        ORDER BY question_order ASC, created_at ASC
      `,
      [quizId],
    );

    for (let index = 0; index < remainingQuestions.rows.length; index++) {
      await client.query(
        `
          UPDATE questions
          SET
            question_order = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [index + 1, remainingQuestions.rows[index].id],
      );
    }

    // ------------------------------------------------------------
    // 5. Update quiz timestamp
    // ------------------------------------------------------------

    await client.query(
      `
        UPDATE quizzes
        SET updated_at = NOW()
        WHERE id = $1
          AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    await client.query("COMMIT");

    return {
      success: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete question error:", error);

    return {
      success: false,
      error: "Unable to delete question.",
    };
  } finally {
    client.release();
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE OPTION                                                              */
/* -------------------------------------------------------------------------- */

export async function createOption(questionId: string) {
  const admin = await requireAdmin();

  if (!questionId) {
    return {
      success: false,
      error: "Question ID is required.",
    };
  }

  try {
    const questionResult = await pool.query(
      `
        SELECT
          q.id,
          quiz.status
        FROM questions q
        INNER JOIN quizzes quiz
          ON quiz.id = q.quiz_id
        WHERE q.id = $1
          AND quiz.owner_id = $2
      `,
      [questionId, admin.id],
    );

    if (questionResult.rows.length === 0) {
      return {
        success: false,
        error: "Question not found.",
      };
    }

    if (questionResult.rows[0].status !== "draft") {
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    const orderResult = await pool.query(
      `
        SELECT COALESCE(MAX(option_order), 0) + 1 AS next_order
        FROM options
        WHERE question_id = $1
      `,
      [questionId],
    );

    const nextOrder = Number(orderResult.rows[0].next_order);

    const result = await pool.query(
      `
        INSERT INTO options (
          question_id,
          option_text,
          option_order,
          is_correct
        )
        VALUES ($1, $2, $3, FALSE)
        RETURNING
          id,
          question_id,
          option_text,
          option_order,
          is_correct
      `,
      [questionId, "", nextOrder],
    );

    return {
      success: true,
      option: result.rows[0],
    };
  } catch (error) {
    console.error("Create option error:", error);

    return {
      success: false,
      error: "Unable to create option.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE OPTION                                                              */
/* -------------------------------------------------------------------------- */

export async function updateOption(data: {
  optionId: string;
  optionText: string;
  isCorrect: boolean;
}) {
  const admin = await requireAdmin();

  const optionText = data.optionText?.trim();

  if (!data.optionId) {
    return {
      success: false,
      error: "Option ID is required.",
    };
  }

  if (!optionText) {
    return {
      success: false,
      error: "Option cannot be empty.",
    };
  }

  try {
    const result = await pool.query(
      `
        UPDATE options o
        SET
          option_text = $1,
          is_correct = $2
        FROM questions q
        INNER JOIN quizzes quiz
          ON quiz.id = q.quiz_id
        WHERE o.id = $3
          AND o.question_id = q.id
          AND quiz.owner_id = $4
          AND quiz.status = 'draft'
        RETURNING
          o.id,
          o.question_id,
          o.option_text,
          o.option_order,
          o.is_correct
      `,
      [optionText, Boolean(data.isCorrect), data.optionId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Option not found or cannot be edited.",
      };
    }

    return {
      success: true,
      option: result.rows[0],
    };
  } catch (error) {
    console.error("Update option error:", error);

    return {
      success: false,
      error: "Unable to update option.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* SAVE ENTIRE QUIZ                                                           */
/* -------------------------------------------------------------------------- */

export async function saveQuizEditor(data: SaveQuizEditorData) {
  const admin = await requireAdmin();

  const title = data.title?.trim();
  const description = data.description?.trim() || null;
  const durationMinutes = Number(data.durationMinutes);

  if (!data.quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  if (!title) {
    return {
      success: false,
      error: "Quiz title is required.",
    };
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 600
  ) {
    return {
      success: false,
      error: "Duration must be between 1 and 600 minutes.",
    };
  }

  /*
   * IMPORTANT:
   *
   * Status is intentionally NOT accepted here anymore.
   *
   * The editor only saves quiz content.
   * Publishing/unpublishing is controlled from the quiz list toggle.
   */

  for (const question of data.questions) {
    if (!question.questionText.trim()) {
      return {
        success: false,
        error: "Every question must have question text.",
      };
    }

    if (
      !Number.isInteger(Number(question.marks)) ||
      Number(question.marks) <= 0
    ) {
      return {
        success: false,
        error: "Every question must have valid marks.",
      };
    }

    for (const option of question.options) {
      if (!option.optionText.trim()) {
        return {
          success: false,
          error: "Every option must contain text.",
        };
      }
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const quizResult = await client.query(
      `
        SELECT
          id,
          status
        FROM quizzes
        WHERE id = $1
          AND owner_id = $2
        FOR UPDATE
      `,
      [data.quizId, admin.id],
    );

    if (quizResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    /*
     * Never allow content editing on a live quiz.
     */
    if (quizResult.rows[0].status !== "draft") {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Live quizzes cannot be edited. Switch the quiz to Draft first.",
      };
    }

    await client.query(
      `
        UPDATE quizzes
        SET
          title = $1,
          description = $2,
          duration_seconds = $3,
          updated_at = NOW()
        WHERE id = $4
          AND owner_id = $5
      `,
      [title, description, durationMinutes * 60, data.quizId, admin.id],
    );

    for (const question of data.questions) {
      const questionResult = await client.query(
        `
          UPDATE questions q
          SET
            question_text = $1,
            marks = $2,
            updated_at = NOW()
          FROM quizzes quiz
          WHERE q.id = $3
            AND q.quiz_id = quiz.id
            AND quiz.id = $4
            AND quiz.owner_id = $5
          RETURNING q.id
        `,
        [
          question.questionText.trim(),
          Number(question.marks),
          question.id,
          data.quizId,
          admin.id,
        ],
      );

      if (questionResult.rows.length === 0) {
        throw new Error(`Question ${question.id} was not found.`);
      }

      for (const option of question.options) {
        const optionResult = await client.query(
          `
            UPDATE options o
            SET
              option_text = $1,
              is_correct = $2
            FROM questions q
            INNER JOIN quizzes quiz
              ON quiz.id = q.quiz_id
            WHERE o.id = $3
              AND o.question_id = q.id
              AND q.id = $4
              AND quiz.id = $5
              AND quiz.owner_id = $6
            RETURNING o.id
          `,
          [
            option.optionText.trim(),
            Boolean(option.isCorrect),
            option.id,
            question.id,
            data.quizId,
            admin.id,
          ],
        );

        if (optionResult.rows.length === 0) {
          throw new Error(`Option ${option.id} was not found.`);
        }
      }
    }

    await client.query("COMMIT");

    return {
      success: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Save quiz editor error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to save quiz.",
    };
  } finally {
    client.release();
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE OPTION                                                              */
/* -------------------------------------------------------------------------- */

export async function deleteOption(optionId: string) {
  const admin = await requireAdmin();

  if (!optionId) {
    return {
      success: false,
      error: "Option ID is required.",
    };
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM options o
        USING questions q, quizzes quiz
        WHERE
          o.id = $1
          AND o.question_id = q.id
          AND q.quiz_id = quiz.id
          AND quiz.owner_id = $2
          AND quiz.status = 'draft'
        RETURNING o.id
      `,
      [optionId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Option not found or cannot be deleted.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete option error:", error);

    return {
      success: false,
      error: "Unable to delete option.",
    };
  }
}

// ============================================================
// GET STUDENT LISTS ASSIGNED TO A QUIZ
// ============================================================

export async function getQuizStudentLists(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
      lists: [],
    };
  }

  try {
    const quiz = await pool.query(
      `
      SELECT id
      FROM quizzes
      WHERE id = $1
        AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    if (quiz.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
        lists: [],
      };
    }

    const result = await pool.query(
      `
      SELECT
        sl.id,
        sl.name,
        COUNT(slm.user_id)::INTEGER AS member_count,
        qsl.assigned_at
      FROM quiz_student_lists qsl
      INNER JOIN student_lists sl
        ON sl.id = qsl.list_id
      LEFT JOIN student_list_members slm
        ON slm.list_id = sl.id
      WHERE qsl.quiz_id = $1
        AND sl.owner_id = $2
      GROUP BY
        sl.id,
        sl.name,
        qsl.assigned_at
      ORDER BY sl.name ASC
      `,
      [quizId, admin.id],
    );

    return {
      success: true,
      lists: result.rows,
    };
  } catch (error) {
    console.error("Get quiz student lists error:", error);

    return {
      success: false,
      error: "Unable to load assigned student lists.",
      lists: [],
    };
  }
}

// ============================================================
// ASSIGN STUDENT LIST TO QUIZ
// ============================================================

export async function assignStudentListToQuiz(quizId: string, listId: string) {
  const admin = await requireAdmin();

  if (!quizId || !listId) {
    return {
      success: false,
      error: "Quiz ID and student list ID are required.",
    };
  }

  try {
    // Verify quiz belongs to this admin and is editable.
    const quiz = await pool.query(
      `
      SELECT id
      FROM quizzes
      WHERE id = $1
        AND owner_id = $2
        AND status = 'draft'
      `,
      [quizId, admin.id],
    );

    if (quiz.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found or cannot be edited while live.",
      };
    }

    // Verify list belongs to this admin.
    const list = await pool.query(
      `
      SELECT id
      FROM student_lists
      WHERE id = $1
        AND owner_id = $2
      `,
      [listId, admin.id],
    );

    if (list.rows.length === 0) {
      return {
        success: false,
        error: "Student list not found.",
      };
    }

    await pool.query(
      `
      INSERT INTO quiz_student_lists (
        quiz_id,
        list_id
      )
      VALUES ($1, $2)
      ON CONFLICT (quiz_id, list_id)
      DO NOTHING
      `,
      [quizId, listId],
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Assign student list to quiz error:", error);

    return {
      success: false,
      error: "Unable to assign student list.",
    };
  }
}

// ============================================================
// REMOVE STUDENT LIST FROM QUIZ
// ============================================================

export async function removeStudentListFromQuiz(
  quizId: string,
  listId: string,
) {
  const admin = await requireAdmin();

  if (!quizId || !listId) {
    return {
      success: false,
      error: "Quiz ID and student list ID are required.",
    };
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM quiz_student_lists qsl
      USING quizzes q, student_lists sl
      WHERE qsl.quiz_id = q.id
        AND qsl.list_id = sl.id
        AND qsl.quiz_id = $1
        AND qsl.list_id = $2
        AND q.owner_id = $3
        AND sl.owner_id = $3
        AND q.status = 'draft'
      RETURNING qsl.quiz_id
      `,
      [quizId, listId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Student list assignment not found or cannot be removed.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Remove student list from quiz error:", error);

    return {
      success: false,
      error: "Unable to remove the student list.",
    };
  }
}

export async function getAdminStudentLists() {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
      SELECT
        sl.id,
        sl.name,
        COUNT(slm.user_id)::INTEGER AS member_count
      FROM student_lists sl
      LEFT JOIN student_list_members slm
        ON slm.list_id = sl.id
      WHERE sl.owner_id = $1
      GROUP BY sl.id, sl.name
      ORDER BY sl.name ASC
      `,
      [admin.id],
    );

    return {
      success: true,
      lists: result.rows,
    };
  } catch (error) {
    console.error("Get admin student lists error:", error);

    return {
      success: false,
      error: "Unable to load student lists.",
      lists: [],
    };
  }
}
