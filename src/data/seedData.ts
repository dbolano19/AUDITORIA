import {
  IPS,
  User,
  Patient,
  Audit,
  ClinicalDocHC,
  IngresoNote,
  DailyFollowUp,
  DiagnosticAid,
  ProcedureItem,
  TreatmentItem,
  AdditionalTreatments,
  Finding,
  UserSatisfaction,
  StayAnalysis,
  RecommendationItem,
  AuditAction,
  AuditTrail
} from '../types';

export const INITIAL_IPS: IPS[] = [
  {
    id: 'ips-bonadona',
    code: 'IPS-001',
    name: 'Clínica Bonadona Prevenir',
    city: 'Barranquilla',
    department: 'Atlántico',
    status: 'Activa',
    createdAt: '2025-01-15',
    bedsCapacity: 180,
    servicesAvailable: ['UCI Adultos', 'Hospitalización', 'Cirugía', 'Urgencias', 'Oncología'],
    observations: 'Centro de referencia de alta complejidad en oncología y medicina interna.',
    contacts: [
      { name: 'Dra. Carmen Valencia', role: 'Coordinadora de Auditoría Concurrente', email: 'c.valencia@bonadona.med.co', phone: '+57 (605) 367-8900' },
      { name: 'Dr. Roberto Mendoza', role: 'Director Médico', email: 'r.mendoza@bonadona.med.co', phone: '+57 (605) 367-8901' }
    ]
  },
  {
    id: 'ips-misericordia',
    code: 'IPS-002',
    name: 'Clínica de la Misericordia Internacional',
    city: 'Barranquilla',
    department: 'Atlántico',
    status: 'Activa',
    createdAt: '2025-01-20',
    bedsCapacity: 220,
    servicesAvailable: ['UCI Adultos', 'UCI Pediátrica', 'Hospitalización', 'Hemodinamia', 'Urgencias'],
    observations: 'Institución de IV nivel con programa especializado cardiovascular y trauma.',
    contacts: [
      { name: 'Dr. Fernando Arteta', role: 'Jefe de Calidad y Auditoría', email: 'f.arteta@misericordia.org.co', phone: '+57 (605) 385-4000' },
      { name: 'Enf. Luisa Morales', role: 'Auditora de Cuentas Médicas', email: 'l.morales@misericordia.org.co', phone: '+57 (605) 385-4005' }
    ]
  },
  {
    id: 'ips-clinica-costa',
    code: 'IPS-003',
    name: 'Clínica Costa',
    city: 'Barranquilla',
    department: 'Atlántico',
    status: 'Activa',
    createdAt: '2025-02-01',
    bedsCapacity: 140,
    servicesAvailable: ['Hospitalización General', 'Cirugía Mayor', 'Urgencias', 'Gineco-Obstetricia'],
    observations: 'Institución prestadora de servicios de III nivel con amplia cobertura quirúrgica.',
    contacts: [
      { name: 'Dra. Martha Salazar', role: 'Auditora Médica Concurrente', email: 'm.salazar@clinicacosta.com.co', phone: '+57 (605) 358-1122' },
      { name: 'Ing. David Ospina', role: 'Coordinador de Sistemas de Salud', email: 'd.ospina@clinicacosta.com.co', phone: '+57 (605) 358-1125' }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Alejandro Restrepo',
    email: 'admin.auditoria@minsalud.gov.co',
    role: 'Administrador',
    specialty: 'Medicina Interna / Auditoría en Salud',
    regMedica: 'RM-08-44921'
  },
  {
    id: 'usr-auditor-1',
    name: 'Dra. Patricia Charry',
    email: 'p.charry@auditoria.co',
    role: 'Auditor',
    specialty: 'Epidemiología y Auditoría Clínica',
    regMedica: 'RM-08-31204',
    ipsAssigned: ['ips-bonadona', 'ips-misericordia']
  },
  {
    id: 'usr-coord-1',
    name: 'Dr. Gabriel Echeverri',
    email: 'g.echeverri@auditoria.co',
    role: 'Coordinador',
    specialty: 'Gerencia Hospitalaria',
    regMedica: 'RM-08-19882'
  },
  {
    id: 'usr-super-1',
    name: 'Dra. María Jimena Santos',
    email: 'mj.santos@superintendencia.gov.co',
    role: 'Supervisor',
    specialty: 'Garantía de Calidad'
  },
  {
    id: 'usr-consulta-1',
    name: 'Lic. Andrés Buelvas',
    email: 'a.buelvas@analitica.co',
    role: 'Consulta',
    specialty: 'Analista de Datos Clínicos'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    internalId: 'BON-PAC-2025-0101',
    docType: 'CC',
    docNumber: '1047483920',
    fullName: 'Carlos Alberto Vives Meza (Ficticio)',
    age: 58,
    sex: 'M',
    originDepartment: 'Atlántico',
    originMunicipality: 'Barranquilla',
    ipsId: 'ips-bonadona',
    ipsName: 'Clínica Bonadona Prevenir',
    service: 'UCI Adultos',
    roomBed: 'Cama UCI-04',
    admissionDate: '2025-05-10',
    mainDiagnosis: 'Neumonía adquirida en la comunidad grave con choque séptico',
    mainDiagnosisCode: 'J18.9',
    secondaryDiagnoses: ['EPOC descompensado', 'Hipertensión arterial estadio 2', 'Diabetes Mellitus tipo 2'],
    attendingPhysician: 'Dr. Jorge Navarro (Intensivista)',
    status: 'Hospitalizado',
    triageLevel: 'I - Reanimación',
    eps: 'Sura EPS',
    observations: 'Paciente con requerimiento de ventilación mecánica invasiva y soporte vasopresor en descenso.'
  },
  {
    id: 'pat-002',
    internalId: 'BON-PAC-2025-0102',
    docType: 'CC',
    docNumber: '32789124',
    fullName: 'Elena Sofía Ceballos Rojas (Ficticio)',
    age: 44,
    sex: 'F',
    originDepartment: 'Atlántico',
    originMunicipality: 'Soledad',
    ipsId: 'ips-bonadona',
    ipsName: 'Clínica Bonadona Prevenir',
    service: 'Hospitalización Piso 4',
    roomBed: 'Habitación 412-A',
    admissionDate: '2025-05-14',
    mainDiagnosis: 'Apendicitis aguda con peritonitis localizada',
    mainDiagnosisCode: 'K35.3',
    secondaryDiagnoses: ['Hemorragia digestiva alta previa inactiva'],
    attendingPhysician: 'Dra. Liliana Gómez (Cirugía General)',
    status: 'Hospitalizado',
    triageLevel: 'II - Emergencia',
    eps: 'Sanitas EPS',
    observations: 'Postoperatorio día 4 apendicectomía laparoscópica. Drenaje serohemático escaso.'
  },
  {
    id: 'pat-003',
    internalId: 'MIS-PAC-2025-0201',
    docType: 'CC',
    docNumber: '1129548231',
    fullName: 'Guillermo José De La Hoz (Ficticio)',
    age: 67,
    sex: 'M',
    originDepartment: 'Magdalena',
    originMunicipality: 'Ciénaga',
    ipsId: 'ips-misericordia',
    ipsName: 'Clínica de la Misericordia Internacional',
    service: 'UCI Coronaria',
    roomBed: 'Box 02 - Coronaria',
    admissionDate: '2025-05-08',
    mainDiagnosis: 'Infarto agudo de miocardio con elevación del ST (IAMCEST) Killip III',
    mainDiagnosisCode: 'I21.0',
    secondaryDiagnoses: ['Insuficiencia cardíaca congestiva descompensada', 'Enfermedad renal crónica estadio 3b'],
    attendingPhysician: 'Dr. Hernando Castro (Cardiología Intervencionista)',
    status: 'Hospitalizado',
    triageLevel: 'I - Reanimación',
    eps: 'Nueva EPS',
    observations: 'Post angioplastia coronaria con stent medicado a DA. En titulación de inotrópicos.'
  },
  {
    id: 'pat-004',
    internalId: 'MIS-PAC-2025-0202',
    docType: 'TI',
    docNumber: '1088492019',
    fullName: 'Mateo Sebastián Barreto Peña (Ficticio)',
    age: 15,
    sex: 'M',
    originDepartment: 'Atlántico',
    originMunicipality: 'Malambo',
    ipsId: 'ips-misericordia',
    ipsName: 'Clínica de la Misericordia Internacional',
    service: 'Hospitalización Pediátrica',
    roomBed: 'Habitación 204',
    admissionDate: '2025-05-18',
    mainDiagnosis: 'Crisis asmática severa tratada',
    mainDiagnosisCode: 'J45.9',
    secondaryDiagnoses: ['Rinitis alérgica perenne'],
    attendingPhysician: 'Dra. Claudia Paternina (Pediatría)',
    status: 'Hospitalizado',
    triageLevel: 'II - Emergencia',
    eps: 'Coosalud EPS',
    observations: 'En desescalonamiento de broncodilatadores y corticoide sistémico.'
  },
  {
    id: 'pat-005',
    internalId: 'COS-PAC-2025-0301',
    docType: 'CC',
    docNumber: '72389104',
    fullName: 'Raúl Alfonso Peñaloza Ortiz (Ficticio)',
    age: 72,
    sex: 'M',
    originDepartment: 'Bolívar',
    originMunicipality: 'Cartagena',
    ipsId: 'ips-clinica-costa',
    ipsName: 'Clínica Costa',
    service: 'Hospitalización Quirúrgica',
    roomBed: 'Cama 315-B',
    admissionDate: '2025-05-02',
    mainDiagnosis: 'Fractura transtrocantérica de fémur derecho desplazada',
    mainDiagnosisCode: 'S72.1',
    secondaryDiagnoses: ['Demencia senil tipo Alzheimer leve', 'Desnutrición calórico-proteica'],
    attendingPhysician: 'Dr. Víctor Rueda (Ortopedia y Traumatología)',
    status: 'Hospitalizado',
    triageLevel: 'III - Urgencia',
    eps: 'Salud Total EPS',
    observations: 'Estancia prolongada (18 días) por demora en autorización de material de osteosíntesis por parte de la EPS.'
  },
  {
    id: 'pat-006',
    internalId: 'COS-PAC-2025-0302',
    docType: 'CC',
    docNumber: '55892144',
    fullName: 'Ana Cecilia Orozco Arrieta (Ficticio)',
    age: 39,
    sex: 'F',
    originDepartment: 'Atlántico',
    originMunicipality: 'Puerto Colombia',
    ipsId: 'ips-clinica-costa',
    ipsName: 'Clínica Costa',
    service: 'Gineco-Obstetricia',
    roomBed: 'Cama 108',
    admissionDate: '2025-05-19',
    mainDiagnosis: 'Preeclampsia severa en puerperio mediato',
    mainDiagnosisCode: 'O14.1',
    secondaryDiagnoses: ['Cesárea segmentaria urgente'],
    attendingPhysician: 'Dra. Beatriz Guzmán (Ginecología)',
    status: 'Hospitalizado',
    triageLevel: 'I - Reanimación',
    eps: 'Famisanar EPS',
    observations: 'En manejo con Sulfato de Magnesio y Labetalol oral. Cifras tensionales en metas.'
  }
];

export const INITIAL_AUDITS: Audit[] = [
  {
    id: 'aud-001',
    auditCode: 'AUD-2025-BON-001',
    ipsId: 'ips-bonadona',
    patientId: 'pat-001',
    auditDate: '2025-05-19',
    auditorId: 'usr-auditor-1',
    auditorName: 'Dra. Patricia Charry',
    type: 'Auditoría completa',
    status: 'En revisión',
    createdAt: '2025-05-19T08:30:00Z',
    updatedAt: '2025-05-19T14:45:00Z',
    generalNotes: 'Auditoría concurrente de paciente en UCI. Se detecta retraso en reporte de cultivos y pertinencia de antibioticoterapia.'
  },
  {
    id: 'aud-002',
    auditCode: 'AUD-2025-BON-002',
    ipsId: 'ips-bonadona',
    patientId: 'pat-002',
    auditDate: '2025-05-18',
    auditorId: 'usr-auditor-1',
    auditorName: 'Dra. Patricia Charry',
    type: 'Seguimiento diario',
    status: 'Validada',
    createdAt: '2025-05-18T10:00:00Z',
    updatedAt: '2025-05-18T16:20:00Z',
    validationDate: '2025-05-18T17:00:00Z',
    validatedBy: 'Dr. Gabriel Echeverri',
    generalNotes: 'Evolución quirúrgica favorable. Cumple criterios para alta temprana en próximas 24 horas.'
  },
  {
    id: 'aud-003',
    auditCode: 'AUD-2025-MIS-001',
    ipsId: 'ips-misericordia',
    patientId: 'pat-003',
    auditDate: '2025-05-19',
    auditorId: 'usr-auditor-1',
    auditorName: 'Dra. Patricia Charry',
    type: 'Revisión de estancia',
    status: 'Borrador',
    createdAt: '2025-05-19T11:15:00Z',
    updatedAt: '2025-05-19T11:15:00Z',
    generalNotes: 'Evaluación de estancia en UCI Coronaria. Pendiente ecocardiograma de control para pase a piso.'
  },
  {
    id: 'aud-004',
    auditCode: 'AUD-2025-COS-001',
    ipsId: 'ips-clinica-costa',
    patientId: 'pat-005',
    auditDate: '2025-05-17',
    auditorId: 'usr-auditor-1',
    auditorName: 'Dra. Patricia Charry',
    type: 'Revisión de estancia',
    status: 'Pendiente de validación',
    createdAt: '2025-05-17T09:30:00Z',
    updatedAt: '2025-05-19T09:00:00Z',
    generalNotes: 'Alerta crítica por estancia prolongada (18 días). Barrera administrativa de EPS en autorización de material de síntesis.'
  }
];

export const INITIAL_DOCUMENTS: ClinicalDocHC[] = [
  {
    id: 'doc-001',
    patientId: 'pat-001',
    auditId: 'aud-001',
    fileName: 'HC_CarlosVives_UCI_Ingreso_Evoluciones.pdf',
    fileSize: 4820000,
    pageCount: 14,
    uploadDate: '2025-05-19T08:45:00Z',
    uploadedBy: 'Dra. Patricia Charry',
    status: 'Procesado',
    documentType: 'Historia Clínica Completa',
    extractedTextSnippet: 'Ingreso UCI Adultos 10/05/2025. Paciente masculino de 58 años remitido por cuadro de dificultad respiratoria progresiva, fiebre no cuantificada y deterioro del estado de conciencia. TAC de tórax evidencia consolidaciones bibasales con broncograma aéreo...',
    notes: 'Documento completo con notas médicas de UCI, hoja de signos vitales y órdenes médicas.'
  },
  {
    id: 'doc-002',
    patientId: 'pat-001',
    auditId: 'aud-001',
    fileName: 'Paraclinicos_Cultivos_CarlosVives.pdf',
    fileSize: 1250000,
    pageCount: 3,
    uploadDate: '2025-05-19T09:10:00Z',
    uploadedBy: 'Dra. Patricia Charry',
    status: 'Procesado',
    documentType: 'Resultados Paraclínicos',
    extractedTextSnippet: 'Hemocultivos tomados el 10/05/2025: Frascos 1 y 2 positivos para Klebsiella pneumoniae BLEE (+). Antibiograma sensible a Meropenem y Amikacina.',
    notes: 'Reporte definitivo de microbiología.'
  },
  {
    id: 'doc-003',
    patientId: 'pat-005',
    auditId: 'aud-004',
    fileName: 'HC_RaulPenaloza_Ortopedia_Barreras.pdf',
    fileSize: 3100000,
    pageCount: 8,
    uploadDate: '2025-05-17T10:00:00Z',
    uploadedBy: 'Dra. Patricia Charry',
    status: 'Procesado',
    documentType: 'Historia Clínica Completa',
    extractedTextSnippet: 'Paciente de 72 años con fractura transtrocantérica de fémur derecho. Solicitud de material de osteosíntesis clavos DHS enviada el 03/05/2025. Sin respuesta oportuna de EPS.',
    notes: 'Contiene soporte de radicaciones de solicitud de material a EPS.'
  }
];

export const INITIAL_INGRESO_NOTES: Record<string, IngresoNote> = {
  'aud-001': {
    auditId: 'aud-001',
    followUpDate: '2025-05-19',
    hospitalizationReason: 'Insuficiencia respiratoria aguda tipo 1 e inestabilidad hemodinámica secundaria a neumonía adquirida en la comunidad grave.',
    relevantSigns: 'Taquipneico (FR 28), tirajes intercostales, estertores crepitantes bilaterales en campos medios e inferiores, cianosis periférica.',
    relevantSymptoms: 'Disnea de pequeños esfuerzos de 5 días de evolución, tos productiva con expectoración mucopurulenta, fiebre de 38.8 °C y astenia marcada.',
    presumptiveDx: '1. Neumonía adquirida en la comunidad severa (CURB-65 = 3 puntos). 2. Choque séptico de origen pulmonar resuelto en transición. 3. EPOC exacerbado Anthonisen I.',
    initialTreatment: 'Intubación orotraqueal + VMI asistida/controlada, sedoanalgesia con fentanilo/midazolam, cristaloides balanceados, Noradrenalina en titulación, Ampicilina/Sulbactam + Claritromicina IV.',
    diagnosticAids: 'TAC de tórax contrastado, gases arteriales basales, hemograma, PCR, procalcitonina, panel de hemocultivos x 2, urocultivo y frotis nasofaríngeo para virus respiratorios.',
    pendingItems: 'Ajuste de antibiótico según reporte microbiológico, ventana de sedación y prueba de ventilación espontánea.',
    auditorObservations: 'Ingreso pertinente a UCI. El manejo inicial siguió las guías clínicas para choque séptico y NAC grave.',
    auditorAnalysis: 'Se evidencia correcta pertinencia en la indicación de estancia en UCI. Requiere vigilancia estricta del tiempo de soporte ventilatorio para evitar neumonía asociada al ventilador.'
  }
};

export const INITIAL_DAILY_FOLLOWUPS: Record<string, DailyFollowUp[]> = {
  'aud-001': [
    {
      id: 'fol-001',
      auditId: 'aud-001',
      date: '2025-05-18',
      clinicalStatus: 'Paciente en día 8 de UCI, afebril, tolerando nutrición enteral por SNG, con destete progresivo de sedación. Buena mecánica ventilatoria.',
      relevantVitalSigns: {
        bp: '125/78',
        hr: 76,
        rr: 18,
        temp: 36.8,
        spo2: 97,
        gcs: 11
      },
      significantClinicalChanges: 'Retiro exitoso de soporte vasopresor (Noradrenalina suspendida hace 24 horas). PaFi mejoró a 280.',
      importantRecentParaclinicals: 'Leucocitos: 11.200 (previo 18.500), PCR: 34 mg/L (previo 120), Procalcitonina: 0.4 ng/mL (en descenso). Gases con acidosis metabólica compensada resuelta.',
      clinicalRisks: {
        infection: true,
        bleeding: false,
        decompensation: false,
        falls: false,
        other: true,
        otherDetail: 'Riesgo de extubación accidental y delirio de UCI'
      },
      medicalAnalysisAndPlan: 'Evolución clínica favorable. Se planea extubación programada en horas de la tarde tras prueba de tubo en T de 30 minutos.',
      pendingItems: 'Reporte definitivo de hemocultivos de control y evaluación por fonoaudiología post extubación.',
      auditorObservations: 'Manejo adecuado del destete ventilatorio. Se sugiere verificar suspensión oportuna de antibioterapia empírica.',
      createdAt: '2025-05-18T11:00:00Z'
    },
    {
      id: 'fol-002',
      auditId: 'aud-001',
      date: '2025-05-19',
      clinicalStatus: 'Paciente post-extubado hace 12 horas, conectado a cánula nasal a 3 L/min. Consciente, orientado, cooperador.',
      relevantVitalSigns: {
        bp: '130/82',
        hr: 82,
        rr: 20,
        temp: 36.6,
        spo2: 95,
        gcs: 15
      },
      significantClinicalChanges: 'Tolera vía oral sin disfagia ni broncoaspiración. No signos de dificultad respiratoria.',
      importantRecentParaclinicals: 'Control de hemograma con leucocitos normales (8.900), creatinina 0.9 mg/dL.',
      clinicalRisks: {
        infection: false,
        bleeding: false,
        decompensation: false,
        falls: true,
        other: false,
        otherDetail: 'Riesgo de caída al iniciar bipedestación'
      },
      medicalAnalysisAndPlan: 'Candidato a traslado a sala de hospitalización general en el transcurso del día.',
      pendingItems: 'Asignación de cama en piso de hospitalización general.',
      auditorObservations: 'Criterio de alta de UCI cumplido. El auditor activa seguimiento para evitar estancia prolongada en UCI por falta de cama en piso.',
      createdAt: '2025-05-19T09:30:00Z'
    }
  ]
};

export const INITIAL_DIAGNOSTIC_AIDS: Record<string, DiagnosticAid[]> = {
  'aud-001': [
    {
      id: 'diag-001',
      auditId: 'aud-001',
      requestDate: '2025-05-10',
      studyName: 'Tomografía axial computarizada de tórax de alta resolución',
      reason: 'Diagnóstico diferencial de neumonía multifocal vs tromboembolismo pulmonar',
      executionDate: '2025-05-10',
      result: 'Opacidades alveolares densas en lóbulo inferior derecho y lóbulo superior izquierdo.',
      interpretation: 'Hallazgos compatibles con bronconeumonía severa bilateral sin derrame pleural significativo.',
      status: 'Completado',
      pertinenceEvaluation: 'Pertinente',
      auditorNotes: 'Estudio de imagen crucial para estadificación y manejo de vía aérea.'
    },
    {
      id: 'diag-002',
      auditId: 'aud-001',
      requestDate: '2025-05-11',
      studyName: 'Hemocultivos pareados aerobios y anaerobios',
      reason: 'Aislamiento microbiológico en choque séptico pulmonar',
      executionDate: '2025-05-11',
      result: 'Klebsiella pneumoniae BLEE (+)',
      interpretation: 'Sensibilidad a carbapenémicos y aminoglucósidos.',
      status: 'Completado',
      pertinenceEvaluation: 'Pertinente',
      auditorNotes: 'Toma oportuna antes de inicio de antibióticos de segunda línea.'
    },
    {
      id: 'diag-003',
      auditId: 'aud-001',
      requestDate: '2025-05-17',
      studyName: 'Ecocardiograma transtorácico con doppler',
      reason: 'Valoración de función ventricular post retiro de inotrópicos',
      executionDate: undefined,
      result: undefined,
      interpretation: undefined,
      status: 'Demorado',
      pertinenceEvaluation: 'En observación',
      auditorNotes: 'Solicitado hace 48 horas sin ejecución por disponibilidad de cardiólogo ecocardiografista.'
    }
  ]
};

export const INITIAL_PROCEDURES: Record<string, ProcedureItem[]> = {
  'aud-001': [
    {
      id: 'proc-001',
      auditId: 'aud-001',
      date: '2025-05-10',
      procedureName: 'Intubación orotraqueal e instalación de catéter venoso central subclavio',
      indication: 'Falla ventilatoria aguda e inestabilidad hemodinámica con requerimiento vasopresor',
      status: 'Realizado',
      result: 'Procedimientos sin complicaciones inmediatas. Rx de control confirma punta de catéter en VCS y tubo en carina +3cm.',
      observations: 'Técnica estéril con lista de chequeo de inserción.',
      pertinenceEvaluation: 'Pertinente'
    },
    {
      id: 'proc-002',
      auditId: 'aud-001',
      date: '2025-05-18',
      procedureName: 'Extubación orotraqueal programada',
      indication: 'Destete ventilatorio exitoso y estabilidad gasométrica',
      status: 'Realizado',
      result: 'Tolerancia adecuada a la extubación sin estridor ni tirajes.',
      observations: 'Se continúa soporte con cánula nasal.',
      pertinenceEvaluation: 'Pertinente'
    }
  ]
};

export const INITIAL_TREATMENTS: Record<string, TreatmentItem[]> = {
  'aud-001': [
    {
      id: 'tx-001',
      auditId: 'aud-001',
      medication: 'Meropenem',
      dose: '1 g',
      route: 'Intravenosa',
      frequency: 'Cada 8 horas en infusión extendida de 3h',
      startDate: '2025-05-12',
      endDate: '2025-05-22',
      observations: 'Ajustado por antibiograma. Completa 7 días hoy.',
      pertinenceEvaluation: 'Pertinente'
    },
    {
      id: 'tx-002',
      auditId: 'aud-001',
      medication: 'Enoxaparina sódica',
      dose: '40 mg',
      route: 'Subcutánea',
      frequency: 'Cada 24 horas',
      startDate: '2025-05-11',
      observations: 'Tromboprofilaxis en paciente crítico inmovilizado.',
      pertinenceEvaluation: 'Pertinente'
    },
    {
      id: 'tx-003',
      auditId: 'aud-001',
      medication: 'Omeprazol',
      dose: '40 mg',
      route: 'Intravenosa',
      frequency: 'Cada 24 horas',
      startDate: '2025-05-10',
      observations: 'Profilaxis de úlceras por estrés.',
      pertinenceEvaluation: 'Pertinente'
    }
  ]
};

export const INITIAL_ADDITIONAL_TREATMENTS: Record<string, AdditionalTreatments> = {
  'aud-001': {
    auditId: 'aud-001',
    oxygenSupport: 'Cánula nasal a 3 Litros/minuto (FiO2 aproximada 32%).',
    ventilatorySupport: 'Previamente en Ventilación Mecánica Invasiva (retirada el 18/05/2025).',
    rehabilitation: 'Fisioterapia respiratoria e incentivo respiratorio 2 veces al día + movilización pasiva de extremidades.',
    otherTreatments: 'Control estricto de glucemias con esquema de insulina según glucometrías.'
  }
};

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'find-001',
    auditId: 'aud-001',
    patientId: 'pat-001',
    ipsId: 'ips-bonadona',
    category: 'Oportunidad',
    description: 'Demora superior a 48 horas en la realización del ecocardiograma transtorácico de control post-retiro de soporte vasopresor.',
    evidenceText: 'Orden médica generada el 17/05/2025 a las 08:30. A la fecha 19/05/2025 no registra agendamiento ni ejecución en el sistema institucional.',
    evidenceDetails: {
      sourceDocId: 'doc-001',
      sourceDocName: 'HC_CarlosVives_UCI_Ingreso_Evoluciones.pdf',
      pdfPage: 9,
      documentDate: '2025-05-17',
      documentType: 'Ordenes Médicas',
      evidenceText: 'Página 9: "Ecocardiograma transtorácico control para valorar FEVI post inotrópicos. Pendiente ejecución por falta de turno".',
      observation: 'Retrasa la toma de decisión para el traslado definitivo a hospitalización general.'
    },
    impact: 'Posible prolongación injustificada de estancia en cama de UCI con mayor costo diario para el pagador.',
    priority: 'Alto',
    recommendation: 'Gestionar con el servicio de Cardiología la realización prioritaria del ecocardiograma en el turno matutino.',
    responsible: 'Coordinación Médica UCI / Jefe de Cardiología Bonadona',
    deadline: '2025-05-20',
    status: 'En proceso',
    createdAt: '2025-05-19T09:45:00Z'
  },
  {
    id: 'find-002',
    auditId: 'aud-001',
    patientId: 'pat-001',
    ipsId: 'ips-bonadona',
    category: 'Seguridad del paciente',
    description: 'Falta de registro de escala de riesgo de caídas post-extubación al iniciar levantada asistida.',
    evidenceText: 'Evolución de enfermería del 19/05/2025 a las 06:00 reporta paciente en sillón sin puntuación de escala Downton/Morse.',
    evidenceDetails: {
      sourceDocId: 'doc-001',
      sourceDocName: 'HC_CarlosVives_UCI_Ingreso_Evoluciones.pdf',
      pdfPage: 12,
      documentDate: '2025-05-19',
      documentType: 'Evolución de Enfermería',
      evidenceText: 'Página 12: "Paciente consciente pasa a sillón 30 min. Sin incidentes". No se anexa semáforo de caída.',
      observation: 'Riesgo de evento adverso en paciente con polineuropatía del paciente crítico.'
    },
    impact: 'Riesgo de caída y trauma intrahospitalario en paciente frágil post UCI.',
    priority: 'Moderado',
    recommendation: 'Diligenciar inmediatamente la valoración de riesgo de caída y aplicar medidas de contención ambiental.',
    responsible: 'Jefe de Enfermería UCI Bonadona',
    deadline: '2025-05-19',
    status: 'Pendiente',
    createdAt: '2025-05-19T10:15:00Z'
  },
  {
    id: 'find-003',
    auditId: 'aud-004',
    patientId: 'pat-005',
    ipsId: 'ips-clinica-costa',
    category: 'Estancia',
    description: 'Estancia hospitalaria prolongada (18 días) por barrera administrativa de autorización de material de osteosíntesis.',
    evidenceText: 'Paciente ingresó el 02/05/2025 con fractura de fémur. Orden de clavo DHS radicada el 03/05/2025. Al 19/05/2025 la EPS no ha emitido autorización de entrega.',
    evidenceDetails: {
      sourceDocId: 'doc-003',
      sourceDocName: 'HC_RaulPenaloza_Ortopedia_Barreras.pdf',
      pdfPage: 4,
      documentDate: '2025-05-03',
      documentType: 'Historia Clínica Completa',
      evidenceText: 'Radicado No. EPS-2025-88231 pendiente por auditoría concurrente del asegurador.',
      observation: '14 días de estancia atribuibles exclusivamente a demora de suministro.'
    },
    impact: 'Sobrecosto hospitalario acumulado superior a $12.000.000 COP y riesgo de úlceras por presión y trombosis venosa profunda.',
    priority: 'Crítico',
    recommendation: 'Escalar caso a la gerencia de enlace de la EPS y activar tutela con medida cautelar de salud si no hay respuesta en 12 horas.',
    responsible: 'Gestor de Enlace EPS / Auditor Líder Salud Total',
    deadline: '2025-05-18',
    status: 'Vencido',
    createdAt: '2025-05-17T11:00:00Z'
  },
  {
    id: 'find-004',
    auditId: 'aud-003',
    patientId: 'pat-003',
    ipsId: 'ips-misericordia',
    category: 'Pertinencia',
    description: 'Omisión de registro de justificación clínica para mantenimiento de sonda vesical a permanencia post retiro de diuréticos endovenosos.',
    evidenceText: 'Nota de evolución del 19/05/2025 mantiene sonda Foley permeable sin diuresis horaria estricta justificada.',
    impact: 'Riesgo de infección del tracto urinario asociada a catéter (ITU-AC).',
    priority: 'Bajo',
    recommendation: 'Evaluar retiro inmediato de catéter urinario o justificar necesidad de cuantificación estricta.',
    responsible: 'Médico Tratante UCI Coronaria Misericordia',
    deadline: '2025-05-20',
    status: 'Pendiente',
    createdAt: '2025-05-19T11:30:00Z'
  }
];

