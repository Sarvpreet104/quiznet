import { requireAdmin } from "@/lib/authorization";
import {
  getAdminStudentLists,
  getQuizForEditor,
  getQuizStudentLists,
} from "@/app/actions/quizzes";
import QuizEditor from "@/components/admin/quizzes/QuizEditor";

type QuizEditorPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

const QuizEditorPage = async ({ params }: QuizEditorPageProps) => {
  await requireAdmin();

  const { quizId } = await params;

  const [quizResult, assignedListsResult, allListsResult] = await Promise.all([
    getQuizForEditor(quizId),
    getQuizStudentLists(quizId),
    getAdminStudentLists(),
  ]);

  if (!quizResult.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Quiz not found</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {quizResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!assignedListsResult.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Unable to load student access</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {assignedListsResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!allListsResult.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Unable to load student lists</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {allListsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const questions = quizResult.questions.map((question) => ({
    ...question,
    options: quizResult.options.filter(
      (option) => option.question_id === question.id,
    ),
  }));

  return (
    <QuizEditor
      initialQuiz={quizResult.quiz}
      initialQuestions={questions}
      initialStudentLists={assignedListsResult.lists}
      allStudentLists={allListsResult.lists}
    />
  );
};

export default QuizEditorPage;
