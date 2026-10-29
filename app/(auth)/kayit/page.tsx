import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Kayıt · Halı Saha" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
