import { Award, Star, Trophy, Target } from 'lucide-react';

const getLevelIcon = (level) => {
  switch (level) {
    case 'level1':
      return <Star className="h-8 w-8 text-green-500" />;
    case 'level2':
      return <Award className="h-8 w-8 text-yellow-500" />;
    case 'level3':
      return <Trophy className="h-8 w-8 text-red-500" />;
    default:
      return <Target className="h-8 w-8 text-gray-500" />;
  }
};

const getLevelColor = (level) => {
  switch (level) {
    case 'level1':
      return 'from-green-400 to-green-600';
    case 'level2':
      return 'from-yellow-400 to-yellow-600';
    case 'level3':
      return 'from-red-400 to-red-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

const formatLevelName = (level) => {
  switch (level) {
    case 'level1':
      return 'Level 1';
    case 'level2':
      return 'Level 2';
    case 'level3':
      return 'Level 3';
    default:
      return level;
  }
};

const getLevelDescription = (level) => {
  switch (level) {
    case 'level1':
      return 'Beginner';
    case 'level2':
      return 'Intermediate';
    case 'level3':
      return 'Advanced';
    default:
      return 'Unknown';
  }
};

export default function LevelCard({ level, problemCount, onClick }) {
  return (
    <div onClick={onClick}>
      <div className={`relative overflow-hidden bg-gradient-to-br ${getLevelColor(level)} text-white rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            {getLevelIcon(level)}
            <div className="text-right">
              <div className="text-2xl font-bold">{problemCount}</div>
              <div className="text-sm opacity-90">Problems</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{formatLevelName(level)}</h3>
              <p className="text-sm opacity-90">{getLevelDescription(level)}</p>
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