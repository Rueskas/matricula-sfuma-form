import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorString(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save to browser session storage first
        sessionStorage.setItem('sfuma_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setErrorString(data.error || 'La contraseña es incorrecta o el servidor no responde.');
      }
    } catch (err) {
      setErrorString('Error de conexión con el servidor. Verifique que la aplicación esté corriendo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-md w-full mx-auto my-12"
      id="admin-login-wrapper"
    >
      <div className="bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner de Cabecera */}
        <div className="bg-primary text-white px-6 py-6 flex items-center gap-4 border-b border-emerald-950">
          <div className="p-3 bg-emerald-950 rounded-xs text-secondary">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-sans font-bold tracking-tight text-lg uppercase">Acceso Restringido</h2>
            <p className="text-emerald-200 text-[11px] leading-tight mt-0.5">
              Portal de Administración • Directiva de la S.F. Unión Musical de Agost
            </p>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-slate-600 font-sans text-xs leading-relaxed text-center">
            Consola administrativa para el personal habilitado de la Escuela de Música Santa Cecilia de Agost. Por favor, introduzca la contraseña de acceso ordinario:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Introduzca la clave maestra..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xs pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white placeholder-slate-400 font-sans transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorString && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border-l-2 border-red-500 p-3 flex gap-2.5 rounded-r-xs"
              >
                <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-red-800 text-[11px] font-sans font-medium leading-relaxed">
                  {errorString}
                </span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#001c11] hover:bg-[#003322] text-white font-bold py-3 text-xs uppercase tracking-widest shadow-sm rounded-xs transition-all cursor-pointer"
            >
              {isSubmitting ? 'Verificando seguridad...' : 'Acceder al panel'}
            </button>
          </form>
        </div>

        {/* Pie de Firma de Seguridad */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          
        </div>
      </div>
    </motion.div>
  );
}
