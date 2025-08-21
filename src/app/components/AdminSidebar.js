import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  LogOut, 
  Code2, 
  ListChecks, 
  Settings, 
  ChevronRight,
  BarChart3,
  FileText,
  Shield,
  Database,
  Activity,
  Bell,
  HelpCircle
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { 
    label: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  { 
    label: 'Students', 
    href: '/admin/students', 
    icon: Users,
    description: 'Manage student accounts'
  },
  { 
    label: 'Technical Courses', 
    href: '/admin/problems', 
    icon: Code2,
    description: 'Coding challenges'
  },
  { 
    label: 'Apptitude', 
    href: '/admin/tests', 
    icon: ListChecks,
    description: 'Tests and assessments'
  },
  { 
    label: 'MCQs', 
    href: '/admin/mcqs', 
    icon: FileText,
    description: 'Multiple choice questions'
  },
  { 
    label: 'Submissions', 
    href: '/admin/submissions', 
    icon: BookOpen,
    description: 'Code submissions'
  },
];

const adminTools = [
  { 
    label: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3,
    description: 'Detailed reports'
  },
  { 
    label: 'System', 
    href: '/admin/system', 
    icon: Database,
    description: 'System monitoring'
  },
  { 
    label: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'Platform configuration'
  },
  { 
    label: 'Security', 
    href: '/admin/security', 
    icon: Shield,
    description: 'Access control'
  },
];

export default function AdminSidebar({ onLogout }) {
  const pathname = usePathname();
  
  return (
    <aside className="sticky top-0 h-screen w-20 md:w-64 bg-white shadow-xl flex flex-col z-30 transition-all duration-200">
      {/* Logo / App Name */}
      <div className="flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-lg shadow-lg" />
        <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
      </div>
      
      {/* Admin Badge */}
      <div className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-indigo-50">
        <Shield className="h-5 w-5 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-700">Admin Dashboard</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-6 px-3 md:px-4">
          {/* Primary Navigation */}
          <div className="mb-6">
            <h3 className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Main Navigation
            </h3>
            <div className="space-y-1">
              {navItems.map(({ label, href, icon: Icon, description }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base transition-all duration-150
                      ${isActive 
                        ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-semibold shadow-sm' 
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                    <div className="hidden md:block flex-1">
                      <span>{label}</span>
                      <p className="text-xs text-gray-500 mt-1 font-normal">{description}</p>
                    </div>
                    <ChevronRight className={`hidden md:block h-4 w-4 ml-auto transition-transform duration-200
                      ${isActive ? 'text-indigo-600 translate-x-0' : 'text-gray-300 -translate-x-2 group-hover:translate-x-0 group-hover:text-indigo-600'}
                    `} />
                  </Link>
                );
              })}
            </div>
          </div>



          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Link
                href="/admin/students/create"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all duration-150"
              >
                <Users className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                <span className="hidden md:inline">Add Student</span>
              </Link>
              <Link
                href="/admin/problems/create"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all duration-150"
              >
                <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                <span className="hidden md:inline">Create Problem</span>
              </Link>
              <Link
                href="/admin/tests/create"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all duration-150"
              >
                <ListChecks className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                <span className="hidden md:inline">Create Test</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto border-t border-gray-100 p-3 md:p-4 space-y-2">
        {/* Help & Support */}
        {/* <Link
          href="/admin/help"
          className="group flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 font-medium text-base transition-colors"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          <span className="hidden md:inline">Help & Support</span>
        </Link> */}

        {/* Notifications */}
        {/* <button className="group flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-700 font-medium text-base transition-colors">
          <Bell className="h-5 w-5 text-gray-400 group-hover:text-amber-600" />
          <span className="hidden md:inline">Notifications</span>
          <span className="hidden md:inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full ml-auto">
            3
          </span>
        </button> */}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="group flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium text-base transition-colors"
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
} 