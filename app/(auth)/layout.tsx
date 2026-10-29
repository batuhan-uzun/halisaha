import { Masthead } from "@/components/Masthead";
import { PitchLines } from "@/components/PitchLines";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Masthead section="Kadroya katıl" />
      <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-16 pt-8 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-12">
        <section className="turf relative hidden min-h-[440px] overflow-hidden text-chalk md:block">
          <PitchLines className="absolute inset-0 h-full w-full text-chalk/30" />
          <div className="relative flex h-full flex-col justify-between p-8">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-chalk/70">Nasıl işliyor</p>
            <ol className="space-y-6">
              {[
                ["01", "Kaydol", "Adın, soyadın, e-postan. Bu kadar."],
                ["02", "Müsait günlerini işaretle", "Önümüzdeki 30 günde hangi akşamlar boşsun?"],
                ["03", "Maç belli olur", "Adminler en kalabalık güne sahayı tutar, burada görürsün."],
              ].map(([no, title, body]) => (
                <li key={no} className="grid grid-cols-[3.25rem_1fr] items-baseline">
                  <span className="font-display text-4xl leading-none text-flag">{no}</span>
                  <div>
                    <p className="font-display text-2xl uppercase leading-tight">{title}</p>
                    <p className="mt-1 text-sm text-chalk/75">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="flex flex-col justify-center">{children}</section>
      </main>
    </>
  );
}
