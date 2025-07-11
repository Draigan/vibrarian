import React from "react";

// Spinner as an animated SVG ring
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 40 40"
      width={40}
      height={40}
    >
      <circle
        className="opacity-25"
        cx="20"
        cy="20"
        r="16"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M20 4a16 16 0 0 1 0 32V32a16 16 0 1 0 0-32v4z"
      />
    </svg>
  );
}

export function SpinnerOverlay({
  loading,
  children,
  spinnerClassName = "text-primary absolute inset-0 z-10 pointer-events-none",
}: {
  loading: boolean;
  children: React.ReactNode;
  spinnerClassName?: string;
}) {
  return (
    <div className="relative inline-block">
      {children}
      {loading && (
        <span className={spinnerClassName}>
          <Spinner className="w-10 h-10" />
        </span>
      )}
    </div>
  );
}
