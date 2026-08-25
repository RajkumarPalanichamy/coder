import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { resolveBrand } from '@/lib/brandLogos';

// Logo, colours and labels all come from the shared registry in
// `src/lib/brandLogos.js` - see that file to add a company or college.
export default function LanguageCard({ language, problemCount, href, onClick }) {
  const brand = resolveBrand(language);

  const CardContent = () => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${brand.gradient} text-white rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group border-2 ${brand.border} h-44`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-125"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-8 -mb-8 transition-transform duration-500 group-hover:scale-110"></div>

      <div className="relative z-10 flex items-center space-x-4 h-full">
        {/* Logo */}
        <BrandLogo name={language} size="md" className="flex-shrink-0" />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold tracking-wide truncate">{brand.label}</h3>
          <p className="text-sm text-white/80 truncate">{brand.typeLabel}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div onClick={onClick}>
      <CardContent />
    </div>
  );
}
