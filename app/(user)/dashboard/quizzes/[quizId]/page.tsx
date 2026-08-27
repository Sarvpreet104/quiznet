import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

import { requireStudent } from "@/lib/authorization";
import { getStudentQuiz } from "@/lib/queries/student-quiz";
import StartQuizButton from "@/components/student/StartQuizButton";

type QuizPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function StudentQuizPage({ params }: QuizPageProps) {
  const user = await requireStudent();

  const { quizId } = await params;

  const quiz = await getStudentQuiz(quizId, user.id);

  if (!quiz) {
    notFound();
  }

  const durationMinutes = Math.ceil(quiz.duration_seconds / 60);

  const isCompleted = quiz.is_submitted;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back */}
        <Link
          href="/dashboard/quizzes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to quizzes
        </Link>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Header */}
          <div className="border-b border-border/60 p-6 md:p-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck className="size-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {quiz.title}
            </h1>

            {quiz.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {quiz.description}
              </p>
            )}
          </div>

          {/* Quiz information */}
          <div className="grid gap-4 p-6 sm:grid-cols-3 md:p-8">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileQuestion className="size-4" />
              </div>

              <p className="text-xs text-muted-foreground">Questions</p>

              <p className="mt-1 text-lg font-semibold">
                {quiz.question_count}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="size-4" />
              </div>

              <p className="text-xs text-muted-foreground">Total Marks</p>

              <p className="mt-1 text-lg font-semibold">{quiz.total_marks}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock3 className="size-4" />
              </div>

              <p className="text-xs text-muted-foreground">Duration</p>

              <p className="mt-1 text-lg font-semibold">
                {durationMinutes} min
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-border/60 px-6 py-6 md:px-8">
            <h2 className="text-sm font-semibold">Before you begin</h2>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Make sure you have enough time to complete the quiz.</li>

              <li>• The timer will start when you begin the quiz.</li>

              <li>• Once submitted, your answers cannot be changed.</li>

              <li>• Your score will be calculated after submission.</li>
            </ul>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              {isCompleted ? (
                <>
                  <p className="text-sm font-semibold">Quiz completed</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    You scored {quiz.score} / {quiz.attempt_total_marks}.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Ready to begin?</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    You have {durationMinutes} minutes.
                  </p>
                </>
              )}
            </div>

            {isCompleted ? (
              <Link
                href={`/dashboard/results/${quiz.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                View Results
              </Link>
            ) : (
              <StartQuizButton quizId={quiz.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
