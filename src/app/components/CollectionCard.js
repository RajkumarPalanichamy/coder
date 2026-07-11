import { BookOpen, Calculator, MessageSquare, Brain } from 'lucide-react';

const getCollectionIcon = (collection) => {
  const name = (collection || '').toLowerCase();
  if (name.includes('quant') || name.includes('aptitude')) {
    return <Calculator className="w-12 h-12 text-green-500" />;
  }
  if (name.includes('verbal')) {
    return <MessageSquare className="w-12 h-12 text-purple-500" />;
  }
  if (name.includes('reason')) {
    return <Brain className="w-12 h-12 text-orange-500" />;
  }
  return <BookOpen className="w-12 h-12 text-blue-500" />;
};

export default function CollectionCard({ collection, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
        <h3 className="text-2xl font-bold">{collection}</h3>
        <p className="text-base opacity-90">Test Collection</p>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {getCollectionIcon(collection)}
          <span className="text-3xl font-bold text-gray-700">∞</span>
        </div>
        <p className="text-gray-600 text-base mb-6">
          Explore various test categories in {collection}
        </p>
        <button className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-lg">
          Continue
        </button>
      </div>
    </div>
  );
}
