import React from 'react';
import { Zap } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  wide?: boolean;
}

export default function AuthShell({ title, subtitle, children, wide = false }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[20%] left-[20%] size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] size-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div
        className={`relative z-10 w-full ${
          wide ? 'max-w-[560px]' : 'max-w-[480px]'
        }`}
      >
        <div className="animate-fade-in-up rounded-2xl border border-border/50 bg-card/60 p-10 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Zap className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="bg-gradient-to-br from-primary/80 to-primary bg-clip-text text-xl font-bold tracking-tight text-transparent">
              AI Fitness
            </span>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
