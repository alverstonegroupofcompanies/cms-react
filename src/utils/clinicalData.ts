/** Optional structured clinical documentation for visit worksheets. */

export type ExamFinding = '' | 'normal' | 'abnormal' | 'not_examined'

export type LocalExamTemplate = 'none' | 'ent' | 'dermatology' | 'orthopedics' | 'general'

export type SpecialtyKey =
  | 'none'
  | 'diabetes'
  | 'hypertension'
  | 'respiratory'
  | 'pediatrics'
  | 'gynecology'

export interface ClinicalData {
  visit: {
    visit_type: '' | 'new' | 'follow_up'
    previous_diagnosis: string
    past_history: string
    current_medications: string
    known_allergies: string
    drug_allergies: string
    previous_surgeries: string
    family_history: string
    lifestyle: string
  }
  vitals: {
    temperature_f: string
    bp_systolic: string
    bp_diastolic: string
    pulse: string
    respiratory_rate: string
    spo2: string
    weight_kg: string
    height_cm: string
    blood_glucose: string
    pain_score: string
  }
  complaint: {
    onset: string
    duration: string
    severity: string
    location: string
    frequency: string
    character: string
    aggravating: string
    relieving: string
    associated: string
  }
  general_exam: Record<string, ExamFinding>
  system_exam: {
    respiratory: Record<string, ExamFinding>
    cardiovascular: Record<string, ExamFinding>
    abdomen: Record<string, ExamFinding>
    neurological: Record<string, ExamFinding>
    musculoskeletal: Record<string, ExamFinding>
  }
  local_exam: {
    template: LocalExamTemplate
    notes: string
    fields: Record<string, string>
  }
  assessment: {
    findings_summary: string
    assessment: string
    differential: string
  }
  specialty: {
    key: SpecialtyKey
    fields: Record<string, string>
  }
  plan: {
    advice: string
    follow_up: string
  }
}

export const GENERAL_EXAM_FIELDS = [
  { key: 'appearance', label: 'General appearance' },
  { key: 'consciousness', label: 'Consciousness' },
  { key: 'orientation', label: 'Orientation' },
  { key: 'hydration', label: 'Hydration' },
  { key: 'pallor', label: 'Pallor' },
  { key: 'jaundice', label: 'Jaundice' },
  { key: 'cyanosis', label: 'Cyanosis' },
  { key: 'clubbing', label: 'Clubbing' },
  { key: 'edema', label: 'Edema' },
  { key: 'lymph_nodes', label: 'Lymph nodes' },
] as const

export const SYSTEM_EXAM_SECTIONS = [
  {
    key: 'respiratory' as const,
    label: 'Respiratory',
    fields: [
      { key: 'air_entry', label: 'Air entry' },
      { key: 'breath_sounds', label: 'Breath sounds' },
      { key: 'wheezing', label: 'Wheezing' },
      { key: 'crepitations', label: 'Crepitations' },
      { key: 'distress', label: 'Respiratory distress' },
    ],
  },
  {
    key: 'cardiovascular' as const,
    label: 'Cardiovascular',
    fields: [
      { key: 'heart_sounds', label: 'Heart sounds' },
      { key: 'rhythm', label: 'Rhythm' },
      { key: 'murmur', label: 'Murmur' },
      { key: 'peripheral_pulses', label: 'Peripheral pulses' },
      { key: 'edema', label: 'Edema' },
    ],
  },
  {
    key: 'abdomen' as const,
    label: 'Abdomen',
    fields: [
      { key: 'soft_tender', label: 'Soft / tender' },
      { key: 'distension', label: 'Distension' },
      { key: 'bowel_sounds', label: 'Bowel sounds' },
      { key: 'organomegaly', label: 'Organomegaly' },
      { key: 'mass', label: 'Mass' },
    ],
  },
  {
    key: 'neurological' as const,
    label: 'Neurological',
    fields: [
      { key: 'consciousness', label: 'Consciousness' },
      { key: 'orientation', label: 'Orientation' },
      { key: 'motor', label: 'Motor function' },
      { key: 'sensory', label: 'Sensory function' },
      { key: 'reflexes', label: 'Reflexes' },
      { key: 'cranial_nerves', label: 'Cranial nerves' },
    ],
  },
  {
    key: 'musculoskeletal' as const,
    label: 'Musculoskeletal',
    fields: [
      { key: 'rom', label: 'Range of motion' },
      { key: 'swelling', label: 'Swelling' },
      { key: 'tenderness', label: 'Tenderness' },
      { key: 'deformity', label: 'Deformity' },
    ],
  },
] as const

export const LOCAL_EXAM_TEMPLATES: Record<
  Exclude<LocalExamTemplate, 'none'>,
  { label: string; fields: { key: string; label: string }[] }
