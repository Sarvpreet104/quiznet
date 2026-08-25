import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireStudent() {
  const user = await requireUser();

  if (user.role !== "student") {
    redirect("/admin");
  }

  return user;
}
