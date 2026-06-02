import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatShortDate, formatTime } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import { ArrowLeft, Mic, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props { params: { id: string } }

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
      speakers: {
        include: {
          user: { select: { name: true } },
          materials: { select: { id: true, title: true, fileUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  if (!event) return { title: 'Not Found' };
  return { title: `Програма — ${event.title}` };
}

export default async function EventProgramPage({ params }: Props) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  const t = getT();
  const locale = getLocale();

  return (
    <div className="ua-bg min-h-screen">
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-4xl">
          <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1.5 text-sm text-[#1a1a1a]/60 hover:text-[#1565C0] transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> {t.program_back}
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#1a1a1a]">{t.program_title}</h1>
          <p className="text-sm text-[#1a1a1a]/70 mt-0.5">
            {event.title} · {formatShortDate(event.date, locale)}, {formatTime(event.date, locale)} · {event.location}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {event.speakers.length === 0 ? (
          <div className="ua-card-white flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-[#F5C800]/50 mb-3" />
            <p className="font-semibold mb-1">{t.program_empty}</p>
            <p className="text-sm text-[#1a1a1a]/50 mb-5">{t.program_empty_desc}</p>
            <Link href={`/events/${event.id}`}>
              <button className="px-4 py-2 rounded-lg border-2 border-[#F5C800] bg-[#FFF8D6] hover:bg-[#FFE566] text-sm font-semibold transition-colors">
                ← {t.program_back}
              </button>
            </Link>
          </div>
        ) : (
          <div className="ua-card-white overflow-hidden">
            <div className="border-b-2 border-[#FFE566] px-5 py-4 flex items-center gap-2">
              <Mic className="h-4 w-4 text-[#7BAAE8]" />
              <h2 className="font-display text-lg font-semibold">{t.program_talks_speakers}</h2>
              <span className="ml-auto text-xs text-[#1a1a1a]/50">{event.speakers.length} {t.program_talks_count}</span>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FFFBEB] border-b border-[#FFE566]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide w-8">#</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide">{t.program_speaker_col}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide">{t.program_topic_col}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide">{t.program_materials_col}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE566]">
                  {event.speakers.map((speaker, index) => (
                    <tr key={speaker.id} className="hover:bg-[#FFFBEB] transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-[#1a1a1a]/30">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#F5C800] flex items-center justify-center text-[#1a1a1a] font-bold text-xs flex-shrink-0">
                            {speaker.user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm">{speaker.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#1565C0] text-sm">{speaker.topic}</p>
                        {speaker.bio && (
                          <p className="text-xs text-[#1a1a1a]/50 mt-0.5 line-clamp-2 max-w-xs">{speaker.bio}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {speaker.materials.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {speaker.materials.map((m) => (
                              <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-[#F5C800] bg-[#FFF8D6] px-2 py-0.5 text-xs font-medium hover:bg-[#FFE566] transition-colors">
                                <FileText className="h-3 w-3" /> {m.title}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#1a1a1a]/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[#FFE566]">
              {event.speakers.map((speaker, index) => (
                <div key={speaker.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-[#1a1a1a]/30 w-4">{index + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-[#F5C800] flex items-center justify-center text-[#1a1a1a] font-bold text-xs flex-shrink-0">
                      {speaker.user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm">{speaker.user.name}</span>
                  </div>
                  <p className="font-medium text-[#1565C0] text-sm pl-10">{speaker.topic}</p>
                  {speaker.bio && (
                    <p className="text-xs text-[#1a1a1a]/55 leading-relaxed pl-10">{speaker.bio}</p>
                  )}
                  {speaker.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-10">
                      {speaker.materials.map((m) => (
                        <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#F5C800] bg-[#FFF8D6] px-2 py-0.5 text-xs font-medium hover:bg-[#FFE566] transition-colors">
                          <FileText className="h-3 w-3" /> {m.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
