"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/authorization";

// types
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

// functions:-
/*
  createQuiz(): 
  to create quiz with a 
  title, description and duration
  in database.

  database tables used: quizzes
*/
export async function createQuiz(data: {
  title: string;
  description?: string;
  duration_minutes: number;
}) {
  // only admin can create quiz
  const admin = await requireAdmin();

  // getting data ready
  const title = data.title?.trim();
  const description = data.description?.trim() || null;
  const durationMinutes = Number(data.duration_minutes);

  // error handeling
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
    // creating quiz
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

    // returning the created quiz data
    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    console.error("createQuiz() error:", error);

    return {
      success: false,
      error: "Unable to create quiz.",
    };
  }
}

/*
  deleteQuiz():
  it deletes a quiz of a admin
  searching db by quiz's id and admin's id

  database tabels used: quizzes
*/
export async function deleteQuiz(quizId: string) {
  // only admin can delete a quiz
  const admin = await requireAdmin();

  // error handeling
  // if quiz's id not provided
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    // deleting the quiz of this admin
    const result = await pool.query(
      `
        DELETE FROM quizzes
        WHERE id = $1
          AND owner_id = $2
        RETURNING id
      `,
      [quizId, admin.id],
    );

    // if the quiz not found, so didn't delete ofcourse.
    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // if deleted
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

/* 
  getAdminQuizzes():
  it fetches the particular admin's quizzes (all of them)
  from database. Also with number of student attempts.
  And the admin can see the quizzes that only he/she has been created.

  database tables used: quizzes, quiz_attempts
*/
export async function getAdminQuizzes() {
  // only admin can access
  const admin = await requireAdmin();

  try {
    // get the list of all quizzes created by admin
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
    console.error("getAdminQuizzes() error:", error);

    return {
      success: false,
      error: "Unable to load quizzes.",
      quizzes: [],
    };
  }
}

/*
  getQuiz():
  it returns only a particular quiz data
  by searching database by admin's id and quiz's id
  so that the quiz is visible to the admin which he/she created.

  database table used: quizzes
*/
export async function getQuiz(quizId: string) {
  // only admin can access this function
  const admin = await requireAdmin();

  // if not quizId
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  // if quizId
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

    // if quiz not found
    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // else returning the quiz
    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    console.error("getQuiz() error:", error);

    return {
      success: false,
      error: "Unable to load quiz.",
    };
  }
}

/*
  setQuizStatus():
  it helps admin to set the status of his/her particular quiz.
  The function uses a TRANSACTION as I needed so many queries to execute.
  The function not just set the quiz status, it validates the quiz itself if it is ready to publish

  database tables used: quizzes, questions, options
*/
export async function setQuizStatus(quizId: string, status: "draft" | "live") {
  // only admin can set the quiz status
  const admin = await requireAdmin();

  // error handeling
  // if quiz's id not provided
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  // if status is a vauge value (it should be either "draft" or "live")
  if (status !== "draft" && status !== "live") {
    return {
      success: false,
      error: "Invalid quiz status.",
    };
  }

  // using TRANSACTION
  const client = await pool.connect();

  try {
    // TRANSACTION BEGINS
    await client.query("BEGIN");

    // 1. Verifing the quiz belongs to this admin
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

    // if not belongs, ROLLBACK
    if (quizResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // 2. If making "live", quiz needs to be validated first!
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

      // Quiz must have at least one question
      if (validationResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return {
          success: false,
          error: "A quiz must contain at least one question before going live.",
        };
      }

      // Validating every question in that quiz
      for (const question of validationResult.rows) {
        // question's text validation
        if (!question.question_text?.trim()) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every question must contain question text.",
          };
        }

        // question's marks validation
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

        // question's number of options validation
        if (Number(question.option_count) < 2) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every live question must have at least two options.",
          };
        }

        // question's correct answer selection validation
        if (Number(question.correct_count) !== 1) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every live question must have exactly one correct answer.",
          };
        }

        // question's option's text validation
        if (Number(question.empty_option_count) > 0) {
          await client.query("ROLLBACK");

          return {
            success: false,
            error: "Every option must contain text.",
          };
        }
      }
    }

    // 3. Change the quiz status
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

    // 4. Making sure the update actually happened
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz could not be updated.",
      };
    }

    // TRANSACTION COMMIT
    await client.query("COMMIT");

    // returning the quiz which status has been changed by admin
    return {
      success: true,
      quiz: result.rows[0],
    };
  } catch (error) {
    // ROLLBACK if something went wrong
    await client.query("ROLLBACK");

    console.error("setQuizStatus() error:", error);

    return {
      success: false,
      error: "Unable to change quiz status.",
    };
  } finally {
    // RELEASING CLIENT
    client.release();
  }
}

