import { Link, useRouterState } from '@tanstack/react-router';
import { Home, CheckCircle, FileText, FolderOpen, MessageCircle, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/check-benefits', icon: CheckCircle, label: 'Check Benefits' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/evidence', icon: FolderOpen, label: 'Evidence' },
  { to: '/conversational', icon: MessageCircle, label: 'AI Assistant' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppSidebar() {
  const routerState = useRouterState();

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-white h-screen p-4">
      <div className="font-bold text-2xl text-blue-600 mb-8">ClaimCompass</div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = routerState.location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}