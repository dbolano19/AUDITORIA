/**
 * USE CASE: CompareIPSUseCase
 * Performs benchmarking and normalized comparisons across Bonadona, Misericordia, and Costa.
 * Applies sample-size guards to prevent skewed percentage comparisons on small samples.
 */

import {
  DashboardFilter,
  IPSComparisonResult,
  IPSComparativeProfile,
  IPSCategoryMatrixRow,
  IPSServiceMatrixRow
} from '../../domain/models';
import { storageService } from '../../services/storageService';
import { AuditSession } from '../../domain/models/AuditSession';

export class CompareIPSUseCase {
  public execute(filter: DashboardFilter): IPSComparisonResult {
    const allSessions = storageService.getAuditSessions();
    const ipsList = storageService.getIPS();

    const bonadonaIPS = ipsList.find(i => i.id === 'ips-001' || i.name.toLowerCase().includes('bonadona')) || { id: 'ips-001', code: 'IPS-001', name: 'Clínica Bonadona', city: 'Barranquilla' };
    const misericordiaIPS = ipsList.find(i => i.id === 'ips-002' || i.name.toLowerCase().includes('misericordia')) || { id: 'ips-002', code: 'IPS-002', name: 'Clínica de la Misericordia Internacional', city: 'Barranquilla' };
    const costaIPS = ipsList.find(i => i.id === 'ips-003' || i.name.toLowerCase().includes('costa')) || { id: 'ips-003', code: 'IPS-003', name: 'Clínica Costa', city: 'Barranquilla' };

    const bonaSessions = allSessions.filter(s => s.ipsId === 'ips-001' || s.ipsName.toLowerCase().includes('bonadona'));
    const miseSessions = allSessions.filter(s => s.ipsId === 'ips-002' || s.ipsName.toLowerCase().includes('misericordia'));
    const costaSessions = allSessions.filter(s => s.ipsId === 'ips-003' || s.ipsName.toLowerCase().includes('costa'));

    const profileBona = this.buildProfile(bonadonaIPS.id, bonadonaIPS.code, bonadonaIPS.name, bonadonaIPS.city, bonaSessions, filter);
    const profileMise = this.buildProfile(misericordiaIPS.id, misericordiaIPS.code, misericordiaIPS.name, misericordiaIPS.city, miseSessions, filter);
    const profileCosta = this.buildProfile(costaIPS.id, costaIPS.code, costaIPS.name, costaIPS.city, costaSessions, filter);

    const insufficientIPS: string[] = [];
    if (!profileBona.isRepresentativeSample) insufficientIPS.push(profileBona.ipsName);
    if (!profileMise.isRepresentativeSample) insufficientIPS.push(profileMise.ipsName);
    if (!profileCosta.isRepresentativeSample) insufficientIPS.push(profileCosta.ipsName);

    // Cross Matrix IPS x Category
    const categoryMatrix = this.buildCategoryMatrix([profileBona, profileMise, profileCosta], [bonaSessions, miseSessions, costaSessions]);

    // Cross Matrix IPS x Service
    const serviceMatrix = this.buildServiceMatrix([bonaSessions, miseSessions, costaSessions]);

    const totalAudits = profileBona.totalAudits + profileMise.totalAudits + profileCosta.totalAudits;
    const totalPatients = profileBona.auditedPatients + profileMise.auditedPatients + profileCosta.auditedPatients;
    const totalFindings = profileBona.totalFindings + profileMise.totalFindings + profileCosta.totalFindings;
    const totalPriority = profileBona.priorityFindings + profileMise.priorityFindings + profileCosta.priorityFindings;

    return {
      comparisonDate: new Date().toISOString(),
      periodText: filter.startDate ? `${filter.startDate} a ${filter.endDate || 'Hoy'}` : 'Vigencia Actual 2025',
      overallNetworkAudits: totalAudits,
      overallNetworkPatients: totalPatients,
      overallNetworkFindings: totalFindings,
      overallNetworkPriority: totalPriority,
      profiles: {
        bonadona: profileBona,
        misericordia: profileMise,
        costa: profileCosta
      },
      categoryMatrix,
      serviceMatrix,
      comparabilitySafeguards: {
        hasInsufficientSampleWarning: insufficientIPS.length > 0,
        insufficientIPSNames: insufficientIPS,
        notice: insufficientIPS.length > 0
          ? `Muestra insuficiente para comparación robusta en: ${insufficientIPS.join(', ')}. Las tasas porcentuales deben interpretarse con cautela.`
          : 'Muestra representativa adecuada para análisis comparativo entre IPS de la red.'
      }
    };
  }

