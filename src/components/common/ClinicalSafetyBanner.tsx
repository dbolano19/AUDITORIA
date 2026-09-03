import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const ClinicalSafetyBanner: React.FC = () => {
  return (
    <aside aria-label="Aviso de seguridad clínica" className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2 max-w-5xl mx-auto text-center md:text-left">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <p className="font-medium text-amber-950">
          <span className="font-bold tracking-wide uppercase text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
            Aviso de Seguridad Clínica
          </span>
          "Esta herramienta es un sistema de apoyo a la auditoría y no reemplaza el criterio profesional del auditor ni las decisiones del equipo asistencial."
        </p>
      </div>
      <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-800 font-medium shrink-0">
        <Info className="w-3.5 h-3.5" />
        <span>Sistema de Auditoría FOMAG</span>
      </div>
    </aside>
  );
};
