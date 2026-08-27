"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/authorization";

// ============================================================
// CREATE STUDENT LIST
// ============================================================

export async function createStudentList(name: string) {
  const admin = await requireAdmin();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "List name is required.",
    };
  }

  if (trimmedName.length > 100) {
    return {
      success: false,
      error: "List name must be 100 characters or less.",
    };
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO student_lists (
        name,
        owner_id
      )
      VALUES ($1, $2)
      RETURNING
        id,
        name,
        owner_id,
        created_at,
        updated_at
      `,
      [trimmedName, admin.id],
    );

    return {
      success: true,
      list: result.rows[0],
    };
  } catch (error) {
    console.error("Create student list error:", error);

    return {
      success: false,
      error: "Something went wrong while creating the list.",
    };
  }
}

// ============================================================
// GET STUDENT LISTS
// ============================================================

export async function getStudentLists() {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
      SELECT
        sl.id,
        sl.name,
        sl.created_at,
        sl.updated_at,
        COUNT(slm.user_id)::INTEGER AS member_count
      FROM student_lists sl
      LEFT JOIN student_list_members slm
        ON slm.list_id = sl.id
      WHERE sl.owner_id = $1
      GROUP BY
        sl.id,
        sl.name,
        sl.created_at,
        sl.updated_at
      ORDER BY sl.created_at DESC
      `,
      [admin.id],
    );

    return {
      success: true,
      lists: result.rows,
    };
  } catch (error) {
    console.error("Get student lists error:", error);

    return {
      success: false,
      error: "Something went wrong while loading student lists.",
      lists: [],
    };
  }
}

// ============================================================
// GET SINGLE STUDENT LIST
// ============================================================

export async function getStudentList(listId: string) {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        owner_id,
        created_at,
        updated_at
      FROM student_lists
      WHERE id = $1
        AND owner_id = $2
      `,
      [listId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Student list not found.",
      };
    }

    return {
      success: true,
      list: result.rows[0],
    };
  } catch (error) {
    console.error("Get student list error:", error);

    return {
      success: false,
      error: "Something went wrong while loading the student list.",
    };
  }
}

// ============================================================
// UPDATE STUDENT LIST
// ============================================================

export async function updateStudentList(listId: string, name: string) {
  const admin = await requireAdmin();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "List name is required.",
    };
  }

  if (trimmedName.length > 100) {
    return {
      success: false,
      error: "List name must be 100 characters or less.",
    };
  }

  try {
    const result = await pool.query(
      `
      UPDATE student_lists
      SET
        name = $1,
        updated_at = NOW()
      WHERE id = $2
        AND owner_id = $3
      RETURNING
        id,
        name,
        owner_id,
        created_at,
        updated_at
      `,
      [trimmedName, listId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Student list not found.",
      };
    }

    return {
      success: true,
      list: result.rows[0],
    };
  } catch (error) {
    console.error("Update student list error:", error);

    return {
      success: false,
      error: "Something went wrong while updating the list.",
    };
  }
}

// ============================================================
// DELETE STUDENT LIST
// ============================================================

export async function deleteStudentList(listId: string) {
  const admin = await requireAdmin();

  if (!listId) {
    return {
      success: false,
      error: "Student list ID is required.",
    };
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM student_lists
      WHERE id = $1
        AND owner_id = $2
      RETURNING id
      `,
      [listId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Student list not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete student list error:", error);

    return {
      success: false,
      error: "Unable to delete student list.",
    };
  }
}

// ============================================================
// SEARCH STUDENTS
// ============================================================

export async function searchStudents(listId: string, query: string) {
  const admin = await requireAdmin();

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      success: true,
      students: [],
    };
  }

  try {
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
        students: [],
      };
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.college_id,
        u.email
      FROM users u
      WHERE u.role = 'student'
        AND (
          u.college_id ILIKE $1
          OR u.email ILIKE $1
          OR u.first_name ILIKE $1
          OR u.last_name ILIKE $1
        )
        AND NOT EXISTS (
          SELECT 1
          FROM student_list_members slm
          WHERE slm.list_id = $2
            AND slm.user_id = u.id
        )
      ORDER BY u.first_name, u.last_name
      LIMIT 20
      `,
      [`%${trimmedQuery}%`, listId],
    );

    return {
      success: true,
      students: result.rows,
    };
  } catch (error) {
    console.error("Search students error:", error);

    return {
      success: false,
      error: "Unable to search students.",
      students: [],
    };
  }
}

// ============================================================
// ADD STUDENT TO LIST
// ============================================================

export async function addStudentToList(listId: string, studentId: string) {
  const admin = await requireAdmin();

  try {
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

    const student = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
        AND role = 'student'
      `,
      [studentId],
    );

    if (student.rows.length === 0) {
      return {
        success: false,
        error: "Student not found.",
      };
    }

    await pool.query(
      `
      INSERT INTO student_list_members (
        list_id,
        user_id
      )
      VALUES ($1, $2)
      ON CONFLICT (list_id, user_id)
      DO NOTHING
      `,
      [listId, studentId],
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Add student to list error:", error);

    return {
      success: false,
      error: "Something went wrong while adding the student.",
    };
  }
}

// ============================================================
// REMOVE STUDENT FROM LIST
// ============================================================

export async function removeStudentFromList(listId: string, studentId: string) {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
      DELETE FROM student_list_members slm
      USING student_lists sl
      WHERE slm.list_id = sl.id
        AND slm.list_id = $1
        AND slm.user_id = $2
        AND sl.owner_id = $3
      RETURNING slm.user_id
      `,
      [listId, studentId, admin.id],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Membership not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Remove student from list error:", error);

    return {
      success: false,
      error: "Something went wrong while removing the student.",
    };
  }
}

// ============================================================
// GET LIST MEMBERS
// ============================================================

export async function getStudentListMembers(listId: string) {
  const admin = await requireAdmin();

  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.college_id,
        u.email,
        slm.added_at
      FROM student_list_members slm
      JOIN users u
        ON u.id = slm.user_id
      JOIN student_lists sl
        ON sl.id = slm.list_id
      WHERE slm.list_id = $1
        AND sl.owner_id = $2
        AND u.role = 'student'
      ORDER BY u.first_name, u.last_name
      `,
      [listId, admin.id],
    );

    return {
      success: true,
      members: result.rows,
    };
  } catch (error) {
    console.error("Get list members error:", error);

    return {
      success: false,
      error: "Something went wrong while loading list members.",
      members: [],
    };
  }
}
