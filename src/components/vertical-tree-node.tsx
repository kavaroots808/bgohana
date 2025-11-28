'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const VerticalTreeNode = ({ node }: { node: Distributor }) => {
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    return (
      <div className="pl-4 border-l-2 border-primary/50 ml-2">
        <DistributorCard distributor={node} isVertical={true} />
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={node.id} className="border-none">
        <AccordionTrigger className="hover:no-underline p-0 [&[data-state=open]>svg]:text-primary data-[state=open]:pb-2">
          <div className="flex-1 text-left">
            <DistributorCard distributor={node} isVertical={true} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-4 space-y-4 border-l-2 border-primary/20 ml-4">
            {node.children.map(child => (
              <VerticalTreeNode key={child.id} node={child} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
