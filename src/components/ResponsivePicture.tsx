import React from 'react';
import { buildSrcSet, getLargestWebp, getMediaEntry, resolveAssetUrl } from '@/lib/media';

interface ResponsivePictureProps {
  assetId?: string | null;
  fallbackUrl?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  assetId,
  fallbackUrl,
  alt,
  sizes = '(max-width: 768px) 92vw, (max-width: 1280px) 48vw, 40vw',
  className = '',
  imgClassName = 'h-full w-full object-cover',
  priority = false,
}) => {
  const entry = getMediaEntry(assetId);

  if (entry) {
    return (
      <picture className={`block ${className}`}>
        <source type="image/avif" srcSet={buildSrcSet(entry, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={buildSrcSet(entry, 'webp')} sizes={sizes} />
        <img
          src={getLargestWebp(entry)}
          alt={alt}
          width={entry.width}
          height={entry.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className={imgClassName}
        />
      </picture>
    );
  }

  return (
    <img
      src={resolveAssetUrl(fallbackUrl)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={`${imgClassName} ${className}`}
    />
  );
};
