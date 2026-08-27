import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleX, Clock3, Trophy } from "lucide-react";

import { requireStudent } from "@/lib/authorization";
import { getStudentResult } from "@/lib/queries/student-results";

type ResultPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function StudentResultPage({ params }: ResultPageProps) {
  const user = await requireStudent();

  const { quizId } = await params;

  const result = await getStudentResult(quizId, user.id);

  if (!result) {
    notFound();
  }

  const score = Number(result.score);
  const totalMarks = Number(result.total_marks);

  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const correctCount = result.questions.filter(
    (question) => question.is_correct,
  ).length;

  const answeredCount = result.questions.filter(
    (question) => question.selected_option_id !== null,
  ).length;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back */}

        <Link
          href="/dashboard/results"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to results
        </Link>

        {/* Result header */}

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/60 p-6 md:p-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {result.title}
            </h1>

            {result.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {result.description}
              </p>
            )}
          </div>

          {/* Score overview */}

          <div className="grid gap-4 p-6 sm:grid-cols-2 md:grid-cols-4 md:p-8">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Score</p>

              <p className="mt-1 text-xl font-bold">
                {score} / {totalMarks}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Percentage</p>

              <p className="mt-1 text-xl font-bold">{percentage}%</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Correct</p>

              <p className="mt-1 text-xl font-bold">{correctCount}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Answered</p>

              <p className="mt-1 text-xl font-bold">
                {answeredCount} / {result.questions.length}
              </p>
            </div>
          </div>

          {/* Completion information */}

          {result.submitted_at && (
            <div className="flex items-center gap-2 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground md:px-8">
              <Clock3 className="size-4" />
              Submitted {new Date(result.submitted_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* Questions */}

        <div className="mt-6 space-y-5">
          {result.questions.map((question, questionIndex) => {
            const answered = question.selected_option_id !== null;

            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
              >
                {/* Question header */}

                <div className="border-b border-border/60 p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Question {questionIndex + 1}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold leading-7 md:text-xl">
                        {question.question_text}
                      </h2>
                    </div>

                    <div className="shrink-0 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
                      {question.marks} {question.marks === 1 ? "mark" : "marks"}
                    </div>
                  </div>

                  {/* Question result */}

                  <div className="mt-4">
                    {question.is_correct ? (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                        <CheckCircle2 className="size-4" />
                        Correct
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                        <CircleX className="size-4" />
                        {answered ? "Incorrect" : "Not answered"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}

                <div className="space-y-3 p-6 md:p-8">
                  {question.options.map((option, optionIndex) => {
                    const isSelected =
                      option.id === question.selected_option_id;

                    const isCorrect = option.id === question.correct_option_id;

                    let optionClass = "border-border/60 bg-background";

                    if (isCorrect) {
                      optionClass = "border-primary/40 bg-primary/10";
                    } else if (isSelected) {
                      optionClass = "border-destructive/40 bg-destructive/10";
                    }

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center gap-4 rounded-xl border p-4 ${optionClass}`}
                      >
                        {/* Letter */}

                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
                            isCorrect
                              ? "border-primary bg-primary text-primary-foreground"
                              : isSelected
                                ? "border-destructive bg-destructive text-destructive-foreground"
                                : "border-border bg-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        {/* Text */}

                        <span className="flex-1 text-sm leading-6">
                          {option.option_text}
                        </span>

                        {/* Labels */}

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {isCorrect && (
                            <span className="text-xs font-medium text-primary">
                              Correct answer
                            </span>
                          )}

                          {isSelected && !isCorrect && (
                            <span className="text-xs font-medium text-destructive">
                              Your answer
                            </span>
                          )}

                          {isSelected && isCorrect && (
                            <span className="text-xs font-medium text-primary">
                              Your answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom navigation */}

        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/results"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium transition hover:bg-accent"
          >
            <ArrowLeft className="size-4" />
            Back to Results
          </Link>
        </div>
      </div>
    </div>
  );
}