> = {
  general: {
    label: 'General local',
    fields: [
      { key: 'site', label: 'Site' },
      { key: 'findings', label: 'Findings' },
    ],
  },
  ent: {
    label: 'ENT',
    fields: [
      { key: 'ear', label: 'Ear' },
      { key: 'nose', label: 'Nose' },
      { key: 'throat', label: 'Throat' },
      { key: 'tonsils', label: 'Tonsils' },
      { key: 'sinuses', label: 'Sinuses' },
    ],
  },
  dermatology: {
    label: 'Dermatology',
    fields: [
      { key: 'lesion_location', label: 'Lesion location' },
      { key: 'size', label: 'Size' },
      { key: 'color', label: 'Color' },
      { key: 'shape', label: 'Shape' },
      { key: 'distribution', label: 'Distribution' },
      { key: 'itching', label: 'Itching' },
      { key: 'scaling', label: 'Scaling' },
      { key: 'infection_signs', label: 'Infection signs' },
    ],
  },
  orthopedics: {
    label: 'Orthopedics',
    fields: [
      { key: 'pain_site', label: 'Site of pain' },
      { key: 'swelling', label: 'Swelling' },
      { key: 'tenderness', label: 'Tenderness' },
      { key: 'rom', label: 'ROM' },
      { key: 'strength', label: 'Strength' },
      { key: 'deformity', label: 'Deformity' },
    ],
  },
}

export const SPECIALTY_TEMPLATES: Record<
  Exclude<SpecialtyKey, 'none'>,
  { label: string; fields: { key: string; label: string; unit?: string }[] }
> = {
  diabetes: {
    label: 'Diabetes',
    fields: [
      { key: 'fbs', label: 'FBS', unit: 'mg/dL' },
      { key: 'ppbs', label: 'PPBS', unit: 'mg/dL' },
      { key: 'hba1c', label: 'HbA1c', unit: '%' },
    ],
  },
  hypertension: {
    label: 'Hypertension',
    fields: [
      { key: 'bp', label: 'BP', unit: 'mmHg' },
      { key: 'pulse', label: 'Pulse', unit: 'bpm' },
    ],
  },
  respiratory: {
    label: 'Respiratory',
    fields: [
      { key: 'spo2', label: 'SpO₂', unit: '%' },
      { key: 'rr', label: 'Respiratory rate', unit: '/min' },
      { key: 'peak_flow', label: 'Peak flow', unit: 'L/min' },
    ],
  },
  pediatrics: {
    label: 'Pediatrics',
    fields: [
      { key: 'weight', label: 'Weight', unit: 'kg' },
      { key: 'height', label: 'Height / length', unit: 'cm' },
      { key: 'head_circumference', label: 'Head circumference', unit: 'cm' },
      { key: 'growth_percentile', label: 'Growth percentile' },
    ],
  },
  gynecology: {
    label: 'Gynecology',
    fields: [
      { key: 'lmp', label: 'LMP' },
      { key: 'pregnancy_status', label: 'Pregnancy status' },
      { key: 'gravida_para', label: 'Gravida / Para' },
      { key: 'gestational_age', label: 'Gestational age' },
    ],
  },
}

function emptyFindings(keys: readonly { key: string }[]): Record<string, ExamFinding> {
  return Object.fromEntries(keys.map((f) => [f.key, '' as ExamFinding]))
}

export function emptyClinicalData(): ClinicalData {
  return {
    visit: {
      visit_type: '',
      previous_diagnosis: '',
      past_history: '',
      current_medications: '',
      known_allergies: '',
      drug_allergies: '',
      previous_surgeries: '',
      family_history: '',
      lifestyle: '',
    },
    vitals: {
      temperature_f: '',
      bp_systolic: '',
      bp_diastolic: '',
      pulse: '',
      respiratory_rate: '',
      spo2: '',
      weight_kg: '',
      height_cm: '',
      blood_glucose: '',
      pain_score: '',
    },
    complaint: {
      onset: '',
      duration: '',
      severity: '',
      location: '',
      frequency: '',
      character: '',
      aggravating: '',
      relieving: '',
      associated: '',
    },
    general_exam: emptyFindings(GENERAL_EXAM_FIELDS),
    system_exam: {
      respiratory: emptyFindings(SYSTEM_EXAM_SECTIONS[0].fields),
      cardiovascular: emptyFindings(SYSTEM_EXAM_SECTIONS[1].fields),
      abdomen: emptyFindings(SYSTEM_EXAM_SECTIONS[2].fields),
      neurological: emptyFindings(SYSTEM_EXAM_SECTIONS[3].fields),
      musculoskeletal: emptyFindings(SYSTEM_EXAM_SECTIONS[4].fields),
    },
    local_exam: {
      template: 'none',
      notes: '',
      fields: {},
    },
    assessment: {
      findings_summary: '',
      assessment: '',
      differential: '',
    },
    specialty: {
      key: 'none',
      fields: {},
    },
    plan: {
      advice: '',
      follow_up: '',
    },
  }
}

