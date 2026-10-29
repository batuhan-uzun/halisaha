import type { Metadata } from "next";
import { SubmitButton } from "@/components/SubmitButton";
import { loadAdminData } from "@/lib/admin";
import { requireAdmin } from "@/lib/session";
import { setRole } from "../actions";

export const metadata: Metadata = { title: "Üyeler · Admin paneli" };
export const dynamic = "force-dynamic";

const ROLE = {
  owner: { label: "Kurucu", cls: "bg-gold/15 text-gold ring-gold/30" },
  admin: { label: "Admin", cls: "bg-pitch/15 text-pitch ring-pitch/30" },
  member: { label: "Oyuncu", cls: "bg-white/6 text-white/60 ring-white/10" },
} as const;

export default async function AdminMembers() {
  const { supabase, profile } = await requireAdmin();
  const { members, daysPerMember } = await loadAdminData(supabase);
  const isOwner = profile.role === "owner";
  const order = { owner: 0, admin: 1, member: 2 };
  const sorted = [...members].sort(
    (a, b) => order[a.role] - order[b.role] || a.first_name.localeCompare(b.first_name, "tr"),
  );

  return (
    <div className="space-y-6">
      <div className="rise">
        <p className="text-sm text-gold">Admin paneli</p>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">Üyeler</h1>
        <p className="mt-1 text-sm text-white/60">
          {members.length} kayıtlı oyuncu.{" "}
          {isOwner ? "Kaydolanlardan istediğini admin yapabilirsin." : "Admin atamasını sadece kurucu yapabilir."}
        </p>
      </div>

      <ul className="glass divide-y divide-white/8 rounded-[24px] px-4 sm:px-6">
        {sorted.map((m) => {
          const marked = daysPerMember.get(m.id) ?? 0;
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold">
                {m.first_name.charAt(0)}
                {m.last_name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {m.first_name} {m.last_name}
                  {m.id === profile.id && <span className="ml-2 text-xs font-normal text-white/45">(sen)</span>}
                </p>
                <p className="truncate text-sm text-white/50">{m.email}</p>
              </div>
              <span className="text-xs text-white/50 tabular-nums">{marked} gün işaretli</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ROLE[m.role].cls}`}>{ROLE[m.role].label}</span>
              {isOwner && m.role !== "owner" && (
                <form action={setRole}>
                  <input type="hidden" name="target" value={m.id} />
                  <input type="hidden" name="role" value={m.role === "admin" ? "member" : "admin"} />
                  <SubmitButton variant={m.role === "admin" ? "danger" : "ghost"} size="sm" pendingLabel="…">
                    {m.role === "admin" ? "Adminliği al" : "Admin yap"}
                  </SubmitButton>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
