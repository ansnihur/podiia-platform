const PASTEL_COLORS = [
  { bg: '#FFD6D6', text: '#C0392B' }, // рожевий
  { bg: '#FFE4B5', text: '#B8860B' }, // персиковий
  { bg: '#D6EAF8', text: '#1A5276' }, // блакитний
  { bg: '#D5F5E3', text: '#1E8449' }, // зелений
  { bg: '#E8DAEF', text: '#6C3483' }, // фіолетовий
  { bg: '#FDEBD0', text: '#A04000' }, // помаранчевий
  { bg: '#D6DBDF', text: '#2C3E50' }, // сірий
  { bg: '#FDEDEC', text: '#922B21' }, // коралевий
  { bg: '#EBF5FB', text: '#1F618D' }, // ніжно-синій
  { bg: '#EAFAF1', text: '#1E8449' }, // м'ятний
  { bg: '#FEF9E7', text: '#B7950B' }, // лимонний
  { bg: '#F9EBEA', text: '#A93226' }, // пудровий
];

export function getAvatarColor(name: string): { bg: string; text: string } {
  if (!name) return PASTEL_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}
