'use client';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  LogOut, 
  Code2, 
  ListChecks, 
  UserCircle, 
  FileText, 
  ChevronRight, 
  GraduationCap,
  Target,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  Bookmark,
  Star,
  Clock,
  Award,
  Zap,
  Lightbulb,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StudentProfileCard from './StudentProfileCard';

const navItems = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & progress',
    badge: null
  },
  { 
    label: 'Profile', 
    href: '/dashboard/profile', 
    icon: UserCircle,
    description: 'Personal information',
    badge: null
  },
  { 
    label: 'Technical Courses', 
    href: '/dashboard/problems', 
    icon: Code2,
    description: 'Coding challenges',
    badge: 'New'
  },
  { 
    label: 'Aptitude Tests', 
    href: '/dashboard/tests', 
    icon: Trophy,
    description: 'Assessments & MCQs',
    badge: null
  },
  { 
    label: 'My Submissions', 
    href: '/dashboard/submissions', 
    icon: FileText,
    description: 'Code submissions',
    badge: null
  },
  // { 
  //   label: 'Progress Tracking', 
  //   href: '/dashboard/progress', 
  //   icon: TrendingUp,
  //   description: 'Learning analytics',
  //   badge: 'Pro'
  // },
  // { 
  //   label: 'Study Groups', 
  //   href: '/dashboard/groups', 
  //   icon: Users,
  //   description: 'Collaborate with peers',
  //   badge: null
  // },
  // { 
  //   label: 'Resources', 
  //   href: '/dashboard/resources', 
  //   icon: BookOpen,
  //   description: 'Study materials',
  //   badge: null
  // },
  // { 
  //   label: 'Achievements', 
  //   href: '/dashboard/achievements', 
  //   icon: Award,
  //   description: 'Badges & rewards',
  //   badge: null
  // }
];

const quickActions = [
  { label: 'Start Practice', icon: Zap, action: 'practice', color: 'bg-green-500' },
  { label: 'Take Test', icon: Target, action: 'test', color: 'bg-blue-500' },
  // { label: 'View Progress', icon: BarChart3, action: 'progress', color: 'bg-purple-500' },
  // { label: 'Get Help', icon: HelpCircle, action: 'help', color: 'bg-orange-500' }
];

