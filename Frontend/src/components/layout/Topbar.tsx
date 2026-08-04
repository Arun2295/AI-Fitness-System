import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GOAL_LABELS: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  WEIGHT_GAIN: 'Weight Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
  GENERAL_FITNESS: 'General Fitness',
  STRENGTH: 'Strength',
  ENDURANCE: 'Endurance',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibility',
  BODYBUILDING: 'Bodybuilding',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Topbar() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clearAuth();
    navigate('/login');
  };

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] || 'User';
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="fixed top-0 right-0 left-60 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-sm">
      {/* Greeting */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {getGreeting()}, {firstName} 👋
        </span>
        <span className="text-xs text-muted-foreground">{today}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user.goal && (
          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
            {GOAL_LABELS[user.goal] || user.goal}
          </Badge>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="btn-user-menu"
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-secondary outline-none"
            >
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {firstName}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="btn-top-logout"
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
