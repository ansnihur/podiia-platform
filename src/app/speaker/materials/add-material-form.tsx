'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, CheckCircle2, FileText } from 'lucide-react';

interface SpeakerSlot {
  id: string;
  topic: string;
  eventId: string;
  event: { title: string };
}

interface Props {
  speakerSlots: SpeakerSlot[];
}

export function AddMaterialForm({ speakerSlots }: Props) {
  const router = useRouter();
  const [speakerId, setSpeakerId] = useState(speakerSlots[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedSlot = speakerSlots.find(s => s.id === speakerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!speakerId || !title.trim() || !fileUrl.trim()) {
      setError('Заповніть всі поля.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speakerId,
          eventId: selectedSlot?.eventId,
          title: title.trim(),
          fileUrl: fileUrl.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Не вдалось додати матеріал.');
        return;
      }
      setTitle('');
      setFileUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ua-card-white p-5">
      <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-[#7BAAE8]" />
        Додати матеріал
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {speakerSlots.length > 1 && (
          <div>
            <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">Захід</label>
            <select
              value={speakerId}
              onChange={e => setSpeakerId(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#F5C800]"
            >
              {speakerSlots.map(s => (
                <option key={s.id} value={s.id}>{s.event.title} — {s.topic}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">Назва матеріалу</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Презентація, стаття, відео..."
            className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#F5C800]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">URL файлу</label>
          <input
            value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#F5C800]"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Матеріал додано!
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] disabled:opacity-50 transition-colors"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {submitting ? 'Додавання...' : 'Додати матеріал'}
        </button>
      </form>
    </div>
  );
}
