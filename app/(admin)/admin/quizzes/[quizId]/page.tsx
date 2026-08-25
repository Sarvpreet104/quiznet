import { requireAdmin } from "@/lib/authorization";
import { getQuizForEditor } from "@/app/actions/quizzes";
import AddQuestionButton from "@/components/admin/quizzes/AddQuestionButton";
import QuestionEditor from "@/components/admin/quizzes/QuestionEditor";

type QuizEditorPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

const QuizEditorPage = async ({ params }: QuizEditorPageProps) => {
  const admin = await requireAdmin();

  const { quizId } = await params;

  const result = await getQuizForEditor(quizId);

  if (!result.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Quiz not found</h1>

        <p className="mt-2 text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const quiz = result.quiz;

  return (
    <div className="p-6 space-y-8">
      {/* Quiz Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>

            {quiz.description && (
              <p className="mt-2 text-muted-foreground">{quiz.description}</p>
            )}
          </div>

          <div className="rounded-full border px-3 py-1 text-sm capitalize">
            {quiz.status}
          </div>
        </div>

        {/* Quiz information */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Duration</p>

            <p className="mt-1 font-semibold">
              {Math.floor(quiz.duration_seconds / 60)} minutes
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Status</p>

            <p className="mt-1 font-semibold capitalize">{quiz.status}</p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Owner</p>

            <p className="mt-1 font-semibold">
              {admin.first_name} {admin.last_name}
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Questions</h2>

            <p className="text-sm text-muted-foreground">
              Add and manage the questions for this quiz.
            </p>
          </div>

          {quiz.status === "draft" && <AddQuestionButton quizId={quiz.id} />}
        </div>

        {result.questions.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <h3 className="text-lg font-semibold">No questions yet</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add your first question to start building this quiz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {result.questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                disabled={quiz.status !== "draft"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuizEditorPage;
