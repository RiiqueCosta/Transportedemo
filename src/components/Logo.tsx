import React from 'react';

/** Marca Cargova: um "C" que lembra uma estrada fazendo a curva */
export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cgv-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B6CFF" />
          <stop offset="1" stopColor="#5A35F0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#cgv-g)" />
      <path d="M28.5 13.2A10 10 0 1 0 28.5 26.8" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M15 20h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2.6 2.6" opacity=".85" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={compact ? 'w-7 h-7' : 'w-8 h-8'} />
      <span className="font-display font-bold tracking-tight text-[19px] text-zinc-900 dark:text-white">
        cargova
      </span>
    </div>
  );
}
