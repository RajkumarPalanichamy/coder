import { FolderOpen, BookOpen, Puzzle, Target, Zap, Layers } from 'lucide-react';

const getCategoryIcon = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('array') || categoryLower.includes('list')) {
    return <Layers className="h-8 w-8 text-blue-500" />;
  } else if (categoryLower.includes('string') || categoryLower.includes('text')) {
    return <BookOpen className="h-8 w-8 text-green-500" />;
  } else if (categoryLower.includes('tree') || categoryLower.includes('graph')) {
    return <Target className="h-8 w-8 text-purple-500" />;
  } else if (categoryLower.includes('dynamic') || categoryLower.includes('dp')) {
    return <Zap className="h-8 w-8 text-yellow-500" />;
  } else if (categoryLower.includes('sort') || categoryLower.includes('search')) {
    return <Puzzle className="h-8 w-8 text-red-500" />;
  } else {
    return <FolderOpen className="h-8 w-8 text-gray-500" />;
  }
};

const getCategoryColor = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('array') || categoryLower.includes('list')) {
    return 'from-blue-400 to-blue-600';
  } else if (categoryLower.includes('string') || categoryLower.includes('text')) {
    return 'from-green-400 to-green-600';
  } else if (categoryLower.includes('tree') || categoryLower.includes('graph')) {
    return 'from-purple-400 to-purple-600';
  } else if (categoryLower.includes('dynamic') || categoryLower.includes('dp')) {
    return 'from-yellow-400 to-yellow-600';
  } else if (categoryLower.includes('sort') || categoryLower.includes('search')) {
    return 'from-red-400 to-red-600';
  } else {
    return 'from-gray-400 to-gray-600';
  }
};

const formatCategoryName = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function CategoryCard({ category, problemCount, onClick }) {
  return (
    <div onClick={onClick}>
      <div className={`relative overflow-hidden bg-gradient-to-br ${getCategoryColor(category)} text-white rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            {getCategoryIcon(category)}
            <div className="text-right">
              <div className="text-2xl font-bold">{problemCount}</div>
              <div className="text-sm opacity-90">Problems</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{formatCategoryName(category)}</h3>
              <p className="text-sm opacity-90">Category</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 