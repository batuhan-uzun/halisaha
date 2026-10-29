"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
  className?: string;
};

export const buttonStyles = {
  primary:
    "bg-gold text-night shadow-[0_10px_30px_-10px_rgb(255_200_94/0.7)] hover:bg-[#ffd47f]",
  ghost: "glass-soft text-chalk hover:bg-white/10",
  danger: "border border-flare/40 bg-flare/10 text-flare hover:bg-flare/20",
};

export function SubmitButton({ children, pendingLabel, variant = "primary", size = "md", className = "" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        size === "md" ? "px-6 py-3 text-[15px]" : "px-3.5 py-1.5 text-sm"
      } ${buttonStyles[variant]} ${className}`}
    >
      {pending ? (pendingLabel ?? "Bekle…") : children}
    </button>
  );
}
