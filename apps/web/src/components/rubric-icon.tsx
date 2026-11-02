import { colors } from '@podiia/brand';

const PETAL = 'M24 22 C 20 15, 21 9, 24 5 C 27 9, 28 15, 24 22 Z';

/** Folk symbol per rubric: дерево життя, квітка, хоровод, засіяне поле, сонце. */
export function RubricIcon({ slug, size = 32, ink = colors.ground }: { slug: string; size?: number; ink?: string }) {
  const c = colors.carmine;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      {slug === 'mind' && (
        <>
          <path d="M24 44 V8" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 34 C 16 34, 10 28, 10 22 C 18 22, 24 28, 24 34 Z M24 34 C 32 34, 38 28, 38 22 C 30 22, 24 28, 24 34 Z M24 22 C 18 22, 14 17, 14 12 C 20 12, 24 17, 24 22 Z M24 22 C 30 22, 34 17, 34 12 C 28 12, 24 17, 24 22 Z" fill={ink} />
          <circle cx="24" cy="6" r="4" fill={c} />
        </>
      )}
      {slug === 'soul' && (
        <>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} d={PETAL} fill={ink} transform={`rotate(${a} 24 24)`} />
          ))}
          <circle cx="24" cy="24" r="5" fill={c} />
        </>
      )}
      {slug === 'group' && (
        <>
          <g fill={ink}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <circle key={a} cx={24 + 16 * Math.sin((a * Math.PI) / 180)} cy={24 - 16 * Math.cos((a * Math.PI) / 180)} r="4.5" />
            ))}
          </g>
          <circle cx="24" cy="24" r="5" fill={c} />
        </>
      )}
      {slug === 'hands' && (
        <>
          <path d="M24 4 L44 24 L24 44 L4 24 Z" fill="none" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
          <g fill={ink}>
            <circle cx="24" cy="16" r="3" />
            <circle cx="32" cy="24" r="3" />
            <circle cx="24" cy="32" r="3" />
            <circle cx="16" cy="24" r="3" />
          </g>
          <circle cx="24" cy="24" r="3.5" fill={c} />
        </>
      )}
      {slug === 'weekend' && (
        <>
          <circle cx="24" cy="24" r="9" fill={c} />
          <g stroke={ink} strokeWidth="3.5" strokeLinecap="round">
            <path d="M24 4 V9" />
            <path d="M24 39 V44" />
            <path d="M4 24 H9" />
            <path d="M39 24 H44" />
            <path d="M9.9 9.9 L13.4 13.4" />
            <path d="M34.6 34.6 L38.1 38.1" />
            <path d="M9.9 38.1 L13.4 34.6" />
            <path d="M34.6 13.4 L38.1 9.9" />
          </g>
        </>
      )}
    </svg>
  );
}
