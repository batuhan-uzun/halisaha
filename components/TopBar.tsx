import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { isAdminRole, type Profile } from "@/lib/types";

const ROLE_LABEL = { owner: "Kurucu", admin: "Admin", member: "Oyuncu" } as const;

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#4fd68a" />
        <g fill="none" stroke="#04150c" strokeWidth="1.8">
          <rect x="5" y="8" width="22" height="16" rx="1" />
          <line x1="16" y1="8" x2="16" y2="24" />
          <circle cx="16" cy="16" r="3.6" />
        </g>
      </svg>
      <span className="font-display hidden whitespace-nowrap text-[17px] uppercase tracking-tight min-[480px]:inline">Halı Saha</span>
    </Link>
  );
}

export function TopBar({ profile }: { profile?: Profile }) {
  return (
    <header className="glass-bar sticky top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        {profile && (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isAdminRole(profile.role) && (
              <Link
                href="/yonetim"
                className="hidden rounded-full bg-gold/15 px-3.5 py-1.5 text-sm font-semibold text-gold ring-1 ring-gold/30 hover:bg-gold/25 sm:inline-flex"
              >
                Admin paneli
              </Link>
            )}
            <div className="glass-soft flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                {profile.first_name.charAt(0)}
                {profile.last_name.charAt(0)}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-sm font-semibold [overflow-wrap:anywhere]">
                  {profile.first_name} {profile.last_name}
                </span>
                <span className="block text-[11px] text-white/50">{ROLE_LABEL[profile.role]}</span>
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Çıkış yap"
                title="Çıkış yap"
                className="glass-soft grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-chalk"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M12 14l4-4-4-4M16 10H8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
      {profile && isAdminRole(profile.role) && (
        <div className="border-t border-white/5 px-4 py-2 sm:hidden">
          <Link href="/yonetim" className="block rounded-full bg-gold/15 py-1.5 text-center text-sm font-semibold text-gold ring-1 ring-gold/30">
            Admin paneli
          </Link>
        </div>
      )}
    </header>
  );
}
