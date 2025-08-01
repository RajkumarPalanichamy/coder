import Link from 'next/link';
import { Code, FileCode, Coffee, Laptop, Hash, Terminal } from 'lucide-react';

const getLanguageIcon = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return <FileCode className="h-12 w-12 text-yellow-500" />;
    case 'python':
      return <Code className="h-12 w-12 text-blue-500" />;
    case 'java':
      return <Coffee className="h-12 w-12 text-red-500" />;
    case 'cpp':
    case 'c++':
      return <Terminal className="h-12 w-12 text-blue-600" />;
    case 'csharp':
    case 'c#':
      return <Terminal className="h-12 w-12 text-purple-600" />;
    case 'c':
      return <Hash className="h-12 w-12 text-gray-600" />;
    case 'go':
      return <Terminal className="h-12 w-12 text-cyan-600" />;
    case 'rust':
      return <Terminal className="h-12 w-12 text-orange-600" />;
    case 'kotlin':
      return <Terminal className="h-12 w-12 text-violet-600" />;
    default:
      return <Laptop className="h-12 w-12 text-gray-500" />;
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
    case 'csharp':
    case 'c#':
      return 'from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800';
    case 'c':
      return 'from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800';
    case 'go':
      return 'from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800';
    case 'rust':
      return 'from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800';
    case 'kotlin':
      return 'from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800';
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
    case 'csharp':
    case 'c#':
      return 'border-purple-200 hover:border-purple-300';
    case 'c':
      return 'border-gray-200 hover:border-gray-300';
    case 'go':
      return 'border-cyan-200 hover:border-cyan-300';
    case 'rust':
      return 'border-orange-200 hover:border-orange-300';
    case 'kotlin':
      return 'border-violet-200 hover:border-violet-300';
    default:
      return 'border-gray-200 hover:border-gray-300';
  }
};

const formatLanguageName = (language) => {
  switch (language.toLowerCase()) {
    case 'cpp':
      return 'C++';
    case 'csharp':
      return 'C#';
    case 'javascript':
      return 'JavaScript';
    default:
      return language.charAt(0).toUpperCase() + language.slice(1);
  }
};

export default function LanguageCard({ language, problemCount, href, onClick }) {
  const CardContent = () => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getLanguageColor(language)} text-white rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group border-2 ${getBorderColor(language)} h-32`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-125"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-8 -mb-8 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex items-center space-x-4 h-full">
        {/* Icon */}
        <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm group-hover:bg-opacity-30 transition-all duration-300 flex-shrink-0">
          {getLanguageIcon(language)}
        </div>
        
        {/* Language Name */}
        <div className="flex-1">
          <h3 className="text-xl font-bold tracking-wide">{formatLanguageName(language)}</h3>
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