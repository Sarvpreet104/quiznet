import { FaQuestion } from "react-icons/fa";
import MyBadge from "@/components/MyBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQs = async () => {
  const items = [
    {
      value: "item-1",
      trigger: "How do I reset my password?",
      content:
        "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours.",
    },
    {
      value: "item-2",
      trigger: "Can I change my subscription plan?",
      content:
        "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.",
    },
    {
      value: "item-3",
      trigger: "What payment methods do you accept?",
      content:
        "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.",
    },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-4" id="faqs">
      {/* content heading */}
      <div className="flex flex-col gap-6 justify-center items-center pt-14 pb-10">
        <MyBadge icon={FaQuestion} label="FAQs" />

        <h2 className="order-two-heading text-center">People Also Ask</h2>
      </div>

      {/*  */}
      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="rounded-lg border border-border my-6 md:my-10"
      >
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="border-b px-4 last:border-b-0"
          >
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default HomeFAQs;
