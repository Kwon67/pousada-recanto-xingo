'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg shadow-dark/5',
        paddingStyles[padding],
        hover && 'card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  aspectRatio?: 'video' | 'square' | 'portrait';
}

export function CardImage({
  src,
  alt,
  className,
  overlay = false,
  aspectRatio = 'video',
}: CardImageProps) {
  const aspectStyles = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className={cn('relative overflow-hidden rounded-xl img-zoom', aspectStyles[aspectRatio], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
      )}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('font-display text-xl font-semibold text-dark', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-text-light text-sm leading-relaxed', className)}>
      {children}
    </p>
  );
}
