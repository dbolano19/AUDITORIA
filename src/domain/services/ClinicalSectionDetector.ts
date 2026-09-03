/**
 * DOMAIN LAYER - Clinical Section Detector (FASE 9)
 * Identifies standard Colombian clinical sections (MinSalud / FOMAG) in extracted page text.
 * Strict principle: NEVER invent sections. If absent -> marked NOT_FOUND.
 */
import { DetectedClinicalSection } from '../models/ClinicalPage';

export interface SectionDefinition {
  standardKey: string;
  name: string;
  patterns: RegExp[];
  isMandatory: boolean;
}

export const STANDARD_CLINICAL_SECTIONS: SectionDefinition[] = [
  {
    standardKey: 'IDENTIFICACION',
    name: 'Identificación y Datos del Paciente',
    patterns: [
      /(?:datos\s+del\s+paciente|identificaci[oó]n|nombre\s+completo|documento\s+de\s+identidad|edad\s*:\s*\d+)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'MOTIVO_CONSULTA',
    name: 'Motivo de Consulta',
    patterns: [
      /(?:motivo\s+de\s+consulta|causa\s+de\s+ingreso|raz[oó]n\s+de\s+la\s+atenci[oó]n)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'ENFERMEDAD_ACTUAL',
    name: 'Enfermedad Actual',
    patterns: [
      /(?:enfermedad\s+actual|cuadro\s+cl[ií]nico|historia\s+de\s+la\s+enfermedad\s+actual)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'ANTECEDENTES',
    name: 'Antecedentes Médicos y Personales',
    patterns: [
      /(?:antecedentes|ant\.\s*patol[oó]gicos|antecedentes\s+patol[oó]gicos|al[eé]rgicos|quir[uú]rgicos|farmacol[oó]gicos|t[oó]xicos)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'SIGNOS_VITALES',
    name: 'Signos Vitales y Parámetros Hemodinámicos',
    patterns: [
      /(?:signos\s+vitales|t\/a|ta\s*:\s*\d+\/\d+|fc\s*:\s*\d+|fr\s*:\s*\d+|spo2|sat\s*o2|temp(?:eratura)?\s*:\s*\d+)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'EXAMEN_FISICO',
    name: 'Examen Físico',
    patterns: [
      /(?:examen\s+f[ií]sico|inspecci[oó]n\s+general|cabeza\s+y\s+cuello|cardiopulmonar|abdomen|extremidades|neurol[oó]gico)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'DIAGNOSTICOS',
    name: 'Diagnósticos e Impresión Diagnóstica',
    patterns: [
      /(?:diagn[oó]stico\s+principal|impresi[oó]n\s+diagn[oó]stica|diagn[oó]sticos?|cie-?10|dx\s+principal)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'EVOLUCIONES',
    name: 'Evoluciones Médicas Diarias',
    patterns: [
      /(?:evoluci[oó]n\s+m[eé]dica|nota\s+de\s+evoluci[oó]n|soap|subjetivo|objetivo|an[aá]lisis\s+m[eé]dico)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'ORDENES_MEDICAS',
    name: 'Órdenes Médicas y Prescripciones',
    patterns: [
      /(?:[oó]rdenes\s+m[eé]dicas|plan\s+de\s+manejo|conducta\s+m[eé]dica|indicaciones\s+m[eé]dicas)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'MEDICAMENTOS',
    name: 'Administración de Medicamentos y Kárdex',
    patterns: [
      /(?:medicamentos?|farmacoterapia|administraci[oó]n\s+de\s+medicamentos|k[aá]rdex|antibioticoterapia)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'LABORATORIOS',
    name: 'Resultados de Laboratorio Clínico',
    patterns: [
      /(?:laboratorio\s+cl[ií]nico|cuadro\s+hem[aá]tico|hemograma|creatinina|gases\s+arteriales|uroan[aá]lisis|cultivos?|antibiograma)/i
    ],
    isMandatory: false
  },
  {
    standardKey: 'IMAGENES',
    name: 'Imágenes Diagnósticas y Reportes Radiológicos',
    patterns: [
      /(?:radiograf[ií]a|rx|tomograf[ií]a|tac|resonancia|ecograf[ií]a|informe\s+radiolog[ií]a)/i
    ],
    isMandatory: false
  },
  {
    standardKey: 'PROCEDIMIENTOS',
    name: 'Procedimientos y Notas Quirúrgicas',
    patterns: [
      /(?:descripci[oó]n\s+quir[uú]rgica|nota\s+operatoria|procedimiento|intubaci[oó]n|cat[eé]ter\s+central|laparotom[ií]a)/i
    ],
    isMandatory: false
  },
  {
    standardKey: 'INTERCONSULTAS',
    name: 'Interconsultas Especializadas',
    patterns: [
      /(?:interconsulta|concepto\s+especialista|valoraci[oó]n\s+por\s+medicina\s+interna|infectolog[ií]a|cardiolog[ií]a|cirug[ií]a)/i
    ],
    isMandatory: false
  },
  {
    standardKey: 'ENFERMERIA',
    name: 'Notas y Registros de Enfermería',
    patterns: [
      /(?:notas?\s+de\s+enfermer[ií]a|hoja\s+de\s+enfermer[ií]a|cuidados\s+de\s+enfermer[ií]a|balance\s+de\s+l[ií]quidos)/i
    ],
    isMandatory: true
  },
  {
    standardKey: 'TERAPIAS',
    name: 'Terapias (Física, Respiratoria, Ocupacional)',
    patterns: [
      /(?:terapia\s+respiratoria|fisioterapia|rehabilitaci[oó]n|terapia\s+f[ií]sica)/i
    ],
    isMandatory: false
  },
  {
    standardKey: 'EPICRISIS',
    name: 'Epicrisis y Resumen de Egreso',
    patterns: [
      /(?:epicrisis|resumen\s+de\s+egreso|orden\s+de\s+salida|plan\s+de\s+alta)/i
    ],
    isMandatory: false
  }
];

export class ClinicalSectionDetector {
  /**
   * Detects clinical sections present in a specific page text
   */
  public static detectSectionsInPage(pageNumber: number, pageText: string): DetectedClinicalSection[] {
    if (!pageText || pageText.trim().length === 0) {
      return [];
    }

    const detected: DetectedClinicalSection[] = [];

    for (const section of STANDARD_CLINICAL_SECTIONS) {
      for (const pattern of section.patterns) {
        const match = pattern.exec(pageText);
        if (match) {
          const startIdx = match.index;
          // Extract a 120-char snippet around the header
          const snippetStart = Math.max(0, startIdx);
          const snippetEnd = Math.min(pageText.length, startIdx + 150);
          const snippet = pageText.substring(snippetStart, snippetEnd).replace(/\s+/g, ' ').trim();

          detected.push({
            name: section.name,
            standardKey: section.standardKey,
            pageNumber,
            startCharIndex: startIdx,
            contentSnippet: snippet,
            confidence: 0.95,
            isMandatory: section.isMandatory,
            status: 'FOUND'
          });
          break; // Found one pattern for this section on this page
        }
      }
    }

    return detected;
  }

  /**
   * Evaluates document completeness across all pages
   */
  public static evaluateDocumentSections(
    pages: { pageNumber: number; text: string }[]
  ): {
    sectionsFound: DetectedClinicalSection[];
    missingMandatorySections: string[];
    completenessRatio: number;
  } {
    const allFound: DetectedClinicalSection[] = [];
    const foundKeys = new Set<string>();

    for (const p of pages) {
      const pageSections = this.detectSectionsInPage(p.pageNumber, p.text);
      for (const sec of pageSections) {
        allFound.push(sec);
        foundKeys.add(sec.standardKey);
      }
    }

    const mandatorySections = STANDARD_CLINICAL_SECTIONS.filter(s => s.isMandatory);
    const missingMandatory: string[] = [];

    for (const man of mandatorySections) {
      if (!foundKeys.has(man.standardKey)) {
        missingMandatory.push(man.name);
      }
    }

    const completenessRatio = (mandatorySections.length - missingMandatory.length) / mandatorySections.length;

    return {
      sectionsFound: allFound,
      missingMandatorySections: missingMandatory,
      completenessRatio: parseFloat(completenessRatio.toFixed(2))
    };
  }
}
