import { FaCog } from "react-icons/fa";
import { Fa1, Fa2, Fa3, Fa4, Fa5 } from "react-icons/fa6";

import MyBadge from "@/components/MyBadge";

const steps = [
  {
    number: Fa1,
    title: "Create Your Account",
    description:
      "Sign up with your college details and create your Quiznet account in just a few moments.",
  },
  {
    number: Fa2,
    title: "Choose Your Quiz",
    description:
      "Browse the available quizzes and select the test you want to attempt.",
  },
  {
    number: Fa3,
    title: "Attempt the Test",
    description:
      "Answer each question carefully and complete your quiz within the given time.",
  },
  {
    number: Fa4,
    title: "Submit Your Answers",
    description:
      "Review your answers and submit the quiz when you are ready to finish.",
  },
  {
    number: Fa5,
    title: "View Your Results",
    description:
      "Get your results instantly and use your performance insights to improve.",
  },
];

const HomeWorking = () => {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20"
      id="howitworks"
    >
      {/* ==================== SECTION HEADING ==================== */}

      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-5 text-center">
        <MyBadge icon={FaCog} label="How It Works?" />

        <div className="space-y-3">
          <h2 className="order-two-heading">
            Simple Steps to <span className="text-primary">Follow</span>
          </h2>

          <p className="description-text mx-auto max-w-xl">
            Getting started with Quiznet is simple. Follow these five steps and
            you will be ready to take your next quiz.
          </p>
        </div>
      </div>

      {/* ==================== DESKTOP TIMELINE ==================== */}

      <div className="relative mx-auto mt-16 hidden max-w-5xl md:block">
        {/* Timeline line */}

        <div
          className="
            absolute
            left-1/2
            top-6
            h-[calc(100%-3rem)]
            w-px
            -translate-x-1/2
            bg-border
          "
        />

        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = step.number;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={step.title}
                className="relative grid grid-cols-2 gap-12"
              >
                {/* ==================== LEFT ==================== */}

                <div
                  className={`flex items-center ${
                    isLeft ? "justify-end text-right" : "justify-end opacity-0"
                  }`}
                >
                  {isLeft && (
                    <div className="max-w-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                        Step {index + 1}
                      </p>

                      <h3 className="order-four-heading">{step.title}</h3>

                      <p className="description-text mt-2">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* ==================== CENTER ==================== */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    z-10
                    flex
                    size-12
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-primary/20
                    bg-background
                    text-primary
                    shadow-sm
                    ring-8
                    ring-background
                  "
                >
                  <Icon className="text-lg" />
                </div>

                {/* ==================== RIGHT ==================== */}

                <div
                  className={`flex items-center ${
                    !isLeft
                      ? "justify-start text-left"
                      : "justify-start opacity-0"
                  }`}
                >
                  {!isLeft && (
                    <div className="max-w-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                        Step {index + 1}
                      </p>

                      <h3 className="order-four-heading">{step.title}</h3>

                      <p className="description-text mt-2">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== MOBILE TIMELINE ==================== */}

      <div className="relative mt-12 md:hidden">
        {/* Mobile timeline line */}

        <div
          className="
            absolute
            bottom-6
            left-6
            top-6
            w-px
            bg-border
          "
        />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.number;

            return (
              <div key={step.title} className="relative flex gap-5">
                {/* Number */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-primary/20
                    bg-background
                    text-primary
                    shadow-sm
                    ring-4
                    ring-background
                  "
                >
                  <Icon className="text-lg" />
                </div>

                {/* Content */}

                <div className="pb-2 pt-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    Step {index + 1}
                  </p>

                  <h3 className="order-four-heading">{step.title}</h3>

                  <p className="description-text mt-2">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeWorking;
