"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn, signUp, type AuthState } from "./actions";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const [state, action] = useActionState<AuthState, FormData>(
    mode === "signin" ? signIn : signUp,
    {},
  );
  const v = state.values ?? {};

  if (state.notice) {
    return (
      <div className="border-2 border-ink p-6">
        <p className="font-display text-3xl uppercase">Kaydın alındı</p>
        <p className="mt-3 text-ink-soft">{state.notice}</p>
        <Link href="/giris" className="mt-6 inline-block font-mono text-sm uppercase tracking-widest underline underline-offset-4">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="w-full max-w-md space-y-6" noValidate>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-flag">
          {mode === "signin" ? "Tekrar hoş geldin" : "Yeni oyuncu"}
        </p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] sm:text-6xl">
          {mode === "signin" ? "Giriş yap" : "Kayıt ol"}
        </h1>
      </div>

      {mode === "signup" && (
        <div className="grid grid-cols-2 gap-5">
          <Field label="Ad" name="first_name" autoComplete="given-name" defaultValue={v.first_name} />
          <Field label="Soyad" name="last_name" autoComplete="family-name" defaultValue={v.last_name} />
        </div>
      )}
      <Field label="E-posta" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        hint={mode === "signup" ? "En az 8 karakter" : undefined}
      />

      {state.error && (
        <p role="alert" className="border-l-4 border-flag bg-flag/8 px-3 py-2 text-sm text-flag">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
        <SubmitButton pendingLabel={mode === "signin" ? "Giriliyor…" : "Kaydediliyor…"}>
          {mode === "signin" ? "Sahaya çık" : "Kadroya katıl"}
        </SubmitButton>
        <Link
          href={mode === "signin" ? "/kayit" : "/giris"}
          className="text-sm text-ink-soft underline decoration-rule underline-offset-4 hover:text-ink"
        >
          {mode === "signin" ? "Hesabın yok mu? Kayıt ol" : "Zaten kayıtlı mısın? Giriş yap"}
        </Link>
      </div>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

function Field({ label, hint, name, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {label}
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </span>
      <input name={name} required className="field-input" {...rest} />
    </label>
  );
}