  private buildProfile(
    ipsId: string,
    ipsCode: string,
    ipsName: string,
    city: string,
    sessions: AuditSession[],
    filter: DashboardFilter
  ): IPSComparativeProfile {
    const totalAudits = sessions.length;
    const uniquePatients = new Set(sessions.map(s => s.patientId));
    const auditedPatients = uniquePatients.size;

    // Minimum sample rule for robust comparison: >= 3 audits and >= 2 patients
    const isRepresentativeSample = totalAudits >= 3 && auditedPatients >= 2;

    const allFindings = sessions.flatMap(s => s.findings).filter(f => {
      if (filter.validationFilter === 'CONFIRMED_ONLY') {
        return f.auditorValidation?.status === 'CONFIRMADO' || f.auditorValidation?.status === 'MODIFICADO';
      }
      return true;
    });

    const totalFindings = allFindings.length;
    const criticalFindings = allFindings.filter(f => f.tier === 'NIVEL 1 — SEGURIDAD' || f.isCriticalOrHighPriority).length;
    const highFindings = allFindings.filter(f => f.tier === 'NIVEL 2 — OPORTUNIDAD' || f.tier === 'NIVEL 3 — PERTINENCIA').length;
    const priorityFindings = criticalFindings + highFindings;

    const allActions = sessions.flatMap(s => s.actions24h || []);
    const totalActions = allActions.length;
    const closedActions = allActions.filter(a => a.status === 'Cerrado' || (a.status as string) === 'Cerrada').length;
    const overdueActions = allActions.filter(a => a.status === 'Vencido' || (a.status as string) === 'Vencida' || (a.status !== 'Cerrado' && (a.status as string) !== 'Cerrada' && new Date(a.deadlineDate) < new Date())).length;
    const openActions = totalActions - closedActions;

    let actionComplianceRateText = 'SIN DATOS';
    let actionComplianceRateNum: number | null = null;
    if (totalActions > 0) {
      actionComplianceRateNum = Number(((closedActions / totalActions) * 100).toFixed(1));
      actionComplianceRateText = `${actionComplianceRateNum}%`;
    }

    const stays = sessions.map(s => s.clinicalContext.lengthOfStay).filter(d => typeof d === 'number' && !isNaN(d));
    const averageStayDays = stays.length > 0 ? Number((stays.reduce((a, b) => a + b, 0) / stays.length).toFixed(1)) : 0;
    const medianStayDays = this.calculateMedian(stays);

    // Normalization calculations (per 100 audits / per 100 patients)
    const auditDiv = totalAudits > 0 ? totalAudits : 1;
    const patientDiv = auditedPatients > 0 ? auditedPatients : 1;

    const rateFindingsPer100Audits = Number(((totalFindings / auditDiv) * 100).toFixed(1));
    const ratePriorityFindingsPer100Audits = Number(((priorityFindings / auditDiv) * 100).toFixed(1));
    const rateCriticalFindingsPer100Patients = Number(((criticalFindings / patientDiv) * 100).toFixed(1));
    const rateOverdueActionsPer100Audits = Number(((overdueActions / auditDiv) * 100).toFixed(1));

    const docDefectsCount = allFindings.filter(f => f.tier === 'NIVEL 5 — CALIDAD DOCUMENTAL' || f.category.toLowerCase().includes('doc')).length;
    const rateDocumentalDefectsPer100Audits = Number(((docDefectsCount / auditDiv) * 100).toFixed(1));

    const categoryCounts = new Map<string, number>();
    allFindings.forEach(f => {
      const cat = f.category || 'General';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    const categoryBreakdown = Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count,
      ratePer100Audits: Number(((count / auditDiv) * 100).toFixed(1))
    })).sort((a, b) => b.count - a.count);

    let trafficLightState: IPSComparativeProfile['trafficLightState'] = 'FAVORABLE';
    if (totalAudits === 0) trafficLightState = 'INFORMACION_INSUFICIENTE';
    else if (criticalFindings > 0 || overdueActions > 0) trafficLightState = 'SITUACIONES_PRIORITARIAS';
    else if (highFindings >= 2 || (actionComplianceRateNum !== null && actionComplianceRateNum < 70)) trafficLightState = 'OPORTUNIDADES_RELEVANTES';
    else if (openActions > 0) trafficLightState = 'REQUIERE_SEGUIMIENTO';

