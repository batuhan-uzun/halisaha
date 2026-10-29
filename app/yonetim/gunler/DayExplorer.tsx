"use client";

import Link from "next/link";
import { useState } from "react";
import { fmt, weekdayIndex } from "@/lib/dates";

type Props = {
  days: string[];
  namesByDay: Record<string, string[]>;
  total: number;
  matchDays: string[];
  initialDay: string;
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function DayExplorer({ days, namesByDay, total, matchDays, initialDay }: Props) {
  const [selected, setSelected] = useState(initialDay);
  const matchSet = new Set(matchDays);
  const best = Math.max(0, ...days.map((d) => namesByDay[d]?.length ?? 0));
  const names = namesByDay[selected] ?? [];
  const leading = weekdayIndex(days[0]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <div className="glass rounded-[24px] p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-center text-[11px] font-medium text-white/45 sm:text-xs">
              {d}
            </div>
          ))}
          {Array.from({ length: leading }, (_, i) => (
            <div key={`b-${i}`} aria-hidden="true" />
          ))}
          {days.map((day) => {
            const count = namesByDay[day]?.length ?? 0;
            const heat = best ? count / best : 0;
            const isSel = day === selected;
            const isBest = count > 0 && count === best;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSel}
                aria-label={`${fmt.full(day)}: ${count} kişi müsait`}
                style={{ backgroundColor: count ? `rgb(79 214 138 / ${0.12 + heat * 0.6})` : undefined }}
                className={`relative flex aspect-square flex-col justify-between rounded-xl p-1.5 text-left transition sm:rounded-2xl sm:p-2.5 ${
                  count ? "" : "bg-white/[0.04]"
                } ${isSel ? "ring-2 ring-gold" : "ring-1 ring-white/10 hover:ring-white/30"}`}
              >
                <span className="flex items-start justify-between text-[9px] font-semibold uppercase text-white/55 sm:text-[11px]">
                  {day === days[0] || day.endsWith("-01") ? fmt.monthShort(day) : " "}
                  {matchSet.has(day) && <span className="h-2 w-2 rounded-full bg-gold" title="Maç var" />}
                </span>
                <span className="font-display text-lg leading-none sm:text-2xl">{fmt.day(day)}</span>
                <span className={`text-[10px] font-bold tabular-nums sm:text-sm ${isBest ? "text-gold" : "text-white/80"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-white/50">Renk ne kadar koyuysa o gün o kadar çok kişi müsait. Sarı nokta: maç var.</p>
      </div>

      <div className="glass rounded-[24px] p-5 sm:p-6 xl:sticky xl:top-24 xl:self-start">
        <p className="text-sm text-white/55">{fmt.weekdayLong(selected)}</p>
        <h2 className="font-display text-2xl uppercase">
          {fmt.day(selected)} {fmt.monthLong(selected)}
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-pitch" style={{ width: `${(names.length / Math.max(1, total)) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {names.length}/{total} kişi
          </span>
        </div>

        {names.length === 0 ? (
          <p className="mt-5 text-sm text-white/55">Bu gün kimse müsait değil.</p>
        ) : (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {names.map((n) => (
              <li key={n} className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pitch/20 text-[11px] font-bold text-pitch">
                  {n
                    .split(" ")
                    .map((p) => p.charAt(0))
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="text-sm font-medium">{n}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/yonetim/maclar?gun=${selected}`}
          className="mt-6 inline-flex w-full justify-center rounded-full bg-gold px-5 py-2.5 text-[15px] font-semibold text-night hover:bg-[#ffd47f]"
        >
          {matchSet.has(selected) ? "Bu güne bir maç daha koy" : "Bu güne maç koy"}
        </Link>
      </div>
    </div>
  );
}
