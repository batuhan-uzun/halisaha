import Link from "next/link";
import { AvailabilityBoard } from "@/components/AvailabilityBoard";
import { MatchRow, MatchTicket } from "@/components/MatchTicket";
import { Footer, SectionTitle } from "@/components/Section";
import { TopBar } from "@/components/TopBar";
import { windowDays } from "@/lib/dates";
import { requireProfile } from "@/lib/session";
import { isAdminRole, type Match } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { supabase, profile } = await requireProfile();
  const days = windowDays();
  const first = days[0];
  const last = days[days.length - 1];

  const [mineRes, countsRes, totalRes, matchesRes] = await Promise.all([
    supabase.from("availability").select("day").eq("user_id", profile.id).gte("day", first).lte("day", last),
    supabase.rpc("availability_counts", { from_day: first, to_day: last }),
    supabase.rpc("member_count"),
    supabase
      .from("matches")
      .select("*")
      .gte("match_date", first)
      .order("match_date")
      .order("start_time")
      .returns<Match[]>(),
  ]);

  const counts: Record<string, number> = {};
  for (const row of (countsRes.data ?? []) as { day: string; available: number }[]) {
    counts[row.day] = row.available;
  }
  const total = typeof totalRes.data === "number" ? totalRes.data : 0;
  const matches = matchesRes.data ?? [];
  const [next, ...later] = matches;
  const isAdmin = isAdminRole(profile.role);

  return (
    <>
      <TopBar profile={profile} />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="rise">
          <p className="text-sm text-white/60">
            Selam {profile.first_name} {profile.last_name},
          </p>
          <h1 className="font-display mt-1 text-3xl uppercase leading-tight sm:text-5xl">
            {next ? "Maç günü belli" : "Maç günü henüz belli değil"}
          </h1>
        </div>

        <section aria-label="Sıradaki maç">
          {next ? (
            <MatchTicket match={next} attending={counts[next.match_date]} total={total} />
          ) : (
            <div className="glass rise rounded-[28px] p-6 sm:p-8">
              <p className="font-display text-xl uppercase sm:text-2xl">Sahayı daha kimse tutmadı</p>
              <p className="mt-2 max-w-xl text-white/65">
                Aşağıdan müsait olduğun günleri işaretle. Adminler en çok kişinin boş olduğu güne maçı koyunca burada görünecek.
              </p>
              {isAdmin && (
                <Link href="/yonetim/maclar" className="mt-5 inline-flex rounded-full bg-gold px-5 py-2.5 text-[15px] font-semibold text-night hover:bg-[#ffd47f]">
                  Maç belirle
                </Link>
              )}
            </div>
          )}

          {later.length > 0 && (
            <div className="glass mt-4 rounded-[24px] px-5 py-2 sm:px-6">
              <p className="pt-3 text-xs font-medium uppercase tracking-wider text-white/45">Sonraki maçlar</p>
              <ul className="divide-y divide-white/8">
                {later.map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </ul>
            </div>
          )}
        </section>

        <section aria-labelledby="musaitlik">
          <SectionTitle id="musaitlik" kicker="Önümüzdeki 30 gün">
            Ne zaman müsaitsin?
          </SectionTitle>
          <AvailabilityBoard
            userId={profile.id}
            days={days}
            initialMine={(mineRes.data ?? []).map((r) => r.day as string)}
            initialCounts={counts}
            total={total}
            matchDays={matches.map((m) => m.match_date)}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