export default function StudentSidebar({ onLogout }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [weeklyProgress, setWeeklyProgress] = useState({
    dayStreak: 0,
    completed: 0,
    progress: 0,
    rank: 'Top 50%',
    points: 0,
    solvedProblems: 0,
    totalProblems: 0
  });
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchWeeklyProgress();
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Only redirect if user is admin and we have router access
        if (data.user.role === 'admin' && typeof window !== 'undefined') {
          window.location.href = '/admin/dashboard';
        }
      } else if (res.status === 401) {
        // Only redirect if we have router access
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only redirect if we have router access
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const fetchWeeklyProgress = async () => {
    try {
      const res = await fetch('/api/user/weekly-progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWeeklyProgress(data);
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'practice':
        window.location.href = '/dashboard/problems';
        break;
      case 'test':
        window.location.href = '/dashboard/tests';
        break;
      case 'progress':
        window.location.href = '/dashboard/progress';
        break;
      case 'help':
        window.location.href = '/dashboard/help';
        break;
      default:
        break;
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? 'main' : section);
  };

  const pathname = usePathname();
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';
  const progressPercentage = weeklyProgress.totalProblems > 0 ? Math.round((weeklyProgress.solvedProblems / weeklyProgress.totalProblems) * 100) : 0;

  // Mobile menu component
  const MobileMenu = () => (
    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Profile Section */}
        <div className="p-4 border-b border-gray-200">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4">
          {navItems.map(({ label, href, icon: Icon, description, badge }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                pathname === href
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {badge && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </Link>
          ))}
        </nav>

        {/* Mobile Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(({ label, icon: Icon, action, color }) => (
              <button
                key={action}
                onClick={() => {
                  handleQuickAction(action);
                  setIsMobileMenuOpen(false);
                }}
                className={`${color} text-white p-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Stats Summary */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
            This Week
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-indigo-50 rounded-lg p-2">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-indigo-200 rounded mb-1"></div>
                  <div className="h-3 bg-indigo-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold text-indigo-700">{weeklyProgress.dayStreak}</div>
                  <div className="text-xs text-indigo-600">Day Streak</div>
                </>
              )}
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-green-200 rounded mb-1"></div>
                  <div className="h-3 bg-green-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold text-green-700">{weeklyProgress.completed}</div>
                  <div className="text-xs text-green-600">Completed</div>
                </>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-purple-200 rounded mb-1"></div>
                  <div className="h-3 bg-purple-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold text-purple-700">{progressPercentage}%</div>
                  <div className="text-xs text-purple-600">Progress</div>
                </>
              )}
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-yellow-50 rounded-lg p-2 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-yellow-200 rounded mb-1"></div>
                  <div className="h-3 bg-yellow-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-yellow-700">{weeklyProgress.rank}</div>
                  <div className="text-xs text-yellow-600">Rank</div>
                </>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-blue-200 rounded mb-1"></div>
                  <div className="h-3 bg-blue-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-blue-700">{weeklyProgress.points}</div>
                  <div className="text-xs text-blue-600">Points</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-white shadow-xl flex flex-col z-30 transition-all duration-300 overflow-y-auto ${
        isCollapsed ? 'w-20' : 'w-20 md:w-72'
      }`}>
        {/* Logo / App Name */}
        <div className="sticky top-0 z-10 flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg shadow-lg" />
          {!isCollapsed && (
            <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
          )}
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-100">
          {user && (
            <StudentProfileCard 
              user={user} 
              isCollapsed={isCollapsed}
              notifications={notifications}
              onNotificationClick={() => setNotifications(0)}
            />
          )}
          {!user && (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="animate-pulse">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-100">
          <h3 className={`text-sm font-semibold text-gray-700 mb-3 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed && 'Quick Actions'}
          </h3>
          <div className={`grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {quickActions.map(({ label, icon: Icon, action, color }) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className={`${color} text-white p-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity ${
                  isCollapsed ? 'p-2' : ''
                }`}
                title={isCollapsed ? label : undefined}
              >
                <Icon className={`${isCollapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4 mr-2'} inline`} />
                {!isCollapsed && label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="p-4">
            <h3 className={`text-sm font-semibold text-gray-700 mb-3 ${isCollapsed ? 'text-center' : ''}`}>
              {!isCollapsed && 'Navigation'}
            </h3>
            {navItems.map(({ label, href, icon: Icon, description, badge }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors group ${
                  pathname === href
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{label}</span>
                      {badge && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex-shrink-0">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{description}</p>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Stats Summary */}
          <div className={`${!isCollapsed ? 'hidden md:block' : 'hidden'} px-4 py-4 border-b border-gray-100`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
              This Week
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-indigo-50 rounded-lg p-2">
                {progressLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-indigo-200 rounded mb-1"></div>
                    <div className="h-3 bg-indigo-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-indigo-700">{weeklyProgress.dayStreak}</div>
                    <div className="text-xs text-indigo-600">Day Streak</div>
                  </>
                )}
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                {progressLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-green-200 rounded mb-1"></div>
                    <div className="h-3 bg-green-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-green-700">{weeklyProgress.completed}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </>
                )}
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                {progressLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-purple-200 rounded mb-1"></div>
                    <div className="h-3 bg-purple-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-purple-700">{progressPercentage}%</div>
                    <div className="text-xs text-purple-600">Progress</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-yellow-50 rounded-lg p-2 text-center">
                {progressLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-yellow-200 rounded mb-1"></div>
                    <div className="h-3 bg-yellow-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-yellow-700">{weeklyProgress.rank}</div>
                    <div className="text-xs text-yellow-600">Rank</div>
                  </>
                )}
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                {progressLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-blue-200 rounded mb-1"></div>
                    <div className="h-3 bg-blue-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-blue-700">{weeklyProgress.points}</div>
                    <div className="text-xs text-blue-600">Points</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="p-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
} 