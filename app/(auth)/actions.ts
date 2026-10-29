"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string; values?: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-posta ya da şifre hatalı.";
  if (m.includes("email address") && m.includes("invalid"))
    return "Bu e-posta adresi kabul edilmedi, başka bir adres dene.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu e-posta ile zaten kayıt olunmuş. Giriş yapmayı dene.";
  if (m.includes("email not confirmed")) return "E-posta adresin henüz onaylanmamış.";
  if (m.includes("password")) return "Şifre en az 8 karakter olmalı.";
  if (m.includes("rate limit")) return "Çok fazla deneme oldu, biraz bekleyip tekrar dene.";
  return "Bir şeyler ters gitti, tekrar dener misin?";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!EMAIL_RE.test(email) || !password) {
    return { error: "E-posta ve şifreni gir.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translate(error.message), values };

  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const firstName = text(formData, "first_name");
  const lastName = text(formData, "last_name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { first_name: firstName, last_name: lastName, email };

  if (!firstName || !lastName) return { error: "Adını ve soyadını yaz.", values };
  if (firstName.length > 50 || lastName.length > 50) return { error: "İsim çok uzun.", values };
  if (!EMAIL_RE.test(email)) return { error: "Geçerli bir e-posta adresi yaz.", values };
  if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı.", values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });
  if (error) return { error: translate(error.message), values };

  // Supabase, kayitli bir adresi tekrar kaydetmeye calisinca hata yerine bos kimlikli kullanici dondurur.
  if (data.user && data.user.identities?.length === 0) {
    return { error: translate("already registered"), values };
  }

  if (!data.session) {
    return { notice: "Kaydın alındı. E-postana gelen onay bağlantısına tıklayıp giriş yap." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
