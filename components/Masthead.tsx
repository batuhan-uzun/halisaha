import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { fmt, todayIso } from "@/lib/dates";
import type { Profile } from "@/lib/types";
import { isAdminRole } from "@/lib/types";

type Props = {
  profile?: Profile;
  section?: string;
};

export function Masthead({ profile, section }: Props) {
  const today = todayIso();
  const year = today.slice(0, 4);

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between gap-3 border-t-[6px] border-ink pt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
        <span className="truncate">
          {fmt.full(today)} {year}
        </span>
        {profile ? (
          <div className="flex shrink-0 items-center gap-3">
            {isAdminRole(profile.role) && (
              <Link href="/yonetim" className="text-ink underline-offset-4 hover:underline">
                Yönetim
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="uppercase tracking-[0.14em] hover:text-flag">
                Çıkış
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="mt-1 flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
        <Link href="/" className="block leading-none">
          <span className="font-display text-[clamp(3.4rem,15vw,8.5rem)] leading-[0.82] tracking-[-0.01em] uppercase">
            Halı Saha
          </span>
        </Link>
        <div className="hidden pb-2 text-right sm:block">
          <p className="font-display text-xl uppercase leading-none">Maç günü</p>
          <p className="font-display text-xl uppercase leading-none text-flag">burada belli olur</p>
        </div>
      </div>
      <div className="mt-[3px] flex items-center justify-between border-b border-ink pb-1.5 pt-1 font-mono text-[11px] uppercase tracking-[0.14em] sm:text-xs">
        <span>{section ?? "Fikstür & müsaitlik"}</span>
        {profile ? (
          <span className="truncate pl-3 text-ink-soft">
            {profile.first_name} {profile.last_name.charAt(0)}.
            {profile.role === "owner" ? " · kurucu" : profile.role === "admin" ? " · admin" : ""}
          </span>
        ) : (
          <span className="text-ink-soft">30 günlük pencere</span>
        )}
      </div>
    </header>
  );
}
