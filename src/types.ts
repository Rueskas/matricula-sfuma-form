export interface TutorInfo {
  nombre: string;
  dni: string;
  telefono: string;
}

export interface BankInfo {
  entidad: string;
  titular: string;
  iban: string;
}

export interface ConsentInfo {
  proteccionDatos: boolean;
  tratamientoInformativo: boolean;
  domiciliacionBancaria: boolean;
  fotografiasYVideos: boolean; // Consentimiento para toma de fotos/videos de los alumnos
}

export type MembershipType = 'individual' | 'pareja' | 'familiar';

export interface Registration {
  id: string; // Unique submission ID
  fechaRegistro: string; // ISO date string
  
  // Student Personal Details
  nombre: string;
  dniNia: string;
  fechaNacimiento: string;
  direccion: string;
  codigoPostal: string;
  localidad: string;
  provincia: string;
  telefono: string;
  correo: string;
  
  // Minor details (optional, conditional)
  esMenor: boolean;
  tutor?: TutorInfo;
  tutorAlt?: TutorInfo;
  
  // New Membership indicator
  esNuevoSocio: boolean;
  modalidadSocio?: MembershipType; // Solo si esNuevoSocio es verdadero
  
  // Bank Information
  banco: BankInfo;
  
  // Consents
  consentimientos: ConsentInfo;
}

export interface FormErrors {
  nombre?: string;
  dniNia?: string;
  fechaNacimiento?: string;
  direccion?: string;
  codigoPostal?: string;
  localidad?: string;
  provincia?: string;
  telefono?: string;
  correo?: string;
  
  // Tutor errors
  tutorNombre?: string;
  tutorDni?: string;
  tutorTelefono?: string;
  
  // Bank errors
  bancoEntidad?: string;
  bancoTitular?: string;
  bancoIban?: string;
  
  // Consent errors
  consents?: string;
}
