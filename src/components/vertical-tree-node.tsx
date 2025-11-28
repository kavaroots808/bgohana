'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const VerticalTreeNode = ({ node }: { node: Distributor }) => {
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    return (
      <div className="ml-2 pl-4">
        <DistributorCard distributor={node} isVertical={true} />
      </div>
    );
  }

  return (
    <div className="ml-2 pl-4">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={node.id} className="border-none">
                <div className='flex items-center gap-0'>
                    <DistributorCard distributor={node} isVertical={true} />
                    <AccordionTrigger className="p-2 -ml-2 [&[data-state=open]>svg]:text-primary"/>
                </div>
                <AccordionContent>
                    <div className="pl-4 space-y-4 border-l-2 border-primary/20 ml-4">
                        {node.children.map(child => (
                            <VerticalTreeNode key={child.id} node={child} />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
};
