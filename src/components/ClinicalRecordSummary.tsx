import {
  GENERAL_EXAM_FIELDS,
  LOCAL_EXAM_TEMPLATES,
  SPECIALTY_TEMPLATES,
  SYSTEM_EXAM_SECTIONS,
  calcBmi,
  type ClinicalData,
  type ExamFinding,
} from '../utils/clinicalData'

type Props = {
  data: ClinicalData
  visitDateLabel?: string
  chiefComplaint?: string
  clinicalNotes?: string
  diagnosis?: string
}

type Fact = { label: string; value: string }

function findingLabel(v: ExamFinding): string {
  if (v === 'normal') return 'Normal'
  if (v === 'abnormal') return 'Abnormal'
  if (v === 'not_examined') return 'Not examined'
  return ''
}

function visitTypeLabel(v: ClinicalData['visit']['visit_type']): string {
  if (v === 'new') return 'New'
  if (v === 'follow_up') return 'Follow-up'
  return ''
}

function FactBlock({ title, facts }: { title: string; facts: Fact[] }) {
  if (!facts.length) return null
  return (
    <div className="ws-ro-block">
      <h4>{title}</h4>
      <dl className="ws-facts">
        {facts.map((f) => (
          <div key={f.label} className={f.value.length > 80 ? 'ws-facts-wide' : undefined}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function factsFromRecord(
  entries: Array<{ label: string; value?: string | null }>
): Fact[] {
  return entries
    .map((e) => ({ label: e.label, value: (e.value || '').trim() }))
    .filter((e) => e.value)
}

function examFacts(
  fields: readonly { key: string; label: string }[],
  values: Record<string, ExamFinding>
): Fact[] {
  return fields
    .map((f) => ({ label: f.label, value: findingLabel(values[f.key] || '') }))
    .filter((f) => f.value)
}

export default function ClinicalRecordSummary({
  data,
  visitDateLabel,
  chiefComplaint,
  clinicalNotes,
  diagnosis,
}: Props) {
  const topFacts = factsFromRecord([
    { label: 'Chief complaint', value: chiefComplaint },
    { label: 'Free-text notes', value: clinicalNotes },
    { label: 'Diagnosis', value: diagnosis },
  ])

  const visitFacts = factsFromRecord([
    { label: 'Visit date / time', value: visitDateLabel },
    { label: 'Consultation type', value: visitTypeLabel(data.visit.visit_type) },
    { label: 'Known allergies', value: data.visit.known_allergies },
    { label: 'Drug allergies', value: data.visit.drug_allergies },
    { label: 'Current medications', value: data.visit.current_medications },
    { label: 'Previous diagnosis', value: data.visit.previous_diagnosis },
    { label: 'Past medical history', value: data.visit.past_history },
    { label: 'Previous surgeries', value: data.visit.previous_surgeries },
    { label: 'Family history', value: data.visit.family_history },
    { label: 'Lifestyle', value: data.visit.lifestyle },
  ])

  const complaintFacts = factsFromRecord([
    { label: 'Onset', value: data.complaint.onset },
    { label: 'Duration', value: data.complaint.duration },
    { label: 'Severity', value: data.complaint.severity },
    { label: 'Location', value: data.complaint.location },
    { label: 'Frequency', value: data.complaint.frequency },
    { label: 'Character', value: data.complaint.character },
    { label: 'Aggravating', value: data.complaint.aggravating },
    { label: 'Relieving', value: data.complaint.relieving },
    { label: 'Associated', value: data.complaint.associated },
  ])

  const bmi = calcBmi(data.vitals.weight_kg, data.vitals.height_cm)
  const bp =
    data.vitals.bp_systolic || data.vitals.bp_diastolic
      ? `${data.vitals.bp_systolic || '—'} / ${data.vitals.bp_diastolic || '—'}`
      : ''
  const vitalsFacts = factsFromRecord([
    { label: 'Temperature (°F)', value: data.vitals.temperature_f },
    { label: 'Blood pressure', value: bp },
    { label: 'Pulse (bpm)', value: data.vitals.pulse },
    { label: 'Resp. rate', value: data.vitals.respiratory_rate },
    { label: 'SpO₂ (%)', value: data.vitals.spo2 },
    { label: 'Weight (kg)', value: data.vitals.weight_kg },
    { label: 'Height (cm)', value: data.vitals.height_cm },
    { label: 'BMI', value: bmi },
    { label: 'Blood glucose', value: data.vitals.blood_glucose },
    { label: 'Pain score', value: data.vitals.pain_score },
  ])

  const generalFacts = examFacts(GENERAL_EXAM_FIELDS, data.general_exam)

  const systemBlocks = SYSTEM_EXAM_SECTIONS.map((section) => ({
    title: section.label,
    facts: examFacts(section.fields, data.system_exam[section.key]),
  })).filter((b) => b.facts.length)

  const localTemplate =
    data.local_exam.template !== 'none'
      ? LOCAL_EXAM_TEMPLATES[data.local_exam.template]
      : null
  const localFacts = factsFromRecord([
    { label: 'Template', value: localTemplate?.label },
    ...(localTemplate
      ? localTemplate.fields.map((f) => ({
          label: f.label,
          value: data.local_exam.fields[f.key],
        }))
      : []),
    { label: 'Local exam notes', value: data.local_exam.notes },
  ])

  const specialtyTemplate =
    data.specialty.key !== 'none' ? SPECIALTY_TEMPLATES[data.specialty.key] : null
  const specialtyFacts = factsFromRecord([
    { label: 'Specialty set', value: specialtyTemplate?.label },
    ...(specialtyTemplate
      ? specialtyTemplate.fields.map((f) => ({
          label: f.unit ? `${f.label} (${f.unit})` : f.label,
          value: data.specialty.fields[f.key],
        }))
      : []),
  ])

  const assessmentFacts = factsFromRecord([
    { label: 'Findings summary', value: data.assessment.findings_summary },
    { label: 'Assessment', value: data.assessment.assessment },
    { label: 'Differential', value: data.assessment.differential },
    { label: 'Advice', value: data.plan.advice },
    { label: 'Follow-up', value: data.plan.follow_up },
  ])

  const hasAnything =
    topFacts.length > 0 ||
    visitFacts.length > 0 ||
    complaintFacts.length > 0 ||
    vitalsFacts.length > 0 ||
    generalFacts.length > 0 ||
    systemBlocks.length > 0 ||
    localFacts.length > 0 ||
    specialtyFacts.length > 0 ||
    assessmentFacts.length > 0

  if (!hasAnything) {
    return <p className="ws-empty">No clinical notes recorded for this visit.</p>
  }

  return (
    <div className="ws-readonly">
      <FactBlock title="Visit summary" facts={topFacts} />
      <FactBlock title="Patient & visit" facts={visitFacts} />
      <FactBlock title="Chief complaint detail" facts={complaintFacts} />
      <FactBlock title="Vital signs" facts={vitalsFacts} />
      <FactBlock title="General examination" facts={generalFacts} />
      {systemBlocks.map((block) => (
        <FactBlock key={block.title} title={block.title} facts={block.facts} />
      ))}
      <FactBlock title="Local / specialty exam" facts={localFacts} />
      <FactBlock title="Specialty measurements" facts={specialtyFacts} />
      <FactBlock title="Assessment & plan" facts={assessmentFacts} />
    </div>
  )
}
