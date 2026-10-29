"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/yonetim", label: "Genel bakış", icon: "M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z" },
  { href: "/yonetim/gunler", label: "Günler", icon: "M4 6h12v11H4zM4 9h12M8 3v4M12 3v4" },
  { href: "/yonetim/maclar", label: "Maçlar", icon: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 3 3 2.2-1.1 3.6H8.1L7 8.2z" },
  { href: "/yonetim/uyeler", label: "Üyeler", icon: "M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 16a5 5 0 0 1 10 0M13.5 9a2 2 0 1 0 0-4M14.5 16h3a4 4 0 0 0-3.5-4" },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="glass flex gap-1 overflow-x-auto rounded-2xl p-1.5 lg:flex-col lg:rounded-3xl lg:p-2">
      {ITEMS.map((item) => {
        const active = item.href === "/yonetim" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition lg:rounded-2xl lg:py-2.5 ${
              active ? "bg-white/12 text-chalk ring-1 ring-white/15" : "text-white/60 hover:bg-white/6 hover:text-chalk"
            }`}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-white/45 hover:text-chalk lg:mt-2 lg:border-t lg:border-white/8 lg:pt-3"
      >
        ← Siteye dön
      </Link>
      {!isOwner && <span className="sr-only">Admin atamayı sadece kurucu yapabilir</span>}
    </nav>
  );
}
