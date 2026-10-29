import { PitchLines } from "./PitchLines";

/** Sabit arka plan: projektor isiginda, perspektifte bir gece sahasi. */
export function Stadium() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      {/* gokyuzu ve tribun golgesi */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,#12301f_0%,#071510_45%,#040c08_75%)]" />

      {/* saha */}
      <div className="absolute inset-x-[-30%] bottom-[-14%] h-[88%] [perspective:1000px]">
        <div className="turf-plane absolute inset-0 origin-bottom [transform:rotateX(58deg)]">
          <PitchLines className="absolute inset-[4%] h-[92%] w-[92%] text-white/20" />
        </div>
      </div>

      {/* projektorler */}
      <div className="absolute -left-[12%] -top-[22%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgb(255_238_196/0.30),rgb(255_220_150/0.08)_45%,transparent_70%)]" />
      <div className="absolute -right-[12%] -top-[22%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgb(255_238_196/0.26),rgb(255_220_150/0.07)_45%,transparent_70%)]" />
      <div className="absolute left-[6%] top-0 h-[120%] w-[18vw] origin-top -rotate-[24deg] bg-gradient-to-b from-white/[0.07] to-transparent blur-2xl" />
      <div className="absolute right-[6%] top-0 h-[120%] w-[18vw] origin-top rotate-[24deg] bg-gradient-to-b from-white/[0.06] to-transparent blur-2xl" />

      {/* sis ve vinyet */}
      <div className="absolute inset-x-0 top-[38%] h-[30%] bg-gradient-to-b from-transparent via-[#9fd8b4]/[0.05] to-transparent blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_55%,rgb(0_0_0/0.65))]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
