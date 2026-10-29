export function SectionTitle({
  id,
  kicker,
  children,
  action,
}: {
  id: string;
  kicker?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && <p className="text-[13px] font-medium text-gold">{kicker}</p>}
        <h2 id={id} className="font-display text-2xl uppercase sm:text-3xl">
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6">
      <p className="text-center text-xs text-white/35">Halı Saha · iyi maçlar</p>
    </footer>
  );
}
