"use server";

import pool from "@/lib/db";
import {
  clearSessionCookie,
  createToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// to register a user
export async function registerUser(data: {
  first_name: string;
  last_name: string;
  college_id: string;
  email: string;
  password: string;
  confirm_password: string;
}) {
  // Server-Side validation
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid registration data.",
    };
  }

  const { first_name, last_name, college_id, email, password } = parsed.data;

  // Normalize values as they have to be case-insensitive
  const normalizedCollegeId = college_id.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await pool.query(
      `
      SELECT email, college_id
      FROM users
      WHERE email = $1 OR college_id = $2
      `,
      [normalizedEmail, normalizedCollegeId],
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      if (user.email === normalizedEmail) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }

      if (user.college_id === normalizedCollegeId) {
        return {
          success: false,
          error: "An account with this college ID already exists.",
        };
      }
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (
        first_name,
        last_name,
        college_id,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        first_name,
        last_name,
        college_id,
        email,
        role
      `,
      [
        first_name,
        last_name,
        normalizedCollegeId,
        normalizedEmail,
        passwordHash,
      ],
    );

    return {
      success: true,
      user: result.rows[0],
    };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: "Something went wrong while creating your account.",
    };
  }
}

//  login a user
export async function loginUser(data: { email: string; password: string }) {
  // Server-Side validation
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid login data.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        college_id,
        email,
        password_hash,
        role
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const user = result.rows[0];

    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const token = await createToken({
      id: user.id,
      role: user.role,
    });

    await setSessionCookie(token);

    return {
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        college_id: user.college_id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      error: "Something went wrong while logging in.",
    };
  }
}

// Logout a user
export async function logoutUser() {
  await clearSessionCookie();

  return {
    success: true,
  };
}
