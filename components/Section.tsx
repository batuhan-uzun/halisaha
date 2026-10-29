export function SectionTitle({ id, kicker, children }: { id: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-flag">{kicker}</p>
      <h2 id={id} className="font-display text-4xl uppercase leading-[0.92] sm:text-5xl">
        {children}
      </h2>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-6">
      <div className="flex justify-between border-t-2 border-ink pt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        <span>Halı Saha</span>
        <span>İyi maçlar</span>
      </div>
    </footer>
  );
}
