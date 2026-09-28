"use server";

import pool from "@/lib/db";
import { requireAdmin } from "@/lib/authorization";

/*
  createStudentList():
  to enable the functionality to create a studentlist.

  database tables used: student_lists
*/
export async function createStudentList(name: string) {
  // only admin can create a student list
  const admin = await requireAdmin();

  // getting the data
  const trimmedName = name.trim();

  // error handling
  // if list name not provided
  if (!trimmedName) {
    return {
      success: false,
      error: "List name is required.",
    };
  }

  // if list name too long
  if (trimmedName.length > 100) {
    return {
      success: false,
      error: "List name must be 100 characters or less.",
    };
  }

  try {
    // create a student list
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
    console.error("createStudentList() error:", error);

    return {
      success: false,
      error: "Something went wrong while creating the list.",
    };
  }
}

/*
  getStudentLists():
  to fetch studentlists of this admin.

  database tables used: student_lists, student_list_members
*/
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
    console.error("getStudentLists() error:", error);

    return {
      success: false,
      error: "Something went wrong while loading student lists.",
      lists: [],
    };
  }
}

/*
  getStudentList():
  to fetch a single studentlist of this admin.

  database tables used: student_lists
*/
export async function getStudentList(listId: string) {
  // only admin access
  const admin = await requireAdmin();

  try {
    // searching list
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

    // if list not found
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
    console.error("getStudentList() error:", error);

    return {
      success: false,
      error: "Something went wrong while loading the student list.",
    };
  }
}

/*
  updateStudentList():
  to enable the editing of the list

  database tables used: student_lists
*/
export async function updateStudentList(listId: string, name: string) {
  // only admin can edit
  const admin = await requireAdmin();

  // get edited data
  const trimmedName = name.trim();

  // if data not valid
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
    // update the list
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

    // if list not found
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
    console.error("updateStudentList() error:", error);

    return {
      success: false,
      error: "Something went wrong while updating the list.",
    };
  }
}

/*
  deleteStudentList():
  to enable the deletion of the list

  database tables used: student_lists
*/
export async function deleteStudentList(listId: string) {
  // only admin can delete list
  const admin = await requireAdmin();

  // if list id not provided
  if (!listId) {
    return {
      success: false,
      error: "Student list ID is required.",
    };
  }

  try {
    // delete list
    const result = await pool.query(
      `
      DELETE FROM student_lists
      WHERE id = $1
        AND owner_id = $2
      RETURNING id
      `,
      [listId, admin.id],
    );

    // if list not found
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
    console.error("deleteStudentList() error:", error);

    return {
      success: false,
      error: "Unable to delete student list.",
    };
  }
}

/*
  searchStudents():
  to enable the searching for students to add in the list.

  database tables used: student_lists, users, student_list_members
*/
export async function searchStudents(listId: string, query: string) {
  // only admin feature
  const admin = await requireAdmin();

  // get the search query
  const trimmedQuery = query.trim();

  // if query is null, give empty list
  if (!trimmedQuery) {
    return {
      success: true,
      students: [],
    };
  }

  try {
    // fetching this student list
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
        students: [],
      };
    }

    // searching the students based on query which are not already in this list
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
    console.error("searchStudents() error:", error);

    return {
      success: false,
      error: "Unable to search students.",
      students: [],
    };
  }
}

/*
  addStudentToList():
  it helps in adding a student in the list.

  database tables used: student_lists, users, student_list_members
*/
export async function addStudentToList(listId: string, studentId: string) {
  // admin only
  const admin = await requireAdmin();

  try {
    // get this list
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

    // get the student
    const student = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
        AND role = 'student'
      `,
      [studentId],
    );

    // if student not found
    if (student.rows.length === 0) {
      return {
        success: false,
        error: "Student not found.",
      };
    }

    // add student to this list
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
    console.error("addStudentToList() error:", error);

    return {
      success: false,
      error: "Something went wrong while adding the student.",
    };
  }
}

/*
  removeStudentFromList():
  it helps in removing a student from the list.

  database tables used: student_lists, student_list_members
*/
export async function removeStudentFromList(listId: string, studentId: string) {
  // only admin
  const admin = await requireAdmin();

  try {
    // remove the student from the list
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

    // if student not found in list
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
    console.error("removeStudentFromList() error:", error);

    return {
      success: false,
      error: "Something went wrong while removing the student.",
    };
  }
}

/*
  getStudentListMembers():
  it fetches all the members of a list

  database tables used: student_lists, student_list_members
*/
export async function getStudentListMembers(listId: string) {
  // only admin
  const admin = await requireAdmin();

  try {
    // fetch members of the list
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
    console.error("getStudentListMembers() error:", error);

    return {
      success: false,
      error: "Something went wrong while loading list members.",
      members: [],
    };
  }
}
