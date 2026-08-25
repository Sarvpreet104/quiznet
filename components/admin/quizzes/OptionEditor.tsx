"use client";

import { useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { updateOption, deleteOption } from "@/app/actions/quizzes";

type Option = {
  id: string;
  question_id: string;
  option_text: string;
  option_order: number;
  is_correct: boolean;
};

type OptionEditorProps = {
  option: Option;
  disabled?: boolean;
  onDeleted: (optionId: string) => void;
};

const OptionEditor = ({
  option,
  disabled = false,
  onDeleted,
}: OptionEditorProps) => {
  const [text, setText] = useState(option.option_text);
  const [isCorrect, setIsCorrect] = useState(option.is_correct);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);

    if (!text.trim()) {
      setError("Option cannot be empty.");
      return;
    }

    setIsSaving(true);

    const result = await updateOption({
      optionId: option.id,
      optionText: text.trim(),
      isCorrect,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setText(result.option.option_text);
    setIsCorrect(result.option.is_correct);

    setIsSaving(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this option?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const result = await deleteOption(option.id);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    onDeleted(option.id);
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSaving || isDeleting}
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 outline-none transition focus:border-primary disabled:opacity-50"
            placeholder="Enter option..."
          />

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <label className="flex items-center gap-2 pt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isCorrect}
            onChange={(e) => setIsCorrect(e.target.checked)}
            disabled={disabled || isSaving || isDeleting}
            className="size-4"
          />

          <span className="text-sm">Correct</span>

          {isCorrect && <FaCheck className="text-green-500" />}
        </label>
      </div>

      {!disabled && (
        <div className="mt-3 flex gap-2">
          <SecondaryButton
            name={isSaving ? "Saving..." : "Save"}
            type="button"
            disabled={isSaving || isDeleting}
            onClick={handleSave}
          />

          <SecondaryButton
            name={isDeleting ? "Deleting..." : "Delete"}
            type="button"
            disabled={isSaving || isDeleting}
            onClick={handleDelete}
            icon={FaTrash}
          />
        </div>
      )}
    </div>
  );
};

export default OptionEditor;
