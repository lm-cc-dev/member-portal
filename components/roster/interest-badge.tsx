'use client';

import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Color palette matching the profile fields component
const optionColors = [
  { bg: 'bg-gradient-to-r from-blue-50 to-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-gradient-to-r from-violet-50 to-violet-100', border: 'border-violet-400', text: 'text-violet-700' },
  { bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
  { bg: 'bg-gradient-to-r from-amber-50 to-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
  { bg: 'bg-gradient-to-r from-rose-50 to-rose-100', border: 'border-rose-400', text: 'text-rose-700' },
  { bg: 'bg-gradient-to-r from-cyan-50 to-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700' },
  { bg: 'bg-gradient-to-r from-orange-50 to-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  { bg: 'bg-gradient-to-r from-teal-50 to-teal-100', border: 'border-teal-400', text: 'text-teal-700' },
];

interface InterestBadgeProps {
  value: string;
  colorIndex: number;
  isMatching: boolean;
}

export function InterestBadge({ value, colorIndex, isMatching }: InterestBadgeProps) {
  const colorSet = optionColors[colorIndex % optionColors.length];

  const baseClasses = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all`;
  const colorClasses = `${colorSet.border} ${colorSet.bg} ${colorSet.text} font-medium`;
  const matchClasses = isMatching ? 'ring-2 ring-amber-500 ring-offset-1 shadow-md' : '';

  const badge = (
    <span className={`${baseClasses} ${colorClasses} ${matchClasses}`}>
      {isMatching && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
      {value}
    </span>
  );

  if (isMatching) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>You share this interest!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
