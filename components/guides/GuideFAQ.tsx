"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface GuideFAQProps {
  items: FAQItem[];
  heading?: string;
}

const GuideFAQ = ({ items, heading = "Frequently asked questions" }: GuideFAQProps) => {
  return (
    <section aria-labelledby="guide-faq">
      <h2 id="guide-faq" className="text-base font-heading font-semibold text-foreground mb-2">
        {heading}
      </h2>
      <Accordion type="single" collapsible className="border border-border rounded-none bg-secondary px-3">
        {items.map((item, idx) => (
          <AccordionItem key={idx} value={`faq-${idx}`} className="last:border-b-0">
            <AccordionTrigger className="text-sm text-left font-medium text-foreground py-3">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default GuideFAQ;
