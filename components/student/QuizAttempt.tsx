"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import { saveQuizResponse, submitQuiz } from "@/app/actions/student-quiz";

type Option = {
  id: string;
  option_text: string;
  option_order: number;
};

type Question = {
  id: string;
  question_text: string;
  question_order: number;
  marks: number;
  options: Option[];
  selected_option_id: string | null;
};

type Attempt = {
  attempt_id: string;
  quiz_id: string;
  started_at: string;
  duration_seconds: number;
  title: string;
  description: string | null;
  total_marks: number;
  questions: Question[];
};

type QuizAttemptProps = {
  attempt: Attempt;
};

export default function QuizAttempt({ attempt }: QuizAttemptProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};

    for (const question of attempt.questions) {
      initial[question.id] = question.selected_option_id ?? null;
    }

    return initial;
  });

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const startedAt = new Date(attempt.started_at).getTime();

    const endTime = startedAt + attempt.duration_seconds * 1000;

    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  });

  const [isSaving, startSaving] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const currentQuestion = attempt.questions[currentIndex];

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((answer) => answer !== null).length;
  }, [answers]);

  const isLastQuestion = currentIndex === attempt.questions.length - 1;

  const isFirstQuestion = currentIndex === 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0",
    )}`;
  };

  /*
   * Countdown.
   *
   * The initial value is calculated from started_at.
   * We don't simply count down from duration_seconds,
   * because the student may have refreshed the page.
   */

  useEffect(() => {
    const interval = window.setInterval(() => {
      const startedAt = new Date(attempt.started_at).getTime();

      const endTime = startedAt + attempt.duration_seconds * 1000;

      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [attempt.started_at, attempt.duration_seconds]);

  /*
   * Automatically submit when the timer reaches zero.
   */

  useEffect(() => {
    if (remainingSeconds !== 0) {
      return;
    }

    startSubmitting(async () => {
      const result = await submitQuiz({
        attemptId: attempt.attempt_id,
        quizId: attempt.quiz_id,
      });

      if (result.success) {
        router.push(`/dashboard/results/${attempt.quiz_id}`);
        return;
      }

      setError(result.error ?? "The quiz could not be submitted.");
    });
  }, [remainingSeconds, attempt.attempt_id, attempt.quiz_id, router]);

  async function handleAnswer(questionId: string, optionId: string) {
    if (remainingSeconds <= 0) {
      return;
    }

    setError(null);

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));

    startSaving(async () => {
      const result = await saveQuizResponse({
        attemptId: attempt.attempt_id,
        quizId: attempt.quiz_id,
        questionId,
        optionId,
      });

      if (!result.success) {
        if (result.expired) {
          setRemainingSeconds(0);
        }

        setError(result.error ?? "Unable to save your answer.");
      }
    });
  }

  function goPrevious() {
    if (!isFirstQuestion) {
      setCurrentIndex((index) => index - 1);
    }
  }

  function goNext() {
    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
    }
  }

  function handleSubmit() {
    const unanswered = attempt.questions.length - answeredCount;

    const message =
      unanswered > 0
        ? `You have ${unanswered} unanswered ${
            unanswered === 1 ? "question" : "questions"
          }. Submit anyway?`
        : "Are you sure you want to submit the quiz?";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    setError(null);

    startSubmitting(async () => {
      const result = await submitQuiz({
        attemptId: attempt.attempt_id,
        quizId: attempt.quiz_id,
      });

      if (!result.success) {
        setError(result.error ?? "Unable to submit the quiz.");
        return;
      }

      router.push("/dashboard/results");
    });
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This quiz has no questions.
        </p>
      </div>
    );
  }

  const timerDanger = remainingSeconds <= 60;

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {attempt.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Question {currentIndex + 1} of {attempt.questions.length}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
              timerDanger
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border/60 bg-muted/50"
            }`}
          >
            <Clock3 className="size-4" />

            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Progress */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {answeredCount} / {attempt.questions.length} answered
            </span>

            <span>
              {Math.round((answeredCount / attempt.questions.length) * 100)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${(answeredCount / attempt.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Question navigation */}

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {attempt.questions.map((question, index) => {
            const answered = answers[question.id] !== null;

            const active = index === currentIndex;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`flex size-9 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : answered
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/60 bg-background hover:bg-accent"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Question {currentIndex + 1}
              </p>

              <h2 className="mt-2 text-lg font-semibold leading-7 md:text-xl">
                {currentQuestion.question_text}
              </h2>
            </div>

            <div className="shrink-0 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
              {currentQuestion.marks}{" "}
              {currentQuestion.marks === 1 ? "mark" : "marks"}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-6 md:p-8">
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentQuestion.id] === option.id;

            return (
              <button
                key={option.id}
                type="button"
                disabled={isSaving || isSubmitting || remainingSeconds <= 0}
                onClick={() => handleAnswer(currentQuestion.id, option.id)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-background hover:bg-accent"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="flex-1 text-sm leading-6">
                  {option.option_text}
                </span>

                {selected && (
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}

        {error && (
          <div className="mx-6 mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:mx-8">
            {error}
          </div>
        )}

        {/* Controls */}

        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <button
            type="button"
            onClick={goPrevious}
            disabled={isFirstQuestion || isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>

          <div className="flex gap-3">
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saving indicator */}

      {isSaving && (
        <div className="text-center text-xs text-muted-foreground">
          Saving answer...
        </div>
      )}
    </div>
  );
}
