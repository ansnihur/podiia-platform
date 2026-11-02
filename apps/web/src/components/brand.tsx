import { SPIRAL_PATH, colors } from '@podiia/brand';

/** The emblem: Trypillian S-spiral on a carmine circle. */
export function SpiralMark({ size = 32, bg = colors.carmine, ink = colors.light, label }: { size?: number; bg?: string; ink?: string; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="32 22 156 156"
      className="shrink-0"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="110" cy="100" r="78" fill={bg} />
      <path d={SPIRAL_PATH} fill="none" stroke={ink} strokeWidth={size < 28 ? 18 : 13} strokeLinecap="round" />
    </svg>
  );
}

/** Decorative spiral line; `draw` animates it like a pen stroke. */
export function SpiralLine({ width = 140, color = colors.carmine, stroke = 10, draw = false, className = '' }: { width?: number; color?: string; stroke?: number; draw?: boolean; className?: string }) {
  return (
    <svg width={width} height={(width * 80) / 140} viewBox="40 60 140 80" aria-hidden className={className}>
      <path
        d={SPIRAL_PATH}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={draw ? 1 : undefined}
        strokeDasharray={draw ? 1 : undefined}
        className={draw ? 'animate-draw' : undefined}
      />
    </svg>
  );
}

/** Podїa wordmark: the dotless ı with two carmine dots forms the Ukrainian ї. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[-0.03em] ${className}`}>
      <span className="sr-only">Podїa</span>
      <span aria-hidden>
      Pod
      <span className="relative inline-block">
        ı
        <span className="absolute left-1/2 top-[0.04em] flex -translate-x-1/2 gap-[0.11em]" aria-hidden>
          <span className="h-[0.22em] w-[0.22em] rounded-full bg-carmine" />
          <span className="h-[0.22em] w-[0.22em] rounded-full bg-carmine" />
        </span>
      </span>
      a
      </span>
    </span>
  );
}

export function Logo({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.4, fontSize: size }}>
      <SpiralMark size={Math.round(size * 1.25)} />
      <Wordmark />
    </span>
  );
}
