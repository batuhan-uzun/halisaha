import { Bone } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <span className="sr-only">Yükleniyor…</span>
      <div className="space-y-2">
        <Bone className="h-4 w-24" />
        <Bone className="h-9 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="glass space-y-2 rounded-[22px] p-4 sm:p-5">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-16" />
            <Bone className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="glass space-y-3 rounded-[24px] p-5 sm:p-6">
        <Bone className="h-6 w-48" />
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
