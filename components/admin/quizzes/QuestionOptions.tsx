"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import PrimaryButton from "@/components/Buttons/PrimaryButton";
import OptionEditor from "./OptionEditor";

import { createOption } from "@/app/actions/quizzes";

type Option = {
  id: string;
  question_id: string;
  option_text: string;
  option_order: number;
  is_correct: boolean;
};

type QuestionOptionsProps = {
  questionId: string;
  initialOptions: Option[];
  disabled?: boolean;
};

const QuestionOptions = ({
  questionId,
  initialOptions,
  disabled = false,
}: QuestionOptionsProps) => {
  const [options, setOptions] = useState(
    [...initialOptions].sort((a, b) => a.option_order - b.option_order),
  );

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddOption() {
    setError(null);
    setIsCreating(true);

    const result = await createOption(questionId);

    if (!result.success) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    setOptions((current) => [...current, result.option]);

    setIsCreating(false);
  }

  function handleDeleted(optionId: string) {
    setOptions((current) => current.filter((option) => option.id !== optionId));
  }

  return (
    <div className="mt-6">
      <h4 className="font-semibold">Options</h4>

      <div className="mt-3 space-y-3">
        {options.map((option) => (
          <OptionEditor
            key={option.id}
            option={option}
            disabled={disabled}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {!disabled && (
        <div className="mt-4">
          <PrimaryButton
            name={isCreating ? "Adding..." : "Add Option"}
            type="button"
            disabled={isCreating}
            onClick={handleAddOption}
            icon={FaPlus}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionOptions;
