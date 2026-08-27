"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { startQuiz } from "@/app/actions/student-quiz";

type StartQuizButtonProps = {
  quizId: string;
};

export default function StartQuizButton({ quizId }: StartQuizButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      await startQuiz(quizId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={isPending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}

      {isPending ? "Starting..." : "Start Quiz"}
    </button>
  );
}
