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
      <div>
        <h1 className="font-display text-3xl uppercase">Kaydın alındı</h1>
        <p className="mt-3 text-white/70">{state.notice}</p>
        <Link href="/giris" className="mt-6 inline-block text-sm font-semibold text-gold hover:underline">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="mb-2">
        <h1 className="font-display text-3xl uppercase sm:text-4xl">
          {mode === "signin" ? "Giriş yap" : "Kadroya katıl"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {mode === "signin"
            ? "Müsait günlerini işaretlemek için hesabına gir."
            : "Hesap aç, müsait olduğun günleri işaretle."}
        </p>
      </div>

      {mode === "signup" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" name="first_name" autoComplete="given-name" defaultValue={v.first_name} />
          <Field label="Soyad" name="last_name" autoComplete="family-name" defaultValue={v.last_name} />
        </div>
      )}
      <Field label="E-posta" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} placeholder="ornek@mail.com" />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        hint={mode === "signup" ? "En az 8 karakter" : undefined}
      />

      {state.error && (
        <p role="alert" className="rounded-xl border border-flare/30 bg-flare/10 px-3.5 py-2.5 text-sm text-flare">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" pendingLabel={mode === "signin" ? "Giriliyor…" : "Kaydediliyor…"}>
        {mode === "signin" ? "Giriş yap" : "Kaydol"}
      </SubmitButton>

      <p className="text-center text-sm text-white/60">
        {mode === "signin" ? "Hesabın yok mu? " : "Zaten kayıtlı mısın? "}
        <Link href={mode === "signin" ? "/kayit" : "/giris"} className="font-semibold text-chalk hover:text-gold">
          {mode === "signin" ? "Kaydol" : "Giriş yap"}
        </Link>
      </p>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

function Field({ label, hint, name, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-white/80">
        {label}
        {hint && <span className="text-xs font-normal text-white/45">{hint}</span>}
      </span>
      <input name={name} required className="field" {...rest} />
    </label>
  );
}
