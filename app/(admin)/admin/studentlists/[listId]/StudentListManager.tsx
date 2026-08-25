"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaSearch,
  FaUserPlus,
  FaUserMinus,
  FaUsers,
} from "react-icons/fa";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input as ShadcnInput } from "@/components/ui/input";

import SecondaryButton from "@/components/Buttons/SecondaryButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

import {
  addStudentToList,
  removeStudentFromList,
  searchStudents,
} from "@/app/actions/student-lists";

type Student = {
  id: string;
  first_name: string;
  last_name: string | null;
  college_id: string;
  email: string;
};

type StudentList = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type StudentListManagerProps = {
  list: StudentList;
  initialMembers: Student[];
};

export default function StudentListManager({
  list,
  initialMembers,
}: StudentListManagerProps) {
  const router = useRouter();

  const [members, setMembers] = useState<Student[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionStudentId, setActionStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const query = search.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    const result = await searchStudents(list.id, query);

    setSearching(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSearchResults(result.students);
  }

  async function handleAddStudent(student: Student) {
    setActionStudentId(student.id);
    setError(null);

    const result = await addStudentToList(list.id, student.id);

    if (!result.success) {
      setError(result.error);
      setActionStudentId(null);
      return;
    }

    setMembers((current) => [...current, student]);

    setSearchResults((current) =>
      current.filter((item) => item.id !== student.id),
    );

    setActionStudentId(null);

    router.refresh();
  }

  async function handleRemoveStudent(studentId: string) {
    setActionStudentId(studentId);
    setError(null);

    const result = await removeStudentFromList(list.id, studentId);

    if (!result.success) {
      setError(result.error);
      setActionStudentId(null);
      return;
    }

    setMembers((current) =>
      current.filter((student) => student.id !== studentId),
    );

    setActionStudentId(null);

    router.refresh();
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <SecondaryButton
            name="Student Lists"
            href="/admin/studentlists"
            icon={FaArrowLeft}
            className="mb-6 flex-row-reverse"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>

              <p className="mt-1 text-muted-foreground">
                Manage the students in this list.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-secondary px-4 py-2">
              <FaUsers />

              <span className="font-medium">{members.length}</span>

              <span className="text-muted-foreground">
                {members.length === 1 ? "student" : "students"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add students */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Add Students</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Search by college ID, name, or email.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

                  <ShadcnInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search students..."
                    className="pl-9"
                  />
                </div>

                <PrimaryButton
                  name={searching ? "Searching..." : "Search"}
                  type="button"
                  disabled={searching}
                  onClick={handleSearch}
                />
              </div>

              <div className="mt-5 space-y-3">
                {searchResults.length === 0 && !searching && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Search for students to add them.
                  </p>
                )}

                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-4 rounded-xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {student.first_name} {student.last_name ?? ""}
                      </p>

                      <p className="truncate text-sm text-muted-foreground">
                        {student.college_id} · {student.email}
                      </p>
                    </div>

                    <PrimaryButton
                      name=""
                      type="button"
                      disabled={actionStudentId === student.id}
                      onClick={() => handleAddStudent(student)}
                      icon={FaUserPlus}
                      className="shrink-0"
                      aria-label={`Add ${student.first_name}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current members */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Students</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Students currently assigned to this list.
                </p>
              </div>

              {members.length === 0 ? (
                <div className="py-12 text-center">
                  <FaUsers className="mx-auto text-3xl text-muted-foreground" />

                  <p className="mt-4 font-medium">No students yet</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Search for students and add them to this list.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between gap-4 rounded-xl border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {student.first_name} {student.last_name ?? ""}
                        </p>

                        <p className="truncate text-sm text-muted-foreground">
                          {student.college_id} · {student.email}
                        </p>
                      </div>

                      <SecondaryButton
                        name=""
                        type="button"
                        disabled={actionStudentId === student.id}
                        onClick={() => handleRemoveStudent(student.id)}
                        icon={FaUserMinus}
                        className="shrink-0"
                        aria-label={`Remove ${student.first_name}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
