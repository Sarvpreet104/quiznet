import CreateStudentListForm from "./CreateStudentListForm";

export default function CreateStudentListPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Student List</h1>

          <p className="mt-1 text-muted-foreground">
            Create a reusable group of students for your quizzes.
          </p>
        </div>

        <CreateStudentListForm />
      </div>
    </div>
  );
}
