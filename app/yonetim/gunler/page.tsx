import type { Metadata } from "next";
import { loadAdminData } from "@/lib/admin";
import { requireAdmin } from "@/lib/session";
import { DayExplorer } from "./DayExplorer";

export const metadata: Metadata = { title: "Günler · Admin paneli" };
export const dynamic = "force-dynamic";

export default async function AdminDays() {
  const { supabase } = await requireAdmin();
  const { days, byDay, ranked, matches, total } = await loadAdminData(supabase);

  return (
    <div className="space-y-6">
      <div className="rise">
        <p className="text-sm text-gold">Admin paneli</p>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">Günler</h1>
        <p className="mt-1 text-sm text-white/60">Bir güne dokun, o gün müsait olanların tam listesini gör.</p>
      </div>
      <DayExplorer
        days={days}
        namesByDay={Object.fromEntries(byDay)}
        total={total}
        matchDays={matches.map((m) => m.match_date)}
        initialDay={ranked[0]?.[0] ?? days[0]}
      />
    </div>
  );
}
