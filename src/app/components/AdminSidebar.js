import Link from 'next/link';
import { Users, BookOpen, LayoutDashboard, LogOut, Code2, ListChecks, Settings, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Problems', href: '/admin/problems', icon: Code2 },
  { label: 'Tests', href: '/admin/tests', icon: ListChecks },
  { label: 'Submissions', href: '/admin/submissions', icon: BookOpen },
];

export default function AdminSidebar({ onLogout }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 h-screen w-20 md:w-64 bg-white shadow-xl flex flex-col z-30 transition-all duration-200">
      {/* Logo / App Name */}
      <div className="flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg shadow-lg" />
        <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
      </div>
      
      {/* Admin Badge */}
      <div className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-indigo-50">
        <Settings className="h-5 w-5 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-700">Admin Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 py-6 px-3 md:px-4 bg-white">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base transition-all duration-150
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}
                group relative
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
              <span className="hidden md:inline">{label}</span>
              <ChevronRight className={`hidden md:block h-4 w-4 ml-auto transition-transform duration-200
                ${isActive ? 'text-indigo-600 translate-x-0' : 'text-gray-300 -translate-x-2 group-hover:translate-x-0 group-hover:text-indigo-600'}
              `} />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto mb-6 px-3 md:px-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg text-red-600 hover:bg-red-50 font-medium text-base transition-colors group"
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
} 