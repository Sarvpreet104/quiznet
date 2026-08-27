import Link from "next/link";
import { FaPlus, FaUsers } from "react-icons/fa";

import { getStudentLists } from "@/app/actions/student-lists";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudentListsPage() {
  const result = await getStudentLists();

  if (!result.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Student Lists</h1>

        <p className="mt-4 text-destructive">{result.error}</p>
      </div>
    );
  }

  const lists = result.lists;

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Lists</h1>

          <p className="text-muted-foreground mt-1">
            Organize students into reusable groups for your quizzes.
          </p>
        </div>

        <PrimaryButton
          name="Create List"
          href="/admin/studentlists/create"
          icon={FaPlus}
        />
      </div>

      {/* Lists */}
      {lists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/admin/studentlists/${list.id}`}
              className="group"
            >
              <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <FaUsers className="text-xl" />
                    </div>

                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      Student List
                    </span>
                  </div>

                  <div className="mt-5">
                    <h2 className="truncate text-xl font-semibold">
                      {list.name}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {list.member_count}{" "}
                      {list.member_count === 1 ? "student" : "students"}
                    </p>
                  </div>

                  <div className="mt-auto pt-6">
                    <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Manage list →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
          <FaUsers className="text-xl" />
        </div>

        <h2 className="mt-4 text-xl font-semibold">No student lists yet</h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Create your first student list to quickly assign groups of students to
          quizzes.
        </p>

        <PrimaryButton
          name="Create Your First List"
          href="/admin/studentlists/create"
          icon={FaPlus}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
}
