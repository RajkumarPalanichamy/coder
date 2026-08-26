import BrandLogo from './BrandLogo';
import { resolveBrand } from '@/lib/brandLogos';

// Company collections (Zoho, Accenture, ...) get their own logo, every college
// shares one common college logo, and anything else keeps the neutral test
// collection styling. See `src/lib/brandLogos.js` to register a new name.
export default function CollectionCard({ collection, onClick }) {
  const brand = resolveBrand(collection);
  const subtitle = brand.kind === 'assessment' ? 'Test Collection' : brand.typeLabel;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className={`bg-gradient-to-r ${brand.gradient} p-6 text-white`}>
        <h3 className="text-2xl font-bold">{brand.label}</h3>
        <p className="text-base opacity-90">{subtitle}</p>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <BrandLogo name={collection} size="lg" />
        </div>
        <p className="text-gray-600 text-base mb-6">
          Explore various test categories in {brand.label}
        </p>
        <button className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-lg">
          Continue
        </button>
      </div>
    </div>
  );
}
