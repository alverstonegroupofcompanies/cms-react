import { useMemo, useState } from 'react'
import HintTip from './HintTip'
import {
  GENERAL_EXAM_FIELDS,
  LOCAL_EXAM_TEMPLATES,
  SPECIALTY_TEMPLATES,
  SYSTEM_EXAM_SECTIONS,
  calcBmi,
  type ClinicalData,
  type ExamFinding,
  type LocalExamTemplate,
  type SpecialtyKey,
} from '../utils/clinicalData'

type Props = {
  data: ClinicalData
  onChange: (next: ClinicalData) => void
  disabled?: boolean
  specialization?: string | null
  visitDateLabel?: string
}

function Section({
  id,
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  hint?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`ws-acc${open ? ' is-open' : ''}`}>
      <button type="button" className="ws-acc-head" onClick={onToggle} aria-expanded={open} id={id}>
        <span className="ws-acc-title">
          <strong>{title}</strong>
          {hint ? <HintTip text={hint} /> : null}
        </span>
        <span className="ws-acc-chevron" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="ws-acc-body">{children}</div>}
    </div>
  )
}

function FindingSelect({
  value,
  onChange,
  disabled,
}: {
  value: ExamFinding
  onChange: (v: ExamFinding) => void
  disabled?: boolean
}) {
  return (
    <select
      className="ws-finding"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ExamFinding)}
    >
      <option value="">—</option>
      <option value="normal">Normal</option>
      <option value="abnormal">Abnormal</option>
      <option value="not_examined">Not examined</option>
    </select>
  )
}

