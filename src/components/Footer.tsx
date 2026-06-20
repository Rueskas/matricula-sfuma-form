import React from 'react';
import { Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'enrollment' | 'admin' | 'privacy') => void;
  isAdminModeEnabled?: boolean;
}

export default function Footer({ onNavigate, isAdminModeEnabled }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-12 text-xs text-on-surface-variant font-medium print:hidden">
      <div className="w-full px-4 md:px-12 max-w-[1280px] mx-auto space-y-6 font-sans">
        
        {/* Main Footer blocks */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand mark */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="font-display font-black text-primary text-sm uppercase tracking-wider">
                Santa Cecilia
              </span>
            </div>
            <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider mt-0.5">
              Escuela de Música de Agost
            </p>
          </div>

          {/* Contact Details from design HTML */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-center md:text-left text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <span>Dirección: Avenida de Alicante, 23. Agost (Alicante)</span>
            <span className="hidden sm:inline">•</span>
            <span>Tel: 686 18 08 27</span>
            <span className="hidden sm:inline">•</span>
            <span>Email: unionmusicalagost@hotmail.com</span>
          </div>

          {/* Action Links */}
          <div className="flex gap-4 justify-center font-bold text-[10px] uppercase tracking-widest text-primary">
            <button 
              onClick={() => onNavigate('enrollment')}
              className="hover:underline transition-all cursor-pointer font-sans"
            >
              Inscripción
            </button>
            <button 
              onClick={() => onNavigate('privacy')}
              className="hover:underline transition-all cursor-pointer font-sans"
            >
              Política de Privacidad
            </button>
            {isAdminModeEnabled && (
              <button 
                onClick={() => onNavigate('admin')}
                className="hover:underline transition-all cursor-pointer font-sans"
              >
                Base Matrículas
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: secure status and copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200/60 pt-6 gap-4">
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center sm:text-left">
            © {currentYear} SFUMA • Portal Digital de Admisión • Escuela de Música Santa Cecilia de Agost
          </div>

        </div>

      </div>
    </footer>
  );
}
