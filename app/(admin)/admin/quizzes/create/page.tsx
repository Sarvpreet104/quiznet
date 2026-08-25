import CreateQuizForm from "./CreateQuizForm";

export default function CreateQuizPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Create Quiz</h1>

        <p className="mt-1 text-muted-foreground">
          Start by entering the basic quiz information.
        </p>

        <div className="mt-8">
          <CreateQuizForm />
        </div>
      </div>
    </div>
  );
}
