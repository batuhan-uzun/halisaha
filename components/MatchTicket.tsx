import { daysUntil, fmt, hhmm } from "@/lib/dates";
import type { Match } from "@/lib/types";
import { PitchLines } from "./PitchLines";

export function mapsHref(match: Pick<Match, "maps_url" | "pitch_name" | "address">) {
  if (match.maps_url) return match.maps_url;
  const q = [match.pitch_name, match.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function countdown(iso: string) {
  const d = daysUntil(iso);
  if (d <= 0) return "Bugün";
  if (d === 1) return "Yarın";
  return `${d} gün kaldı`;
}

export function MatchTicket({ match, attending }: { match: Match; attending?: number }) {
  const time = match.end_time
    ? `${hhmm(match.start_time)}–${hhmm(match.end_time)}`
    : hhmm(match.start_time);

  return (
    <article className="grid border-2 border-ink bg-chalk shadow-[6px_6px_0_0_var(--color-ink)] md:grid-cols-[minmax(0,0.9fr)_18px_minmax(0,1.25fr)]">
      <div className="turf relative overflow-hidden px-5 py-6 text-chalk sm:px-7">
        <PitchLines className="absolute inset-0 h-full w-full text-chalk/25" />
        <div className="relative flex h-full flex-col justify-between gap-6">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em]">
            <span>Sıradaki maç</span>
            <span className="bg-flag px-2 py-1 text-chalk">{countdown(match.match_date)}</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-[clamp(6rem,24vw,9.5rem)] leading-[0.78]">
              {fmt.day(match.match_date)}
            </span>
            <span className="pb-1 font-display text-3xl uppercase leading-[0.95] sm:text-4xl">
              {fmt.monthLong(match.match_date)}
              <br />
              <span className="text-chalk/70">{fmt.weekdayLong(match.match_date)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="perforated h-[18px] md:hidden" aria-hidden="true" />
      <div className="perforated-y hidden md:block" aria-hidden="true" />

      <div className="flex flex-col justify-between gap-6 px-5 py-6 sm:px-7">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Saat</p>
          <p className="font-mono text-4xl font-medium tracking-tight sm:text-5xl">{time}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Saha</p>
          <p className="font-display text-3xl uppercase leading-[0.95] sm:text-4xl">{match.pitch_name}</p>
          {match.address && <p className="mt-1.5 text-ink-soft">{match.address}</p>}
          {match.notes && (
            <p className="mt-3 border-l-4 border-flag pl-3 text-sm">{match.notes}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule pt-4">
          <a
            href={mapsHref(match)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-display text-lg uppercase tracking-wide text-chalk hover:bg-pitch-deep"
          >
            Haritada aç
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
          {typeof attending === "number" && (
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
              O gün {attending} kişi müsait
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function MatchRow({ match }: { match: Match }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-rule py-3">
      <div className="leading-none">
        <span className="font-display text-4xl">{fmt.day(match.match_date)}</span>
        <span className="ml-1 font-mono text-[11px] uppercase text-ink-soft">{fmt.monthShort(match.match_date)}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-xl uppercase leading-tight">{match.pitch_name}</p>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
          {fmt.weekdayLong(match.match_date)} · {hhmm(match.start_time)}
          {match.end_time ? `–${hhmm(match.end_time)}` : ""}
        </p>
      </div>
      <a
        href={mapsHref(match)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs uppercase tracking-[0.14em] underline underline-offset-4 hover:text-flag"
      >
        Harita
      </a>
    </li>
  );
}
