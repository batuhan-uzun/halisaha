"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { createMatch, type MatchFormState } from "./actions";

type DayOption = { value: string; label: string };

export function MatchForm({ days, defaultDay }: { days: DayOption[]; defaultDay?: string }) {
  const [state, action] = useActionState<MatchFormState, FormData>(createMatch, {});

  return (
    <form key={state.key} action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr_1fr]">
        <Field label="Gün">
          <select name="match_date" defaultValue={defaultDay} required className="field">
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Başlama">
          <input name="start_time" type="time" required defaultValue="21:00" className="field tabular-nums" />
        </Field>
        <Field label="Bitiş">
          <input name="end_time" type="time" defaultValue="22:00" className="field tabular-nums" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Halı saha">
          <input name="pitch_name" required maxLength={100} placeholder="Örn. Yıldız Spor Tesisleri" className="field" />
        </Field>
        <Field label="Adres">
          <input name="address" maxLength={200} placeholder="Mahalle, sokak, ilçe" className="field" />
        </Field>
      </div>

      <Field label="Harita linki" hint="İsteğe bağlı">
        <input name="maps_url" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/..." className="field" />
      </Field>

      {state.error && (
        <p role="alert" className="rounded-xl border border-flare/30 bg-flare/10 px-3.5 py-2.5 text-sm text-flare">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-xl border border-pitch/30 bg-pitch/10 px-3.5 py-2.5 text-sm text-pitch">
          Maç yayınlandı, ana sayfada herkes görüyor.
        </p>
      )}

      <SubmitButton pendingLabel="Yayınlanıyor…">Maçı yayınla</SubmitButton>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-white/80">
        {label}
        {hint && <span className="text-xs font-normal text-white/45">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
