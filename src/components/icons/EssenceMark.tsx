import { ComponentPropsWithoutRef } from 'react';

type EssenceMarkProps = ComponentPropsWithoutRef<'svg'>;

export default function EssenceMark({ className, ...props }: EssenceMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.6" opacity="0.24" />
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="32" cy="32" r="4.2" fill="currentColor" opacity="0.85" />
      <path d="M32 8v8m0 32v8M8 32h8m32 0h8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="m15.4 15.4 5.6 5.6m22 22 5.6 5.6m0-33.2-5.6 5.6m-22 22-5.6 5.6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
