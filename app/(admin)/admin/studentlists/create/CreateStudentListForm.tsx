"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUsers } from "react-icons/fa";

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
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <Input
        {...register("name")}
        icon={FaUsers}
        label="List Name"
        ID="name"
        type="text"
        placeholder="e.g. CSE 3rd Year"
        autoComplete="off"
        error={errors.name?.message}
      />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex justify-end gap-3">
        <SecondaryButton
          name="Cancel"
          href="/admin/studentlists"
          disabled={isSubmitting}
        />

        <PrimaryButton
          name={isSubmitting ? "Creating..." : "Create List"}
          type="submit"
          disabled={isSubmitting}
          icon={FaUsers}
        />
      </div>
    </form>
  );
}
