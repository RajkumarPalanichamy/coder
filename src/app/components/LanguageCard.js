import Link from 'next/link';
import { Code, FileCode, Coffee, Laptop, Hash, Terminal } from 'lucide-react';

const getLanguageIcon = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return <FileCode className="h-16 w-16 text-yellow-500" />;
    case 'python':
      return <Code className="h-16 w-16 text-blue-500" />;
    case 'java':
      return <Coffee className="h-16 w-16 text-red-500" />;
    case 'cpp':
    case 'c++':
      return <Terminal className="h-16 w-16 text-blue-600" />;
    case 'c':
      return <Hash className="h-16 w-16 text-gray-600" />;
    default:
      return <Laptop className="h-16 w-16 text-gray-500" />;
  }
};

const getLanguageColor = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return 'from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700';
    case 'python':
      return 'from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700';
    case 'java':
      return 'from-red-400 to-red-600 hover:from-red-500 hover:to-red-700';
    case 'cpp':
    case 'c++':
      return 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800';
    case 'c':
      return 'from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800';
    default:
      return 'from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700';
  }
};

const getBorderColor = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return 'border-yellow-200 hover:border-yellow-300';
    case 'python':
      return 'border-blue-200 hover:border-blue-300';
    case 'java':
      return 'border-red-200 hover:border-red-300';
    case 'cpp':
    case 'c++':
      return 'border-blue-200 hover:border-blue-300';
    case 'c':
      return 'border-gray-200 hover:border-gray-300';
    default:
      return 'border-gray-200 hover:border-gray-300';
  }
};

const formatLanguageName = (language) => {
  switch (language.toLowerCase()) {
    case 'cpp':
      return 'C++';
    case 'javascript':
      return 'JavaScript';
    default:
      return language.charAt(0).toUpperCase() + language.slice(1);
  }
};

export default function LanguageCard({ language, problemCount, href, onClick }) {
  const CardContent = () => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getLanguageColor(language)} text-white rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group border-2 ${getBorderColor(language)}`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        {/* Large Icon */}
        <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm group-hover:bg-opacity-30 transition-all duration-300">
          {getLanguageIcon(language)}
        </div>
        
        {/* Language Name */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-wide">{formatLanguageName(language)}</h3>
          {problemCount !== undefined && (
            <div className="text-white text-opacity-90">
              <span className="text-lg font-semibold">{problemCount}</span>
              <span className="text-sm ml-1">Problem{problemCount !== 1 ? 's' : ''}</span>
            </div>
          )}
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