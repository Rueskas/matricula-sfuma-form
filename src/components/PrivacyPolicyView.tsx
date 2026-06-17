import React from 'react';
import { ArrowLeft, ShieldCheck, Printer, Scale, Eye, CheckCircle } from 'lucide-react';

interface PrivacyPolicyProps {
  onBackToForm: () => void;
}

export default function PrivacyPolicyView({ onBackToForm }: PrivacyPolicyProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-sm border border-slate-200 p-6 md:p-10 shadow-xs max-w-[1000px] mx-auto space-y-8 font-sans text-sm text-slate-700 animate-fadeIn print:border-none print:p-0 print:shadow-none">

      {/* Header and print button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 print:hidden">
        <button
          onClick={onBackToForm}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary group transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Formulario</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Política</span>
        </button>
      </div>

      {/* Title */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="flex justify-center sm:justify-start items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] bg-emerald-50 text-[#003322] px-2 py-0.5 border border-emerald-150 font-bold uppercase tracking-widest rounded-xs">
              DOCUMENTO DE CONFORMIDAD RGPD
            </span>
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-[#001c11] uppercase tracking-tight mt-1">
              Política de Privacidad y Protección de Datos
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          Última actualización: junio de 2026. Conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-150 p-5 rounded-md leading-relaxed text-xs">

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#001c11] uppercase tracking-wider text-[11px]">
            <Scale className="w-3.5 h-3.5 text-emerald-800" />
            <span>Responsable</span>
          </div>
          <p className="text-slate-600">
            <strong>Sociedad Filarmónica Unión Musical de Agost</strong><br />
            Avda. de la Pau, 4 - 03698 Agost (Alicante)<br />
            info@musicaagost.es
          </p>
        </div>

        <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1.5 font-bold text-[#001c11] uppercase tracking-wider text-[11px]">
            <Eye className="w-3.5 h-3.5 text-emerald-800" />
            <span>Finalidad</span>
          </div>
          <p className="text-slate-600">
            • Gestión de matriculaciones en la Escuela de Música.<br />
            • Gestión administrativa, académica y organizativa.<br />
            • Gestión de cobros SEPA.<br />
            • Alta y gestión de socios.<br />
            • Comunicaciones informativas de la actividad.
          </p>
        </div>

        <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1.5 font-bold text-[#001c11] uppercase tracking-wider text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-800" />
            <span>Legitimación</span>
          </div>
          <p className="text-slate-600">
            • Ejecución de relación contractual y asociativa.<br />
            • Cumplimiento de obligaciones legales.<br />
            • Consentimiento expreso para imágenes y comunicaciones no esenciales.<br />
            • Interés legítimo limitado a comunicaciones organizativas.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 pt-2 text-justify select-text font-sans">

        {/* 2 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">2. Finalidad del tratamiento</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Gestión de matriculación de alumnos.</li>
            <li>Gestión académica, administrativa y organizativa.</li>
            <li>Cobros mediante domiciliación SEPA.</li>
            <li>Gestión de socios.</li>
            <li>Comunicaciones sobre actividades de la entidad.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">3. Legitimación</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Ejecución de contrato o relación asociativa.</li>
            <li>Cumplimiento de obligaciones legales.</li>
            <li>Consentimiento del interesado o tutor legal.</li>
            <li>Interés legítimo para comunicaciones organizativas.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">4. Datos tratados</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Identificación: nombre, DNI/NIE, fecha nacimiento.</li>
            <li>Contacto: dirección, teléfono, email.</li>
            <li>Tutor legal: datos identificativos.</li>
            <li>Bancarios: IBAN para SEPA.</li>
            <li>Imagen (con consentimiento).</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">5. Destinatarios</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Bancos (SEPA).</li>
            <li>Administración pública si procede.</li>
            <li>FSMCV en actividades oficiales.</li>
            <li>Proveedores tecnológicos como encargados del tratamiento.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">6. Seguridad</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Acceso restringido a personal autorizado.</li>
            <li>Conexiones seguras HTTPS.</li>
            <li>Control de accesos.</li>
            <li>Medidas técnicas de protección de datos.</li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">7. Conservación</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 mt-2">
            <li>Durante la relación con el interesado.</li>
            <li>Plazos legales fiscales y administrativos.</li>
            <li>Bloqueo posterior según normativa.</li>
            <li>Imágenes hasta revocación del consentimiento.</li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">8. Derechos</h2>
          <p className="text-slate-600 mt-2">
            Acceso, rectificación, supresión, limitación, oposición y portabilidad.
          </p>
          <p className="mt-2 text-slate-600">
            Ejercicio: <strong>info@musicaagost.es</strong>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            También puede reclamar ante la AEPD: https://www.aepd.es
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">9. Menores</h2>
          <p className="text-slate-600 mt-2">
            Los datos deben ser facilitados por el tutor legal, que garantiza la autorización correspondiente.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">10. Veracidad</h2>
          <p className="text-slate-600 mt-2">
            El usuario garantiza que los datos facilitados son veraces y actualizados.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">11. Cambios</h2>
          <p className="text-slate-600 mt-2">
            La entidad podrá modificar esta política para adaptarla a cambios legales o de actividad.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-bold text-sm text-[#001c11] uppercase border-b border-slate-100 pb-1">12. Contacto</h2>
          <p className="text-slate-600 mt-2">
            info@musicaagost.es<br />
            Avda. de la Pau, 4, 03698 Agost (Alicante)
          </p>
        </section>

      </div>


      {/* Back button */}
      <div className="pt-6 border-t border-slate-100 flex justify-center print:hidden">
        <button
          onClick={onBackToForm}
          className="bg-[#001c11] hover:bg-[#003322] text-white font-bold py-3 px-8 text-xs uppercase tracking-widest rounded-xs"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Volver
        </button>
      </div>

    </div>
  );
}