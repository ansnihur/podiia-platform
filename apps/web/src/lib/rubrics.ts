import { rubrics, type RubricSlug } from '@podiia/brand';
import { isWeekendInKyiv } from './format';

export { rubrics };
export type { RubricSlug };

export const rubricName = (slug: string) => rubrics.find((r) => r.slug === slug)?.name ?? slug;

/** Rubrics of an event = rubrics of its interests + «На вихідні» when it falls on Sat/Sun in Kyiv. */
export function rubricsForEvent(fromInterests: string[], startsAt: Date): RubricSlug[] {
  const set = new Set(fromInterests as RubricSlug[]);
  if (isWeekendInKyiv(startsAt)) set.add('weekend');
  return rubrics.map((r) => r.slug).filter((s) => set.has(s));
}
