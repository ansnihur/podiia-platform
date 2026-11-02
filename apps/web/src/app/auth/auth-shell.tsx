import { SpiralLine } from '@/components/brand';

export function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-wrap gap-6 px-4 py-6 sm:px-6">
      <div className="relative flex min-h-[260px] flex-[1_1_380px] flex-col justify-end overflow-hidden rounded-big bg-ground p-8 text-light">
        <SpiralLine width={460} color="#3E1C1E" stroke={16} className="absolute -left-10 top-6" />
        <SpiralLine width={460} color="#C8241B" stroke={5} draw className="absolute -left-10 top-6" />
        <p className="relative font-display text-3xl font-extrabold leading-tight tracking-[-0.03em]">Почни з дому — а ми покажемо світ</p>
      </div>
      <div className="flex flex-[999_1_420px] flex-col gap-5 py-4">
        <h1 className="h-display text-4xl">{title}</h1>
        <p className="text-lg text-muted">{lead}</p>
        {children}
      </div>
    </div>
  );
}
