import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Salad,
  BookOpen,
  TrendingUp,
  Dumbbell,
  Target,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard className="size-4" />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Salad className="size-4" />,          label: 'Nutrition',  to: '/nutrition' },
  { icon: <BookOpen className="size-4" />,        label: 'Knowledge',  to: '/knowledge' },
  { icon: <TrendingUp className="size-4" />,      label: 'Progress',   to: '/progress',  disabled: true },
  { icon: <Dumbbell className="size-4" />,        label: 'Workouts',   to: '/workouts',  disabled: true },
  { icon: <Target className="size-4" />,          label: 'Goals',      to: '/goals',     disabled: true },
  { icon: <Settings className="size-4" />,        label: 'Settings',   to: '/settings',  disabled: true },
];

export default function Sidebar() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clearAuth();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
          <Zap className="size-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          AI Fitness
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menu
        </p>
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/40 cursor-not-allowed'
                  )}
                >
                  {item.icon}
                  {item.label}
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">
                    Soon
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Coming soon</TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Footer — Sign out */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          id="btn-sidebar-logout"
          variant="ghost"
          className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
