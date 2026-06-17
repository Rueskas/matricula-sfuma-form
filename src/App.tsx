import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import Footer from './components/Footer';
import { Registration } from './types';

// Standard high-fidelity mock data for instant demo testing


export default function App() {
  const [activeTab, setActiveTab ] = useState<'enrollment' | 'admin' | 'privacy'>('enrollment');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdminModeEnabled, setIsAdminModeEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('sfuma_admin_token') || null;
  });
  // Check query parameters or hashes for enabling Admin Portal link visibility
  useEffect(() => {
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const hasAdminParam = params.get('portal') === 'directiva';
      if (hasAdminParam) {
        setIsAdminModeEnabled(true);
      }
    };

    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    return () => window.removeEventListener('hashchange', handleUrlCheck);
  }, []);

  // Load submissions from full-stack backend API on mount
    useEffect(() => {
    const fetchRegistrations = async () => {
      if (!adminToken) {
        setRegistrations([]);
        return;
      }
      try {
        const response = await fetch('/api/registrations', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRegistrations(data);
        } else if (response.status === 401) {
          // Token expired, rejected or modified on server restart
          console.warn('Sesión de administración inválida o requerida por el backend. Cerrando.');
          setAdminToken(null);
          sessionStorage.removeItem('sfuma_admin_token');
        } else {
          console.error('Failed to load registrations from database API');
        }
      } catch (err) {
        console.error('Error connecting to registrations database:', err);
      }
    };
    fetchRegistrations();
  }, [adminToken]);

    // Add individual submission via API (Public Route)
  const handleRegister = async (formData: Omit<Registration, 'id' | 'fechaRegistro'>) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newReg = await response.json();
        // Only update local array if user is already logged in as admin to keep sync
        if (adminToken) {
          setRegistrations(prev => [newReg, ...prev]);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al guardar la matrícula en el servidor: ${errData.error || 'Inténtelo más tarde'}`);
      }
    } catch (err) {
      console.error('Connection failure during registration submit:', err);
      alert('Error de conexión. Asegúrate de que el servidor está online antes de volver a intentarlo.');
    }
  };

  // Delete submission via API (Admin protected)
  const handleDeleteRegistration = async (id: string) => {
    if (!adminToken) return;
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Error al intentar borrar el registro del servidor. Puede que su sesión haya caducado.');
      }
    } catch (err) {
      console.error('Connection error during deletion:', err);
      alert('Error de conexión al procesar la baja.');
    }
  };


  // Clear all registrations via API (Admin protected)
  const handleClearAll = async () => {
    if (!adminToken) return;
    try {
      const response = await fetch('/api/registrations/clear-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.ok) {
        setRegistrations([]);
      } else {
        alert('Error al intentar vaciar la base de datos.');
      }
    } catch (err) {
      console.error('Connection error during table clean:', err);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem('sfuma_admin_token');
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header bar and branding */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        registrationsCount={registrations.length}
        isAdminModeEnabled={isAdminModeEnabled}
      />

      {/* Main Focus Area Container */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 md:px-12 py-8 space-y-8 font-sans">
        {activeTab === 'enrollment' && (
          <RegistrationForm 
            onRegister={handleRegister} 
            onNavigateToPrivacy={() => setActiveTab('privacy')}
          />
        )}

        {activeTab === 'admin' && (
          adminToken ? (
            <AdminPanel 
              registrations={registrations} 
              onDeleteRegistration={handleDeleteRegistration} 
              onClearAll={handleClearAll}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin onLoginSuccess={setAdminToken} />
          )
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyView 
            onBackToForm={() => setActiveTab('enrollment')} 
          />
        )}
      </main>

      {/* Footer bar */}
      <Footer 
        onNavigate={setActiveTab} 
        isAdminModeEnabled={isAdminModeEnabled}
      />
    </div>
  );
}
