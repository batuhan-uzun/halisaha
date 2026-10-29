import Link from "next/link";
import { AvailabilityBoard } from "@/components/AvailabilityBoard";
import { Masthead } from "@/components/Masthead";
import { MatchRow, MatchTicket } from "@/components/MatchTicket";
import { Footer, SectionTitle } from "@/components/Section";
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
  const matches = matchesRes.data ?? [];
  const [next, ...later] = matches;
  const isAdmin = isAdminRole(profile.role);

  return (
    <>
      <Masthead profile={profile} />
      <main className="mx-auto w-full max-w-5xl space-y-14 px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <section aria-labelledby="mac">
          <SectionTitle id="mac" kicker="Manşet">
            {next ? "Maç günü belli" : "Maç henüz belli değil"}
          </SectionTitle>
          {next ? (
            <MatchTicket match={next} attending={counts[next.match_date]} />
          ) : (
            <div className="border-2 border-dashed border-ink/40 px-5 py-8 sm:px-8">
              <p className="max-w-xl font-display text-3xl uppercase leading-[0.95] sm:text-4xl">
                Sahayı daha kimse tutmadı.
              </p>
              <p className="mt-3 max-w-xl text-ink-soft">
                Aşağıdan müsait olduğun günleri işaretle. Adminler en çok kişinin boş olduğu güne maçı koyunca burada görünecek.
              </p>
              {isAdmin && (
                <Link href="/yonetim" className="mt-5 inline-block bg-ink px-4 py-2.5 font-display text-lg uppercase text-chalk hover:bg-pitch-deep">
                  Maç belirle
                </Link>
              )}
            </div>
          )}

          {later.length > 0 && (
            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Sonraki maçlar</p>
              <ul className="mt-1 border-t-2 border-ink">
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
          <p className="-mt-2 mb-5 max-w-2xl text-ink-soft">
            Boş olduğun günlere dokun, tekrar dokunursan geri alırsın. Her günün altındaki çizgi o gün kaç kişinin müsait olduğunu gösterir.
          </p>
          <AvailabilityBoard
            userId={profile.id}
            days={days}
            initialMine={(mineRes.data ?? []).map((r) => r.day as string)}
            initialCounts={counts}
            total={typeof totalRes.data === "number" ? totalRes.data : 0}
            matchDays={matches.map((m) => m.match_date)}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
