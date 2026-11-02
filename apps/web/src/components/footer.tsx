import { SpiralMark, Wordmark } from './brand';

export function Footer() {
  return (
    <footer className="mt-16 bg-ground text-light">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3 text-xl">
          <SpiralMark size={30} />
          <Wordmark />
        </div>
        <p className="max-w-md text-sm text-[#D8CFCB]">Почни з дому — а ми покажемо світ. Кожну подію перевіряє команда Podїa.</p>
      </div>
    </footer>
  );
}
