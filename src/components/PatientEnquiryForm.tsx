import { useState } from 'react'
import { CLINIC } from '../config/clinic'
import { IconCheck } from './Icons'

export const ENQUIRY_PURPOSES = [
  { value: 'callback', label: 'Request a quick call back' },
  { value: 'appointment', label: 'Book a specialist consultation' },
  { value: 'lab-home', label: 'Lab diagnostic test at home' },
  { value: 'sample-collection', label: 'Home blood sample collection' },
  { value: 'pharmacy', label: 'Pharmacy & prescription availability' },
  { value: 'reports', label: 'Lab reports & clinical documents' },
  { value: 'general', label: 'General hospital enquiry' },
  { value: 'other', label: 'Other assistance' },
] as const

export type EnquiryPurpose = (typeof ENQUIRY_PURPOSES)[number]['value']

type FormState = {
  name: string
  phone: string
  email: string
  purpose: EnquiryPurpose | ''
  preferredTime: string
  message: string
}

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  purpose: '',
  preferredTime: '',
  message: '',
}

interface Props {
  title?: string
  lead?: string
  submitLabel?: string
  compact?: boolean
}

export default function PatientEnquiryForm({
  title = 'Request a Priority Call Back',
  lead = 'Leave your details below and our hospital reception desk will contact you promptly.',
  submitLabel = 'Request Priority Call Back',
  compact = false,
}: Props) {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL)

  const needsCallbackSlot =
    form.purpose === 'callback' ||
    form.purpose === 'appointment' ||
    form.purpose === 'lab-home' ||
    form.purpose === 'sample-collection'

  const purposeLabel =
    ENQUIRY_PURPOSES.find((p) => p.value === form.purpose)?.label ?? 'your enquiry'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const reset = () => {
    setSent(false)
    setForm(INITIAL)
  }

  if (sent) {
    return (
      <div className="ps-contact-thanks">
        <div className="ps-thanks-icon-wrap">
          <IconCheck size={28} />
        </div>
        <h2>Request Received Successfully</h2>
        <p>
          Thank you{form.name ? `, ${form.name}` : ''}. We noted your request for{' '}
          <strong>{purposeLabel.toLowerCase()}</strong>
          {form.phone ? ` and our front desk will call you back on ${form.phone}` : ''}.
        </p>
        <div className="ps-thanks-urgent-box">
          <span>For acute symptoms or immediate emergency care:</span>
          <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}>{CLINIC.phone} (24/7 Desk)</a>
        </div>
        <button type="button" className="ps-btn" onClick={reset}>
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="ps-form-badge-pill">
        <span className="ps-form-badge-dot" />
        <span>Average callback response: &lt; 15 mins</span>
      </div>
      <h2>{title}</h2>
      <p className="ps-form-lead">{lead}</p>
      <form className={`ps-form${compact ? ' ps-form-compact' : ''}`} onSubmit={handleSubmit}>
        <div className="ps-form-row">
          <label>
            <span>Full Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              placeholder="e.g. Rahul Nair"
            />
          </label>
          <label>
            <span>Phone Number</span>
            <input
              required
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              placeholder="e.g. 98470 12345"
            />
          </label>
        </div>

        <label>
          <span>Email Address <em className="ps-optional">(optional)</em></span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>Service Purpose</span>
          <select
            required
            value={form.purpose}
            onChange={(e) =>
              setForm({ ...form, purpose: e.target.value as EnquiryPurpose | '' })
            }
          >
            <option value="" disabled>
              Select your purpose
            </option>
            {ENQUIRY_PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {needsCallbackSlot && (
          <label>
            <span>Preferred Time Slot <em className="ps-optional">(optional)</em></span>
            <select
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
            >
              <option value="">Any time (24 hours)</option>
              <option value="morning">Morning (9:00 AM – 12:00 PM)</option>
              <option value="afternoon">Afternoon (12:00 PM – 4:00 PM)</option>
              <option value="evening">Evening (4:00 PM – 8:00 PM)</option>
              <option value="night">Night Emergency (8:00 PM – 9:00 AM)</option>
            </select>
          </label>
        )}

        <label>
          <span>Additional Notes <em className="ps-optional">(optional)</em></span>
          <textarea
            rows={compact ? 3 : 4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Briefly describe your health question or preferred doctor…"
          />
        </label>

        <button type="submit" className="ps-btn ps-btn-block ps-btn-submit-clinical">
          <span>{submitLabel}</span>
          <span className="ps-btn-arrow">→</span>
        </button>

        <div className="ps-form-privacy-note">
          <span>🔒 100% Confidential • Directly handled by Alverstone Medcity clinical desk</span>
        </div>
      </form>
    </>
  )
}
