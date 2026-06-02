import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="ua-bg min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="ua-card p-12 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-2xl bg-[#FFFDE7] flex items-center justify-center">
            <Calendar className="h-8 w-8 text-[#FFD84D]" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="font-display text-7xl font-bold text-[#111827] mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold mb-3 text-[#111827]">Сторінку не знайдено</h2>
        <p className="text-sm text-[#6B7280] mb-7">
          Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link href="/">
          <button className="px-6 py-2.5 rounded-lg bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] transition-colors">
            На головну
          </button>
        </Link>
      </div>
    </div>
  );
}
