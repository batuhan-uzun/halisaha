"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { createMatch, type MatchFormState } from "./actions";

type DayOption = { value: string; label: string };

export function MatchForm({ days, defaultDay }: { days: DayOption[]; defaultDay?: string }) {
  const [state, action] = useActionState<MatchFormState, FormData>(createMatch, {});

  return (
    <form key={state.key} action={action} className="space-y-6 border-2 border-ink bg-chalk p-5 sm:p-7">
      <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr_1fr]">
        <label className="block">
          <Label>Gün</Label>
          <select name="match_date" defaultValue={defaultDay} required className="field-input">
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <Label>Başlama</Label>
          <input name="start_time" type="time" required defaultValue="21:00" className="field-input font-mono" />
        </label>
        <label className="block">
          <Label>Bitiş</Label>
          <input name="end_time" type="time" defaultValue="22:00" className="field-input font-mono" />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <Label>Halı saha</Label>
          <input name="pitch_name" required maxLength={100} placeholder="Örn. Yıldız Spor Tesisleri" className="field-input" />
        </label>
        <label className="block">
          <Label>Adres</Label>
          <input name="address" maxLength={200} placeholder="Mahalle, sokak, ilçe" className="field-input" />
        </label>
      </div>

      <label className="block">
        <Label hint="İsteğe bağlı">Harita linki</Label>
        <input name="maps_url" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/..." className="field-input" />
      </label>

      <label className="block">
        <Label hint="İsteğe bağlı">Not</Label>
        <input name="notes" maxLength={500} placeholder="Örn. Saha 2 numara, kaleci eldiveni getirin" className="field-input" />
      </label>

      {state.error && (
        <p role="alert" className="border-l-4 border-flag px-3 py-2 text-sm text-flag">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="border-l-4 border-pitch px-3 py-2 text-sm text-pitch">
          Maç kaydedildi, ana sayfada herkes görüyor.
        </p>
      )}

      <SubmitButton pendingLabel="Kaydediliyor…">Maçı yayınla</SubmitButton>
    </form>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
      {children}
      {hint && <span className="normal-case tracking-normal">{hint}</span>}
    </span>
  );
}
