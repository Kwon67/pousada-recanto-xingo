'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function EmptyState({
  title,
  icon,
  className,
  titleClassName,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 bg-white rounded-2xl border border-gray-100', className)}>
      {icon}
      <p className={cn('text-gray-400', titleClassName)}>{title}</p>
    </div>
  );
}
