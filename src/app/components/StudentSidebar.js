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
  const [progress, setProgress] = useState({
    completed: 12,
    total: 25,
    streak: 5,
    level: 'Intermediate',
    rank: 'Top 15%',
    points: 1250
  });

  useEffect(() => {
    fetchUser();
    fetchProgress();
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
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        }
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchProgress = async () => {
    try {
      // Simulate fetching progress data
      // In real app, this would come from an API
      setProgress({
        completed: Math.floor(Math.random() * 20) + 5,
        total: 25,
        streak: Math.floor(Math.random() * 10) + 1,
        level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        rank: ['Top 5%', 'Top 15%', 'Top 25%', 'Top 50%'][Math.floor(Math.random() * 4)],
        points: Math.floor(Math.random() * 2000) + 500
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
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
  const progressPercentage = Math.round((progress.completed / progress.total) * 100);

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
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-lg font-bold text-indigo-700">
                {user.firstName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4">
          {navItems.map(({ label, href, icon: Icon, description, badge }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
                {badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => {
                  handleQuickAction(action.action);
                  setIsMobileMenuOpen(false);
                }}
                className={`${action.color} text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-all duration-200`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-colors"
          >
            Logout
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
      <aside className={`sticky top-0 h-screen bg-white shadow-xl flex flex-col z-30 transition-all duration-300 overflow-y-auto ${
        isCollapsed ? 'w-20' : 'w-20 md:w-72'
      }`}>
        {/* Logo / App Name */}
        <div className="flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg shadow-lg" />
          {!isCollapsed && (
            <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
          )}
        </div>

        {/* Profile Section */}
        <div className={`${!isCollapsed ? 'hidden md:flex' : 'hidden'} flex-col items-center px-4 pt-4 pb-2 border-b border-gray-100`}>
          {user && (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700 mb-3 border-4 border-white shadow-lg">
                  {user.firstName?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-semibold text-gray-800 text-lg leading-tight text-center mb-1">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-sm text-gray-500 mb-2">{user.email}</span>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between w-full text-xs text-gray-600">
                <span>Level {progress.level}</span>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`${!isCollapsed ? 'hidden md:block' : 'hidden'} px-4 py-4 border-b border-gray-100`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-indigo-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className={`${action.color} text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1`}
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

       

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 py-4 px-3 md:px-4 bg-white">
          {navItems.map(({ label, href, icon: Icon, description, badge }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 hover:bg-indigo-50
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-gray-600 hover:text-indigo-700'}
                `}
                title={isCollapsed ? label : undefined}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                  {!isCollapsed && (
                    <div className="hidden md:flex flex-col">
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-gray-500">{description}</span>
                    </div>
                  )}
                  {badge && !isCollapsed && (
                    <span className="hidden md:inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronRight className={`hidden md:block h-4 w-4 ml-auto transition-transform duration-200
                    ${isActive ? 'text-indigo-600 translate-x-0' : 'text-gray-300 -translate-x-2 group-hover:translate-x-0 group-hover:text-indigo-600'}
                  `} />
                )}
              </Link>
            );
          })}
        </nav>
         {/* Stats Summary */}
         <div className={`${!isCollapsed ? 'hidden md:block' : 'hidden'} px-4 py-4 border-b border-gray-100`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
            This Week
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-indigo-50 rounded-lg p-2">
              <div className="text-lg font-bold text-indigo-700">{progress.streak}</div>
              <div className="text-xs text-indigo-600">Day Streak</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-700">{progress.completed}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="text-lg font-bold text-purple-700">{progressPercentage}%</div>
              <div className="text-xs text-purple-600">Progress</div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-yellow-50 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-yellow-700">{progress.rank}</div>
              <div className="text-xs text-yellow-600">Rank</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-blue-700">{progress.points}</div>
              <div className="text-xs text-blue-600">Points</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-gray-100">
          {/* Notifications */}
          <div className={`${!isCollapsed ? 'hidden md:flex' : 'hidden'} items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors`}>
            {/* <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Notifications</span>
            </div> */}
            {/* {notifications > 0 && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                {notifications}
              </span>
            )} */}
          </div>

          {/* Settings */}
          {/* <div className={`${!isCollapsed ? 'hidden md:flex' : 'hidden'} items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors`}>
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Settings</span>
          </div> */}

          {/* Toggle Collapse Button */}
          <div className="px-3 md:px-4 py-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
              {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
            </button>
          </div>

          {/* Logout */}
          <div className="px-3 md:px-4 py-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm transition-all duration-200 shadow-sm group"
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
              {!isCollapsed && <span className="hidden md:inline">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu />}
    </>
  );
} 