/**
 * Deal Not Found Page
 *
 * Displayed when a deal doesn't exist or user doesn't have access
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function DealNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Empty className="max-w-md">
        <EmptyMedia variant="icon">
          <FileQuestion />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Deal Not Found</EmptyTitle>
          <EmptyDescription>
            The deal you are looking for does not exist or you do not have
            permission to view it.
          </EmptyDescription>
        </EmptyHeader>
        <Button asChild className="mt-4">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </Empty>
    </div>
  );
}
