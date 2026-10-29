import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Giriş · Halı Saha" };

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