/*
  getQuizForEditor():
  this fuction just return quiz, that quiz's questions and their respective options data.

  database tabels used: quizzes, questions, options
*/
export async function getQuizForEditor(quizId: string) {
  // only admin can get the data for the editor (because he/she is using the editor stupid :), Jk)
  const admin = await requireAdmin();

  // if quiz ID not provided
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    // getting the quiz data
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

    // if quiz not found
    if (quizResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // getting the quiz's question data
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

    // getting quiz's question's option data
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

    // returning the quiz data, quiz's questions data, quis'z questions' options data
    return {
      success: true,
      quiz: quizResult.rows[0],
      questions: questionsResult.rows,
      options: optionsResult.rows,
    };
  } catch (error) {
    console.error("getQuizForEditor() error:", error);

    return {
      success: false,
      error: "Unable to load quiz.",
    };
  }
}

/*
  createQuestions():
  it allows the functionality to create a question in a quiz.

  database tables used: quizzes, questions
*/
export async function createQuestion(quizId: string) {
  // only admin can create a question
  const admin = await requireAdmin();

  // if quiz id not provided
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  try {
    // looking at quiz status
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

    // if quiz not found
    if (quizResult.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // if quiz is live
    if (quizResult.rows[0].status !== "draft") {
      // it can't be edited, so the question can't be added too
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    // next order of the question in quiz
    const orderResult = await pool.query(
      `
        SELECT COALESCE(MAX(question_order), 0) + 1 AS next_order
        FROM questions
        WHERE quiz_id = $1
      `,
      [quizId],
    );

    const nextOrder = Number(orderResult.rows[0].next_order);

    // creating question
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
    console.error("createQuestion() error:", error);

    return {
      success: false,
      error: "Unable to create question.",
    };
  }
}

/*
  deleteQuestion():
  it allows the functionality of deleting a question when quiz is in draft mode.
  it also reorders the remaining questions in the quiz.
  
  database tables used: quizzes, questions, options
*/
export async function deleteQuestion(questionId: string) {
  // only admin can delete a question
  const admin = await requireAdmin();

  // if question id not provided
  if (!questionId) {
    return {
      success: false,
      error: "Question ID is required.",
    };
  }

  // using TRANSACTION
  const client = await pool.connect();

  try {
    // TRANSACTION BEGINS
    await client.query("BEGIN");

    // 1. Verify question belongs to this admin and quiz is "draft"
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

    // if no question found
    if (questionResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Question not found or cannot be deleted.",
      };
    }

    const quizId = questionResult.rows[0].quiz_id;

    // 2. Delete the question's options first
    await client.query(
      `
        DELETE FROM options
        WHERE question_id = $1
      `,
      [questionId],
    );

    // 3. Delete the question
    await client.query(
      `
        DELETE FROM questions
        WHERE id = $1
          AND quiz_id = $2
      `,
      [questionId, quizId],
    );

    // 4. Re-number the remaining questions
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

    // 5. Update quiz timestamp
    await client.query(
      `
        UPDATE quizzes
        SET updated_at = NOW()
        WHERE id = $1
          AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    // TRANSACTION COMMIT
    await client.query("COMMIT");

    return {
      success: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("deleteQuestion() error:", error);

    return {
      success: false,
      error: "Unable to delete question.",
    };
  } finally {
    client.release();
  }
}

/*
  createOption():
  it allows the functionality of creating options of a question in a quiz.

  database tables used: quizzes, questions, options
*/
export async function createOption(questionId: string) {
  // only admin can create options
  const admin = await requireAdmin();

  // if question id not provided
  if (!questionId) {
    return {
      success: false,
      error: "Question ID is required.",
    };
  }

  try {
    // get question id and quiz status
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

    // if question not found
    if (questionResult.rows.length === 0) {
      return {
        success: false,
        error: "Question not found.",
      };
    }

    // if quiz is live
    if (questionResult.rows[0].status !== "draft") {
      return {
        success: false,
        error: "Live quizzes cannot be edited.",
      };
    }

    // next order of option
    const orderResult = await pool.query(
      `
        SELECT COALESCE(MAX(option_order), 0) + 1 AS next_order
        FROM options
        WHERE question_id = $1
      `,
      [questionId],
    );

    const nextOrder = Number(orderResult.rows[0].next_order);

    // create the option
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
    console.error("createOption() error:", error);

    return {
      success: false,
      error: "Unable to create option.",
    };
  }
}

/*
  updateOpiton():
  it enables the functionality of updating the option data of a question in a quiz.

  database tables used: quizzes, questions, options
*/
export async function updateOption(data: {
  optionId: string;
  optionText: string;
  isCorrect: boolean;
}) {
  // only admin can update option data
  const admin = await requireAdmin();

  // get option data from admin
  const optionText = data.optionText?.trim();

  // error handling
  // if option id not provided
  if (!data.optionId) {
    return {
      success: false,
      error: "Option ID is required.",
    };
  }

  // if option text not provided
  if (!optionText) {
    return {
      success: false,
      error: "Option cannot be empty.",
    };
  }

  try {
    // updating the option data
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

    // if option not found
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
    console.error("updateOption() error:", error);

    return {
      success: false,
      error: "Unable to update option.",
    };
  }
}

/*
  saveQuizEditor():
  it enables the save funcitonality to the quiz editor.

  database tables used: 
*/
export async function saveQuizEditor(data: SaveQuizEditorData) {
  // only admin can have the save functionality
  const admin = await requireAdmin();

  // getting data of quiz from editor
  const title = data.title?.trim();
  const description = data.description?.trim() || null;
  const durationMinutes = Number(data.durationMinutes);

  // if quiz id not provided
  if (!data.quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
    };
  }

  // if title not given
  if (!title) {
    return {
      success: false,
      error: "Quiz title is required.",
    };
  }

  // if duration is vague
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

  // Validating all the questions of the quiz before saving
  for (const question of data.questions) {
    // question must has text
    if (!question.questionText.trim()) {
      return {
        success: false,
        error: "Every question must have question text.",
      };
    }

    // checking the marks
    if (
      !Number.isInteger(Number(question.marks)) ||
      Number(question.marks) <= 0
    ) {
      return {
        success: false,
        error: "Every question must have valid marks.",
      };
    }

    // validating the options
    for (const option of question.options) {
      // option must has text
      if (!option.optionText.trim()) {
        return {
          success: false,
          error: "Every option must contain text.",
        };
      }
    }
  }

  // using TRANSACTION
  const client = await pool.connect();

  try {
    // TRANSACTION BEGINS
    await client.query("BEGIN");

    // getting the quiz status
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

    // if quiz not found
    if (quizResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Quiz not found.",
      };
    }

    // if quiz is live
    if (quizResult.rows[0].status !== "draft") {
      await client.query("ROLLBACK");

      return {
        success: false,
        error: "Live quizzes cannot be edited. Switch the quiz to Draft first.",
      };
    }

    // saving (updating) the quiz
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

    // saving all questions
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

      // if a question not found
      if (questionResult.rows.length === 0) {
        throw new Error(`Question ${question.id} was not found.`);
      }

      // saving every option
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

        // if an option not found
        if (optionResult.rows.length === 0) {
          throw new Error(`Option ${option.id} was not found.`);
        }
      }
    }

    // TRANSACION COMMIT
    await client.query("COMMIT");

    return {
      success: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("saveQuizEditor() error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to save quiz.",
    };
  } finally {
    client.release();
  }
}

/*
  deleteOption():
  to enable the delete option functionality in editor

  database tables used: questions, quizzes, options
*/
export async function deleteOption(optionId: string) {
  // admin only usage
  const admin = await requireAdmin();

  // if option's ID not provided
  if (!optionId) {
    return {
      success: false,
      error: "Option ID is required.",
    };
  }

  try {
    // delete option
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

    // if option not found
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
    console.error("deleteOption() error:", error);

    return {
      success: false,
      error: "Unable to delete option.",
    };
  }
}

/*
  getQuizStudentLists():
  to make the student lists available in editor so that the list could be assigned to that quiz.

  database tables used: quizzes, get_student_lists, student_lists
*/
export async function getQuizStudentLists(quizId: string) {
  // admin only access
  const admin = await requireAdmin();

  // if quiz id not provided
  if (!quizId) {
    return {
      success: false,
      error: "Quiz ID is required.",
      lists: [],
    };
  }

  try {
    // checking quiz
    const quiz = await pool.query(
      `
      SELECT id
      FROM quizzes
      WHERE id = $1
        AND owner_id = $2
      `,
      [quizId, admin.id],
    );

    // if quiz not found
    if (quiz.rows.length === 0) {
      return {
        success: false,
        error: "Quiz not found.",
        lists: [],
      };
    }

    // if quiz found, get the available studentlist details
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
    console.error("getQuizStudentLists() error:", error);

    return {
      success: false,
      error: "Unable to load assigned student lists.",
      lists: [],
    };
  }
}

/*
  assignStudentListToQuiz():
  to enable the functionality to assign the quiz a student list.

  database tables used: quizzes, student_lists, quiz_student_lists
*/
export async function assignStudentListToQuiz(quizId: string, listId: string) {
  // only admin can assign the student lists to quiz
  const admin = await requireAdmin();

  // if quiz id or list id not provided.
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

    // if quiz not found or is live
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

    // if list not found
    if (list.rows.length === 0) {
      return {
        success: false,
        error: "Student list not found.",
      };
    }

    // assign list to quiz
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
    console.error("assignStudentListToQuiz() error:", error);

    return {
      success: false,
      error: "Unable to assign student list.",
    };
  }
}

/*
  removeStudentListFromQuiz():
  to enable the functionality of un-assigning the studentlist from a quiz

  database tables used: quizzes, quiz_student_lists, student_lists
*/
export async function removeStudentListFromQuiz(
  quizId: string,
  listId: string,
) {
  // only admin can unassign a student list to a quiz
  const admin = await requireAdmin();

  // if quiz id or list id not provided
  if (!quizId || !listId) {
    return {
      success: false,
      error: "Quiz ID and student list ID are required.",
    };
  }

  try {
    // unassigning the student list from quiz
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

    // if studentlist not found or quiz is live
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
    console.error("removeStudentListFromQuiz() error:", error);

    return {
      success: false,
      error: "Unable to remove the student list.",
    };
  }
}

/*
  IS THIS A USELESS FUNCTION ????
  getAdminStudentLists():

  database tables used: 
*/
export async function getAdminStudentLists() {
  // only admin access
  const admin = await requireAdmin();

  try {
    // getting the student lists of this admin
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
    console.error("getAdminStudentLists() error:", error);

    return {
      success: false,
      error: "Unable to load student lists.",
      lists: [],
    };
  }
}
