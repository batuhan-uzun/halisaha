"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { fmt, weekdayIndex } from "@/lib/dates";

type Props = {
  userId: string;
  days: string[];
  initialMine: string[];
  initialCounts: Record<string, number>;
  total: number;
  matchDays: string[];
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function AvailabilityBoard({ userId, days, initialMine, initialCounts, total, matchDays }: Props) {
  const [mine, setMine] = useState(() => new Set(initialMine));
  const [counts, setCounts] = useState(initialCounts);
  const [pendingDay, setPendingDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const matchSet = new Set(matchDays);
  const leading = weekdayIndex(days[0]);
  const max = Math.max(1, total);

  function apply(day: string, on: boolean) {
    setMine((prev) => {
      const next = new Set(prev);
      if (on) next.add(day);
      else next.delete(day);
      return next;
    });
    setCounts((prev) => ({ ...prev, [day]: Math.max(0, (prev[day] ?? 0) + (on ? 1 : -1)) }));
  }

  function toggle(day: string) {
    if (pendingDay) return;
    const turningOn = !mine.has(day);
    setError(null);
    setPendingDay(day);
    apply(day, turningOn);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = turningOn
        ? await supabase.from("availability").insert({ user_id: userId, day })
        : await supabase.from("availability").delete().eq("user_id", userId).eq("day", day);
      if (error) {
        apply(day, !turningOn);
        setError("Kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
      }
      setPendingDay(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
          <span className="text-ink">{mine.size}</span> gün seçtin · kadroda {total} kişi
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 bg-pitch" /> Müsaitim
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-4 bg-flag" /> Müsait kişi
          </li>
          <li className="flex items-center gap-1.5">
            <Flag className="h-3 w-3 text-flag" /> Maç var
          </li>
        </ul>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5" role="group" aria-label="Önümüzdeki 30 gün">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft sm:text-[11px]">
            {d}
          </div>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((day, i) => {
          const on = mine.has(day);
          const count = counts[day] ?? 0;
          const showMonth = i === 0 || day.endsWith("-01");
          const isMatch = matchSet.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              aria-pressed={on}
              aria-label={`${fmt.full(day)}: ${on ? "müsaitsin" : "müsait değilsin"}, ${count} kişi müsait${isMatch ? ", maç var" : ""}`}
              className={`group relative flex aspect-[5/6] flex-col justify-between overflow-hidden border p-1 text-left transition-colors sm:aspect-square sm:p-2 ${
                on
                  ? "border-pitch-deep bg-pitch text-chalk"
                  : "border-rule bg-chalk/60 hover:border-ink hover:bg-chalk"
              } ${pendingDay === day ? "opacity-70" : ""}`}
            >
              <span className="flex items-start justify-between">
                <span className={`font-mono text-[9px] uppercase leading-none sm:text-[10px] ${on ? "text-chalk/70" : "text-ink-soft"}`}>
                  {showMonth ? fmt.monthShort(day) : " "}
                </span>
                {isMatch && <Flag className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${on ? "text-chalk" : "text-flag"}`} />}
              </span>
              <span className="font-display text-[1.6rem] leading-none sm:text-4xl">{fmt.day(day)}</span>
              <span className="flex items-center gap-1">
                <span className={`relative h-1 flex-1 ${on ? "bg-chalk/25" : "bg-rule"}`}>
                  <span
                    className={`absolute inset-y-0 left-0 ${on ? "bg-chalk" : "bg-flag"}`}
                    style={{ width: `${Math.min(100, (count / max) * 100)}%` }}
                  />
                </span>
                <span className="font-mono text-[9px] leading-none tabular-nums sm:text-[11px]">{count}</span>
              </span>
              {on && (
                <span className="stamp-in pointer-events-none absolute right-1.5 top-[42%] hidden border-2 border-chalk px-1.5 py-px font-display text-sm uppercase leading-tight tracking-wide text-chalk sm:block">
                  Varım
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 border-l-4 border-flag px-3 py-2 text-sm text-flag">
          {error}
        </p>
      )}
    </div>
  );
}

function Flag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={className}>
      <path d="M2 1v10" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.7 1.3h7.3L8 4.2l2 2.9H2.7z" fill="currentColor" />
    </svg>
  );
}
