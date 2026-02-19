'use client';

interface DataStateProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}

export default function DataState({
  title,
  message,
  tone = 'neutral',
}: DataStateProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className={tone === 'error' ? 'text-red-500 text-sm' : 'text-gray-500 text-sm'}>
        {message}
      </p>
    </div>
  );
}