export const INITIAL_USER_SATISFACTION: Record<string, UserSatisfaction> = {
  'aud-001': {
    auditId: 'aud-001',
    dignifiedTreatment: 'Sí',
    dxInformation: 'Sí',
    txInformation: 'Sí',
    nonConformities: 'No',
    nonConformitiesDesc: '',
    unresolvedNeeds: 'No',
    unresolvedNeedsDesc: '',
    emotionalSupport: 'Sí',
    comfort: 'Adecuado',
    observations: 'Familiar (esposa) manifiesta satisfacción con el trato del personal médico y la claridad en los informes diarios de UCI.',
    updatedAt: '2025-05-19T12:00:00Z'
  }
};

export const INITIAL_STAY_ANALYSIS: Record<string, StayAnalysis> = {
  'aud-001': {
    auditId: 'aud-001',
    admissionDate: '2025-05-10',
    currentDate: '2025-05-19',
    stayDays: 9,
    clinicalJustification: 'Paciente cursó con choque séptico pulmonar y falla ventilatoria aguda severa con necesidad de VMI durante 7 días.',
    prolongedStayRisk: 'Moderado',
    administrativeBarriers: 'Ninguna barrera administrativa reportada con EPS Sura.',
    operationalBarriers: 'Demora en asignación de cama de hospitalización general piso 3/4 para traslado de UCI.',
    clinicalBarriers: 'Vigilancia de estabilidad respiratoria en las primeras 24 horas post-extubación.',
    earlyDischargePossibility: 'En evaluación',
    earlyDischargeNotes: 'Posible traslado hoy a piso; alta médica proyectada en 72 horas completando ciclo antibiótico.',
    ipsActions: 'Gestión prioritaria de cama básica y solicitud de ecocardiograma.',
    avoidableCostsEstimated: 0,
    updatedAt: '2025-05-19T13:00:00Z'
  },
  'aud-004': {
    auditId: 'aud-004',
    admissionDate: '2025-05-02',
    currentDate: '2025-05-19',
    stayDays: 18,
    clinicalJustification: 'Paciente fracturado inmovilizado en tracción esquelética en espera de intervención quirúrgica.',
    prolongedStayRisk: 'Crítico',
    administrativeBarriers: 'Falta de entrega de material de osteosíntesis por parte del proveedor contratado por la EPS.',
    operationalBarriers: 'Turno quirúrgico reprogramado en dos oportunidades por ausencia de insumos ortopédicos.',
    clinicalBarriers: 'Riesgo de trombosis, deterioro cognitivo y atrofia muscular por inmovilidad prolongada.',
    earlyDischargePossibility: 'No',
    earlyDischargeNotes: 'No puede darse de alta sin resolución quirúrgica de la fractura.',
    ipsActions: 'Reiteración de correos a la gerencia de enlace de la aseguradora y notificación a la Secretaría de Salud.',
    avoidableCostsEstimated: 12500000,
    updatedAt: '2025-05-19T10:00:00Z'
  }
};

