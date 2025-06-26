import Link from 'next/link';
import { Users, BookOpen, LayoutDashboard, LogOut, Code2, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Problems', href: '/admin/problems', icon: BookOpen },
  // { label: 'MCQ Management', href: '/admin/mcqs', icon: BookOpen },
  { label: 'Tests', href: '/admin/tests', icon: ListChecks },
  // { label: 'MCQs by Test', href: '/admin/mcqs-by-test', icon: BookOpen },
  // { label: 'Test Management', href: '/admin/tests', icon: BookOpen },
  // { label: 'Students', href: '/admin/students', icon: Users },
];

export default function AdminSidebar({ onLogout }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 h-screen w-20 md:w-64 bg-white shadow-lg flex flex-col z-30 transition-all duration-200">
      {/* Logo / App Name */}
      <div className="flex items-center justify-center md:justify-start h-16 px-4 border-b border-indigo-100">
        <Code2 className="h-8 w-8 text-indigo-600" />
        <span className="hidden md:inline ml-2 text-xl font-bold text-indigo-700 tracking-tight">Zenith Mentor</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 py-6 px-2 md:px-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-base transition-colors
                ${isActive ? 'bg-indigo-100 text-indigo-700 font-semibold shadow' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}
                ${isActive ? 'border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}
              `}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="mt-auto mb-4 px-2 md:px-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium text-base transition-colors"
        >
          <LogOut className="h-6 w-6" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
} 