    return {
      ipsId,
      ipsCode,
      ipsName,
      city,
      isRepresentativeSample,
      sampleWarningText: isRepresentativeSample ? undefined : 'Muestra insuficiente para comparación robusta.',
      totalAudits,
      auditedPatients,
      totalFindings,
      priorityFindings,
      criticalFindings,
      highFindings,
      openActions,
      overdueActions,
      closedActions,
      totalActions,
      actionComplianceRateText,
      actionComplianceRateNum,
      averageStayDays,
      medianStayDays,
      recurrentFindingsCount: Math.max(0, totalFindings - categoryBreakdown.length),
      rateFindingsPer100Audits,
      ratePriorityFindingsPer100Audits,
      rateCriticalFindingsPer100Patients,
      rateOverdueActionsPer100Audits,
      rateDocumentalDefectsPer100Audits,
      categoryBreakdown,
      trafficLightState
    };
  }

  private buildCategoryMatrix(
    profiles: IPSComparativeProfile[],
    sessionsByIPS: AuditSession[][]
  ): IPSCategoryMatrixRow[] {
    const standardCategories = [
      'Seguridad del paciente',
      'Oportunidad',
      'Pertinencia',
      'Estancia',
      'Calidad documental',
      'Tratamiento',
      'Ayudas diagnósticas',
      'Interconsultas'
    ];

    const [bona, mise, costa] = profiles;
    const [bonaSess, miseSess, costaSess] = sessionsByIPS;

    const countCat = (sess: AuditSession[], cat: string) => {
      return sess.flatMap(s => s.findings).filter(f => f.category.toLowerCase().includes(cat.toLowerCase().substring(0, 5))).length;
    };

    return standardCategories.map(cat => {
      const bCount = countCat(bonaSess, cat);
      const mCount = countCat(miseSess, cat);
      const cCount = countCat(costaSess, cat);

      const bRate = bona.totalAudits > 0 ? Number(((bCount / bona.totalAudits) * 100).toFixed(1)) : 0;
      const mRate = mise.totalAudits > 0 ? Number(((mCount / mise.totalAudits) * 100).toFixed(1)) : 0;
      const cRate = costa.totalAudits > 0 ? Number(((cCount / costa.totalAudits) * 100).toFixed(1)) : 0;

      return {
        category: cat,
        bonadonaCount: bCount,
        bonadonaRate: bRate,
        misericordiaCount: mCount,
        misericordiaRate: mRate,
        costaCount: cCount,
        costaRate: cRate,
        totalNetwork: bCount + mCount + cCount
      };
    });
  }

  private buildServiceMatrix(sessionsByIPS: AuditSession[][]): IPSServiceMatrixRow[] {
    const services = ['UCI (Adultos / Pediátrica)', 'Hospitalización Medicina Interna', 'Urgencias Adultos', 'Cirugía y Quirófanos'];
    const [bonaSess, miseSess, costaSess] = sessionsByIPS;

    const getServiceData = (sess: AuditSession[], srv: string) => {
      const match = sess.filter(s => (s.clinicalContext.currentService || '').toLowerCase().includes(srv.toLowerCase().substring(0, 4)));
      const findings = match.flatMap(s => s.findings);
      const priority = findings.filter(f => f.isCriticalOrHighPriority || f.tier === 'NIVEL 1 — SEGURIDAD' || f.tier === 'NIVEL 2 — OPORTUNIDAD').length;
      return { audits: match.length, findings: findings.length, priority };
    };

    return services.map(srv => {
      const bData = getServiceData(bonaSess, srv);
      const mData = getServiceData(miseSess, srv);
      const cData = getServiceData(costaSess, srv);

      return {
        service: srv,
        bonadonaFindings: bData.findings,
        bonadonaPriority: bData.priority,
        bonadonaAudits: bData.audits,
        misericordiaFindings: mData.findings,
        misericordiaPriority: mData.priority,
        misericordiaAudits: mData.audits,
        costaFindings: cData.findings,
        costaPriority: cData.priority,
        costaAudits: cData.audits,
        totalFindings: bData.findings + mData.findings + cData.findings
      };
    });
  }

  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1));
    }
    return sorted[middle];
  }
}
