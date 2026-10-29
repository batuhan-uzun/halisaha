import { TopBar } from "@/components/TopBar";

const STEPS = [
  ["Kaydol", "Adın, soyadın ve e-postan yeterli."],
  ["Müsait günlerini işaretle", "Önümüzdeki 30 günde boş olduğun akşamları seç."],
  ["Maç belli olur", "Adminler en kalabalık güne sahayı tutar, burada görürsün."],
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-16">
        <section className="rise hidden lg:block">
          <p className="text-sm font-medium text-gold">Bu akşam kim var?</p>
          <h1 className="font-display mt-3 text-6xl uppercase leading-[0.95] xl:text-7xl">
            Maç günü
            <br />
            <span className="text-pitch">birlikte</span> belli olur
          </h1>
          <ol className="mt-10 max-w-md space-y-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/8 text-sm font-bold ring-1 ring-white/15">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/60">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="glass rise rounded-[28px] p-6 sm:p-8">{children}</section>
      </main>
    </>
  );
}
