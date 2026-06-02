'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

export function FeedbackForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const ratingLabels = ['', t.rating_poor, t.rating_fair, t.rating_average, t.rating_good, t.rating_excellent];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError(t.event_rating_required); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, rating, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t.event_review_error);
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="ua-card-white p-6 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="font-semibold text-[#1a1a1a]">{t.event_review_sent}</p>
        <p className="text-sm text-[#1a1a1a]/55">{t.event_review_added}</p>
      </div>
    );
  }

  const activeStars = hovered || rating;

  return (
    <div className="ua-card-white p-6">
      <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2 text-[#1a1a1a]">
        <Star className="h-5 w-5 text-[#F5C800] fill-[#F5C800]" />
        {t.event_leave_review}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#1a1a1a]/60 mb-2">{t.event_your_rating}</p>
          <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button key={value} type="button" onClick={() => setRating(value)} onMouseEnter={() => setHovered(value)} className="transition-transform hover:scale-110 focus:outline-none">
                  <Star className={`h-8 w-8 transition-colors ${value <= activeStars ? 'text-[#F5C800] fill-[#F5C800]' : 'text-gray-300 fill-transparent'}`} />
                </button>
              );
            })}
            {rating > 0 && <span className="ml-2 self-center text-sm text-[#1a1a1a]/50">{ratingLabels[rating]}</span>}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1a1a1a]/60 mb-2">
            {t.event_comment} <span className="font-normal">{t.event_comment_optional}</span>
          </p>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder={t.event_comment_placeholder}
            className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#F5C800] resize-none" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading || rating === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] disabled:opacity-50 transition-colors">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t.event_sending_review : t.event_send_review}
        </button>
      </form>
    </div>
  );
}
