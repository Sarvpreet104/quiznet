"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/authorization";

export async function createQuiz(data: {
  title: string;
  description?: string;
  duration_minutes: number;
}) {
  const admin = await requireAdmin();

  const title = data.title.trim();
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

  const durationSeconds = durationMinutes * 60;

  try {
    const result = await pool.query(
      `
      INSERT INTO quizzes (
        title,
        description,
        owner_id,
        duration_seconds
      )
      VALUES ($1, $2, $3, $4)
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
      [title, description, admin.id, durationSeconds],
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

export async function getQuiz(quizId: string) {
  const admin = await requireAdmin();

  try {
    const quizResult = await pool.query(
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

    if (quizResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    return {
      success: true,
      quiz: quizResult.rows[0],
    };
  } catch (error) {
    console.error("Get quiz error:", error);

    return {
      success: false,
      error: "Unable to load quiz.",
    };
  }
}

export async function deleteQuiz(quizId: string) {
  const admin = await requireAdmin();

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
      error: "Unable to delete quiz.",
    };
  }
}

export async function getQuizForEditor(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    // --------------------------------
    // Get the quiz
    // --------------------------------

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

    // --------------------------------
    // Get questions
    // --------------------------------

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

    // --------------------------------
    // Get options
    // --------------------------------

    const optionsResult = await pool.query(
      `
      SELECT
        o.id,
        o.question_id,
        o.option_text,
        o.option_order,
        o.is_correct
      FROM options o
      WHERE o.question_id IN (
        SELECT id
        FROM questions
        WHERE quiz_id = $1
      )
      ORDER BY o.question_id, o.option_order ASC
      `,
      [quizId],
    );

    // --------------------------------
    // Return everything
    // --------------------------------

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

export async function createQuestion(quizId: string) {
  const admin = await requireAdmin();

  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    // Make sure the quiz exists and belongs to this admin.
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

    const quiz = quizResult.rows[0];

    // Only draft quizzes can be edited.
    if (quiz.status !== "draft") {
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    // Find the next question order.
    const orderResult = await pool.query(
      `
      SELECT COALESCE(MAX(question_order), 0) + 1 AS next_order
      FROM questions
      WHERE quiz_id = $1
      `,
      [quizId],
    );

    const nextOrder = Number(orderResult.rows[0].next_order);

    // Create the question.
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

export async function updateQuestion(data: {
  questionId: string;
  questionText: string;
  marks: number;
}) {
  const admin = await requireAdmin();

  const questionText = data.questionText.trim();

  if (!questionText) {
    return {
      success: false,
      error: "Question text is required.",
    };
  }

  if (data.marks <= 0 || !Number.isInteger(data.marks)) {
    return {
      success: false,
      error: "Marks must be a positive whole number.",
    };
  }

  try {
    // Verify that this question belongs to one of this admin's quizzes
    // and that the quiz is still editable.
    const ownershipResult = await pool.query(
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
      [data.questionId, admin.id],
    );

    if (ownershipResult.rows.length === 0) {
      return {
        success: false,
        error: "Question not found.",
      };
    }

    if (ownershipResult.rows[0].status !== "draft") {
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    const result = await pool.query(
      `
      UPDATE questions
      SET
        question_text = $1,
        marks = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        quiz_id,
        question_text,
        question_order,
        marks,
        created_at,
        updated_at
      `,
      [questionText, data.marks, data.questionId],
    );

    return {
      success: true,
      question: result.rows[0],
    };
  } catch (error) {
    console.error("Update question error:", error);

    return {
      success: false,
      error: "Unable to update question.",
    };
  }
}

export async function createOption(questionId: string) {
  const admin = await requireAdmin();

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

export async function updateOption(data: {
  optionId: string;
  optionText: string;
  isCorrect: boolean;
}) {
  const admin = await requireAdmin();

  const optionText = data.optionText.trim();

  if (!optionText) {
    return {
      success: false,
      error: "Option text is required.",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const optionResult = await client.query(
      `
      SELECT
        o.id,
        o.question_id
      FROM options o
      JOIN questions q
        ON q.id = o.question_id
      JOIN quizzes quiz
        ON quiz.id = q.quiz_id
      WHERE
        o.id = $1
        AND quiz.owner_id = $2
        AND quiz.status = 'draft'
      `,
      [data.optionId, admin.id],
    );

    if (optionResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Option not found or cannot be edited.",
      };
    }

    const questionId = optionResult.rows[0].question_id;

    // If this option is being marked correct,
    // make all other options incorrect.
    if (data.isCorrect) {
      await client.query(
        `
        UPDATE options
        SET is_correct = FALSE
        WHERE
          question_id = $1
          AND id != $2
        `,
        [questionId, data.optionId],
      );
    }

    const result = await client.query(
      `
      UPDATE options
      SET
        option_text = $1,
        is_correct = $2
      WHERE id = $3
      RETURNING
        id,
        question_id,
        option_text,
        option_order,
        is_correct
      `,
      [optionText, data.isCorrect, data.optionId],
    );

    await client.query("COMMIT");

    return {
      success: true,
      option: result.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("updateOption error:", error);

    return {
      success: false,
      error: "Failed to update option.",
    };
  } finally {
    client.release();
  }
}

export async function setCorrectOption(questionId: string, optionId: string) {
  const admin = await requireAdmin();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownershipResult = await client.query(
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

    if (ownershipResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Question not found.",
      };
    }

    if (ownershipResult.rows[0].status !== "draft") {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    // Make sure the option actually belongs to this question.
    const optionResult = await client.query(
      `
      SELECT id
      FROM options
      WHERE id = $1
        AND question_id = $2
      `,
      [optionId, questionId],
    );

    if (optionResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Option does not belong to this question.",
      };
    }

    // First make every option incorrect.
    await client.query(
      `
      UPDATE options
      SET is_correct = FALSE
      WHERE question_id = $1
      `,
      [questionId],
    );

    // Then make the selected option correct.
    await client.query(
      `
      UPDATE options
      SET is_correct = TRUE
      WHERE id = $1
        AND question_id = $2
      `,
      [optionId, questionId],
    );

    await client.query("COMMIT");

    return {
      success: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Set correct option error:", error);

    return {
      success: false,
      error: "Unable to set correct option.",
    };
  } finally {
    client.release();
  }
}

export async function deleteOption(optionId: string) {
  const admin = await requireAdmin();

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
}
