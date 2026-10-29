import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole, type Profile } from "@/lib/types";

export const requireProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/giris");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();
  if (!profile) redirect("/giris");

  return { supabase, profile };
});

export async function requireAdmin() {
  const session = await requireProfile();
  if (!isAdminRole(session.profile.role)) redirect("/");
  return session;
}
