import CreateStudentListForm from "./CreateStudentListForm";

export default function CreateStudentListPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">Student Lists</p>

          <h1 className="text-3xl font-bold tracking-tight">
            Create Student List
          </h1>

          <p className="mt-2 max-w-xl text-muted-foreground">
            Create a reusable group of students that you can assign to your
            quizzes later.
          </p>
        </div>

        <CreateStudentListForm />
      </div>
    </div>
  );
}
