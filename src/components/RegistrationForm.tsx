import React, { useState, useEffect } from 'react';
import { Registration, MembershipType, FormErrors } from '../types';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (data: Omit<Registration, 'id' | 'fechaRegistro'>) => void;
  onNavigateToPrivacy?: () => void;
}

export default function RegistrationForm({ onRegister, onNavigateToPrivacy }: RegistrationFormProps) {
  // Main form fields
  const [nombre, setNombre] = useState('');
  const [dniNia, setDniNia] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [localidad, setLocalidad] = useState('Agost');
  const [provincia, setProvincia] = useState('Alicante');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  // Minor conditional toggle
  const [esMenor, setEsMenor] = useState(false);
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorDni, setTutorDni] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');

  // Whether they are a new member (esNuevoSocio)
  const [esNuevoSocio, setEsNuevoSocio] = useState(false);
  
  // Membership choice (only shown if they are a new member)
  const [modalidadSocio, setModalidadSocio] = useState<MembershipType>('individual');

  // Bank direct debit details
  const [bancoEntidad, setBancoEntidad] = useState('');
  const [bancoTitular, setBancoTitular] = useState('');
  const [bancoIban, setBancoIban] = useState('');

  // Consent checkboxes
  const [consentRGPD, setConsentRGPD] = useState(false);
  const [consentInformativo, setConsentInformativo] = useState(false);
  const [consentDomiciliacion, setConsentDomiciliacion] = useState(false);
  const [consentFotografias, setConsentFotografias] = useState(false);

  // Status & Validation
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  

  // Automatic Age Detection
  useEffect(() => {
    if (!fechaNacimiento) return;
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Auto-toggle esMenor if age < 18
    if (age > 0 && age < 18) {
      setEsMenor(true);
    } else {
      setEsMenor(false);
    }
  }, [fechaNacimiento]);

  // Form Validation Checklist
  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    
    // Student validations (All are mandatory!)
    if (!nombre.trim()) tempErrors.nombre = 'El nombre y apellidos son obligatorios';
    if (!dniNia.trim()) tempErrors.dniNia = 'El DNI o NIA es obligatorio';
    if (!fechaNacimiento) tempErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    if (!direccion.trim()) tempErrors.direccion = 'La dirección postal es obligatoria';
    if (!codigoPostal.trim()) tempErrors.codigoPostal = 'El código postal es obligatorio';
    if (!localidad.trim()) tempErrors.localidad = 'La localidad es obligatoria';
    if (!provincia.trim()) tempErrors.provincia = 'La provincia es obligatoria';
    
    if (!telefono.trim()) {
      tempErrors.telefono = 'El teléfono de contacto es obligatorio';
    }
    if (!correo.trim()) {
      tempErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      tempErrors.correo = 'El formato de correo no es válido';
    }

    // Minor/Tutor validations
    if (esMenor) {
      if (!tutorNombre.trim()) tempErrors.tutorNombre = 'El nombre del tutor legal es obligatorio';
      if (!tutorDni.trim()) tempErrors.tutorDni = 'El DNI del tutor es obligatorio';
      if (!tutorTelefono.trim()) tempErrors.tutorTelefono = 'El teléfono del tutor es obligatorio';
    }

    // Banking validations (Mandatory for direct debit)
    if (!bancoEntidad.trim()) tempErrors.bancoEntidad = 'La entidad bancaria es obligatoria';
    if (!bancoTitular.trim()) tempErrors.bancoTitular = 'El titular de la cuenta es obligatorio';
    if (!bancoIban.trim()) {
      tempErrors.bancoIban = 'El número de cuenta IBAN es obligatorio';
    } else {
      const cleanIban = bancoIban.replace(/\s+/g, '');
      if (cleanIban.length < 24) {
        tempErrors.bancoIban = 'Por favor, introduzca un IBAN válido';
      }
    }

    // Consent validations (RGPD, Informativo, Domiciliación are mandatory; Fotografías is optional!)
    if (!consentRGPD || !consentInformativo || !consentDomiciliacion) {
      tempErrors.consents = 'Debe marcar todos los consentimientos obligatorios de privacidad, tratamiento de datos y SEPA para poder continuar';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate first
    const isValid = validateForm();
    if (!isValid) {
      // Small delay to make sure state is set then scroll to the first error
      setTimeout(() => {
        const errorElement = document.querySelector('.text-rose-600');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setIsSubmitting(true);
    
    // Simulating digital deposit save
    setTimeout(() => {
      onRegister({
        nombre,
        dniNia,
        fechaNacimiento,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        telefono,
        correo,
        esMenor,
        tutor: esMenor ? {
          nombre: tutorNombre,
          dni: tutorDni,
          telefono: tutorTelefono
        } : undefined,
        esNuevoSocio,
        modalidadSocio: esNuevoSocio ? modalidadSocio : undefined,
        banco: {
          entidad: bancoEntidad,
          titular: bancoTitular,
          iban: bancoIban.toUpperCase()
        },
        consentimientos: {
          proteccionDatos: consentRGPD,
          tratamientoInformativo: consentInformativo,
          domiciliacionBancaria: consentDomiciliacion,
          fotografiasYVideos: consentFotografias
        }
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);

      // Toast clean up and fields clear
      setTimeout(() => {
        setShowSuccessToast(false);
        // Clear all fields for the next enrollment
        clearForm();
      }, 4000);
    }, 1500);
  };

  const clearForm = () => {
    setNombre('');
    setDniNia('');
    setFechaNacimiento('');
    setDireccion('');
    setCodigoPostal('');
    setLocalidad('Agost');
    setProvincia('Alicante');
    setTelefono('');
    setCorreo('');
    setEsMenor(false);
    setTutorNombre('');
    setTutorDni('');
    setTutorTelefono('');
    setEsNuevoSocio(false);
    setModalidadSocio('individual');
    setBancoEntidad('');
    setBancoTitular('');
    setBancoIban('');
    setConsentRGPD(false);
    setConsentInformativo(false);
    setConsentDomiciliacion(false);
    setConsentFotografias(false);
    setErrors({});
  };

  return (
    <div className="space-y-8">
      {/* Toast notifications */}
      {showSuccessToast && (
        <div className="fixed top-24 right-4 md:right-12 z-50 p-4 rounded-xl bg-[#f3fcf8] border border-primary text-primary shadow-xl max-w-md animate-fadeIn flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold font-display text-primary">¡Inscripción Almacenada Digitalmente!</h5>
            <p className="text-xs text-on-surface-variant mt-1">
              Los datos se han guardado con éxito. El departamento de administración revisará la información según el transcurso habitual del nuevo curso académico.
            </p>
          </div>
        </div>
      )}

      {/* Hero Header with Music Hall Image Overlay */}
      <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 shadow-md">
        <img 
          className="w-full h-full object-cover" 
          alt="Escuela de Música Santa Cecilia Agost inside"
          referrerPolicy="no-referrer"
          src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1000&auto=format&fit=crop&q=80"
          onError={(e) => {
            // Unsplash backup if server is slow
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1000&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-primary/20 flex items-end p-6 md:p-8">
          <div className="text-white">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-tight">
              Formulario de Inscripción
            </h2>
            <p className="text-sm md:text-md opacity-90 font-medium tracking-wide mt-1 text-[#bdedd4]">
              Escuela de Música Santa Cecilia de Agost
            </p>
          </div>
        </div>
      </div>

      {/* Core Enrollment Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pb-12" id="enrollmentForm" noValidate>
        
        {/* SECTION 1: Datos personales del alumno */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">1</span>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 text-primary">Datos del Alumno</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre Completo */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="student-name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Nombre y apellidos <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Escriba su nombre completo"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.nombre ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.nombre && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.nombre}</p>}
            </div>

            {/* DNI / NIA */}
            <div>
              <label htmlFor="student-dni" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                DNI / NIA <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-dni"
                type="text"
                value={dniNia}
                onChange={(e) => setDniNia(e.target.value)}
                placeholder="12345678A"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.dniNia ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.dniNia && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.dniNia}</p>}
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label htmlFor="student-birthdate" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Fecha de nacimiento <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-birthdate"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.fechaNacimiento ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.fechaNacimiento && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fechaNacimiento}</p>}
            </div>

            {/* Dirección Postal */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="student-address" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Dirección postal <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-address"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número, piso, puerta"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.direccion ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.direccion && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.direccion}</p>}
            </div>

            {/* Código postal */}
            <div>
              <label htmlFor="student-zip" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Código postal <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-zip"
                type="text"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                placeholder="03698"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.codigoPostal ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.codigoPostal && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.codigoPostal}</p>}
            </div>

            {/* Localidad */}
            <div>
              <label htmlFor="student-city" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Localidad <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-city"
                type="text"
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.localidad ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.localidad && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.localidad}</p>}
            </div>

            {/* Provincia */}
            <div>
              <label htmlFor="student-province" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Provincia <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-province"
                type="text"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.provincia ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.provincia && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.provincia}</p>}
            </div>

            {/* Teléfono móvil */}
            <div>
              <label htmlFor="student-phone" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Teléfono de contacto <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-phone"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+34 600 000 000"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.telefono ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.telefono && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.telefono}</p>}
            </div>

            {/* Correo electrónico */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="student-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Correo electrónico <span className="text-rose-600">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@ejemplo.com"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.correo ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.correo && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.correo}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: Tutor legal (Menores) */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 text-primary">Tutor Legal (Solo menores de edad)</h2>
          </div>

          <div className="space-y-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              ¿El alumno es menor de edad?
            </label>
            
            {/* Custom Radios for Yes/No */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEsMenor(true)}
                className={`flex-1 py-4 border rounded-lg text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  esMenor 
                    ? 'border-primary bg-[#f3fcf8] text-primary shadow-xs' 
                    : 'border-[#c0c8c2] text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setEsMenor(false)}
                className={`flex-1 py-4 border rounded-lg text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  !esMenor 
                    ? 'border-primary bg-[#f3fcf8] text-primary shadow-xs' 
                    : 'border-[#c0c8c2] text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                No
              </button>
            </div>

            {/* Conditional Tutor Fields */}
            {esMenor && (
              <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg talk-bubble">
                  Por favor, cumplimente los datos de contacto del tutor legal.
                </div>

                <div>
                  <label htmlFor="tutor-name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Nombre y apellidos del padre, madre o tutor legal <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="tutor-name"
                    type="text"
                    value={tutorNombre}
                    onChange={(e) => setTutorNombre(e.target.value)}
                    placeholder="Nombre completo del tutor"
                    required={esMenor}
                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                      errors.tutorNombre ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                    }`}
                  />
                  {errors.tutorNombre && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.tutorNombre}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tutor-dni" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      DNI del tutor legal <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="tutor-dni"
                      type="text"
                      value={tutorDni}
                      onChange={(e) => setTutorDni(e.target.value)}
                      placeholder="12345678A"
                      required={esMenor}
                      className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                        errors.tutorDni ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                      }`}
                    />
                    {errors.tutorDni && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.tutorDni}</p>}
                  </div>

                  <div>
                    <label htmlFor="tutor-phone" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Teléfono de contacto del tutor <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="tutor-phone"
                      type="tel"
                      value={tutorTelefono}
                      onChange={(e) => setTutorTelefono(e.target.value)}
                      placeholder="+34 600 000 000"
                      required={esMenor}
                      className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                        errors.tutorTelefono ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                      }`}
                    />
                    {errors.tutorTelefono && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.tutorTelefono}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Solicitud de Socio */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">3</span>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 text-primary">Inscripción de Socio</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                ¿Se registra como nuevo socio de la Unión Musical de Agost? <span className="text-rose-600">*</span>
              </label>
              
              {/* Custom Radios for esNuevoSocio Yes/No */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEsNuevoSocio(true)}
                  className={`flex-1 py-4 border rounded-lg text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    esNuevoSocio 
                      ? 'border-primary bg-[#f3fcf8] text-primary shadow-xs ring-2 ring-primary' 
                      : 'border-[#c0c8c2] text-on-surface-variant hover:bg-slate-50'
                  }`}
                >
                  Sí, soy nuevo socio
                </button>
                <button
                  type="button"
                  onClick={() => setEsNuevoSocio(false)}
                  className={`flex-1 py-4 border rounded-lg text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    !esNuevoSocio 
                      ? 'border-primary bg-[#f3fcf8] text-primary shadow-xs ring-2 ring-primary' 
                      : 'border-[#c0c8c2] text-on-surface-variant hover:bg-slate-50'
                  }`}
                >
                  No, ya soy socio
                </button>
              </div>
            </div>

            {/* Conditionally reveal Modalidad de socio only if esNuevoSocio is true */}
            {esNuevoSocio ? (
              <div className="pt-5 border-t border-slate-100 space-y-4 animate-fadeIn">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-2 text-secondary">
                  Seleccione la modalidad de socio deseada:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Tier 1: Individual */}
                  <button
                    type="button"
                    onClick={() => setModalidadSocio('individual')}
                    className={`p-6 border rounded-xl flex flex-col items-center text-center transition-all cursor-pointer ${
                      modalidadSocio === 'individual'
                        ? 'border-primary bg-[#f3fcf8] ring-2 ring-primary'
                        : 'border-[#c0c8c2] hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-display font-extrabold text-sm text-primary mb-2">Individual</span>
                    <span className="font-display font-extrabold text-2xl text-secondary">18 €</span>
                    <span className="text-[11px] text-on-surface-variant mt-3 block font-medium">Cuota anual por persona</span>
                  </button>

                  {/* Tier 2: Pareja */}
                  <button
                    type="button"
                    onClick={() => setModalidadSocio('pareja')}
                    className={`p-6 border rounded-xl flex flex-col items-center text-center transition-all cursor-pointer ${
                      modalidadSocio === 'pareja'
                        ? 'border-primary bg-[#f3fcf8] ring-2 ring-primary'
                        : 'border-[#c0c8c2] hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-display font-extrabold text-sm text-primary mb-2">Pareja</span>
                    <span className="font-display font-extrabold text-2xl text-secondary">24 €</span>
                    <span className="text-[11px] text-on-surface-variant mt-3 block font-medium">Cuota anual para 2 personas</span>
                  </button>

                  {/* Tier 3: Familiar */}
                  <button
                    type="button"
                    onClick={() => setModalidadSocio('familiar')}
                    className={`p-6 border rounded-xl flex flex-col items-center text-center transition-all cursor-pointer ${
                      modalidadSocio === 'familiar'
                        ? 'border-primary bg-[#f3fcf8] ring-2 ring-primary'
                        : 'border-[#c0c8c2] hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-display font-extrabold text-sm text-primary mb-2">Familiar</span>
                    <span className="font-display font-extrabold text-2xl text-secondary">36 €</span>
                    <span className="text-[11px] text-on-surface-variant mt-3 block font-medium">Cuota anual para unidad familiar</span>
                  </button>

                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 text-on-surface-variant text-xs rounded-lg talk-bubble">
                No se ha seleccionado la opción de socio nuevo. No se cargará ninguna cuota anual de socio en la cuenta de domiciliación bancaria especificada a continuación por este concepto, únicamente los cobros correspondientes a la matrícula escolar habitual.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Domiciliación bancaria */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">4</span>
              <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 text-primary">Domiciliación Bancaria</h2>
            </div>
           <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-container border border-outline-variant rounded-sm text-on-surface text-[10px] font-semibold uppercase tracking-wider">
  <Lock className="w-3 h-3 text-on-surface-variant" />
  <span>Pago Seguro SEPA</span>
</div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-lg space-y-4">
            
            {/* Banco name */}
            <div>
              <label htmlFor="bank-entity" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Entidad Bancaria <span className="text-rose-600">*</span>
              </label>
              <input
                id="bank-entity"
                type="text"
                value={bancoEntidad}
                onChange={(e) => setBancoEntidad(e.target.value)}
                placeholder="Nombre de su banco (ej. Caixabank, Santander, BBVA)"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.bancoEntidad ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.bancoEntidad && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.bancoEntidad}</p>}
            </div>

            {/* Titular */}
            <div>
              <label htmlFor="bank-holder" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Titular de la cuenta <span className="text-rose-600">*</span>
              </label>
              <input
                id="bank-holder"
                type="text"
                value={bancoTitular}
                onChange={(e) => setBancoTitular(e.target.value)}
                placeholder="Nombre completo del titular de la cuenta"
                required
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all ${
                  errors.bancoTitular ? 'border-rose-400 focus:border-rose-600' : 'border-[#c0c8c2]'
                }`}
              />
              {errors.bancoTitular && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.bancoTitular}</p>}
            </div>

            {/* IBAN */}
            <div>
              <label htmlFor="bank-iban" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Número de cuenta (IBAN) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="bank-iban"
                  type="text"
                  value={bancoIban}
                  onChange={(e) => setBancoIban(e.target.value)}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  required
                  className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-0 focus:border-primary transition-all pl-14 ${
                    errors.bancoIban ? 'border-rose-400 focus:border-rose-600 font-mono' : 'border-[#c0c8c2] font-mono'
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 font-semibold text-xs tracking-wider font-mono">
                  IBAN
                </span>
              </div>
              {errors.bancoIban && <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.bancoIban}</p>}
            </div>

            <p className="text-[11px] text-on-surface-variant italic leading-relaxed pt-2">
              Se procederá al cobro de la cuota correspondiente a la modalidad de socio elegida según la periodicidad anual establecida reglamentariamente por la junta de la sociedad.
            </p>
          </div>
        </div>

        {/* SECTION 5: Consentimientos */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">5</span>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 text-primary">Consentimientos obligatorios</h2>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Consent 1 */}
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentRGPD}
                onChange={(e) => setConsentRGPD(e.target.checked)}
                className="accent-secondary mt-1 w-5 h-5 shrink-0 rounded border-[#c0c8c2] text-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-sans">
                Acepto la política de protección de datos personales conforme al Reglamento General de Protección de Datos (RGPD). <span className="text-rose-600">*</span>
              </span>
            </label>

            {/* Consent 2 */}
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentInformativo}
                onChange={(e) => setConsentInformativo(e.target.checked)}
                className="accent-secondary mt-1 w-5 h-5 shrink-0 rounded border-[#c0c8c2] text-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-sans">
                Autorizo expresamente el tratamiento de mis datos personales facilitados para fines informativos referentes a las actividades, ensayos y conciertos de la escuela de música. <span className="text-rose-600">*</span>
              </span>
            </label>

            {/* Consent 3 */}
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentDomiciliacion}
                onChange={(e) => setConsentDomiciliacion(e.target.checked)}
                className="accent-secondary mt-1 w-5 h-5 shrink-0 rounded border-[#c0c8c2] text-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-sans">
                Autorizo expresamente la domiciliación bancaria ordinaria de las cuotas reglamentarias correspondientes en la cuenta indicada. <span className="text-rose-600">*</span>
              </span>
            </label>

            {/* Consent 4: Fotografías y Vídeos */}
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentFotografias}
                onChange={(e) => setConsentFotografias(e.target.checked)}
                className="accent-secondary mt-1 w-5 h-5 shrink-0 rounded border-[#c0c8c2] text-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-sans">
                Doy mi consentimiento para la obtención y publicación de fotografías y vídeos de los alumnos en actos de la escuela de música con fines únicamente informativos y de promoción de la sociedad musical. <span className="text-xs text-slate-400 font-normal lowercase italic">(opcional)</span>
              </span>
            </label>

            {errors.consents && (
              <p className="text-rose-600 text-xs mt-3 flex items-center gap-1 font-semibold font-sans">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.consents}</span>
              </p>
            )}
          </div>
        </div>

        {/* SECTION 6: Política de Privacidad de la Sociedad */}
        <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-8 form-card text-xs text-on-surface-variant space-y-4 font-sans leading-relaxed">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#3a6753]" />
            <span className="font-bold uppercase tracking-wider text-primary text-xs">Información Legal de Privacidad y Protección de Datos</span>
          </div>
          
          <div className="space-y-3 font-sans">
            <p className="text-xs md:text-sm leading-relaxed text-slate-600">
              De conformidad con lo dispuesto en el <strong>Reglamento General de Protección de Datos (RGPD) - Reglamento (UE) 2016/679</strong> y la <strong>Ley Orgánica 3/2018 (LOPDGDD)</strong>, sus datos identificativos, de contacto y bancarios serán tratados de forma estrictamente segura y encriptada por la Sociedad Filarmónica Unión Musical de Agost con fines exclusivamente administrativos, escolares y de cobros contractuales de cuotas del alumnado.
            </p>
            {onNavigateToPrivacy && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[#001c11] text-xs uppercase tracking-wider">Documento de Conformidad Legal Completo</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Consulte el detalle completo sobre tratamiento de datos, cesión de datos bancarios periódicos y cómo solicitar los derechos ARCO de rectificación o supresión.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToPrivacy}
                  className="bg-[#001c11] hover:bg-[#003322] text-white font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xs transition-all shrink-0 cursor-pointer text-center"
                >
                  Leer Política de Privacidad Estructurada
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Section Info & Action Button */}
        <div className="space-y-5 pt-3">
          <div className="p-4 bg-[#fed488]/15 border-l-4 border-secondary rounded-r-lg">
            <p className="text-on-secondary-container text-xs md:text-sm italic leading-relaxed font-sans">
              Una vez enviada la solicitud de inscripción, la administración de la sociedad revisará la información y continuará el proceso de matriculación según el procedimiento oficial habitual. Recibirá un correo electrónico de confirmación una vez validado.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#001c11] hover:bg-[#003322] disabled:bg-primary/65 text-white font-bold py-4 text-xs uppercase tracking-widest mt-8 shadow-md rounded-xs transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Procesando inscripción digital...</span>
              </>
            ) : (
              <>
                <span>Enviar inscripción</span>
                <Send className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
