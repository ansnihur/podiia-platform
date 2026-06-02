interface Props {
  iconSize?: number;
  textSize?: string;
}

export function PodiiaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <circle cx="14" cy="14" r="14" fill="#1a1a1a" />
      <circle cx="14" cy="14" r="6" fill="#F5C800" />
      <circle cx="12" cy="12" r="1.5" fill="#FFE566" opacity="0.7" />
      <ellipse cx="14" cy="14" rx="11" ry="5" stroke="#7BAAE8" strokeWidth="1.5" fill="none" transform="rotate(-35 14 14)" />
      <circle cx="22" cy="9" r="2" fill="#7BAAE8" />
      <circle cx="21.5" cy="8.5" r="0.5" fill="white" opacity="0.8" />
    </svg>
  );
}

export function PodiiaWordmark({ textSize = 'text-xl' }: { textSize?: string }) {
  return (
    <span className={`font-display ${textSize} font-bold text-[#111827]`}>
      Pod<span className="text-[#7BAAE8]">i</span><span className="text-[#FFD84D]">i</span>a
    </span>
  );
}
