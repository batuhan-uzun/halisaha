"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type Mode = "add" | "remove";
type Drag = { anchor: number; current: number; mode: Mode };

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const LONG_PRESS_MS = 260;
const MOVE_TOLERANCE = 10;

export function AvailabilityBoard({ userId, days, initialMine, initialCounts, total, matchDays }: Props) {
  const [mine, setMine] = useState(() => new Set(initialMine));
  const [counts, setCounts] = useState(initialCounts);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const press = useRef<{ x: number; y: number; index: number; touch: boolean } | null>(null);
  const timer = useRef<number | null>(null);
  const mineRef = useRef(mine);
  mineRef.current = mine;

  const matchSet = new Set(matchDays);
  const leading = weekdayIndex(days[0]);
  const max = Math.max(1, total);

  const setDragBoth = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };

  const commit = useCallback(
    async (targets: string[], mode: Mode) => {
      const current = mineRef.current;
      const changed = targets.filter((d) => (mode === "add" ? !current.has(d) : current.has(d)));
      if (changed.length === 0) return;

      const applyLocal = (on: boolean) => {
        setMine((prev) => {
          const next = new Set(prev);
          changed.forEach((d) => (on ? next.add(d) : next.delete(d)));
          return next;
        });
        setCounts((prev) => {
          const next = { ...prev };
          changed.forEach((d) => (next[d] = Math.max(0, (next[d] ?? 0) + (on ? 1 : -1))));
          return next;
        });
      };

      setError(null);
      setSaving(true);
      applyLocal(mode === "add");

      const supabase = createClient();
      const { error } =
        mode === "add"
          ? await supabase
              .from("availability")
              .upsert(changed.map((day) => ({ user_id: userId, day })), { onConflict: "user_id,day", ignoreDuplicates: true })
          : await supabase.from("availability").delete().eq("user_id", userId).in("day", changed);

      if (error) {
        applyLocal(mode !== "add");
        setError("Kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
      }
      setSaving(false);
    },
    [userId],
  );

  const begin = useCallback((index: number) => {
    const mode: Mode = mineRef.current.has(days[index]) ? "remove" : "add";
    setDragBoth({ anchor: index, current: index, mode });
    navigator.vibrate?.(12);
  }, [days]);

  const clearPress = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    press.current = null;
  };

  useEffect(() => {
    const indexAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-day-index]");
      return el ? Number(el.dataset.dayIndex) : null;
    };

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d) {
        const i = indexAt(e.clientX, e.clientY);
        if (i !== null && i !== d.current) setDragBoth({ ...d, current: i });
        return;
      }
      const p = press.current;
      if (p?.touch && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) {
        clearPress(); // parmak kaydi: sayfa kaydiriliyor
      }
    };

    const onUp = () => {
      const d = dragRef.current;
      const p = press.current;
      clearPress();
      if (d) {
        const [a, b] = d.anchor <= d.current ? [d.anchor, d.current] : [d.current, d.anchor];
        setDragBoth(null);
        void commit(days.slice(a, b + 1), d.mode);
      } else if (p) {
        // kisa dokunus: tek gun
        const day = days[p.index];
        void commit([day], mineRef.current.has(day) ? "remove" : "add");
      }
    };

    const onCancel = () => {
      clearPress();
      setDragBoth(null);
    };

    // Basili tutup surukleme baslayinca sayfa kaymasin
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current) e.preventDefault();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [commit, days]);

  function onPointerDown(e: React.PointerEvent, index: number) {
    if (saving) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const touch = e.pointerType !== "mouse";
    press.current = { x: e.clientX, y: e.clientY, index, touch };
    if (touch) {
      timer.current = window.setTimeout(() => {
        timer.current = null;
        if (press.current) begin(index);
      }, LONG_PRESS_MS);
    } else {
      e.preventDefault();
      begin(index);
    }
  }

  const inRange = (i: number) => {
    if (!drag) return false;
    const [a, b] = drag.anchor <= drag.current ? [drag.anchor, drag.current] : [drag.current, drag.anchor];
    return i >= a && i <= b;
  };

  const weekendDays = days.filter((d) => weekdayIndex(d) >= 4);
  const rangeSize = drag ? Math.abs(drag.current - drag.anchor) + 1 : 0;

  return (
    <div className="glass rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm">
            <span className="font-semibold">{mine.size} gün</span>
            <span className="text-white/55"> seçtin · kadroda {total} kişi</span>
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {drag
              ? `${rangeSize} gün ${drag.mode === "add" ? "eklenecek" : "çıkarılacak"}, bırakınca kaydedilir`
              : "Dokun: tek gün. Basılı tut ve sürükle: aralık seç."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickButton disabled={saving} onClick={() => commit(weekendDays, "add")}>
            Cuma–Pazar
          </QuickButton>
          <QuickButton disabled={saving} onClick={() => commit(days, "add")}>
            Hepsi
          </QuickButton>
          <QuickButton disabled={saving || mine.size === 0} onClick={() => commit([...mine], "remove")}>
            Temizle
          </QuickButton>
        </div>
      </div>

      <div className="no-callout mt-5 grid grid-cols-7 gap-1.5 sm:gap-2" role="group" aria-label="Önümüzdeki 30 gün">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`pb-1 text-center text-[11px] font-medium sm:text-xs ${i >= 5 ? "text-gold/80" : "text-white/45"}`}>
            {d}
          </div>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((day, i) => {
          const selected = mine.has(day);
          const previewing = inRange(i);
          const on = previewing ? drag!.mode === "add" : selected;
          const count = counts[day] ?? 0;
          const showMonth = i === 0 || day.endsWith("-01");
          const isMatch = matchSet.has(day);
          const removing = previewing && drag!.mode === "remove" && selected;
          const adding = previewing && drag!.mode === "add" && !selected;

          return (
            <button
              key={day}
              type="button"
              data-day-index={i}
              onPointerDown={(e) => onPointerDown(e, i)}
              onClick={(e) => {
                if (e.detail === 0) void commit([day], selected ? "remove" : "add"); // klavye
              }}
              onContextMenu={(e) => e.preventDefault()}
              aria-pressed={selected}
              aria-label={`${fmt.full(day)}: ${selected ? "müsaitsin" : "müsait değilsin"}, ${count} kişi müsait${isMatch ? ", maç var" : ""}`}
              className={`relative flex aspect-square touch-manipulation flex-col justify-between rounded-xl p-1.5 text-left transition-[background-color,box-shadow,transform] duration-150 sm:rounded-2xl sm:p-2.5 ${
                on
                  ? "bg-pitch text-night shadow-[0_8px_24px_-8px_rgb(79_214_138/0.8)]"
                  : "bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/10"
              } ${adding ? "scale-[0.96] ring-2 ring-white/70" : ""} ${removing ? "scale-[0.96] ring-2 ring-flare" : ""} ${
                saving ? "cursor-wait" : "cursor-pointer"
              }`}
            >
              <span className="flex items-start justify-between">
                <span className={`text-[9px] font-semibold uppercase leading-none sm:text-[11px] ${on ? "text-night/60" : "text-white/45"}`}>
                  {showMonth ? fmt.monthShort(day) : " "}
                </span>
                {isMatch && (
                  <span
                    title="Maç var"
                    className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${on ? "bg-night" : "bg-gold shadow-[0_0_8px_2px_rgb(255_200_94/0.6)]"}`}
                  />
                )}
              </span>
              <span className="font-display text-lg leading-none sm:text-3xl">{fmt.day(day)}</span>
              <span className="flex items-center gap-1">
                <span className={`relative h-1 flex-1 overflow-hidden rounded-full ${on ? "bg-night/15" : "bg-white/10"}`}>
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full ${on ? "bg-night/70" : "bg-gold"}`}
                    style={{ width: `${Math.min(100, (count / max) * 100)}%` }}
                  />
                </span>
                <span className={`text-[9px] font-semibold leading-none tabular-nums sm:text-[11px] ${on ? "text-night/70" : "text-white/60"}`}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-pitch" /> Müsaitim
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-full bg-gold" /> Müsait kişi sayısı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" /> Maç var
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-flare/30 bg-flare/10 px-3.5 py-2.5 text-sm text-flare">
          {error}
        </p>
      )}
    </div>
  );
}

function QuickButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="glass-soft rounded-full px-3.5 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  );
}
