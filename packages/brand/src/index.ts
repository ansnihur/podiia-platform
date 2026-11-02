/**
 * Podїa brand tokens — shared by web and (later) the mobile app.
 * Source of truth: design system v3 «Трипільська спіраль».
 */

export const colors = {
  light: '#F3F3F1', // фон без крему
  ground: '#2A0E10', // темні блоки
  carmine: '#C8241B', // бренд, «Іду»
  ink: '#1A1414', // текст
  stone: '#E7E6E3', // картки, межі
  petal: '#F7B49A', // орнамент на темному
  muted: '#5A5350', // другорядний текст
  white: '#FFFFFF',
} as const;

/** Trypillian S-spiral, drawn in a 140×80 box (viewBox "40 60 140 80"). */
export const SPIRAL_PATH =
  'M70 100 A10 10 0 0 1 90 100 A20 20 0 0 1 50 100 A30 30 0 0 1 110 100 A30 30 0 0 0 170 100 A20 20 0 0 0 130 100 A10 10 0 0 0 150 100';

export type RubricSlug = 'mind' | 'soul' | 'group' | 'hands' | 'weekend';

export const rubrics: { slug: RubricSlug; name: string; symbol: string; order: number }[] = [
  { slug: 'mind', name: 'Для розуму', symbol: 'tree', order: 1 },
  { slug: 'soul', name: 'Для душі', symbol: 'flower', order: 2 },
  { slug: 'group', name: 'Гуртом', symbol: 'ring', order: 3 },
  { slug: 'hands', name: 'Руками', symbol: 'field', order: 4 },
  { slug: 'weekend', name: 'На вихідні', symbol: 'sun', order: 5 },
];

/** Cover colours for events without a photo (generated covers). */
export const rubricCovers: Record<RubricSlug, { bg: string; line: string; text: string }> = {
  mind: { bg: colors.ground, line: colors.petal, text: colors.light },
  soul: { bg: colors.carmine, line: colors.light, text: colors.white },
  group: { bg: colors.stone, line: colors.carmine, text: colors.ink },
  hands: { bg: colors.petal, line: colors.ground, text: colors.ink },
  weekend: { bg: colors.ink, line: colors.carmine, text: colors.light },
};
