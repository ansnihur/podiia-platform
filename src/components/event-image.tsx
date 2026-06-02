'use client';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface EventImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function EventImage({ src, alt, className, fallbackClassName }: EventImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={fallbackClassName ?? 'h-full w-full flex items-center justify-center'}>
        <Calendar className="h-16 w-16" style={{ color: 'rgba(0,0,0,0.3)' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
