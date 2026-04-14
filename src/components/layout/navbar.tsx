'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, LayoutDashboard, Settings2, Users2, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Personnel',
      href: '/attendance-history',
      icon: Users2,
    },
    {
      label: 'Management',
      href: '/management',
      icon: Building2,
    },
  ];

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tighter text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">ZK<span className="text-slate-900 font-bold">TECO</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={`gap-2 px-4 h-10 rounded-lg font-bold transition-all ${
                        isActive 
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-100 h-10">
              <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user?.role}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold transition-all rounded-lg h-10 px-4">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

