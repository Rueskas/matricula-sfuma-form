import React, { useState } from 'react';
import { Registration } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  User, 
  Calendar, 
  CreditCard, 
  Database, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Check, 
  Plus, 
  FileSpreadsheet, 
  AlertTriangle , Lock
} from 'lucide-react';

interface AdminPanelProps {
  registrations: Registration[];
  onDeleteRegistration: (id: string) => void;
  onClearAll: () => void;
  onLogout?: () => void;
}

export default function AdminPanel({ 
  registrations, 
  onDeleteRegistration, 
  onClearAll,
  onLogout
}: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [filterMembership, setFilterMembership] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');

  // Filter logic
  const filteredRegs = registrations.filter(reg => {
    const matchesSearch = 
      reg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.dniNia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.tutor?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMembership = 
      filterMembership === 'all' || reg.modalidadSocio === filterMembership;

    const matchesAge = 
      filterAge === 'all' || 
      (filterAge === 'minor' && reg.esMenor) || 
      (filterAge === 'adult' && !reg.esMenor);

    return matchesSearch && matchesMembership && matchesAge;
  });

  // Export to CSV helper
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No hay registros guardados para exportar.');
      return;
    }

    const headers = [
      'ID', 'Fecha Registro', 'Nombre Alumno', 'DNI_NIA', 'Fecha Nacimiento', 
      'Direccion', 'Codigo Postal', 'Localidad', 'Provincia', 'Telefono', 'Correo', 
      'Es Menor', 'Nombre Tutor', 'DNI Tutor', 'Telefono Tutor', 
      'Es Socio Nuevo', 'Modalidad Socio', 'Entidad Bancaria', 'Titular Cuenta', 'IBAN',
      'Consentimiento Fotos Videos'
    ];

    const rows = registrations.map(reg => [
      reg.id,
      reg.fechaRegistro,
      `"${reg.nombre.replace(/"/g, '""')}"`,
      reg.dniNia,
      reg.fechaNacimiento,
      `"${reg.direccion.replace(/"/g, '""')}"`,
      reg.codigoPostal,
      reg.localidad,
      reg.provincia,
      reg.telefono,
      reg.correo,
      reg.esMenor ? 'Sí' : 'No',
      reg.tutor ? `"${reg.tutor.nombre.replace(/"/g, '""')}"` : '',
      reg.tutor ? reg.tutor.dni : '',
      reg.tutor ? reg.tutor.telefono : '',
      reg.esNuevoSocio ? 'Sí' : 'No',
      reg.modalidadSocio || 'N/A',
      `"${reg.banco.entidad.replace(/"/g, '""')}"`,
      `"${reg.banco.titular.replace(/"/g, '""')}"`,
      reg.banco.iban,
      reg.consentimientos?.fotografiasYVideos ? 'Autorizado' : 'Denegado'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Inscripciones_Santa_Cecilia_Agost_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  // Export to Excel helper
  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert('No hay registros guardados para exportar.');
      return;
    }

    const dataToExport = registrations.map(reg => ({
      'ID Registro': reg.id,
      'Fecha Registro': new Date(reg.fechaRegistro).toLocaleString('es-ES'),
      'Nombre Alumno': reg.nombre,
      'DNI/NIA': reg.dniNia || '---',
      'Fecha Nacimiento': reg.fechaNacimiento || '---',
      'Dirección': reg.direccion,
      'Código Postal': reg.codigoPostal,
      'Localidad': reg.localidad,
      'Provincia': reg.provincia,
      'Teléfono': reg.telefono,
      'Correo Electrónico': reg.correo,
      'Es Menor': reg.esMenor ? 'Sí' : 'No',
      'Nombre Tutor': reg.tutor?.nombre || '---',
      'DNI Tutor': reg.tutor?.dni || '---',
      'Teléfono Tutor': reg.tutor?.telefono || '---',
      'Es Socio Nuevo': reg.esNuevoSocio ? 'Sí' : 'No',
      'Modalidad Socio': reg.modalidadSocio || 'N/A',
      'Entidad Bancaria': reg.banco.entidad,
      'Titular Cuenta': reg.banco.titular,
      'IBAN': reg.banco.iban,
      'Consentimiento LOPD': reg.consentimientos?.proteccionDatos ? 'Aceptado' : 'No',
      'Comunicaciones Escolares': reg.consentimientos?.tratamientoInformativo ? 'Aceptado' : 'No',
      'Domiciliación Bancaria': reg.consentimientos?.domiciliacionBancaria ? 'Aceptado' : 'No',
      'Fotos/Vídeos': reg.consentimientos?.fotografiasYVideos ? 'Autorizado' : 'Denegado'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscripciones');

    // Auto-fit column widths nicely for better presentation
    const maxLens = Object.keys(dataToExport[0]).map(key => {
      let maxLen = key.length;
      dataToExport.forEach(obj => {
        const valStr = String((obj as any)[key] || '');
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: maxLen + 2 };
    });
    worksheet['!cols'] = maxLens;

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Inscripciones_Santa_Cecilia_Agost_${dateStr}.xlsx`);
  };

  // Export individual registration to PDF helper
  const exportToPDF = (reg: Registration) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header bar back color matching deep emerald
    doc.setFillColor(0, 28, 17);
    doc.rect(0, 0, 210, 32, 'F');

    // Header Text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("SOCIEDAD FILARMÓNICA UNIÓN MUSICAL DE AGOST", 15, 12);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(190, 210, 200);
    doc.text("Escuela de Música Santa Cecilia • Avda. de la Pau, 4 - 03698 Agost (Alicante)", 15, 18);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("FICHA OFICIAL DE MATRICULACIÓN", 15, 27);

    // ID Badge on the right
    doc.setFillColor(40, 80, 60);
    doc.rect(150, 11, 45, 13, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'normal');
    doc.text("ID DE REGISTRO", 153, 15);
    doc.setFontSize(9.5);
    doc.setFont('Helvetica', 'bold');
    doc.text(reg.id, 153, 21);

    let y = 42;

    // Date
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 80, 75);
    const dateObj = new Date(reg.fechaRegistro);
    doc.text(`Fecha de registro telemático: ${dateObj.toLocaleDateString('es-ES')} a las ${dateObj.toLocaleTimeString('es-ES')}`, 15, y);
    
    y += 8;

    // Helpers
    const drawSectionHeader = (title: string, yPos: number) => {
      doc.setFillColor(238, 244, 240);
      doc.rect(15, yPos, 180, 7, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 28, 17);
      doc.text(title.toUpperCase(), 18, yPos + 4.8);
      return yPos + 12;
    };

    const drawField = (label: string, val: string, xPos: number, yPos: number) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 130, 125);
      doc.text(label.toUpperCase(), xPos, yPos);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(val || '---', xPos, yPos + 4.2);
    };

    // 1. DATOS DEL ALUMNO
    y = drawSectionHeader("1. DATOS DEL ALUMNO", y);
    drawField("Nombre completo", reg.nombre, 15, y);
    drawField("DNI / NIA", reg.dniNia || '---', 130, y);
    y += 10;

    drawField("Fecha de nacimiento", reg.fechaNacimiento || '---', 15, y);
    drawField("Dirección postal", reg.direccion, 65, y);
    y += 10;

    drawField("Código Postal", reg.codigoPostal, 15, y);
    drawField("Localidad", reg.localidad, 65, y);
    drawField("Provincia", reg.provincia, 130, y);
    y += 10;

    drawField("Teléfono móvil", reg.telefono, 15, y);
    drawField("Correo electrónico", reg.correo, 65, y);
    y += 12;

    // 2. TUTOR LEGAL (si es menor)
    if (reg.esMenor && reg.tutor) {
      y = drawSectionHeader("2. DATOS DEL TUTOR LEGAL (REPRESENTANTE MENOR)", y);
      drawField("Nombre del tutor", reg.tutor.nombre, 15, y);
      drawField("DNI/NIE del tutor", reg.tutor.dni, 110, y);
      drawField("Teléfono tutor", reg.tutor.telefono, 155, y);
      y += 12;
    }

    // 3. SOCIO / CUOTAS
    y = drawSectionHeader("3. ALTA DE SOCIO Y MODALIDAD", y);
    if (reg.esNuevoSocio) {
      const cuota = reg.modalidadSocio === 'individual' ? '18 €/año' :
                    reg.modalidadSocio === 'pareja' ? '24 €/año' :
                    '36 €/año';
      drawField("Solicitud nuevo socio", "SÍ, SOLICITA NUEVA ALTA", 15, y);
      drawField("Modalidad elegida", reg.modalidadSocio?.toUpperCase() || 'N/A', 90, y);
      drawField("Cuota anual", cuota, 140, y);
    } else {
      drawField("Solicitud nuevo socio", "NO (SÓLO MATRICULACIÓN, YA ES SOCIO)", 15, y);
    }
    y += 12;

    // 4. DATOS BANCARIOS
    y = drawSectionHeader("4. DOMICILIACIÓN BANCARIA DE RECIBOS (SEPA)", y);
    drawField("Entidad Financiera", reg.banco.entidad, 15, y);
    drawField("Titular de la Cuenta", reg.banco.titular, 90, y);
    y += 10;
    drawField("Cuenta Internacional IBAN", reg.banco.iban, 15, y);
    y += 14;

    // 5. CONSENTIMIENTOS
    y = drawSectionHeader("5. DECLARACIÓN DE FIRMAS Y CONSENTIMIENTOS", y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 85, 80);

    const checkTerms = [
      { key: "RGPD", txt: "Aceptación expresa de la Política de Privacidad de Datos y Reglamento (UE) (Protección de datos).", yes: reg.consentimientos?.proteccionDatos ?? true },
      { key: "INF", txt: "Autorización para recibir notificaciones acerca de actividades, audiciones y conciertos.", yes: reg.consentimientos?.tratamientoInformativo ?? true },
      { key: "SEPA", txt: "Autorización para emitir recibos domiciliados SEPA en la cuenta bancaria facilitada.", yes: reg.consentimientos?.domiciliacionBancaria ?? true },
      { key: "DIMG", txt: "Autorización opcional de difusión escolar de fotos/vídeos en canales oficiales.", yes: reg.consentimientos?.fotografiasYVideos ?? false }
    ];

    checkTerms.forEach((term) => {
      // Draw a neat box
      doc.rect(15, y, 3, 3);
      if (term.yes) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text("X", 15.8, y + 2.4);
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 28, 17);
      doc.text(`[${term.key}]`, 20, y + 2.4);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(80, 85, 80);
      doc.text(term.txt, 32, y + 2.4);
      y += 5.2;
    });

    y += 6;

    // Signature boxes
    doc.setFillColor(252, 254, 253);
    doc.rect(15, y, 180, 26, 'F');
    doc.setDrawColor(210, 220, 215);
    doc.rect(15, y, 180, 26, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(110, 120, 115);
    doc.text("FIRMA DEL INTERESADO O TUTOR LEGAL", 20, y + 5);
    doc.text("SOCIEDAD FILARMÓNICA UNIÓN MUSICAL", 110, y + 5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(150, 155, 150);
    doc.text("Firmado digitalmente con marca temporal.", 20, y + 21);
    doc.text("Sello oficial de validación telemática.", 110, y + 21);

    // Save
    const sanitizedTitle = reg.nombre.replace(/[^a-zA-Z]/g, "_");
    doc.save(`Ficha_Inscripcion_${sanitizedTitle}.pdf`);
  };


  // Stats computation
  const totalInscritos = registrations.length;
  const totalMenores = registrations.filter(r => r.esMenor).length;
  const totalNuevosSocios = registrations.filter(r => r.esNuevoSocio).length;
  const individualCount = registrations.filter(r => r.esNuevoSocio && r.modalidadSocio === 'individual').length;
  const parejaCount = registrations.filter(r => r.esNuevoSocio && r.modalidadSocio === 'pareja').length;
  const familiarCount = registrations.filter(r => r.esNuevoSocio && r.modalidadSocio === 'familiar').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top action cards & stats */}
      <div className="bg-white rounded-sm border border-slate-200 p-6 form-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-primary text-[10px] font-bold rounded-xs border border-blue-150 uppercase tracking-widest">
              <Database className="w-3 h-3" />
              <span>Base de Datos Digital</span>
            </div>
            <h2 className="text-xl font-display font-bold text-primary mt-2 uppercase tracking-wide">
              Registros de Matrículas Almacenadas
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">
              {totalInscritos} matrícula(s) telemáticas recogidas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mr-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            )}
            {totalInscritos > 0 && (
              <>
            <button
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>
                <button hidden
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas vaciar todos los registros digitales? Esta acción no se puede deshacer.')) {
                      onClearAll();
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-105 text-rose-700 border border-rose-250 px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar todo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Metrics Roll */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-slate-50 rounded-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans block">
              Alumnos / Matrículas
            </span>
            <div className="text-2xl font-display font-bold text-primary pt-1">
              {totalInscritos}
            </div>
          </div>
          <div className="p-4 bg-[#f3fcf8] rounded-xs border border-[#3a6753]/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a6753] font-sans block">
              Menores de Edad
            </span>
            <div className="text-2xl font-display font-bold text-[#001c11] pt-1">
              {totalMenores}
            </div>
          </div>
          <div className="p-4 bg-[#f3fcf8] rounded-xs border border-[#3a6753]/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a6753] font-sans block">
              Nuevos Socios
            </span>
            <div className="text-2xl font-display font-bold text-[#001c11] pt-1">
              {totalNuevosSocios}
            </div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans block">
              Socio Individual
            </span>
            <div className="text-2xl font-display font-bold text-primary pt-1">
              {individualCount} <span className="text-xs text-on-surface-variant font-normal">({individualCount * 18}€)</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans block">
              Socio Pareja
            </span>
            <div className="text-2xl font-display font-bold text-primary pt-1">
              {parejaCount} <span className="text-xs text-on-surface-variant font-normal">({parejaCount * 24}€)</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans block">
              Socio Familiar
            </span>
            <div className="text-2xl font-display font-bold text-primary pt-1">
              {familiarCount} <span className="text-xs text-on-surface-variant font-normal">({familiarCount * 36}€)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Block */}
      <div className="bg-white rounded-sm border border-slate-200 form-card overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, del correo o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className="px-3 py-2.5 rounded-sm border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-primary"
            >
              <option value="all">Socio: Todos</option>
              <option value="individual">Individual (18€)</option>
              <option value="pareja">Pareja (24€)</option>
              <option value="familiar">Familiar (36€)</option>
            </select>

            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="px-3 py-2.5 rounded-sm border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-primary"
            >
              <option value="all">Edad: Todos</option>
              <option value="minor">Menores de edad</option>
              <option value="adult">Mayores de edad</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        {filteredRegs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant bg-white flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary">No se encontraron inscripciones</h3>
            <p className="text-sm text-on-surface-variant">
              {totalInscritos === 0 
                ? 'El listado digital está inicialmente vacío. Rellena e ingresa un formulario o carga los ejemplos virtuales.' 
                : 'Ningún registro almacenado coincide con los filtros de búsqueda aplicados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-primary uppercase tracking-wider">
                  <th className="py-4 px-6">Alumno</th>
                  <th className="py-4 px-6">DNI / NIA</th>
                  <th className="py-4 px-6">Localidad</th>
                  <th className="py-4 px-6">Socio</th>
                  <th className="py-4 px-6">Titular Cuenta</th>
                  <th className="py-2.5 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-blue-50/20 transition-all">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary">{reg.nombre}</div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-secondary" /> {reg.correo}
                        {reg.esMenor && (
                          <span className="ml-1.5 px-2 py-0.5 bg-primary-container/40 border border-outline-variant text-primary text-[10px] font-extrabold rounded-full">
  Menor
</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-bold text-slate-700">
                      {reg.dniNia || '---'}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      <div>{reg.localidad}</div>
                      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{reg.codigoPostal}</div>
                    </td>
                    <td className="py-4 px-6">
                      {reg.esNuevoSocio ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                          reg.modalidadSocio === 'individual' ? 'bg-indigo-50 border border-indigo-150 text-indigo-800' :
                          reg.modalidadSocio === 'pareja' ? 'bg-blue-50 border border-blue-150 text-blue-800' :
                          'bg-amber-50 border border-amber-150 text-amber-800'
                        }`}>
                          {reg.modalidadSocio}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500">
                          Matrícula Sola
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      <div className="font-medium">{reg.banco.titular}</div>
                      <div className="font-mono text-[10px] opacity-75 mt-0.5">{reg.banco.iban.substring(0, 10)}...</div>
                    </td>
                    <td className="py-2.5 px-6">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-2 text-primary hover:bg-[#f3fcf8] rounded-md transition-all cursor-pointer"
                          title="Ver Ficha Completa"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el registro de ${reg.nombre}?`)) {
                              onDeleteRegistration(reg.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Overlay Card Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold">Ficha de Inscripción Digital</p>
                <h3 className="text-lg font-display font-bold uppercase tracking-wide mt-1">{selectedReg.nombre}</h3>
                <p className="text-xs opacity-75 mt-0.5 font-mono">ID: {selectedReg.id} • Inscrito: {new Date(selectedReg.fechaRegistro).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedReg(null)}
                className="bg-white/10 hover:bg-white/20 transition-all p-2 rounded-sm text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-1.5 uppercase text-xs tracking-wider">
                  <User className="w-4 h-4 text-secondary shrink-0" />
                  <span>Datos del Alumno</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase text-slate-400">DNI / NIA</span>
                    <span className="text-primary font-medium">{selectedReg.dniNia || '---'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase text-slate-400">Fecha Nacimiento</span>
                    <span className="text-primary font-medium">{selectedReg.fechaNacimiento || '---'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase text-slate-400">Dirección</span>
                    <span className="text-primary font-medium">
                      {selectedReg.direccion}, {selectedReg.codigoPostal} - {selectedReg.localidad} ({selectedReg.provincia})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase text-slate-400">Teléfono móvil</span>
                    <span className="text-primary font-medium">{selectedReg.telefono}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase text-slate-400">Correo electrónico</span>
                    <span className="text-primary font-medium font-mono">{selectedReg.correo}</span>
                  </div>
                </div>
              </div>

              {/* Conditional Minor Details */}
              {selectedReg.esMenor && selectedReg.tutor && (
                <div className="space-y-3 p-4 bg-primary-container/20 border border-outline-variant rounded-sm">
  <h4 className="font-display font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-1.5 uppercase text-xs tracking-wider">
    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
    <span>Datos del Tutor Legal (Menor de edad)</span>
  </h4>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <span className="text-[11px] font-bold text-on-surface-variant block uppercase">
        Nombre Tutor
      </span>
      <span className="text-on-surface font-semibold">
        {selectedReg.tutor.nombre}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div>
        <span className="text-[11px] font-bold text-on-surface-variant block uppercase">
          DNI Tutor
        </span>
        <span className="text-on-surface font-mono font-medium">
          {selectedReg.tutor.dni}
        </span>
      </div>

      <div>
        <span className="text-[11px] font-bold text-on-surface-variant block uppercase">
          Teléfono
        </span>
        <span className="text-on-surface font-medium">
          {selectedReg.tutor.telefono}
        </span>
      </div>
    </div>
  </div>
</div>
              )}

              {/* Membership details */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-1.5 uppercase text-xs tracking-wider">
                  <CreditCard className="w-4 h-4 text-secondary shrink-0" />
                  <span>Membresía e Inscripción de Socio</span>
                </h4>
                {selectedReg.esNuevoSocio ? (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm flex justify-between items-center">
                    <span className="font-semibold text-primary uppercase text-xs tracking-wide">
                      Alta Nuevo Socio - {selectedReg.modalidadSocio}
                    </span>
                    <span className="font-bold text-secondary text-base">
                      {selectedReg.modalidadSocio === 'individual' ? '18 €/año' :
                       selectedReg.modalidadSocio === 'pareja' ? '24 €/año' :
                       '36 €/año'}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm text-xs text-on-surface-variant font-medium">
                    No solicita alta como nuevo socio (Inscripción ordinaria / Ya es socio). Sin cargos de cuota anual adherida.
                  </div>
                )}
              </div>

              {/* Direct debit banking details */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-1.5 uppercase text-xs tracking-wider">
                  <Database className="w-4 h-4 text-secondary shrink-0" />
                  <span>Domiciliación Bancaria</span>
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase font-sans text-slate-400">Entidad Bancaria</span>
                    <span className="text-primary font-bold block">{selectedReg.banco.entidad}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase font-sans text-slate-400">Titular de la Cuenta</span>
                    <span className="text-primary font-bold block">{selectedReg.banco.titular}</span>
                  </div>
                  <div className="col-span-full">
                    <span className="text-[11px] font-bold text-on-surface-variant block uppercase font-sans text-slate-400">Número de Cuenta IBAN</span>
                    <span className="text-primary font-bold text-sm block tracking-widest">{selectedReg.banco.iban}</span>
                  </div>
                </div>
              </div>

              {/* Consents list */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-1.5 uppercase text-xs tracking-wider">
                  <Check className="w-4 h-4 text-secondary shrink-0" />
                  <span>Consentimientos y Firmas Digitales</span>
                </h4>
                <div className="space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Aceptada Política de Protección de Datos Personales (RGPD).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Autorizado el tratamiento para fines informativos escolares.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Autorizada la domiciliación bancaria de las cuotas.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 shrink-0 ${selectedReg.consentimientos?.fotografiasYVideos || selectedReg.consentFotografias ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Consentimiento para toma y publicación de fotografías y vídeos: {selectedReg.consentimientos?.fotografiasYVideos || selectedReg.consentFotografias ? 'AUTORIZADO' : 'NO AUTORIZADO'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
<button
                onClick={() => exportToPDF(selectedReg)}
                className="bg-[#001c11] hover:bg-[#003322] text-white border border-[#001c11] px-4 py-2 rounded-xs text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
              >
                Descargar Ficha (PDF)
              </button>
              <button
                onClick={() => setSelectedReg(null)}
                className="bg-primary hover:bg-blue-900 text-white px-5 py-2 rounded-xs text-xs font-bold shadow-md transition-all cursor-pointer uppercase tracking-wider"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
