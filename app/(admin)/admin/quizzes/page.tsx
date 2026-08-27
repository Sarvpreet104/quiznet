import Link from "next/link";
import { FaArrowRight, FaClock, FaFileAlt, FaPlus } from "react-icons/fa";

import { getAdminQuizzes } from "@/app/actions/quizzes";
import { Card, CardContent } from "@/components/ui/card";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import QuizStatusToggle from "@/components/admin/quizzes/QuizStatusToggle";

export default async function AdminQuizzesPage() {
  const result = await getAdminQuizzes();

  if (!result.success) {
    throw new Error(result.error);
  }

  const quizzes = result.quizzes;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quiz Management
            </h1>

            <p className="mt-1 text-muted-foreground">
              Create, edit and manage your quizzes.
            </p>
          </div>

          <PrimaryButton
            name="Create Quiz"
            href="/admin/quizzes/create"
            icon={FaPlus}
          />
        </div>

        {/* Empty state */}

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                <FaFileAlt className="text-2xl text-muted-foreground" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">No quizzes yet</h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Create your first quiz and start building your question bank.
              </p>

              <div className="mt-6">
                <PrimaryButton
                  name="Create Your First Quiz"
                  href="/admin/quizzes/create"
                  icon={FaPlus}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="overflow-hidden transition hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Quiz information */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-lg font-semibold">
                          {quiz.title}
                        </h2>
                      </div>

                      {quiz.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-xs" />
                          {Math.floor(Number(quiz.duration_seconds) / 60)} min
                        </span>

                        <span>
                          {quiz.attempt_count}{" "}
                          {quiz.attempt_count === 1 ? "attempt" : "attempts"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <QuizStatusToggle quizId={quiz.id} status={quiz.status} />

                      <Link
                        href={`/admin/quizzes/${quiz.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                      >
                        Open Editor
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
