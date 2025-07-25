// Function to get language configuration (color, icon) based on language name
export const getLanguageConfig = (language) => {
  const configs = {
    'javascript': { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '🟨',
      displayName: 'JavaScript'
    },
    'python': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🐍',
      displayName: 'Python'
    },
    'java': { 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '☕',
      displayName: 'Java'
    },
    'cpp': { 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⚡',
      displayName: 'C++'
    },
    'c': { 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '🔧',
      displayName: 'C'
    },
    'rust': { 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '🦀',
      displayName: 'Rust'
    },
    'go': { 
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: '🐹',
      displayName: 'Go'
    },
    'kotlin': { 
      color: 'bg-violet-100 text-violet-800 border-violet-200',
      icon: '🚀',
      displayName: 'Kotlin'
    },
    'typescript': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '📘',
      displayName: 'TypeScript'
    },
    'php': { 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: '🐘',
      displayName: 'PHP'
    },
    'ruby': { 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '💎',
      displayName: 'Ruby'
    },
    'swift': { 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🍎',
      displayName: 'Swift'
    },
    'csharp': { 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '💜',
      displayName: 'C#'
    },
    'dart': { 
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: '🎯',
      displayName: 'Dart'
    },
    'scala': { 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '🔥',
      displayName: 'Scala'
    },
    'perl': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🐪',
      displayName: 'Perl'
    },
    'lua': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🌙',
      displayName: 'Lua'
    },
    'r': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '📊',
      displayName: 'R'
    },
    'matlab': { 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🔢',
      displayName: 'MATLAB'
    },
    'haskell': { 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🔮',
      displayName: 'Haskell'
    }
  };
  
  // Return config if exists, otherwise return a default config
  return configs[language.toLowerCase()] || {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '⚙️',
    displayName: language.charAt(0).toUpperCase() + language.slice(1)
  };
};