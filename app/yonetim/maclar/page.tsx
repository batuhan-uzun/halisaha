import type { Metadata } from "next";
import { MatchRow, timeRange } from "@/components/MatchTicket";
import { SubmitButton } from "@/components/SubmitButton";
import { loadAdminData } from "@/lib/admin";
import { fmt } from "@/lib/dates";
import { requireAdmin } from "@/lib/session";
import { deleteMatch } from "../actions";
import { MatchForm } from "../MatchForm";

export const metadata: Metadata = { title: "Maçlar · Admin paneli" };
export const dynamic = "force-dynamic";

export default async function AdminMatches({ searchParams }: { searchParams: Promise<{ gun?: string }> }) {
  const { supabase } = await requireAdmin();
  const { days, byDay, ranked, matches } = await loadAdminData(supabase);
  const { gun } = await searchParams;

  const matchDays = new Set(matches.map((m) => m.match_date));
  const dayOptions = days.map((d) => ({
    value: d,
    label: `${fmt.short(d)} · ${byDay.get(d)?.length ?? 0} kişi${matchDays.has(d) ? " · maç var" : ""}`,
  }));
  const defaultDay = gun && days.includes(gun) ? gun : (ranked[0]?.[0] ?? days[0]);

  return (
    <div className="space-y-6">
      <div className="rise">
        <p className="text-sm text-gold">Admin paneli</p>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">Maçlar</h1>
      </div>

      <section aria-labelledby="yeni-mac" className="glass rounded-[24px] p-5 sm:p-7">
        <h2 id="yeni-mac" className="font-display mb-5 text-lg uppercase">
          Yeni maç
        </h2>
        <MatchForm key={defaultDay} days={dayOptions} defaultDay={defaultDay} />
      </section>

      <section aria-labelledby="planli" className="glass rounded-[24px] p-5 sm:p-6">
        <h2 id="planli" className="font-display text-lg uppercase">
          Planlı maçlar
        </h2>
        {matches.length === 0 ? (
          <p className="py-6 text-sm text-white/55">Planlı maç yok.</p>
        ) : (
          <ul className="mt-2 divide-y divide-white/8">
            {matches.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                trailing={
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-white/50 sm:inline">
                      {byDay.get(m.match_date)?.length ?? 0} kişi müsait · {timeRange(m)}
                    </span>
                    <form action={deleteMatch}>
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton variant="danger" size="sm" pendingLabel="…">
                        İptal et
                      </SubmitButton>
                    </form>
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
