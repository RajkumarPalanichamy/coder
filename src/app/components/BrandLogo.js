'use client';

import { useState } from 'react';
import { ClipboardList, Code2, GraduationCap } from 'lucide-react';
import { resolveBrand } from '@/lib/brandLogos';

// `frame: false` (xl) skips the border/padding/rounding of its own - the card
// already provides the shape - but still shows the full image uncropped on a
// plain background, so every source image (whatever its own aspect ratio or
// baked-in whitespace) reads at a consistent size instead of some filling the
// box and others getting cropped differently.
const SIZES = {
  xs: { tile: 'w-12 h-12 rounded-lg p-1', text: 'text-base', icon: 'w-7 h-7', frame: true },
  sm: { tile: 'w-14 h-14 rounded-xl p-1.5', text: 'text-lg', icon: 'w-7 h-7', frame: true },
  md: { tile: 'w-20 h-20 rounded-2xl p-2.5', text: 'text-2xl', icon: 'w-10 h-10', frame: true },
  lg: { tile: 'w-40 h-40 rounded-2xl p-5', text: 'text-5xl', icon: 'w-20 h-20', frame: true },
  xl: { tile: 'w-full h-48 bg-white p-4', text: 'text-6xl', icon: 'w-24 h-24', frame: false },
};

/**
 * The logo for a language, company or college, resolved through the shared
 * registry in `src/lib/brandLogos.js`.
 *
 * Registered artwork (Java, Zoho, Accenture, the common college logo, ...) is
 * rendered on a light tile so dark wordmarks stay legible on coloured cards.
 * Anything without artwork falls back to a brand-coloured monogram, and a logo
 * file that fails to load falls back the same way instead of showing a broken
 * image.
 */
export default function BrandLogo({ name, size = 'md', className = '' }) {
  const [brokenSrc, setBrokenSrc] = useState(null);

  const brand = resolveBrand(name);
  const dims = SIZES[size] || SIZES.md;
  const showImage = Boolean(brand.logo) && brokenSrc !== brand.logo;

  if (showImage) {
    const frameClasses = dims.frame ? 'bg-white border border-gray-100 shadow-sm' : '';
    return (
      <div
        className={`${dims.tile} flex items-center justify-center ${frameClasses} group-hover:scale-105 transition-transform duration-300 ${className}`}
      >
        <img
          src={brand.logo}
          alt={`${brand.label} logo`}
          className="w-full h-full object-contain"
          onError={() => setBrokenSrc(brand.logo)}
        />
      </div>
    );
  }

  const FallbackIcon =
    brand.kind === 'college' ? GraduationCap : brand.kind === 'language' ? Code2 : ClipboardList;

  // Companies keep their initials (recognisable without artwork); everything
  // else keeps the icon it has always had.
  return (
    <div
      className={`${dims.tile} flex items-center justify-center ${dims.frame ? 'border border-white/40 shadow-sm' : ''} group-hover:scale-105 transition-transform duration-300 ${className}`}
      style={{ backgroundColor: brand.accent }}
      title={brand.label}
    >
      {brand.kind === 'company' ? (
        <span className={`${dims.text} font-extrabold tracking-wide text-white`}>{brand.monogram}</span>
      ) : (
        <FallbackIcon className={`${dims.icon} text-white`} />
      )}
    </div>
  );
}
