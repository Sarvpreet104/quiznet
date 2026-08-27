"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaGlobe,
  FaLock,
  FaPlus,
  FaSave,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

import {
  assignStudentListToQuiz,
  createOption,
  createQuestion,
  deleteOption,
  deleteQuestion,
  deleteQuiz,
  removeStudentListFromQuiz,
  saveQuizEditor,
} from "@/app/actions/quizzes";

// ============================================================
// TYPES
// ============================================================

type Option = {
  id: string;
  question_id: string;
  option_text: string;
  option_order: number;
  is_correct: boolean;
};

type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_order: number;
  marks: number;
  options: Option[];
};

type StudentList = {
  id: string;
  name: string;
  member_count: number;
  assigned_at?: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "live";
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type QuizEditorProps = {
  initialQuiz: Quiz;
  initialQuestions: Question[];
  initialStudentLists: StudentList[];
  allStudentLists: StudentList[];
};

// ============================================================
// COMPONENT
// ============================================================

const QuizEditor = ({
  initialQuiz,
  initialQuestions,
  initialStudentLists,
  allStudentLists,
}: QuizEditorProps) => {
  const router = useRouter();

  const [title, setTitle] = useState(initialQuiz.title);
  const [description, setDescription] = useState(initialQuiz.description ?? "");

  const [duration, setDuration] = useState(
    String(Math.floor(initialQuiz.duration_seconds / 60)),
  );

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const [studentLists, setStudentLists] =
    useState<StudentList[]>(initialStudentLists);

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );

  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  const [assigningListId, setAssigningListId] = useState<string | null>(null);

  const [removingListId, setRemovingListId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const isDraft = initialQuiz.status === "draft";
  const isLive = initialQuiz.status === "live";

  // ============================================================
  // DERIVED DATA
  // ============================================================

  const totalMarks = useMemo(() => {
    return questions.reduce(
      (total, question) => total + Number(question.marks || 0),
      0,
    );
  }, [questions]);

  const availableStudentLists = useMemo(() => {
    const assignedIds = new Set(studentLists.map((list) => list.id));

    return allStudentLists.filter((list) => !assignedIds.has(list.id));
  }, [allStudentLists, studentLists]);

  // ============================================================
  // QUESTION HELPERS
  // ============================================================

  function updateQuestion(questionId: string, updates: Partial<Question>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              ...updates,
            }
          : question,
      ),
    );

    setSuccess(false);
  }

  function updateOption(
    questionId: string,
    optionId: string,
    updates: Partial<Option>,
  ) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId
              ? {
                  ...option,
                  ...updates,
                }
              : option,
          ),
        };
      }),
    );

    setSuccess(false);
  }

  function setCorrectOption(questionId: string, optionId: string) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            is_correct: option.id === optionId,
          })),
        };
      }),
    );

    setSuccess(false);
  }

  // ============================================================
  // ADD QUESTION
  // ============================================================

  async function handleAddQuestion() {
    if (!isDraft) {
      return;
    }

    setError(null);
    setIsAddingQuestion(true);

    const result = await createQuestion(initialQuiz.id);

    if (!result.success) {
      setError(result.error);
      setIsAddingQuestion(false);
      return;
    }

    setQuestions((current) => [
      ...current,
      {
        ...result.question,
        options: [],
      },
    ]);

    setIsAddingQuestion(false);
    setSuccess(false);
  }

  // ============================================================
  // DELETE QUESTION
  // ============================================================

  async function handleDeleteQuestion(questionId: string) {
    if (!isDraft) {
      return;
    }

    const question = questions.find((item) => item.id === questionId);

    const confirmed = window.confirm(
      `Delete Question ${question?.question_order ?? ""} permanently?\n\nThis will also delete all of its answer options. This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingQuestionId(questionId);

    const result = await deleteQuestion(questionId);

    if (!result.success) {
      setError(result.error);
      setDeletingQuestionId(null);
      return;
    }

    // Remove the question from the local UI immediately.
    setQuestions((current) => {
      const remaining = current.filter((item) => item.id !== questionId);

      // Re-number locally so the UI matches the database.
      return remaining.map((item, index) => ({
        ...item,
        question_order: index + 1,
      }));
    });

    setDeletingQuestionId(null);
    setSuccess(false);

    // Refresh server data so the page and database stay synchronized.
    router.refresh();
  }

  // ============================================================
  // ADD OPTION
  // ============================================================

  async function handleAddOption(questionId: string) {
    if (!isDraft) {
      return;
    }

    setError(null);

    const result = await createOption(questionId);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [...question.options, result.option],
            }
          : question,
      ),
    );

    setSuccess(false);
  }

  // ============================================================
  // DELETE OPTION
  // ============================================================

  async function handleDeleteOption(questionId: string, optionId: string) {
    if (!isDraft) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this option?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    const result = await deleteOption(optionId);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.filter(
                (option) => option.id !== optionId,
              ),
            }
          : question,
      ),
    );

    setSuccess(false);
  }

  // ============================================================
  // ASSIGN STUDENT LIST
  // ============================================================

  async function handleAssignStudentList(listId: string) {
    if (!isDraft) {
      return;
    }

    setError(null);
    setAssigningListId(listId);

    const result = await assignStudentListToQuiz(initialQuiz.id, listId);

    if (!result.success) {
      setError(result.error);
      setAssigningListId(null);
      return;
    }

    const listToAdd = allStudentLists.find((list) => list.id === listId);

    if (listToAdd) {
      setStudentLists((current) => {
        if (current.some((list) => list.id === listId)) {
          return current;
        }

        return [...current, listToAdd];
      });
    }

    setAssigningListId(null);
  }

  // ============================================================
  // REMOVE STUDENT LIST
  // ============================================================

  async function handleRemoveStudentList(listId: string) {
    if (!isDraft) {
      return;
    }

    const list = studentLists.find((item) => item.id === listId);

    const confirmed = window.confirm(
      `Remove "${list?.name ?? "this list"}" from this quiz?\n\nStudents in this list will no longer have access through this list.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setRemovingListId(listId);

    const result = await removeStudentListFromQuiz(initialQuiz.id, listId);

    if (!result.success) {
      setError(result.error);
      setRemovingListId(null);
      return;
    }

    setStudentLists((current) => current.filter((list) => list.id !== listId));

    setRemovingListId(null);
  }

  // ============================================================
  // SAVE QUIZ
  // ============================================================

  async function handleSave() {
    if (!isDraft) {
      return;
    }

    setError(null);
    setSuccess(false);

    const parsedDuration = Number(duration);

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 1 ||
      parsedDuration > 600
    ) {
      setError("Duration must be between 1 and 600 minutes.");
      return;
    }

    setIsSaving(true);

    const result = await saveQuizEditor({
      quizId: initialQuiz.id,
      title,
      description,
      durationMinutes: parsedDuration,
      questions: questions.map((question) => ({
        id: question.id,
        questionText: question.question_text,
        marks: Number(question.marks),
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.option_text,
          isCorrect: option.is_correct,
        })),
      })),
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setSuccess(true);
    setIsSaving(false);

    router.refresh();

    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  }

  // ============================================================
  // DELETE QUIZ
  // ============================================================

  async function handleDeleteQuiz() {
    const confirmed = window.confirm(
      "Delete this quiz permanently?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeletingQuiz(true);

    const result = await deleteQuiz(initialQuiz.id);

    if (!result.success) {
      setError(result.error);
      setIsDeletingQuiz(false);
      return;
    }

    router.push("/admin/quizzes");
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================== */}
        {/* TOP NAVIGATION */}
        {/* ================================================== */}

        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/admin/quizzes"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <FaArrowLeft />
            Back to quizzes
          </Link>

          <div className="flex items-center gap-3">
            {success && (
              <div className="hidden items-center gap-2 text-sm font-medium text-green-600 sm:flex">
                <FaCheckCircle />
                Changes saved
              </div>
            )}

            {isDraft && (
              <PrimaryButton
                name={isSaving ? "Saving..." : "Save All Changes"}
                type="button"
                disabled={isSaving || isDeletingQuiz}
                icon={FaSave}
                onClick={handleSave}
              />
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <FaFileAlt />
                  Quiz Editor
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  {title || "Untitled Quiz"}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Build your quiz, manage its questions and prepare it for
                  publication.
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  isLive
                    ? "border-green-500/30 bg-green-500/10 text-green-600"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600"
                }`}
              >
                {isLive ? <FaGlobe /> : <FaLock />}
                {isLive ? "Live" : "Draft"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Questions
                </p>

                <p className="mt-1 text-xl font-bold">{questions.length}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total marks
                </p>

                <p className="mt-1 text-xl font-bold">{totalMarks}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Duration
                </p>

                <p className="mt-1 flex items-center gap-1 text-xl font-bold">
                  <FaClock className="text-sm text-muted-foreground" />
                  {Math.floor(Number(duration) || 0)}m
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Assigned lists
                </p>

                <p className="mt-1 flex items-center gap-2 text-xl font-bold">
                  <FaUsers className="text-sm text-muted-foreground" />
                  {studentLists.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* LIVE INFO */}
        {/* ================================================== */}

        {isLive && (
          <div className="mb-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-sm text-green-700 dark:text-green-400">
            <div className="flex gap-3">
              <FaGlobe className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">This quiz is live.</p>

                <p className="mt-1 opacity-90">
                  Students can access this quiz. Content and student access
                  editing are disabled while the quiz is live.
                </p>

                <p className="mt-2 font-medium">
                  Switch the quiz back to Draft from the quiz list before making
                  changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STUDENT ACCESS */}
        {/* ================================================== */}

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Student Access</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose which student lists can access this quiz.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            {/* ASSIGNED LISTS */}

            <div>
              <div className="mb-4 flex items-center gap-2">
                <FaUsers className="text-muted-foreground" />

                <h3 className="font-semibold">Assigned student lists</h3>
              </div>

              {studentLists.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <FaUsers className="mx-auto text-xl text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No student lists assigned
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Assign a list below to control who can access this quiz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FaUsers />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">{list.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {list.member_count}{" "}
                            {list.member_count === 1 ? "student" : "students"}
                          </p>
                        </div>
                      </div>

                      {isDraft && (
                        <button
                          type="button"
                          disabled={
                            removingListId === list.id ||
                            assigningListId !== null ||
                            isSaving
                          }
                          onClick={() => handleRemoveStudentList(list.id)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTrash />

                          {removingListId === list.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVAILABLE LISTS */}

            {isDraft && (
              <div className="mt-8 border-t pt-6">
                <div className="mb-4">
                  <h3 className="font-semibold">Add a student list</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Only student lists belonging to your admin account are
                    shown.
                  </p>
                </div>

                {availableStudentLists.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-5 text-center">
                    <FaUsers className="mx-auto text-xl text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      {allStudentLists.length === 0
                        ? "You haven't created any student lists yet."
                        : "All your student lists are already assigned."}
                    </p>

                    {allStudentLists.length === 0 && (
                      <Link
                        href="/admin/studentlists/create"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        <FaPlus />
                        Create a student list
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableStudentLists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <FaUsers className="text-sm" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {list.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {list.member_count}{" "}
                              {list.member_count === 1 ? "student" : "students"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            assigningListId === list.id ||
                            assigningListId !== null ||
                            removingListId !== null ||
                            isSaving
                          }
                          onClick={() => handleAssignStudentList(list.id)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaPlus />

                          {assigningListId === list.id ? "Adding..." : "Assign"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* QUIZ SETTINGS */}
        {/* ================================================== */}

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Quiz Settings</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure the basic information students will see.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="grid gap-6">
              {/* TITLE */}

              <div>
                <label htmlFor="quiz-title" className="text-sm font-medium">
                  Quiz title
                </label>

                <input
                  id="quiz-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setSuccess(false);
                  }}
                  disabled={!isDraft || isSaving}
                  placeholder="e.g. JavaScript Fundamentals"
                  className="mt-2 w-full rounded-xl border bg-secondary px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="quiz-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="quiz-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setSuccess(false);
                  }}
                  disabled={!isDraft || isSaving}
                  rows={3}
                  placeholder="Describe what this quiz covers..."
                  className="mt-2 w-full resize-none rounded-xl border bg-secondary px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* DURATION */}

              <div className="max-w-md">
                <label htmlFor="quiz-duration" className="text-sm font-medium">
                  Duration
                </label>

                <div className="relative mt-2">
                  <input
                    id="quiz-duration"
                    type="number"
                    min={1}
                    max={600}
                    value={duration}
                    onChange={(event) => {
                      setDuration(event.target.value);
                      setSuccess(false);
                    }}
                    disabled={!isDraft || isSaving}
                    className="w-full rounded-xl border bg-secondary px-4 py-3 pr-20 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* QUESTIONS */}
        {/* ================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Questions</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add questions, choices and mark the correct answer.
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
                <FaFileAlt className="text-xl text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">No questions yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Add your first question to start building this quiz.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-2xl border bg-card shadow-sm"
                >
                  {/* QUESTION HEADER */}

                  <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {question.question_order}
                      </div>

                      <div>
                        <p className="font-semibold">
                          Question {question.question_order}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {question.marks}{" "}
                          {question.marks === 1 ? "mark" : "marks"}
                          {" • "}
                          {question.options.length}{" "}
                          {question.options.length === 1 ? "option" : "options"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={question.marks}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            marks: Number(event.target.value),
                          })
                        }
                        disabled={!isDraft || isSaving}
                        className="w-24 rounded-lg border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                        aria-label={`Marks for question ${question.question_order}`}
                      />

                      {isDraft && (
                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            deletingQuestionId !== null ||
                            isAddingQuestion
                          }
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete question ${question.question_order}`}
                          title="Delete question"
                        >
                          {deletingQuestionId === question.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QUESTION CONTENT */}

                  <div className="p-5">
                    <div>
                      <label
                        htmlFor={`question-${question.id}`}
                        className="text-sm font-medium"
                      >
                        Question
                      </label>

                      <textarea
                        id={`question-${question.id}`}
                        value={question.question_text}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            question_text: event.target.value,
                          })
                        }
                        disabled={!isDraft || isSaving}
                        rows={3}
                        placeholder="Enter your question..."
                        className="mt-2 w-full resize-none rounded-xl border bg-secondary px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* OPTIONS */}

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Answer options</h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Select exactly one correct answer.
                          </p>
                        </div>

                        {isDraft && (
                          <SecondaryButton
                            name="Add Option"
                            type="button"
                            icon={FaPlus}
                            disabled={isSaving || deletingQuestionId !== null}
                            onClick={() => handleAddOption(question.id)}
                          />
                        )}
                      </div>

                      {question.options.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            No options yet.
                          </p>

                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(question.id)}
                              disabled={isSaving || deletingQuestionId !== null}
                              className="mt-3 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                            >
                              Add an option
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {question.options.map((option, index) => (
                            <div
                              key={option.id}
                              className={`rounded-xl border p-3 transition ${
                                option.is_correct
                                  ? "border-green-500/40 bg-green-500/5"
                                  : "bg-background"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  disabled={!isDraft || isSaving}
                                  onClick={() =>
                                    setCorrectOption(question.id, option.id)
                                  }
                                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition ${
                                    option.is_correct
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                  } disabled:cursor-not-allowed disabled:opacity-50`}
                                  aria-label={`Mark option ${
                                    index + 1
                                  } as correct`}
                                >
                                  {String.fromCharCode(65 + index)}
                                </button>

                                <input
                                  type="text"
                                  value={option.option_text}
                                  onChange={(event) =>
                                    updateOption(question.id, option.id, {
                                      option_text: event.target.value,
                                    })
                                  }
                                  disabled={!isDraft || isSaving}
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + index,
                                  )}`}
                                  className="min-w-0 flex-1 rounded-lg border bg-secondary px-3 py-2.5 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                {option.is_correct && (
                                  <span className="hidden text-xs font-semibold text-green-600 sm:block">
                                    Correct
                                  </span>
                                )}

                                {isDraft && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteOption(question.id, option.id)
                                    }
                                    disabled={isSaving}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                    aria-label="Delete option"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* ================================================== */}
              {/* ADD QUESTION — BELOW ALL QUESTION CARDS */}
              {/* ================================================== */}

              {isDraft && (
                <div className="flex justify-center pt-2">
                  <PrimaryButton
                    name={
                      isAddingQuestion ? "Adding..." : "Add Another Question"
                    }
                    type="button"
                    disabled={
                      isAddingQuestion ||
                      isSaving ||
                      deletingQuestionId !== null
                    }
                    icon={FaPlus}
                    onClick={handleAddQuestion}
                  />
                </div>
              )}
            </div>
          )}

          {/* ================================================== */}
          {/* ADD FIRST QUESTION */}
          {/* ================================================== */}

          {questions.length === 0 && isDraft && (
            <div className="mt-5 flex justify-center">
              <PrimaryButton
                name={isAddingQuestion ? "Adding..." : "Add First Question"}
                type="button"
                disabled={isAddingQuestion || isSaving}
                icon={FaPlus}
                onClick={handleAddQuestion}
              />
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* BOTTOM ACTIONS */}
        {/* ================================================== */}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDeleteQuiz}
            disabled={isDeletingQuiz || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaTrash />

            {isDeletingQuiz ? "Deleting..." : "Delete Quiz"}
          </button>

          <div className="flex gap-3">
            <Link
              href="/admin/quizzes"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
            >
              Cancel
            </Link>

            {isDraft && (
              <PrimaryButton
                name={isSaving ? "Saving..." : "Save All Changes"}
                type="button"
                disabled={isSaving || isDeletingQuiz}
                icon={FaSave}
                onClick={handleSave}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
