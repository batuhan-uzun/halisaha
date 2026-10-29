import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { Footer, SectionTitle } from "@/components/Section";
import { SubmitButton } from "@/components/SubmitButton";
import { fmt, hhmm, windowDays } from "@/lib/dates";
import { requireProfile } from "@/lib/session";
import { isAdminRole, type Match } from "@/lib/types";
import { deleteMatch } from "./actions";
import { MatchForm } from "./MatchForm";

export const metadata: Metadata = { title: "Yönetim · Halı Saha" };
export const dynamic = "force-dynamic";

type AvailabilityRow = { day: string; profiles: { first_name: string; last_name: string } | null };

export default async function AdminPage() {
  const { supabase, profile } = await requireProfile();
  if (!isAdminRole(profile.role)) redirect("/");

  const days = windowDays();
  const first = days[0];
  const last = days[days.length - 1];

  const [availRes, totalRes, matchesRes] = await Promise.all([
    supabase
      .from("availability")
      .select("day, profiles(first_name, last_name)")
      .gte("day", first)
      .lte("day", last)
      .returns<AvailabilityRow[]>(),
    supabase.rpc("member_count"),
    supabase
      .from("matches")
      .select("*")
      .gte("match_date", first)
      .order("match_date")
      .order("start_time")
      .returns<Match[]>(),
  ]);

  const total = typeof totalRes.data === "number" ? totalRes.data : 0;
  const byDay = new Map<string, string[]>(days.map((d) => [d, []]));
  for (const row of availRes.data ?? []) {
    if (!row.profiles) continue;
    byDay.get(row.day)?.push(`${row.profiles.first_name} ${row.profiles.last_name}`);
  }
  for (const names of byDay.values()) names.sort((a, b) => a.localeCompare(b, "tr"));

  const matches = matchesRes.data ?? [];
  const matchDays = new Set(matches.map((m) => m.match_date));
  const ranked = [...byDay.entries()]
    .filter(([, names]) => names.length > 0)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const top = ranked.slice(0, 8);
  const rest = ranked.slice(8);
  const best = ranked[0]?.[1].length ?? 0;

  const dayOptions = days.map((d) => ({
    value: d,
    label: `${fmt.short(d)} · ${byDay.get(d)?.length ?? 0} kişi${matchDays.has(d) ? " · maç var" : ""}`,
  }));

  return (
    <>
      <Masthead profile={profile} section="Yönetim masası" />
      <main className="mx-auto w-full max-w-5xl space-y-14 px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <section aria-labelledby="en-uygun">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle id="en-uygun" kicker={`Kadro: ${total} kişi`}>
              En uygun günler
            </SectionTitle>
            <Link href="/yonetim/uyeler" className="mb-5 font-mono text-xs uppercase tracking-[0.14em] underline underline-offset-4 hover:text-flag">
              Üyeler ve roller
            </Link>
          </div>

          {ranked.length === 0 ? (
            <p className="border-2 border-dashed border-ink/40 px-5 py-6 text-ink-soft">
              Henüz kimse müsait gün işaretlemedi.
            </p>
          ) : (
            <ol className="border-t-2 border-ink">
              {top.map(([day, names], i) => (
                <DayRow key={day} rank={i + 1} day={day} names={names} total={total} isBest={names.length === best} hasMatch={matchDays.has(day)} />
              ))}
            </ol>
          )}
          {rest.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink">
                Diğer {rest.length} gün
              </summary>
              <ol className="mt-2 border-t border-ink">
                {rest.map(([day, names], i) => (
                  <DayRow key={day} rank={i + 9} day={day} names={names} total={total} hasMatch={matchDays.has(day)} />
                ))}
              </ol>
            </details>
          )}
        </section>

        <section aria-labelledby="mac-belirle">
          <SectionTitle id="mac-belirle" kicker="Sahayı tuttun mu?">
            Maç belirle
          </SectionTitle>
          <MatchForm days={dayOptions} defaultDay={ranked[0]?.[0] ?? days[0]} />
        </section>

        <section aria-labelledby="planli">
          <SectionTitle id="planli" kicker="Yayında">
            Planlı maçlar
          </SectionTitle>
          {matches.length === 0 ? (
            <p className="text-ink-soft">Planlı maç yok.</p>
          ) : (
            <ul className="border-t-2 border-ink">
              {matches.map((m) => (
                <li key={m.id} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-rule py-3">
                  <div className="leading-none">
                    <span className="font-display text-4xl">{fmt.day(m.match_date)}</span>
                    <span className="ml-1 font-mono text-[11px] uppercase text-ink-soft">{fmt.monthShort(m.match_date)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl uppercase leading-tight">{m.pitch_name}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
                      {fmt.weekdayLong(m.match_date)} · {hhmm(m.start_time)}
                      {m.end_time ? `–${hhmm(m.end_time)}` : ""} · {byDay.get(m.match_date)?.length ?? 0} kişi müsait
                    </p>
                  </div>
                  <form action={deleteMatch}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton variant="danger" pendingLabel="…" className="px-3 py-1.5 text-sm">
                      İptal
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function DayRow({
  rank,
  day,
  names,
  total,
  isBest,
  hasMatch,
}: {
  rank: number;
  day: string;
  names: string[];
  total: number;
  isBest?: boolean;
  hasMatch?: boolean;
}) {
  const pct = total ? Math.round((names.length / total) * 100) : 0;
  return (
    <li className="grid grid-cols-[2rem_5.5rem_1fr] gap-x-3 gap-y-2 border-b border-rule py-4 sm:grid-cols-[2.5rem_7rem_1fr_auto]">
      <span className="font-mono text-xs text-ink-soft tabular-nums">{String(rank).padStart(2, "0")}</span>
      <div className="leading-none">
        <span className="font-display text-3xl">{fmt.day(day)}</span>
        <span className="ml-1 font-mono text-[11px] uppercase text-ink-soft">{fmt.monthShort(day)}</span>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{fmt.weekdayLong(day)}</p>
      </div>
      <div className="col-span-3 col-start-1 sm:col-span-1 sm:col-start-auto">
        <div className="flex items-center gap-3">
          <span className="relative h-2 flex-1 bg-rule">
            <span className={`absolute inset-y-0 left-0 ${isBest ? "bg-flag" : "bg-pitch"}`} style={{ width: `${pct}%` }} />
          </span>
          <span className="font-mono text-sm tabular-nums">
            {names.length}/{total}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">{names.join(", ")}</p>
      </div>
      <div className="col-start-3 row-start-1 flex items-start justify-end gap-2 sm:col-start-auto sm:row-start-auto">
        {isBest && <span className="bg-flag px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-chalk">En kalabalık</span>}
        {hasMatch && <span className="border border-pitch px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-pitch">Maç var</span>}
      </div>
    </li>
  );
}
