"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaGlobe, FaLock, FaSpinner } from "react-icons/fa";
import { setQuizStatus } from "@/app/actions/quizzes";

type QuizStatus = "draft" | "live";

type QuizStatusToggleProps = {
  quizId: string;
  status: QuizStatus;
};

export default function QuizStatusToggle({
  quizId,
  status,
}: QuizStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isLive = status === "live";

  function handleToggle() {
    setError(null);

    const nextStatus: QuizStatus = isLive ? "draft" : "live";

    const message = isLive
      ? "Take this quiz offline?\n\nStudents will no longer be able to access it."
      : "Publish this quiz?\n\nThe quiz will become available to students.";

    if (!window.confirm(message)) {
      return;
    }

    startTransition(async () => {
      const result = await setQuizStatus(quizId, nextStatus);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        role="switch"
        aria-checked={isLive}
        aria-label={isLive ? "Turn quiz off" : "Publish quiz"}
        className="group inline-flex items-center gap-3 rounded-full border bg-background px-3 py-2 transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            isLive ? "text-green-600" : "text-muted-foreground"
          }`}
        >
          {isLive ? <FaGlobe /> : <FaLock />}
          {isLive ? "Live" : "Draft"}
        </span>

        <span
          className={`relative h-6 w-11 rounded-full transition ${
            isLive ? "bg-green-500" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-1 flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition ${
              isLive ? "left-6" : "left-1"
            }`}
          >
            {isPending && (
              <FaSpinner className="size-2.5 animate-spin text-muted-foreground" />
            )}
          </span>
        </span>
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
