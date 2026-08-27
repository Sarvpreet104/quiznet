import { notFound, redirect } from "next/navigation";

import { requireStudent } from "@/lib/authorization";
import { getStudentQuizAttempt } from "@/lib/queries/student-quiz-attempt";
import QuizAttempt from "@/components/student/QuizAttempt";

type QuizAttemptPageProps = {
  params: Promise<{
    quizId: string;
  }>;
  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function StudentQuizAttemptPage({
  params,
  searchParams,
}: QuizAttemptPageProps) {
  const user = await requireStudent();

  const { quizId } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    redirect(`/dashboard/quizzes/${quizId}`);
  }

  const attempt = await getStudentQuizAttempt(quizId, attemptId, user.id);

  if (!attempt) {
    notFound();
  }

  /*
   * If the attempt has already been submitted, don't allow
   * the student to reopen the quiz.
   */

  if (attempt.is_submitted) {
    redirect(`/dashboard/results/${quizId}`);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <QuizAttempt
          attempt={{
            attempt_id: attempt.attempt_id,
            quiz_id: attempt.quiz_id,
            started_at: attempt.started_at,
            duration_seconds: Number(attempt.duration_seconds),
            title: attempt.title,
            description: attempt.description,
            total_marks: Number(attempt.total_marks),
            questions: attempt.questions.map((question) => ({
              id: question.id,
              question_text: question.question_text,
              question_order: question.question_order,
              marks: Number(question.marks),
              options: question.options.map((option) => ({
                id: option.id,
                option_text: option.option_text,
                option_order: Number(option.option_order),
              })),
              selected_option_id: question.selected_option_id,
            })),
          }}
        />
      </div>
    </div>
  );
}
