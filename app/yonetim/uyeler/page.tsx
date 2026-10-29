import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { Footer, SectionTitle } from "@/components/Section";
import { SubmitButton } from "@/components/SubmitButton";
import { requireProfile } from "@/lib/session";
import { isAdminRole, type Profile } from "@/lib/types";
import { setRole } from "../actions";

export const metadata: Metadata = { title: "Üyeler · Halı Saha" };
export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "Kurucu", admin: "Admin", member: "Üye" } as const;

export default async function MembersPage() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminRole(profile.role)) redirect("/");
  const isOwner = profile.role === "owner";

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at")
    .returns<Profile[]>();
  const members = data ?? [];

  return (
    <>
      <Masthead profile={profile} section="Yönetim · üyeler" />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle id="uyeler" kicker={`${members.length} kayıtlı`}>
            Kadro
          </SectionTitle>
          <Link href="/yonetim" className="mb-5 font-mono text-xs uppercase tracking-[0.14em] underline underline-offset-4 hover:text-flag">
            Yönetime dön
          </Link>
        </div>
        {!isOwner && (
          <p className="-mt-2 mb-5 text-sm text-ink-soft">Admin atamasını sadece kurucu yapabilir.</p>
        )}
        <ul className="border-t-2 border-ink">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule py-3">
              <div className="min-w-0">
                <p className="font-display text-xl uppercase leading-tight">
                  {m.first_name} {m.last_name}
                </p>
                <p className="truncate font-mono text-xs text-ink-soft">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    m.role === "member" ? "border border-rule text-ink-soft" : m.role === "owner" ? "bg-ink text-chalk" : "bg-pitch text-chalk"
                  }`}
                >
                  {ROLE_LABEL[m.role]}
                </span>
                {isOwner && m.role !== "owner" && (
                  <form action={setRole}>
                    <input type="hidden" name="target" value={m.id} />
                    <input type="hidden" name="role" value={m.role === "admin" ? "member" : "admin"} />
                    <SubmitButton variant={m.role === "admin" ? "danger" : "ghost"} pendingLabel="…" className="px-3 py-1.5 text-sm">
                      {m.role === "admin" ? "Adminliği al" : "Admin yap"}
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
