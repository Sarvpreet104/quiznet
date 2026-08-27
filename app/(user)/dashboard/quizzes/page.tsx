import { requireStudent } from "@/lib/authorization";
import { getAvailableQuizzes } from "@/lib/queries/student-quizzes";

export default async function StudentQuizzesPage() {
  const user = await requireStudent();

  const quizzes = await getAvailableQuizzes(user.id);

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and take quizzes assigned to you.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
            <h2 className="text-lg font-semibold">No quizzes available</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You don't have any quizzes assigned to you right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="line-clamp-2 text-lg font-semibold">
                    {quiz.title}
                  </h2>

                  {quiz.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Questions</p>

                    <p className="mt-1 font-semibold">{quiz.question_count}</p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Marks</p>

                    <p className="mt-1 font-semibold">{quiz.total_marks}</p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>

                    <p className="mt-1 font-semibold">
                      {Math.ceil(quiz.duration_seconds / 60)} min
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Status</p>

                    <p className="mt-1 font-semibold">
                      {quiz.is_submitted ? "Completed" : "Available"}
                    </p>
                  </div>
                </div>

                <div>
                  <a
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    {quiz.is_submitted ? "View Quiz" : "Start Quiz"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
