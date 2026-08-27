import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  History,
  Trophy,
} from "lucide-react";

import { requireStudent } from "@/lib/authorization";

const Dashboard = async () => {
  const user = await requireStudent();

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
        {/* ---------------------------------------------------------------- */}
        {/* Welcome Section                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
          {/* Decorative background */}

          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-primary">
                  Welcome back
                </p>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Hey, {user.first_name}!
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                  Ready to test your knowledge? Pick a quiz, challenge yourself,
                  and keep building that streak.
                </p>
              </div>

              <Link
                href="/dashboard/quizzes"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Browse Quizzes
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Stats                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Quizzes */}

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Keep going
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Available Quizzes
            </p>

            <p className="mt-1 text-2xl font-bold">Explore</p>
          </div>

          {/* Results */}

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Track progress
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">Your Results</p>

            <p className="mt-1 text-2xl font-bold">View</p>
          </div>

          {/* Streak */}

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Flame className="size-5" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Stay consistent
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Learning Streak
            </p>

            <p className="mt-1 text-2xl font-bold">Keep it up 🔥</p>
          </div>

          {/* Achievements */}

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Trophy className="size-5" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">Achievements</p>

            <p className="mt-1 text-2xl font-bold">🏆</p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Main Content                                                     */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Quick Actions */}

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">What do you want to do?</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Jump straight into the stuff that matters.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Browse quizzes */}

              <Link
                href="/dashboard/quizzes"
                className="group rounded-2xl border border-border/60 bg-background p-5 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>

                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <h3 className="mt-5 font-semibold">Take a Quiz</h3>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Browse available quizzes and challenge yourself.
                </p>
              </Link>

              {/* Results */}

              <Link
                href="/dashboard/results"
                className="group rounded-2xl border border-border/60 bg-background p-5 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <History className="size-5" />
                  </div>

                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <h3 className="mt-5 font-semibold">View Results</h3>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Review your previous attempts and see your answers.
                </p>
              </Link>
            </div>
          </div>

          {/* Motivation Card */}

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-7">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-5" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">Today's Challenge</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Don't wait until you feel ready. Take a quiz, find your weak
              spots, and use the results to get better.
            </p>

            <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-medium">
                    10 minutes can make a difference.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Pick one quiz and see how much you know.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/quizzes"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Find a quiz
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom Tip                                                       */}
        {/* ---------------------------------------------------------------- */}

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">💡 Pro tip</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Don't just chase your score. Review the questions you got wrong
                — that's where the actual XP is.
              </p>
            </div>

            <Link
              href="/dashboard/results"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium transition hover:bg-accent"
            >
              Review Answers
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
