'use client';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

export function HeroImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null | undefined;
  title: string;
}) {
  const hasValidUrl = !!(imageUrl && imageUrl.startsWith('http'));
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !hasValidUrl || imgError;

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Placeholder — завжди в DOM, показується поки img не завантажився */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE8A3 60%, #FFD84D 100%)',
          opacity: showPlaceholder ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: showPlaceholder ? 1 : 0,
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,216,77,0.35)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <CalendarDays style={{ width: 72, height: 72, color: 'rgba(160,110,0,0.4)' }} strokeWidth={1.2} />
        </div>
      </div>

      {/* Image — завантажується в фоні */}
      {hasValidUrl && (
        <img
          src={imageUrl!}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: imgError ? 0 : 1,
            zIndex: 2,
          }}
          onError={() => setImgError(true)}
        />
      )}

      {/* Єдиний overlay — завжди поверх і фото, і placeholder */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        zIndex: 3,
        pointerEvents: 'none',
      }} />
    </div>
  );
}
