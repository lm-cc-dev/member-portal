'use client';

import { PropsWithChildren } from 'react';

interface ProfileSectionProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
