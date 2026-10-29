import { daysUntil, fmt, hhmm } from "@/lib/dates";
import type { Match } from "@/lib/types";
import { PitchLines } from "./PitchLines";

export function mapsHref(match: Pick<Match, "maps_url" | "pitch_name" | "address">) {
  if (match.maps_url) return match.maps_url;
  const q = [match.pitch_name, match.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function countdown(iso: string) {
  const d = daysUntil(iso);
  if (d <= 0) return "Bugün";
  if (d === 1) return "Yarın";
  return `${d} gün kaldı`;
}

export function timeRange(match: Pick<Match, "start_time" | "end_time">) {
  return match.end_time ? `${hhmm(match.start_time)} – ${hhmm(match.end_time)}` : hhmm(match.start_time);
}

export function MatchTicket({ match, attending, total }: { match: Match; attending?: number; total?: number }) {
  return (
    <article className="glass rise relative overflow-hidden rounded-[28px]">
      <PitchLines className="absolute -right-24 -top-10 h-[130%] w-[75%] text-white/[0.06]" />
      <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_1fr] md:gap-10">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-pitch/15 px-3 py-1 text-xs font-semibold text-pitch ring-1 ring-pitch/30">
            <span className="h-1.5 w-1.5 rounded-full bg-pitch shadow-[0_0_8px_2px_rgb(79_214_138/0.7)]" />
            {countdown(match.match_date)}
          </span>
          <div className="flex items-end gap-3 md:block">
            <p className="font-display text-[5.5rem] leading-[0.8] sm:text-[7rem]">{fmt.day(match.match_date)}</p>
            <div className="pb-1 md:mt-3 md:pb-0">
              <p className="font-display text-xl uppercase leading-tight sm:text-2xl">{fmt.monthLong(match.match_date)}</p>
              <p className="text-white/60">{fmt.weekdayLong(match.match_date)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 md:border-l md:border-white/10 md:pl-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Info label="Saat">
              <span className="font-display font-wide text-2xl tabular-nums sm:text-3xl">{timeRange(match)}</span>
            </Info>
            <Info label="Saha">
              <span className="font-display text-xl uppercase leading-tight sm:text-2xl">{match.pitch_name}</span>
              {match.address && <span className="mt-1 block text-sm text-white/60">{match.address}</span>}
            </Info>
          </div>
          {match.notes && (
            <p className="glass-soft rounded-2xl px-4 py-3 text-sm text-white/80">{match.notes}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={mapsHref(match)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[15px] font-semibold text-night shadow-[0_10px_30px_-10px_rgb(255_200_94/0.7)] hover:bg-[#ffd47f]"
            >
              Yol tarifi
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>
            {typeof attending === "number" && (
              <span className="text-sm text-white/60">
                O gün <span className="font-semibold text-chalk">{attending}</span>
                {typeof total === "number" ? `/${total}` : ""} kişi müsait
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/45">{label}</p>
      {children}
    </div>
  );
}

export function MatchRow({ match, trailing }: { match: Match; trailing?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <div className="glass-soft grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-center leading-none">
        <span className="font-display text-xl">{fmt.day(match.match_date)}</span>
        <span className="text-[11px] text-white/55">{fmt.monthShort(match.match_date)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{match.pitch_name}</p>
        <p className="text-sm text-white/55">
          {fmt.weekdayLong(match.match_date)} · {timeRange(match)}
        </p>
      </div>
      {trailing ?? (
        <a href={mapsHref(match)} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gold hover:underline">
          Harita
        </a>
      )}
    </li>
  );
}
