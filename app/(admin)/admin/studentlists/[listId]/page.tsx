import { notFound } from "next/navigation";

import {
  getStudentList,
  getStudentListMembers,
} from "@/app/actions/student-lists";

import StudentListManager from "./StudentListManager";

type StudentListPageProps = {
  params: Promise<{
    listId: string;
  }>;
};

export default async function StudentListPage({
  params,
}: StudentListPageProps) {
  const { listId } = await params;

  const [listResult, membersResult] = await Promise.all([
    getStudentList(listId),
    getStudentListMembers(listId),
  ]);

  if (!listResult.success) {
    notFound();
  }

  if (!membersResult.success) {
    throw new Error(membersResult.error);
  }

  return (
    <StudentListManager
      list={listResult.list}
      initialMembers={membersResult.members}
    />
  );
}
