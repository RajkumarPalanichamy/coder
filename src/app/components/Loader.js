import { Loader2, Code2, Trophy, BookOpen } from 'lucide-react';

export default function Loader({ 
  type = 'default', 
  message = 'Loading...', 
  size = 'medium',
  className = '' 
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'h-4 w-4';
      case 'large': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'languages':
        return <Code2 className={`${getSizeClasses()} text-indigo-500 animate-pulse`} />;
      case 'levels':
        return <Trophy className={`${getSizeClasses()} text-indigo-500 animate-pulse`} />;
      case 'problems':
        return <BookOpen className={`${getSizeClasses()} text-indigo-500 animate-pulse`} />;
      default:
        return <Loader2 className={`${getSizeClasses()} text-indigo-500 animate-spin`} />;
    }
  };

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-6 h-32">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-8 bg-gray-400 rounded"></div>
                <div className="text-right">
                  <div className="h-6 w-8 bg-gray-400 rounded mb-1"></div>
                  <div className="h-3 w-12 bg-gray-400 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-gray-400 rounded"></div>
                <div className="h-4 w-4 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(7)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {getIcon()}
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}