"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FaClock, FaHeading, FaPlus } from "react-icons/fa";

import Input from "@/components/Forms/Input";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

import { createQuiz } from "@/app/actions/quizzes";

import { useRouter } from "next/navigation";

import {
  createQuizSchema,
  type CreateQuizFormData,
} from "@/lib/validations/quiz";

const CreateQuizForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizFormData>({
    resolver: zodResolver(createQuizSchema),
    mode: "onBlur",
  });

  const router = useRouter();

  async function onSubmit(data: CreateQuizFormData) {
    setServerError(null);

    const result = await createQuiz(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push(`/admin/quizzes/${result.quiz.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-5">
        {/* Quiz title */}
        <Input
          {...register("title")}
          icon={FaHeading}
          label="Quiz Title"
          ID="title"
          type="text"
          placeholder="JavaScript Fundamentals"
          autoComplete="off"
          error={errors.title?.message}
        />

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="pl-2 text-sm text-foreground">
            Description
          </label>

          <textarea
            {...register("description")}
            id="description"
            placeholder="A quiz covering JavaScript fundamentals."
            rows={4}
            className={`w-full resize-none rounded-xl border bg-secondary px-4 py-3 outline-none transition-all duration-300 ${
              errors.description
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary"
            }`}
          />

          {errors.description?.message && (
            <p className="pl-2 text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Duration */}
        <Input
          {...register("duration_minutes", {
            valueAsNumber: true,
          })}
          icon={FaClock}
          label="Duration (minutes)"
          ID="duration_minutes"
          type="number"
          min={1}
          max={600}
          step={1}
          placeholder="30"
          error={errors.duration_minutes?.message}
        />

        <p className="-mt-3 pl-2 text-xs text-muted-foreground">
          Enter the quiz duration in minutes. Maximum 600 minutes.
        </p>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        {/* Submit */}
        <PrimaryButton
          name={isSubmitting ? "Creating Quiz..." : "Create Quiz"}
          type="submit"
          disabled={isSubmitting}
          className="mt-4"
          icon={FaPlus}
        />
      </div>
    </form>
  );
};

export default CreateQuizForm;
