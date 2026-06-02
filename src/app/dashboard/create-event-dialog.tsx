'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

export function CreateEventDialog() {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', capacity: '100', tags: '', imageUrl: '' });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = (): string => {
    if (!form.title.trim()) return 'Введіть назву заходу';
    if (form.title.trim().length < 5) return 'Назва занадто коротка (мін. 5 символів)';
    if (form.title.trim().length > 120) return 'Назва занадто довга (макс. 120 символів)';
    if (!form.description.trim()) return 'Введіть опис заходу';
    if (form.description.trim().length < 20) return 'Опис занадто короткий (мін. 20 символів)';
    if (!form.date) return 'Оберіть дату заходу';
    if (new Date(form.date) <= new Date()) return 'Дата заходу має бути в майбутньому';
    if (!form.location.trim()) return 'Введіть місце проведення';
    if (form.location.trim().length < 5) return 'Місце проведення занадто коротке';
    const cap = parseInt(form.capacity);
    if (isNaN(cap) || cap < 1) return 'Місткість має бути більше 0';
    if (cap > 100000) return 'Занадто велика місткість (макс. 100 000)';
    if (form.imageUrl && !form.imageUrl.startsWith('http')) return 'Посилання на фото має починатися з http';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); setLoading(false); return; }
    const tags = form.tags.split(',').map(tg => tg.trim()).filter(Boolean);
    const res = await fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, capacity: parseInt(form.capacity), tags }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? t.common_error); setLoading(false); return; }
    setOpen(false);
    setForm({ title: '', description: '', date: '', location: '', capacity: '100', tags: '', imageUrl: '' });
    router.refresh();
    setLoading(false);
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-[10px] border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FFD84D] transition-colors";
  const labelCls = "block text-xs font-semibold text-[#374151] mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] transition-colors">
        <Plus className="h-4 w-4" /> {t.dash_create}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-[#F3F4F6] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
              <h2 className="font-display text-lg font-bold text-[#111827]">{t.create_title}</h2>
              <button onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition-colors text-[#6B7280]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <div className="rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] px-3 py-2.5 text-sm text-[#DC2626]">{error}</div>}
              <div>
                <label className={labelCls}>{t.create_event_title} *</label>
                <input placeholder={t.create_event_title_placeholder} value={form.title} onChange={update('title')} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.create_description} *</label>
                <textarea placeholder={t.create_description_placeholder} value={form.description} onChange={update('description')} required rows={3} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.create_date} *</label>
                  <input type="datetime-local" value={form.date} onChange={update('date')} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.create_capacity} *</label>
                  <input type="number" min="1" value={form.capacity} onChange={update('capacity')} required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.create_location} *</label>
                <input placeholder={t.create_location_placeholder} value={form.location} onChange={update('location')} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.create_tags} <span className="font-normal text-[#9CA3AF]">{t.create_tags_hint}</span></label>
                <input placeholder={t.create_tags_placeholder} value={form.tags} onChange={update('tags')} className={inputCls} />
                <p className="text-xs text-[#9CA3AF] mt-1">{t.create_tags_lang_hint}</p>
              </div>
              <div>
                <label className={labelCls}>{t.create_image} <span className="font-normal text-[#9CA3AF]">{t.create_optional}</span></label>
                <input type="url" placeholder={t.create_image_placeholder} value={form.imageUrl} onChange={update('imageUrl')} className={inputCls} />
              </div>
              <p className="text-xs text-[#9CA3AF]">{t.create_draft_hint}</p>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] text-[#111827] font-semibold text-sm hover:bg-[#F9FAFB] transition-colors">
                  {t.create_cancel}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? t.create_creating : t.create_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
