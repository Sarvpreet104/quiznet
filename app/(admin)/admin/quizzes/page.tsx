import Link from "next/link";
import { FaPlus, FaFileAlt } from "react-icons/fa";

import { getAdminQuizzes } from "@/app/actions/quizzes";

import { Card, CardContent } from "@/components/ui/card";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default async function AdminQuizzesPage() {
  const result = await getAdminQuizzes();

  if (!result.success) {
    throw new Error(result.error);
  }

  const quizzes = result.quizzes;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>

            <p className="mt-1 text-muted-foreground">
              Create and manage your quizzes.
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
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FaFileAlt className="text-4xl text-muted-foreground" />

              <h2 className="mt-4 text-xl font-semibold">No quizzes yet</h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Create your first quiz and assign it to your student lists.
              </p>

              <PrimaryButton
                name="Create Your First Quiz"
                href="/admin/quizzes/create"
                icon={FaPlus}
                className="mt-6"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{quiz.title}</h2>

                      {quiz.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>
                          {Math.floor(quiz.duration_seconds / 60)} min
                        </span>

                        <span>{quiz.attempt_count} attempts</span>

                        <span
                          className={
                            quiz.status === "live"
                              ? "font-medium text-green-500"
                              : "font-medium text-yellow-500"
                          }
                        >
                          {quiz.status === "live" ? "Live" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <PrimaryButton
                        name="Open"
                        href={`/admin/quizzes/${quiz.id}`}
                      />
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
