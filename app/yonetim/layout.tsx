import { Footer } from "@/components/Section";
import { TopBar } from "@/components/TopBar";
import { requireAdmin } from "@/lib/session";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <>
      <TopBar profile={profile} />
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[220px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden px-3 text-xs font-medium uppercase tracking-wider text-white/40 lg:block">Admin paneli</p>
          <AdminNav isOwner={profile.role === "owner"} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
      <Footer />
    </>
  );
}
