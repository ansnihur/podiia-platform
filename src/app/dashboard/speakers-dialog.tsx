'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Plus, Loader2, UserCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/language';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SpeakerUser { id: string; name: string; email: string; }
interface Speaker { id: string; topic: string; bio: string; user: { id: string; name: string; email: string }; }
interface Props { eventId: string; eventTitle: string; }

export function SpeakersDialog({ eventId, eventTitle }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [users, setUsers] = useState<SpeakerUser[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [userId, setUserId] = useState('');
  const [topic, setTopic] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoadingSpeakers(true);
    try {
      const [sr, ur] = await Promise.all([fetch(`/api/speakers?eventId=${eventId}`), fetch('/api/users?role=SPEAKER')]);
      if (sr.ok) setSpeakers(await sr.json());
      if (ur.ok) setUsers(await ur.json());
    } finally {
      setLoadingSpeakers(false);
    }
  }, [eventId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !topic.trim() || !bio.trim()) { setError(t.speakers_dialog_validation); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, topic: topic.trim(), bio: bio.trim() }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error ?? t.speakers_dialog_error); return; }
      setUserId(''); setTopic(''); setBio('');
      await load();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const availableUsers = users.filter(u => !speakers.some(s => s.user.id === u.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 border text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE] hover:bg-[#EDE9FE]">
          <Mic className="h-3.5 w-3.5" /> {t.speakers_dialog_button}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-500" />
            {t.speakers_dialog_button} — {eventTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div>
            <p className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-2">
              {t.speakers_dialog_added} ({speakers.length})
            </p>
            {loadingSpeakers ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : speakers.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/40 italic py-2">{t.speakers_dialog_none}</p>
            ) : (
              <div className="space-y-2">
                {speakers.map((s) => (
                  <div key={s.id} className="rounded-xl border-2 border-[#FFE566] bg-[#FFFBEB] px-3 py-2.5 flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[#F5C800] flex items-center justify-center text-xs font-bold flex-shrink-0">{s.user.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{s.user.name}</p>
                      <p className="text-xs text-[#1565C0] font-medium">{s.topic}</p>
                      <p className="text-xs text-[#1a1a1a]/55 mt-0.5 line-clamp-2">{s.bio}</p>
                    </div>
                    <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={handleAdd} className="space-y-3 border-t border-[#FFE566] pt-4">
            <p className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-1">{t.speakers_dialog_add}</p>
            <div>
              <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">{t.auth_role_speaker}</label>
              <select value={userId} onChange={e => setUserId(e.target.value)}
                className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#F5C800]">
                <option value="">{t.speakers_dialog_select}</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              {availableUsers.length === 0 && !loadingSpeakers && (
                <p className="text-xs text-[#1a1a1a]/40 mt-1">{t.speakers_dialog_no_available}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">{t.speakers_dialog_topic}</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={t.speakers_dialog_topic_placeholder}
                className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#F5C800]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1a1a1a]/70 mb-1 block">{t.speakers_dialog_bio}</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t.speakers_dialog_bio_placeholder} rows={2}
                className="w-full rounded-xl border-2 border-[#E8D44D] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#F5C800] resize-none" />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] disabled:opacity-50 transition-colors">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? t.speakers_dialog_adding : t.speakers_dialog_add}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
