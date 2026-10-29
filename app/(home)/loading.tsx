import { Bone, CalendarSkeleton } from "@/components/Skeleton";
import { Logo } from "@/components/TopBar";

export default function HomeLoading() {
  return (
    <>
      <header className="glass-bar sticky top-0 z-30">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <Bone className="h-9 w-36 rounded-full" />
        </div>
      </header>
      <main aria-busy="true" className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <span className="sr-only">Yükleniyor…</span>
        <div className="space-y-3">
          <Bone className="h-4 w-44" />
          <Bone className="h-10 w-3/4 max-w-xl sm:h-12" />
        </div>
        <div className="glass rounded-[28px] p-5 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
            <div className="space-y-3">
              <Bone className="h-6 w-28 rounded-full" />
              <Bone className="h-24 w-32 sm:h-28" />
              <Bone className="h-5 w-24" />
            </div>
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Bone className="h-14" />
                <Bone className="h-14" />
              </div>
              <Bone className="h-11 w-36 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Bone className="h-8 w-64" />
          <CalendarSkeleton />
        </div>
      </main>
    </>
  );
}
