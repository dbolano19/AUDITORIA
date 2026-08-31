import React from 'react';
import { Patient, Audit } from '../../types';
import { storageService } from '../../services/storageService';
import { UserCheck, Building2, Bed, Calendar, Clock, AlertCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface PatientQuickBarProps {
  patient: Patient | null;
  currentAudit?: Audit | null;
  onOpenExpediente?: (auditId: string) => void;
  onSelectAnotherPatient?: () => void;
}

export const PatientQuickBar: React.FC<PatientQuickBarProps> = ({
  patient,
  currentAudit,
  onOpenExpediente,
  onSelectAnotherPatient
}) => {
  if (!patient) return null;

  const stayDays = storageService.calculateStayDays(patient.admissionDate);
  const semaphore = storageService.getPatientSummarySemaphore(patient.id);

  const semaphoreConfig = {
    green: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Sin hallazgos críticos'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Hallazgos pendientes'
    },
    red: {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-500',
      icon: AlertCircle,
      label: 'Requiere intervención'
    }
  }[semaphore];

  const SemaphoreIcon = semaphoreConfig.icon;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        
        {/* Patient Bar Elements */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 divide-x divide-slate-200">
          
          {/* Patient */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 pr-3">
            <UserCheck className="w-4 h-4 text-cyan-700" />
            <span className="truncate max-w-[180px] md:max-w-[240px]" title={patient.fullName}>
              {patient.fullName}
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              ({patient.docType} {patient.docNumber})
            </span>
          </div>

          {/* IPS */}
          <div className="flex items-center gap-1 text-slate-700 px-3">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">{patient.ipsName}</span>
          </div>

          {/* Servicio & Cama */}
          <div className="flex items-center gap-1 text-slate-700 px-3">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.service}</span>
            <span className="text-slate-400">·</span>
            <span className="font-medium text-slate-800">{patient.roomBed}</span>
          </div>

          {/* Fecha ingreso */}
          <div className="flex items-center gap-1 text-slate-700 px-3">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Ingreso: <strong className="text-slate-800">{patient.admissionDate}</strong></span>
          </div>

          {/* Días estancia */}
          <div className="flex items-center gap-1 text-slate-700 px-3">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Estancia: <strong className={`font-bold ${stayDays > 7 ? 'text-amber-700' : 'text-slate-900'}`}>{stayDays} días</strong></span>
          </div>

          {/* Estado Paciente */}
          <div className="flex items-center gap-1 px-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patient.status}
            </span>
          </div>
        </div>

        {/* Visual Summary Semaphore & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${semaphoreConfig.bg}`}>
            <span className={`w-2 h-2 rounded-full ${semaphoreConfig.dot} animate-pulse`} />
            <SemaphoreIcon className="w-3.5 h-3.5" />
            <span>{semaphoreConfig.label}</span>
          </div>

          {currentAudit && onOpenExpediente && (
            <button
              onClick={() => onOpenExpediente(currentAudit.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <span>Ver Expediente</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {onSelectAnotherPatient && (
            <button
              onClick={onSelectAnotherPatient}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1 cursor-pointer"
            >
              Cambiar
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
