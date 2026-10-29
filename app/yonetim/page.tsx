import type { Metadata } from "next";
import Link from "next/link";
import { countdown, MatchRow } from "@/components/MatchTicket";
import { loadAdminData } from "@/lib/admin";
import { fmt } from "@/lib/dates";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin paneli · Halı Saha" };
export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();
  const { ranked, members, matches, daysPerMember, total } = await loadAdminData(supabase);

  const admins = members.filter((m) => m.role !== "member").length;
  const active = members.filter((m) => (daysPerMember.get(m.id) ?? 0) > 0).length;
  const best = ranked[0];
  const next = matches[0];

  return (
    <div className="space-y-6">
      <div className="rise">
        <p className="text-sm text-gold">Admin paneli</p>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">Genel bakış</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Kadro" value={total} hint={`${admins} admin`} />
        <Stat label="Gün işaretleyen" value={`${active}/${total}`} hint="son 30 gün" />
        <Stat label="Planlı maç" value={matches.length} hint={next ? `ilki ${fmt.short(next.match_date)}` : "henüz yok"} />
        <Stat
          label="En kalabalık gün"
          value={best ? `${fmt.day(best[0])} ${fmt.monthShort(best[0])}` : "—"}
          hint={best ? `${best[1].length} kişi · ${fmt.weekdayLong(best[0])}` : "işaretleme yok"}
          accent
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="glass rounded-[24px] p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg uppercase">En uygun 5 gün</h2>
            <Link href="/yonetim/gunler" className="text-sm font-semibold text-gold hover:underline">
              Tüm günler
            </Link>
          </div>
          {ranked.length === 0 ? (
            <p className="py-6 text-sm text-white/55">Henüz kimse müsait gün işaretlemedi.</p>
          ) : (
            <ol className="space-y-2">
              {ranked.slice(0, 5).map(([day, names]) => (
                <li key={day} className="glass-soft rounded-2xl p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {fmt.short(day)}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums text-white/70">
                        {names.length}/{total}
                      </span>
                      <Link
                        href={`/yonetim/maclar?gun=${day}`}
                        className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/30 hover:bg-gold/25"
                      >
                        Maç koy
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-pitch" style={{ width: `${(names.length / Math.max(1, total)) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-white/65">{names.join(", ")}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="glass rounded-[24px] p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-lg uppercase">Planlı maçlar</h2>
            <Link href="/yonetim/maclar" className="text-sm font-semibold text-gold hover:underline">
              Yönet
            </Link>
          </div>
          {matches.length === 0 ? (
            <p className="py-6 text-sm text-white/55">Planlı maç yok.</p>
          ) : (
            <ul className="divide-y divide-white/8">
              {matches.slice(0, 4).map((m) => (
                <MatchRow key={m.id} match={m} trailing={<span className="text-xs text-white/50">{countdown(m.match_date)}</span>} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-[22px] p-4 sm:p-5 ${accent ? "ring-1 ring-gold/30" : ""}`}>
      <p className="text-xs font-medium text-white/55">{label}</p>
      <p className={`font-display mt-1.5 text-2xl uppercase tabular-nums sm:text-3xl ${accent ? "text-gold" : ""}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  );
}