export const INITIAL_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-001',
    auditId: 'aud-001',
    findingId: 'find-001',
    findingDescription: 'Demora en realización de ecocardiograma de control.',
    requiredAction: 'Priorizar y realizar ecocardiograma transtorácico en jornada AM para liberar cama de UCI.',
    responsible: 'Servicio de Cardiología Bonadona',
    deadline: '2025-05-20',
    priority: 'Alto',
    isRequiredIn24Hours: true,
    status: 'En proceso',
    createdAt: '2025-05-19T10:00:00Z'
  },
  {
    id: 'rec-002',
    auditId: 'aud-001',
    findingId: 'find-002',
    findingDescription: 'Omisión de registro de escala de caídas.',
    requiredAction: 'Aplicar protocolo institucional de prevención de caídas y registrar escala en sistema.',
    responsible: 'Enfermería UCI Bonadona',
    deadline: '2025-05-19',
    priority: 'Moderado',
    isRequiredIn24Hours: true,
    status: 'Pendiente',
    createdAt: '2025-05-19T10:30:00Z'
  },
  {
    id: 'rec-003',
    auditId: 'aud-004',
    findingId: 'find-003',
    findingDescription: 'Estancia prolongada por falta de material de osteosíntesis.',
    requiredAction: 'Despachar de forma urgente el material de osteosíntesis clavos DHS o autorizar compra directa a la IPS.',
    responsible: 'Auditor Médico Regional Salud Total EPS',
    deadline: '2025-05-18',
    priority: 'Crítico',
    isRequiredIn24Hours: true,
    status: 'Vencido',
    createdAt: '2025-05-17T11:15:00Z'
  }
];

