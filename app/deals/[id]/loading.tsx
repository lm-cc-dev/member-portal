/**
 * Deal Detail Loading State
 *
 * Skeleton UI while deal data is being fetched
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DealLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <Skeleton className="h-48 md:h-64 w-full rounded-none" />

      {/* Content Skeleton */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Deal Overview Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-48 rounded-md" />
          </CardContent>
        </Card>

        {/* Separator */}
        <div className="py-4">
          <Skeleton className="h-px w-full" />
        </div>

        {/* Confidential Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-52" />
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
