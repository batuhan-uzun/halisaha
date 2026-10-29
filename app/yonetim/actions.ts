"use server";

import { revalidatePath } from "next/cache";
import { todayIso } from "@/lib/dates";
import { requireProfile } from "@/lib/session";
import { isAdminRole } from "@/lib/types";

export type MatchFormState = { error?: string; ok?: boolean; key?: number };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createMatch(_prev: MatchFormState, formData: FormData): Promise<MatchFormState> {
  const { supabase, profile } = await requireProfile();
  if (!isAdminRole(profile.role)) return { error: "Bu işlem için admin olman gerekiyor." };

  const matchDate = field(formData, "match_date");
  const start = field(formData, "start_time");
  const end = field(formData, "end_time");
  const pitch = field(formData, "pitch_name");
  const address = field(formData, "address");
  const mapsUrl = field(formData, "maps_url");
  const notes = field(formData, "notes");

  if (!DATE_RE.test(matchDate) || matchDate < todayIso()) return { error: "Geçerli bir gün seç." };
  if (!TIME_RE.test(start)) return { error: "Başlama saatini SS:DD biçiminde yaz." };
  if (end && !TIME_RE.test(end)) return { error: "Bitiş saatini SS:DD biçiminde yaz." };
  if (end && end <= start) return { error: "Bitiş saati başlamadan sonra olmalı." };
  if (!pitch) return { error: "Halı sahanın adını yaz." };
  if (pitch.length > 100 || address.length > 200 || notes.length > 500)
    return { error: "Alanlardan biri çok uzun." };
  if (mapsUrl && !/^https?:\/\//i.test(mapsUrl))
    return { error: "Harita linki http:// ya da https:// ile başlamalı." };

  const { error } = await supabase.from("matches").insert({
    match_date: matchDate,
    start_time: start,
    end_time: end || null,
    pitch_name: pitch,
    address: address || null,
    maps_url: mapsUrl || null,
    notes: notes || null,
    created_by: profile.id,
  });
  if (error) return { error: "Maç kaydedilemedi, tekrar dene." };

  revalidatePath("/");
  revalidatePath("/yonetim");
  return { ok: true, key: Date.now() };
}

export async function deleteMatch(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (!isAdminRole(profile.role)) return;
  const id = field(formData, "id");
  if (!id) return;
  await supabase.from("matches").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/yonetim");
}

export async function setRole(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") return;
  const target = field(formData, "target");
  const role = field(formData, "role");
  if (!target || (role !== "admin" && role !== "member")) return;
  await supabase.rpc("set_user_role", { target, new_role: role });
  revalidatePath("/yonetim/uyeler");
}
