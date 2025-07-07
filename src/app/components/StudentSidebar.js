'use client';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Trophy, LogOut, Code2, ListChecks, UserCircle, FileText, ChevronRight, GraduationCap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Problems', href: '/dashboard/problems', icon: Code2 },
  { label: 'Tests', href: '/dashboard/tests', icon: Trophy },
  { label: 'My Submissions', href: '/dashboard/submissions', icon: FileText },
];

export default function StudentSidebar({ onLogout }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
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
  const pathname = usePathname();
  // Get initials for profile section
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';
  return (
    <aside className="sticky top-0 h-screen w-20 md:w-64 bg-white shadow-xl flex flex-col z-30 transition-all duration-200">
      {/* Logo / App Name */}
      <div className="flex items-center justify-center md:justify-start h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg shadow-lg" />
        <span className="hidden md:inline ml-3 text-xl font-bold text-white tracking-tight">Zenith Mentor</span>
      </div>
      {/* Profile Section */}
      <div className="hidden md:flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-indigo-50">
        {user ? (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-lg font-bold text-white shadow-md">
            {initials}
          </div>
        ) : (
          <UserCircle className="w-10 h-10 text-indigo-600" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-indigo-700 text-base leading-tight">
            {user ? `${user.firstName} ${user.lastName}` : 'Student'}
          </span>
          <div className="flex items-center gap-1 text-xs text-indigo-600/80">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Student</span>
          </div>
        </div>
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
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-base transition-all duration-200 shadow-sm group"
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
} 