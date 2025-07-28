import Link from 'next/link';
import { Code, FileCode, Coffee, Laptop, Hash, Terminal } from 'lucide-react';

const getLanguageIcon = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return <FileCode className="h-8 w-8 text-yellow-500" />;
    case 'python':
      return <Code className="h-8 w-8 text-blue-500" />;
    case 'java':
      return <Coffee className="h-8 w-8 text-red-500" />;
    case 'cpp':
    case 'c++':
      return <Terminal className="h-8 w-8 text-blue-600" />;
    case 'c':
      return <Hash className="h-8 w-8 text-gray-600" />;
    default:
      return <Laptop className="h-8 w-8 text-gray-500" />;
  }
};

const getLanguageColor = (language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return 'from-yellow-400 to-yellow-600';
    case 'python':
      return 'from-blue-400 to-blue-600';
    case 'java':
      return 'from-red-400 to-red-600';
    case 'cpp':
    case 'c++':
      return 'from-blue-500 to-blue-700';
    case 'c':
      return 'from-gray-500 to-gray-700';
    default:
      return 'from-gray-400 to-gray-600';
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
    <div className={`relative overflow-hidden bg-gradient-to-br ${getLanguageColor(language)} text-white rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-110"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {getLanguageIcon(language)}
          {/* <div className="text-right">
            <div className="text-2xl font-bold">{problemCount}</div>
            <div className="text-sm opacity-90">Problems</div>
          </div> */}
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{formatLanguageName(language)}</h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
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