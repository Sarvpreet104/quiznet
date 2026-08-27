import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

import { requireStudent } from "@/lib/authorization";
import { getStudentResults } from "@/lib/queries/student-results";

export default async function StudentResultsPage() {
  const user = await requireStudent();

  const results = await getStudentResults(user.id);

  const totalAttempts = results.length;

  const totalScore = results.reduce(
    (sum, result) => sum + Number(result.score),
    0,
  );

  const totalMarks = results.reduce(
    (sum, result) => sum + Number(result.total_marks),
    0,
  );

  const averagePercentage =
    totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Results</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review your completed quizzes and scores.
          </p>
        </div>

        {/* Overview */}

        {results.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {/* Total attempts */}

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileQuestion className="size-5" />
              </div>

              <p className="text-xs text-muted-foreground">Quizzes Completed</p>

              <p className="mt-1 text-2xl font-bold">{totalAttempts}</p>
            </div>

            {/* Total score */}

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Trophy className="size-5" />
              </div>

              <p className="text-xs text-muted-foreground">Total Score</p>

              <p className="mt-1 text-2xl font-bold">
                {totalScore} / {totalMarks}
              </p>
            </div>

            {/* Average */}

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <p className="text-xs text-muted-foreground">
                Overall Percentage
              </p>

              <p className="mt-1 text-2xl font-bold">{averagePercentage}%</p>
            </div>
          </div>
        )}

        {/* No results */}

        {results.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FileQuestion className="size-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">No results yet</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Once you complete a quiz, your result will appear here.
            </p>

            <Link
              href="/dashboard/quizzes"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const score = Number(result.score);
              const marks = Number(result.total_marks);

              const percentage =
                marks > 0 ? Math.round((score / marks) * 100) : 0;

              const submittedAt = result.submitted_at
                ? new Date(result.submitted_at)
                : null;

              return (
                <div
                  key={result.attempt_id}
                  className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    {/* Quiz information */}

                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-semibold">
                        {result.title}
                      </h2>

                      {result.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      )}

                      {submittedAt && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          Completed {submittedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Score */}

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Score</p>

                        <p className="mt-1 text-xl font-bold">
                          {score} / {marks}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {percentage}%
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/results/${result.quiz_id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent"
                      >
                        <span className="hidden sm:inline">View Answers</span>

                        <span className="sm:hidden">Review</span>

                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
