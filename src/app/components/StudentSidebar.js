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
    badge: null,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600'
  },
  { 
    label: 'Profile', 
    href: '/dashboard/profile', 
    icon: UserCircle,
    description: 'Personal information',
    badge: null,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconColor: 'text-green-600'
  },
  { 
    label: 'Technical Courses', 
    href: '/dashboard/problems', 
    icon: Code2,
    description: 'Coding challenges',
    badge: 'New',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600'
  },
  { 
    label: 'Aptitude Tests', 
    href: '/dashboard/tests', 
    icon: Trophy,
    description: 'Assessments & MCQs',
    badge: null,
    bgColor: 'bg-yellow-100',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600'
  },
  { 
    label: 'My Submissions', 
    href: '/dashboard/submissions', 
    icon: FileText,
    description: 'Code submissions',
    badge: null,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  }
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
          {navItems.map(({ label, href, icon: Icon, description, badge, bgColor, textColor, iconColor }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-all duration-200 ${bgColor} ${textColor} hover:shadow-md hover:scale-[1.02] ${
                pathname === href
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-white-800'
                  : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {badge && (
                    <span className="text-xs bg-white bg-opacity-80 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-90">{description}</p>
              </div>
            </Link>
          ))}
        </nav>
        
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
        <div className="sticky top-0 z-10 flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-blue-500">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg shadow-lg" />
          {!isCollapsed && (
            <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
          )}
        </div>

        {/* Profile Section - Made Smaller */}
        <div className="p-3 border-b border-gray-100">
          {user && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          )}
          {!user && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              )}
            </div>
          )}
        </div>

      

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="p-4">
            <h3 className={`text-sm font-semibold text-gray-700 mb-3 ${isCollapsed ? 'text-center' : ''}`}>
              {!isCollapsed && 'Navigation'}
            </h3>
            {navItems.map(({ label, href, icon: Icon, description, badge, bgColor, textColor, iconColor }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-all duration-200 group ${bgColor} ${textColor} hover:shadow-md hover:scale-[1.02] ${
                  pathname === href
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-white-800'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{label}</span>
                                        {badge && (
                    <span className="text-xs bg-white bg-opacity-80 text-purple-700 px-2 py-1 rounded-full flex-shrink-0 font-medium">
                      {badge}
                    </span>
                  )}
                    </div>
                    <p className="text-sm truncate opacity-80">{description}</p>
                  </div>
                )}
              </Link>
            ))}
          </nav>


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