export default function ClinicalRecordPanel({
  data,
  onChange,
  disabled,
  specialization,
  visitDateLabel,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    visit: false,
    complaint: false,
    vitals: false,
    general: false,
    systems: false,
    local: false,
    specialty: false,
    assessment: false,
  })

  const bmi = useMemo(
    () => calcBmi(data.vitals.weight_kg, data.vitals.height_cm),
    [data.vitals.weight_kg, data.vitals.height_cm]
  )

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  const setVisit = (patch: Partial<ClinicalData['visit']>) =>
    onChange({ ...data, visit: { ...data.visit, ...patch } })
  const setVitals = (patch: Partial<ClinicalData['vitals']>) =>
    onChange({ ...data, vitals: { ...data.vitals, ...patch } })
  const setComplaint = (patch: Partial<ClinicalData['complaint']>) =>
    onChange({ ...data, complaint: { ...data.complaint, ...patch } })
  const setAssessment = (patch: Partial<ClinicalData['assessment']>) =>
    onChange({ ...data, assessment: { ...data.assessment, ...patch } })
  const setPlan = (patch: Partial<ClinicalData['plan']>) =>
    onChange({ ...data, plan: { ...data.plan, ...patch } })

  const setLocalTemplate = (template: LocalExamTemplate) => {
    const fields: Record<string, string> = {}
    if (template !== 'none') {
      LOCAL_EXAM_TEMPLATES[template].fields.forEach((f) => {
        fields[f.key] = data.local_exam.fields[f.key] || ''
      })
    }
    onChange({ ...data, local_exam: { ...data.local_exam, template, fields } })
  }

  const setSpecialtyKey = (key: SpecialtyKey) => {
    const fields: Record<string, string> = {}
    if (key !== 'none') {
      SPECIALTY_TEMPLATES[key].fields.forEach((f) => {
        fields[f.key] = data.specialty.fields[f.key] || ''
      })
    }
    onChange({ ...data, specialty: { key, fields } })
  }

  const localFields =
    data.local_exam.template !== 'none' ? LOCAL_EXAM_TEMPLATES[data.local_exam.template].fields : []
  const specialtyFields =
    data.specialty.key !== 'none' ? SPECIALTY_TEMPLATES[data.specialty.key].fields : []

  return (
    <div className="ws-clinical">
      <div className="ws-clinical-title-row">
        <h4 className="ws-clinical-title">Structured exam</h4>
        <HintTip
          text={
            specialization
              ? `All sections optional — fill only what this visit needs. · ${specialization}`
              : 'All sections optional — fill only what this visit needs.'
          }
        />
      </div>

      <Section
        id="ws-visit"
        title="Patient & visit"
        hint="History · allergies · new / follow-up"
        open={open.visit}
        onToggle={() => toggle('visit')}
      >
        <div className="ws-fields-2">
          <label>
            Visit date / time
            <input type="text" value={visitDateLabel || '—'} disabled readOnly />
          </label>
          <label>
            Consultation type
            <select
              value={data.visit.visit_type}
              disabled={disabled}
              onChange={(e) =>
                setVisit({ visit_type: e.target.value as ClinicalData['visit']['visit_type'] })
              }
            >
              <option value="">—</option>
              <option value="new">New</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </label>
          <label>
            Known allergies
            <input
              value={data.visit.known_allergies}
              disabled={disabled}
              onChange={(e) => setVisit({ known_allergies: e.target.value })}
              placeholder="Food / environmental"
            />
          </label>
          <label>
            Drug allergies
            <input
              value={data.visit.drug_allergies}
              disabled={disabled}
              onChange={(e) => setVisit({ drug_allergies: e.target.value })}
              placeholder="e.g. Penicillin"
            />
          </label>
          <label>
            Current medications
            <input
              value={data.visit.current_medications}
              disabled={disabled}
              onChange={(e) => setVisit({ current_medications: e.target.value })}
            />
          </label>
          <label>
            Previous diagnosis
            <input
              value={data.visit.previous_diagnosis}
              disabled={disabled}
              onChange={(e) => setVisit({ previous_diagnosis: e.target.value })}
            />
          </label>
        </div>
        <div className="ws-fields-2" style={{ marginTop: '0.65rem' }}>
          <label className="ws-field-full">
            Past medical history
            <textarea
              rows={2}
              value={data.visit.past_history}
              disabled={disabled}
              onChange={(e) => setVisit({ past_history: e.target.value })}
            />
          </label>
          <label>
            Previous surgeries
            <input
              value={data.visit.previous_surgeries}
              disabled={disabled}
              onChange={(e) => setVisit({ previous_surgeries: e.target.value })}
            />
          </label>
          <label>
            Family history
            <input
              value={data.visit.family_history}
              disabled={disabled}
              onChange={(e) => setVisit({ family_history: e.target.value })}
            />
          </label>
          <label className="ws-field-full">
            Lifestyle
            <input
              value={data.visit.lifestyle}
              disabled={disabled}
              onChange={(e) => setVisit({ lifestyle: e.target.value })}
              placeholder="Smoking, alcohol, activity…"
            />
          </label>
        </div>
      </Section>

      <Section
        id="ws-complaint"
        title="Chief complaint detail"
        hint="Onset · severity · associated symptoms"
        open={open.complaint}
        onToggle={() => toggle('complaint')}
      >
        <div className="ws-fields-2">
          {(
            [
              ['onset', 'Onset'],
              ['duration', 'Duration'],
              ['severity', 'Severity (e.g. 6/10)'],
              ['location', 'Location'],
              ['frequency', 'Frequency'],
              ['character', 'Character'],
              ['aggravating', 'Aggravating factors'],
              ['relieving', 'Relieving factors'],
              ['associated', 'Associated symptoms'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={key === 'associated' ? 'ws-field-full' : undefined}>
              {label}
              <input
                value={data.complaint[key]}
                disabled={disabled}
                onChange={(e) => setComplaint({ [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        id="ws-vitals"
        title="Vital signs"
        hint="BMI auto-calculates from height & weight"
        open={open.vitals}
        onToggle={() => toggle('vitals')}
      >
        <div className="ws-vitals-grid">
          <label>
            Temperature (°F)
            <input
              inputMode="decimal"
              value={data.vitals.temperature_f}
              disabled={disabled}
              onChange={(e) => setVitals({ temperature_f: e.target.value })}
              placeholder="98.6"
            />
          </label>
          <label>
            BP systolic
            <input
              inputMode="numeric"
              value={data.vitals.bp_systolic}
              disabled={disabled}
              onChange={(e) => setVitals({ bp_systolic: e.target.value })}
              placeholder="120"
            />
          </label>
          <label>
            BP diastolic
            <input
              inputMode="numeric"
              value={data.vitals.bp_diastolic}
              disabled={disabled}
              onChange={(e) => setVitals({ bp_diastolic: e.target.value })}
              placeholder="80"
            />
          </label>
          <label>
            Pulse (bpm)
            <input
              inputMode="numeric"
              value={data.vitals.pulse}
              disabled={disabled}
              onChange={(e) => setVitals({ pulse: e.target.value })}
            />
          </label>
          <label>
            Resp. rate
            <input
              inputMode="numeric"
              value={data.vitals.respiratory_rate}
              disabled={disabled}
              onChange={(e) => setVitals({ respiratory_rate: e.target.value })}
            />
          </label>
          <label>
            SpO₂ (%)
            <input
              inputMode="numeric"
              value={data.vitals.spo2}
              disabled={disabled}
              onChange={(e) => setVitals({ spo2: e.target.value })}
            />
          </label>
          <label>
            Weight (kg)
            <input
              inputMode="decimal"
              value={data.vitals.weight_kg}
              disabled={disabled}
              onChange={(e) => setVitals({ weight_kg: e.target.value })}
            />
          </label>
          <label>
            Height (cm)
            <input
              inputMode="decimal"
              value={data.vitals.height_cm}
              disabled={disabled}
              onChange={(e) => setVitals({ height_cm: e.target.value })}
            />
          </label>
          <label>
            BMI
            <input value={bmi || '—'} readOnly disabled title="Auto from height & weight" />
          </label>
          <label>
            Blood glucose
            <input
              inputMode="decimal"
              value={data.vitals.blood_glucose}
              disabled={disabled}
              onChange={(e) => setVitals({ blood_glucose: e.target.value })}
              placeholder="mg/dL"
            />
          </label>
          <label>
            Pain score
            <input
              inputMode="numeric"
              value={data.vitals.pain_score}
              disabled={disabled}
              onChange={(e) => setVitals({ pain_score: e.target.value })}
              placeholder="/10"
            />
          </label>
        </div>
      </Section>

      <Section
        id="ws-general"
        title="General examination"
        hint="Normal / Abnormal / Not examined"
        open={open.general}
        onToggle={() => toggle('general')}
      >
        <div className="ws-exam-grid">
          {GENERAL_EXAM_FIELDS.map((f) => (
            <label key={f.key} className="ws-exam-row">
              <span>{f.label}</span>
              <FindingSelect
                value={data.general_exam[f.key] || ''}
                disabled={disabled}
                onChange={(v) =>
                  onChange({
                    ...data,
                    general_exam: { ...data.general_exam, [f.key]: v },
                  })
                }
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        id="ws-systems"
        title="System examination"
        hint="Expand per system"
        open={open.systems}
        onToggle={() => toggle('systems')}
      >
        {SYSTEM_EXAM_SECTIONS.map((section) => (
          <details key={section.key} className="ws-system-block">
            <summary>{section.label}</summary>
            <div className="ws-exam-grid">
              {section.fields.map((f) => (
                <label key={f.key} className="ws-exam-row">
                  <span>{f.label}</span>
                  <FindingSelect
                    value={data.system_exam[section.key][f.key] || ''}
                    disabled={disabled}
                    onChange={(v) =>
                      onChange({
                        ...data,
                        system_exam: {
                          ...data.system_exam,
                          [section.key]: {
                            ...data.system_exam[section.key],
                            [f.key]: v,
                          },
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </details>
        ))}
      </Section>

      <Section
        id="ws-local"
        title="Local / specialty exam"
        hint="ENT · Derm · Ortho templates"
        open={open.local}
        onToggle={() => toggle('local')}
      >
        <label>
          Template
          <select
            value={data.local_exam.template}
            disabled={disabled}
            onChange={(e) => setLocalTemplate(e.target.value as LocalExamTemplate)}
          >
            <option value="none">None</option>
            <option value="general">General local</option>
            <option value="ent">ENT</option>
            <option value="dermatology">Dermatology</option>
            <option value="orthopedics">Orthopedics</option>
          </select>
        </label>
        {localFields.length > 0 && (
          <div className="ws-fields-2" style={{ marginTop: '0.65rem' }}>
            {localFields.map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  value={data.local_exam.fields[f.key] || ''}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      local_exam: {
                        ...data.local_exam,
                        fields: { ...data.local_exam.fields, [f.key]: e.target.value },
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        )}
        <label className="ws-field-full" style={{ marginTop: '0.65rem' }}>
          Local exam notes
          <textarea
            rows={2}
            value={data.local_exam.notes}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...data,
                local_exam: { ...data.local_exam, notes: e.target.value },
              })
            }
          />
        </label>
      </Section>

      <Section
        id="ws-specialty"
        title="Specialty measurements"
        hint="Diabetes · BP · Peds · Gyn"
        open={open.specialty}
        onToggle={() => toggle('specialty')}
      >
        <label>
          Specialty set
          <select
            value={data.specialty.key}
            disabled={disabled}
            onChange={(e) => setSpecialtyKey(e.target.value as SpecialtyKey)}
          >
            <option value="none">None</option>
            <option value="diabetes">Diabetes</option>
            <option value="hypertension">Hypertension</option>
            <option value="respiratory">Respiratory</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="gynecology">Gynecology</option>
          </select>
        </label>
        {specialtyFields.length > 0 && (
          <div className="ws-fields-2" style={{ marginTop: '0.65rem' }}>
            {specialtyFields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.unit ? ` (${f.unit})` : ''}
                <input
                  value={data.specialty.fields[f.key] || ''}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      specialty: {
                        ...data.specialty,
                        fields: { ...data.specialty.fields, [f.key]: e.target.value },
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="ws-assessment"
        title="Assessment & plan"
        hint="Findings → diagnosis → advice"
        open={open.assessment}
        onToggle={() => toggle('assessment')}
      >
        <div className="ws-form">
          <label className="ws-field-full">
            Findings summary
            <textarea
              rows={2}
              value={data.assessment.findings_summary}
              disabled={disabled}
              onChange={(e) => setAssessment({ findings_summary: e.target.value })}
              placeholder="Key exam / investigation findings"
            />
          </label>
          <label className="ws-field-full">
            Clinical assessment
            <textarea
              rows={2}
              value={data.assessment.assessment}
              disabled={disabled}
              onChange={(e) => setAssessment({ assessment: e.target.value })}
            />
          </label>
          <label className="ws-field-full">
            Differential diagnosis
            <input
              value={data.assessment.differential}
              disabled={disabled}
              onChange={(e) => setAssessment({ differential: e.target.value })}
            />
          </label>
          <div className="ws-fields-2">
            <label className="ws-field-full">
              Advice
              <textarea
                rows={2}
                value={data.plan.advice}
                disabled={disabled}
                onChange={(e) => setPlan({ advice: e.target.value })}
                placeholder="Home care, warnings…"
              />
            </label>
            <label>
              Follow-up
              <input
                value={data.plan.follow_up}
                disabled={disabled}
                onChange={(e) => setPlan({ follow_up: e.target.value })}
                placeholder="e.g. 1 week / SOS"
              />
            </label>
          </div>
        </div>
      </Section>
    </div>
  )
}
