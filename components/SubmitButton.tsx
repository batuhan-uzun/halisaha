"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "solid" | "ghost" | "danger";
  className?: string;
};

const styles = {
  solid:
    "bg-ink text-chalk hover:bg-pitch-deep disabled:bg-ink-soft",
  ghost:
    "border-2 border-ink text-ink hover:bg-ink hover:text-chalk",
  danger:
    "border-2 border-flag text-flag hover:bg-flag hover:text-chalk",
};

export function SubmitButton({ children, pendingLabel, variant = "solid", className = "" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center px-5 py-3 font-display text-lg uppercase tracking-wide transition-colors disabled:cursor-wait ${styles[variant]} ${className}`}
    >
      {pending ? (pendingLabel ?? "Bekle…") : children}
    </button>
  );
}