function mergeRecord<T extends Record<string, unknown>>(base: T, incoming?: unknown): T {
  if (!incoming || typeof incoming !== 'object') return base
  return { ...base, ...(incoming as T) }
}

export function normalizeClinicalData(raw?: unknown): ClinicalData {
  const empty = emptyClinicalData()
  if (!raw || typeof raw !== 'object') return empty
  const data = raw as Partial<ClinicalData>

  return {
    visit: mergeRecord(empty.visit, data.visit),
    vitals: mergeRecord(empty.vitals, data.vitals),
    complaint: mergeRecord(empty.complaint, data.complaint),
    general_exam: mergeRecord(empty.general_exam, data.general_exam),
    system_exam: {
      respiratory: mergeRecord(empty.system_exam.respiratory, data.system_exam?.respiratory),
      cardiovascular: mergeRecord(empty.system_exam.cardiovascular, data.system_exam?.cardiovascular),
      abdomen: mergeRecord(empty.system_exam.abdomen, data.system_exam?.abdomen),
      neurological: mergeRecord(empty.system_exam.neurological, data.system_exam?.neurological),
      musculoskeletal: mergeRecord(empty.system_exam.musculoskeletal, data.system_exam?.musculoskeletal),
    },
    local_exam: {
      template: data.local_exam?.template || 'none',
      notes: data.local_exam?.notes || '',
      fields: mergeRecord({}, data.local_exam?.fields),
    },
    assessment: mergeRecord(empty.assessment, data.assessment),
    specialty: {
      key: data.specialty?.key || 'none',
      fields: mergeRecord({}, data.specialty?.fields),
    },
    plan: mergeRecord(empty.plan, data.plan),
  }
}

/** History fields to copy from a prior visit into a new worksheet. */
export function visitHistoryFromPrior(
  priorClinical?: unknown,
  priorDiagnosis?: string | null
): ClinicalData['visit'] {
  const prior = normalizeClinicalData(priorClinical)
  const previousDiagnosis =
    prior.visit.previous_diagnosis ||
    prior.assessment.assessment ||
    priorDiagnosis ||
    ''

  return {
    visit_type: 'follow_up',
    previous_diagnosis: previousDiagnosis,
    past_history: prior.visit.past_history,
    current_medications: prior.visit.current_medications,
    known_allergies: prior.visit.known_allergies,
    drug_allergies: prior.visit.drug_allergies,
    previous_surgeries: prior.visit.previous_surgeries,
    family_history: prior.visit.family_history,
    lifestyle: prior.visit.lifestyle,
  }
}

/** True when any durable history field has content. */
export function visitHistoryHasContent(visit: ClinicalData['visit']): boolean {
  return Boolean(
    visit.previous_diagnosis ||
      visit.past_history ||
      visit.current_medications ||
      visit.known_allergies ||
      visit.drug_allergies ||
      visit.previous_surgeries ||
      visit.family_history ||
      visit.lifestyle
  )
}

/** BMI from height (cm) and weight (kg). */
export function calcBmi(weightKg: string, heightCm: string): string {
  const w = Number(weightKg)
  const h = Number(heightCm)
  if (!w || !h || w <= 0 || h <= 0) return ''
  const meters = h / 100
  return (w / (meters * meters)).toFixed(1)
}

export function suggestLocalTemplate(specialization?: string | null): LocalExamTemplate {
  const s = (specialization || '').toLowerCase()
  if (/ent|oto|ear|nose|throat/.test(s)) return 'ent'
  if (/derma|skin/.test(s)) return 'dermatology'
  if (/ortho|bone|joint/.test(s)) return 'orthopedics'
  return 'none'
}

export function suggestSpecialtyKey(specialization?: string | null): SpecialtyKey {
  const s = (specialization || '').toLowerCase()
  if (/diabet|endo/.test(s)) return 'diabetes'
  if (/cardio|hyperten/.test(s)) return 'hypertension'
  if (/pulmon|respir|chest/.test(s)) return 'respiratory'
  if (/pedia|child/.test(s)) return 'pediatrics'
  if (/gyn|obstet|women/.test(s)) return 'gynecology'
  return 'none'
}

export function clinicalHasContent(data: ClinicalData): boolean {
  const dump = JSON.stringify(data)
  const empty = JSON.stringify(emptyClinicalData())
  return dump !== empty
}
