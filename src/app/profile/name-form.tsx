'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/language';

export function NameForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const { update } = useSession();
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);
  // tracks the last successfully saved name so the button disables correctly
  const [savedName, setSavedName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === savedName) return;
    if (/\d/.test(trimmed)) {
      setMessage({ text: 'Ім\'я не може містити цифри', ok: false });
      return;
    }
    if (/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ'\- ]/.test(trimmed)) {
      setMessage({ text: 'Ім\'я містить недопустимі символи', ok: false });
      return;
    }
    if (trimmed.length < 2) {
      setMessage({ text: 'Ім\'я має містити щонайменше 2 символи', ok: false });
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedName(trimmed);
      setMessage({ text: "Ім'я оновлено успішно!", ok: true });
      await update({ name: trimmed });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({ text: data.error ?? 'Помилка. Спробуйте ще раз.', ok: false });
    }
  }

  return (
    <div className="ua-card-white p-6">
      <h2 className="font-display text-lg font-semibold mb-4">{t.profile_edit_name}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border-2 border-[#F5C800] bg-[#FFFBEB] px-4 py-2 text-sm font-medium outline-none focus:border-[#7BAAE8] transition-colors"
          placeholder="Ваше ім'я"
          maxLength={60}
          required
        />
        <button
          type="submit"
          disabled={saving || !name.trim() || name.trim() === savedName}
          className="ua-btn-primary px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t.common_loading : t.profile_save}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-sm font-medium ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
