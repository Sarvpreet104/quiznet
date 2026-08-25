"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { createQuestion } from "@/app/actions/quizzes";

type AddQuestionButtonProps = {
  quizId: string;
};

const AddQuestionButton = ({ quizId }: AddQuestionButtonProps) => {
  const router = useRouter();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateQuestion() {
    setError(null);
    setIsCreating(true);

    const result = await createQuestion(quizId);

    if (!result.success) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    router.refresh();

    setIsCreating(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <PrimaryButton
        name={isCreating ? "Adding..." : "Add Question"}
        type="button"
        disabled={isCreating}
        icon={FaPlus}
        onClick={handleCreateQuestion}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default AddQuestionButton;
