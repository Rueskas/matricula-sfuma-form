import React from 'react';
import { Music, FileText, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: 'enrollment' | 'admin' | 'privacy';
  setActiveTab: (tab: 'enrollment' | 'admin' | 'privacy') => void;
  registrationsCount: number;
  isAdminModeEnabled?: boolean;
}

export default function Header({ activeTab, setActiveTab, registrationsCount, isAdminModeEnabled }: HeaderProps) {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-12 max-w-[1280px] mx-auto h-16 md:h-24">
        {/* Logo and Institution Title with sharp corner box */}
        <div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer select-none"
          onClick={() => setActiveTab('enrollment')}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center  rounded-sm p-1.5 shrink-0">
            <img 
              alt="Logo SFUMA" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
              src="logo.ico"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=100&auto=format&fit=crop&q=60';
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-primary font-display font-bold uppercase tracking-widest text-sm md:text-lg leading-tight">
              Escuela de Música Santa Cecilia
            </h1>
            <p className="text-on-surface-variant font-sans text-[10px] md:text-xs font-semibold tracking-tight uppercase">
              AGOST | MATRÍCULA 2026-2027
            </p>
          </div>
        </div>

        {/* Formulario Digital identifier or tabs */}
        <div className="flex items-center gap-4">
          

          {/* Navigation Tabs */}
          <nav className="flex gap-1 md:gap-4 items-center">
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 rounded-t-sm ${
                activeTab === 'enrollment'
                  ? 'text-primary border-primary bg-primary/5'
                  : 'text-on-surface-variant hover:text-primary hover:bg-slate-50 border-transparent'
              }`}
            >
              <Music className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Inscripción</span>
              <span className="sm:hidden">Altas</span>
            </button>

            {isAdminModeEnabled && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 rounded-t-sm relative ${
                  activeTab === 'admin'
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-on-surface-variant hover:text-primary hover:bg-slate-50 border-transparent'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Matrículas</span>
                <span className="sm:hidden">Lista</span>
                {registrationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {registrationsCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
