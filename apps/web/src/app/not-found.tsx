import Link from 'next/link';
import { SpiralLine } from '@/components/brand';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-16">
      <SpiralLine width={160} color="#E7E6E3" stroke={10} />
      <h1 className="h-display text-4xl">Тут поки тихо</h1>
      <p className="text-lg text-muted">Такої сторінки немає — або подію ще не опублікували.</p>
      <Link href="/" className="btn-dark">
        На головну
      </Link>
    </div>
  );
}
