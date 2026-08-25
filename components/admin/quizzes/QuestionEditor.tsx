"use client";

import { useState } from "react";
import { FaSave } from "react-icons/fa";

import Input from "@/components/Forms/Input";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

import { updateQuestion } from "@/app/actions/quizzes";

type QuestionEditorProps = {
  question: {
    id: string;
    question_text: string;
    question_order: number;
    marks: number;
  };
  disabled?: boolean;
};

const QuestionEditor = ({
  question,
  disabled = false,
}: QuestionEditorProps) => {
  const [questionText, setQuestionText] = useState(question.question_text);

  const [marks, setMarks] = useState(String(question.marks));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const parsedMarks = Number(marks);

    if (!questionText.trim()) {
      setError("Question text is required.");
      return;
    }

    if (!Number.isInteger(parsedMarks) || parsedMarks <= 0) {
      setError("Marks must be a positive whole number.");
      return;
    }

    setIsSaving(true);

    const result = await updateQuestion({
      questionId: question.id,
      questionText,
      marks: parsedMarks,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setQuestionText(result.question.question_text);
    setMarks(String(result.question.marks));

    setSuccess(true);
    setIsSaving(false);

    // Remove the success message after a short time.
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">
          Question {question.question_order}
        </h3>

        <span className="text-sm text-muted-foreground">
          {marks} {Number(marks) === 1 ? "mark" : "marks"}
        </span>
      </div>

      {/* Question text */}
      <div className="mt-5">
        <label
          htmlFor={`question-${question.id}`}
          className="text-sm text-foreground"
        >
          Question
        </label>

        <textarea
          id={`question-${question.id}`}
          value={questionText}
          onChange={(event) => {
            setQuestionText(event.target.value);
            setSuccess(false);
          }}
          disabled={disabled || isSaving}
          rows={4}
          placeholder="Enter your question..."
          className="mt-2 w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3 outline-none transition-all duration-300 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Marks */}
      <div className="mt-4 max-w-xs">
        <Input
          icon={() => null}
          label="Marks"
          ID={`marks-${question.id}`}
          name={`marks-${question.id}`}
          type="number"
          value={marks}
          onChange={(event) => {
            setMarks(event.target.value);
            setSuccess(false);
          }}
          min={1}
          disabled={disabled || isSaving}
        />
      </div>

      {/* Error */}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {/* Success */}
      {success && (
        <p className="mt-4 text-sm text-green-600">
          Question saved successfully.
        </p>
      )}

      {/* Save */}
      {!disabled && (
        <div className="mt-5 flex justify-end">
          <PrimaryButton
            name={isSaving ? "Saving..." : "Save Question"}
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            icon={FaSave}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
