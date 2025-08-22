import { BookOpen } from 'lucide-react';

export default function CollectionCard({ collection, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 text-white">
        <h3 className="text-lg font-semibold">{collection}</h3>
        <p className="text-sm opacity-90">Test Collection</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold text-gray-700">∞</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Explore various test categories in {collection}
        </p>
        <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
          Continue
        </button>
      </div>
    </div>
  );
}