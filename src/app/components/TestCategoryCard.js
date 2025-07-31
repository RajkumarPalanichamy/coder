"use client";

const getCategoryIcon = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('oops') || categoryLower.includes('oop')) {
    return '🏗️'; // Object-oriented programming
  } else if (categoryLower.includes('c++') || categoryLower.includes('cpp')) {
    return '⚡'; // C++ performance
  } else if (categoryLower.includes('c#') || categoryLower.includes('csharp')) {
    return '🔷'; // C# Microsoft
  } else if (categoryLower.includes('java')) {
    return '☕'; // Java coffee
  } else if (categoryLower.includes('python')) {
    return '🐍'; // Python snake
  } else if (categoryLower.includes('javascript') || categoryLower.includes('js')) {
    return '🟨'; // JavaScript yellow
  } else if (categoryLower.includes('data structure') || categoryLower.includes('ds')) {
    return '📊'; // Data structures
  } else if (categoryLower.includes('algorithm') || categoryLower.includes('algo')) {
    return '🔄'; // Algorithms
  } else if (categoryLower.includes('web') || categoryLower.includes('frontend')) {
    return '🌐'; // Web development
  } else if (categoryLower.includes('database') || categoryLower.includes('sql')) {
    return '🗄️'; // Database
  }
  return '📝'; // Default test icon
};

const getCategoryColor = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('oops') || categoryLower.includes('oop')) {
    return 'from-purple-500 to-purple-700';
  } else if (categoryLower.includes('c++') || categoryLower.includes('cpp')) {
    return 'from-blue-600 to-blue-800';
  } else if (categoryLower.includes('c#') || categoryLower.includes('csharp')) {
    return 'from-indigo-500 to-indigo-700';
  } else if (categoryLower.includes('java')) {
    return 'from-orange-500 to-orange-700';
  } else if (categoryLower.includes('python')) {
    return 'from-green-500 to-green-700';
  } else if (categoryLower.includes('javascript') || categoryLower.includes('js')) {
    return 'from-yellow-500 to-yellow-700';
  } else if (categoryLower.includes('data structure') || categoryLower.includes('ds')) {
    return 'from-teal-500 to-teal-700';
  } else if (categoryLower.includes('algorithm') || categoryLower.includes('algo')) {
    return 'from-cyan-500 to-cyan-700';
  } else if (categoryLower.includes('web') || categoryLower.includes('frontend')) {
    return 'from-pink-500 to-pink-700';
  } else if (categoryLower.includes('database') || categoryLower.includes('sql')) {
    return 'from-gray-600 to-gray-800';
  }
  return 'from-slate-500 to-slate-700';
};

const formatCategoryName = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function TestCategoryCard({ category, testCount, onClick }) {
  const icon = getCategoryIcon(category);
  const colorClass = getCategoryColor(category);
  const formattedName = formatCategoryName(category);

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClass} text-white rounded-lg p-6 cursor-pointer 
                 transform transition-all duration-200 hover:scale-105 hover:shadow-lg 
                 border border-transparent hover:border-white/20`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{formattedName}</h3>
            <p className="text-sm opacity-90">
              {testCount} {testCount === 1 ? 'test' : 'tests'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{testCount}</div>
          <div className="text-xs opacity-75">Available</div>
        </div>
      </div>
    </div>
  );
}