export const INITIAL_ACTIONS: AuditAction[] = [
  {
    id: 'act-001',
    recommendationId: 'rec-001',
    auditId: 'aud-001',
    patientId: 'pat-001',
    patientName: 'Carlos Alberto Vives Meza (Ficticio)',
    ipsId: 'ips-bonadona',
    ipsName: 'Clínica Bonadona Prevenir',
    actionDescription: 'Realizar ecocardiograma transtorácico prioritario en jornada AM y emitir reporte.',
    responsible: 'Dr. Roberto Mendoza / Cardiología Bonadona',
    deadline: '2025-05-20',
    priority: 'Alto',
    status: 'En proceso',
    isRequiredIn24Hours: true,
    service: 'UCI Adultos',
    roomBed: 'Cama UCI-04',
    createdAt: '2025-05-19T10:00:00Z'
  },
  {
    id: 'act-002',
    recommendationId: 'rec-002',
    auditId: 'aud-001',
    patientId: 'pat-001',
    patientName: 'Carlos Alberto Vives Meza (Ficticio)',
    ipsId: 'ips-bonadona',
    ipsName: 'Clínica Bonadona Prevenir',
    actionDescription: 'Diligenciar escala de riesgo de caída e instalar brazalete de alerta visual.',
    responsible: 'Enf. Luisa Morales / Turno Mañana',
    deadline: '2025-05-19',
    priority: 'Moderado',
    status: 'Pendiente',
    isRequiredIn24Hours: true,
    service: 'UCI Adultos',
    roomBed: 'Cama UCI-04',
    createdAt: '2025-05-19T10:30:00Z'
  },
  {
    id: 'act-003',
    recommendationId: 'rec-003',
    auditId: 'aud-004',
    patientId: 'pat-005',
    patientName: 'Raúl Alfonso Peñaloza Ortiz (Ficticio)',
    ipsId: 'ips-clinica-costa',
    ipsName: 'Clínica Costa',
    actionDescription: 'Entrega física de material de osteosíntesis DHS en farmacia de quirófano.',
    responsible: 'Proveedor Logístico EPS Salud Total',
    deadline: '2025-05-18',
    priority: 'Crítico',
    status: 'Vencido',
    isRequiredIn24Hours: true,
    service: 'Hospitalización Quirúrgica',
    roomBed: 'Cama 315-B',
    createdAt: '2025-05-17T11:15:00Z'
  },
  {
    id: 'act-004',
    auditId: 'aud-003',
    patientId: 'pat-003',
    patientName: 'Guillermo José De La Hoz (Ficticio)',
    ipsId: 'ips-misericordia',
    ipsName: 'Clínica de la Misericordia Internacional',
    actionDescription: 'Evaluar retiro de sonda Foley y balance de líquidos en coronaria.',
    responsible: 'Dr. Hernando Castro',
    deadline: '2025-05-20',
    priority: 'Bajo',
    status: 'Pendiente',
    isRequiredIn24Hours: false,
    service: 'UCI Coronaria',
    roomBed: 'Box 02 - Coronaria',
    createdAt: '2025-05-19T11:30:00Z'
  }
];

