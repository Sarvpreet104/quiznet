"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

import SecondaryButton from "@/components/Buttons/SecondaryButton";

import { deleteStudentList } from "@/app/actions/student-lists";

type DeleteStudentListButtonProps = {
  listId: string;
  listName: string;
};

export default function DeleteStudentListButton({
  listId,
  listName,
}: DeleteStudentListButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${listName}"?\n\nThis will remove the students from this list and unassign the list from any quizzes using it.\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const result = await deleteStudentList(listId);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push("/admin/studentlists");
  }

  return (
    <div>
      <SecondaryButton
        name={isDeleting ? "Deleting..." : "Delete"}
        type="button"
        icon={FaTrash}
        disabled={isDeleting}
        onClick={handleDelete}
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      />

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
