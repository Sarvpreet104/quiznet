"use client";

import { useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUsers, FaArrowLeft, FaPlus } from "react-icons/fa";

import Input from "@/components/Forms/Input";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

import { createStudentList } from "@/app/actions/student-lists";

import {
  studentListSchema,
  type StudentListFormData,
} from "@/lib/validations/student-lists";

export default function CreateStudentListForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentListFormData>({
    resolver: zodResolver(studentListSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: StudentListFormData) {
    setServerError(null);

    const result = await createStudentList(data.name);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push("/admin/studentlists");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FaUsers className="text-lg" />
          </div>

          <div>
            <h2 className="font-semibold">Student list details</h2>

            <p className="text-sm text-muted-foreground">
              Give your list a name so you can easily assign it to quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="flex flex-col gap-6 px-6 py-7">
        <Input
          {...register("name")}
          icon={FaUsers}
          label="List Name"
          ID="name"
          type="text"
          placeholder="e.g. CSE 3rd Year"
          autoComplete="off"
          error={errors.name?.message}
          disabled={isSubmitting}
        />

        {/* Helpful hint */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tip:</span> Use a
            clear name such as{" "}
            <span className="font-medium text-foreground">CSE 3rd Year</span> or{" "}
            <span className="font-medium text-foreground">
              Web Development Lab
            </span>
            .
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
          >
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <SecondaryButton
            name="Cancel"
            href="/admin/studentlists"
            icon={FaArrowLeft}
            disabled={isSubmitting}
          />

          <PrimaryButton
            name={isSubmitting ? "Creating..." : "Create List"}
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? undefined : FaPlus}
          />
        </div>
      </div>
    </form>
  );
}