export const INITIAL_AUDIT_TRAIL: AuditTrail[] = [
  {
    id: 'trail-001',
    userId: 'usr-auditor-1',
    userName: 'Dra. Patricia Charry',
    userRole: 'Auditor',
    timestamp: '2025-05-19T08:30:00Z',
    action: 'CREACION_AUDITORIA',
    affectedRecord: 'Auditoria',
    recordId: 'aud-001',
    newValue: 'AUD-2025-BON-001 en estado Borrador',
    details: 'Se crea auditoría completa para paciente Carlos Alberto Vives Meza en Clínica Bonadona Prevenir.'
  },
  {
    id: 'trail-002',
    userId: 'usr-auditor-1',
    userName: 'Dra. Patricia Charry',
    userRole: 'Auditor',
    timestamp: '2025-05-19T08:45:00Z',
    action: 'CARGA_HISTORIA_CLINICA_PDF',
    affectedRecord: 'DocumentoHC',
    recordId: 'doc-001',
    newValue: 'HC_CarlosVives_UCI_Ingreso_Evoluciones.pdf (14 páginas)',
    details: 'Carga de expediente clínico en formato PDF y asociación a paciente y auditoría.'
  },
  {
    id: 'trail-003',
    userId: 'usr-auditor-1',
    userName: 'Dra. Patricia Charry',
    userRole: 'Auditor',
    timestamp: '2025-05-19T09:45:00Z',
    action: 'REGISTRO_HALLAZGO',
    affectedRecord: 'Hallazgo',
    recordId: 'find-001',
    newValue: 'Demora en ecocardiograma de control (Prioridad Alto)',
    details: 'Registro de hallazgo de oportunidad con evidencia asociada en página 9 de HC.'
  },
  {
    id: 'trail-004',
    userId: 'usr-coord-1',
    userName: 'Dr. Gabriel Echeverri',
    userRole: 'Coordinador',
    timestamp: '2025-05-18T17:00:00Z',
    action: 'VALIDACION_AUDITORIA',
    affectedRecord: 'Auditoria',
    recordId: 'aud-002',
    previousValue: 'Pendiente de validación',
    newValue: 'Validada',
    details: 'Aprobación formal de nota de auditoría concurrente para paciente Elena Sofía Ceballos.'
  }
];
