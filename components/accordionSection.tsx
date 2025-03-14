import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const AccordionSection = ({
  title,
  children,
}: Readonly<{
  title: string;
  children?: React.ReactNode;
}>) => {
  return (
    <section className="bg-white border rounded-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="p-4 bg-neutral-50 rounded-none">
            {title}
          </AccordionTrigger>
          <AccordionContent className="border-t flex flex-col divide-y pb-0">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default AccordionSection;
