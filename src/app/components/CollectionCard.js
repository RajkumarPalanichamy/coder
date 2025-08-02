import Link from 'next/link';
import { Book, BookOpen, GraduationCap, Target, Users, Brain, Zap, Trophy } from 'lucide-react';

const getCollectionIcon = (collection) => {
  switch (collection.toLowerCase()) {
    case 'aptitude':
    case 'reasoning':
      return <Brain className="h-12 w-12 text-purple-500" />;
    case 'technical':
    case 'programming':
      return <BookOpen className="h-12 w-12 text-blue-500" />;
    case 'verbal':
    case 'english':
      return <Book className="h-12 w-12 text-green-500" />;
    case 'quantitative':
    case 'math':
    case 'numerical':
      return <Target className="h-12 w-12 text-red-500" />;
    case 'general':
    case 'knowledge':
      return <GraduationCap className="h-12 w-12 text-indigo-500" />;
    case 'soft skills':
    case 'communication':
      return <Users className="h-12 w-12 text-pink-500" />;
    case 'competitive':
    case 'contest':
      return <Trophy className="h-12 w-12 text-yellow-500" />;
    case 'quick':
    case 'rapid':
      return <Zap className="h-12 w-12 text-orange-500" />;
    default:
      return <BookOpen className="h-12 w-12 text-gray-500" />;
  }
};

const getCollectionColor = (collection) => {
  switch (collection.toLowerCase()) {
    case 'aptitude':
    case 'reasoning':
      return 'from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700';
    case 'technical':
    case 'programming':
      return 'from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700';
    case 'verbal':
    case 'english':
      return 'from-green-400 to-green-600 hover:from-green-500 hover:to-green-700';
    case 'quantitative':
    case 'math':
    case 'numerical':
      return 'from-red-400 to-red-600 hover:from-red-500 hover:to-red-700';
    case 'general':
    case 'knowledge':
      return 'from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700';
    case 'soft skills':
    case 'communication':
      return 'from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700';
    case 'competitive':
    case 'contest':
      return 'from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700';
    case 'quick':
    case 'rapid':
      return 'from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700';
    default:
      return 'from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700';
  }
};

const getBorderColor = (collection) => {
  switch (collection.toLowerCase()) {
    case 'aptitude':
    case 'reasoning':
      return 'border-purple-200 hover:border-purple-300';
    case 'technical':
    case 'programming':
      return 'border-blue-200 hover:border-blue-300';
    case 'verbal':
    case 'english':
      return 'border-green-200 hover:border-green-300';
    case 'quantitative':
    case 'math':
    case 'numerical':
      return 'border-red-200 hover:border-red-300';
    case 'general':
    case 'knowledge':
      return 'border-indigo-200 hover:border-indigo-300';
    case 'soft skills':
    case 'communication':
      return 'border-pink-200 hover:border-pink-300';
    case 'competitive':
    case 'contest':
      return 'border-yellow-200 hover:border-yellow-300';
    case 'quick':
    case 'rapid':
      return 'border-orange-200 hover:border-orange-300';
    default:
      return 'border-gray-200 hover:border-gray-300';
  }
};

const formatCollectionName = (collection) => {
  return collection.charAt(0).toUpperCase() + collection.slice(1);
};

export default function CollectionCard({ collection, testCount, href, onClick }) {
  const CardContent = () => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getCollectionColor(collection)} text-white rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group border-2 ${getBorderColor(collection)} h-32`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-125"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-8 -mb-8 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex items-center space-x-4 h-full">
        {/* Icon */}
        <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm group-hover:bg-opacity-30 transition-all duration-300 flex-shrink-0">
          {getCollectionIcon(collection)}
        </div>
        
        {/* Collection Name and Count */}
        <div className="flex-1">
          <h3 className="text-xl font-bold tracking-wide">{formatCollectionName(collection)}</h3>
          <p className="text-white text-opacity-80 text-sm">{testCount} tests</p>
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