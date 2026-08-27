import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  Users,
  LayoutDashboard,
} from "lucide-react";

import { requireAdmin } from "@/lib/authorization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = async () => {
  const user = await requireAdmin();

  const firstName = user.first_name || "Admin";

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* -------------------------------------------------------
            PAGE HEADER
        ------------------------------------------------------- */}

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage your quizzes, students and assessments from one place.
          </p>
        </div>

        {/* -------------------------------------------------------
            QUICK ACTION CARDS
        ------------------------------------------------------- */}

        <div className="grid gap-4 md:grid-cols-2">
          {/* QUIZZES */}

          <Link href="/admin/quizzes" className="group">
            <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>

                  <ArrowRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <CardTitle className="pt-2">Manage Quizzes</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Create, edit, publish and manage your quizzes.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* STUDENT LISTS */}

          <Link href="/admin/studentlists" className="group">
            <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>

                  <ArrowRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <CardTitle className="pt-2">Student Lists</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Organize students into lists and manage quiz assignments.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* -------------------------------------------------------
            QUICK CREATE
        ------------------------------------------------------- */}

        <Card className="mt-6 overflow-hidden">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>

                <h2 className="font-semibold">Ready to create a quiz?</h2>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Start building a new assessment for your students.
              </p>
            </div>

            <Link
              href="/admin/quizzes/create"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Create Quiz
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
