import Image from 'next/image';
import { rubricCovers, type RubricSlug } from '@podiia/brand';
import { SpiralLine } from './brand';

/** Organizer photo when there is one, otherwise a generated cover in the rubric's colours. */
export function Cover({ coverUrl, rubric, className = '', children }: { coverUrl: string | null; rubric?: string; className?: string; children?: React.ReactNode }) {
  const c = rubricCovers[(rubric as RubricSlug) ?? 'group'] ?? rubricCovers.group;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: c.bg, color: c.text }}>
      {coverUrl ? (
        <Image src={coverUrl} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      ) : (
        <SpiralLine width={320} color={c.line} stroke={9} className="absolute -right-24 -top-4" />
      )}
      {children}
    </div>
  );
}
