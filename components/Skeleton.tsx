/** Yuklenirken gorunen yer tutucu bloklar. */
export function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export function CalendarSkeleton() {
  return (
    <div className="glass rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-56" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-8 w-24 rounded-full" />
          <Bone className="h-8 w-16 rounded-full" />
          <Bone className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 35 }, (_, i) => (
          <Bone key={i} className="aspect-square sm:rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
