import type { SupabaseClient } from "@supabase/supabase-js";
import { windowDays } from "@/lib/dates";
import type { Match, Profile } from "@/lib/types";

type AvailabilityRow = { day: string; user_id: string };

/** Admin gorunumu: 30 gunluk pencere, gun gun musait olanlarin tam adlari. */
export async function loadAdminData(supabase: SupabaseClient) {
  const days = windowDays();
  const first = days[0];
  const last = days[days.length - 1];

  const [availRes, membersRes, matchesRes] = await Promise.all([
    supabase.from("availability").select("day, user_id").gte("day", first).lte("day", last).returns<AvailabilityRow[]>(),
    supabase.from("profiles").select("*").order("first_name").returns<Profile[]>(),
    supabase.from("matches").select("*").gte("match_date", first).order("match_date").order("start_time").returns<Match[]>(),
  ]);

  const members = membersRes.data ?? [];
  const nameOf = new Map(members.map((m) => [m.id, `${m.first_name} ${m.last_name}`]));
  const byDay = new Map<string, string[]>(days.map((d) => [d, []]));
  const daysPerMember = new Map<string, number>();

  for (const row of availRes.data ?? []) {
    const name = nameOf.get(row.user_id);
    if (!name) continue;
    byDay.get(row.day)?.push(name);
    daysPerMember.set(row.user_id, (daysPerMember.get(row.user_id) ?? 0) + 1);
  }
  for (const names of byDay.values()) names.sort((a, b) => a.localeCompare(b, "tr"));

  const matches = matchesRes.data ?? [];
  const ranked = [...byDay.entries()]
    .filter(([, names]) => names.length > 0)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return { days, byDay, ranked, members, matches, daysPerMember, total: members.length };
}
