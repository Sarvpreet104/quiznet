import { FaQuestion } from "react-icons/fa";

import MyBadge from "@/components/MyBadge";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQs = () => {
  const items = [
    {
      value: "item-1",
      trigger: "How do I create a Quiznet account?",
      content:
        "Click the Register button and fill in your first name, last name, college ID, email, and password. Once your account is created, you can log in and access the available quizzes.",
    },
    {
      value: "item-2",
      trigger: "How do I attempt a quiz?",
      content:
        "After logging in, go to your dashboard and choose an available quiz. Read the instructions, start the quiz, answer the questions, and submit your answers when you are finished.",
    },
    {
      value: "item-3",
      trigger: "Can I see my quiz results?",
      content:
        "Yes. After submitting a quiz, your result can be viewed through your dashboard. You can use your results to track your performance and identify areas where you can improve.",
    },
    {
      value: "item-4",
      trigger: "Can I retake a quiz?",
      content:
        "Whether you can retake a quiz depends on how the quiz has been configured by the administrator. If retakes are enabled, you will be able to attempt the quiz again.",
    },
    {
      value: "item-5",
      trigger: "What happens if I leave a quiz before submitting?",
      content:
        "Your quiz attempt may not be completed until you submit your answers. Make sure you finish and submit the quiz before leaving the page to ensure your answers are recorded.",
    },
    {
      value: "item-6",
      trigger: "How do I reset my password?",
      content:
        "If you forget your password, use the password recovery option on the login page and follow the instructions to regain access to your Quiznet account.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20" id="faqs">
      {/* ==================== SECTION HEADING ==================== */}

      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-5 text-center">
        <MyBadge icon={FaQuestion} label="FAQs" />

        <div className="space-y-3">
          <h2 className="order-two-heading">
            People Also <span className="text-primary">Ask</span>
          </h2>

          <p className="description-text mx-auto max-w-xl">
            Got questions? Find quick answers to some of the most common
            questions about Quiznet.
          </p>
        </div>
      </div>

      {/* ==================== FAQ ACCORDION ==================== */}

      <div className="mx-auto mt-12 max-w-3xl md:mt-14">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="space-y-3"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="
                overflow-hidden
                rounded-xl
                border
                border-border/70
                bg-card
                px-5
                shadow-sm
                transition-all
                duration-200
                hover:border-primary/30
                hover:shadow-md
                data-[state=open]:border-primary/40
              "
            >
              <AccordionTrigger
                className="
                  gap-4
                  py-5
                  text-left
                  text-sm
                  font-semibold
                  no-underline
                  hover:no-underline
                  md:text-base
                "
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* Question number */}

                  <div
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-primary/10
                      text-xs
                      font-bold
                      text-primary
                    "
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <span>{item.trigger}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent
                className="
                  pb-5
                  pl-13
                  pr-6
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default HomeFAQs;
