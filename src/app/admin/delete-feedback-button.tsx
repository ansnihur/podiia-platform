'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function DeleteFeedbackButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Видалити цей відгук?')) return;
    setLoading(true);
    await fetch(`/api/feedback?id=${id}`, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
      title="Видалити відгук"
    >
      <Trash2 className="h-4 w-4 text-red-400" />
    </button>
  );
}
