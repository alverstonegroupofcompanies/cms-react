import { useState } from 'react'
import { CLINIC } from '../config/clinic'

export const ENQUIRY_PURPOSES = [
  { value: 'callback', label: 'Request a call back' },
  { value: 'appointment', label: 'Book an appointment' },
  { value: 'lab-home', label: 'Lab test at home' },
  { value: 'sample-collection', label: 'Home sample collection' },
  { value: 'pharmacy', label: 'Pharmacy / medicine query' },
  { value: 'reports', label: 'Reports & documents' },
  { value: 'general', label: 'General enquiry' },
  { value: 'other', label: 'Other' },
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
  title = 'Request a call back',
  lead = 'Tell us what you need — we are open 24 hours for call backs and enquiries.',
  submitLabel = 'Submit enquiry',
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
    // Front-end acknowledgement only — no backend contact API yet
    setSent(true)
  }

  const reset = () => {
    setSent(false)
    setForm(INITIAL)
  }

  if (sent) {
    return (
      <div className="ps-contact-thanks">
        <h2>Request received</h2>
        <p>
          Thanks{form.name ? `, ${form.name}` : ''}. We noted your{' '}
          <strong>{purposeLabel.toLowerCase()}</strong>
          {form.phone ? ` and will reach you on ${form.phone}` : ''}.
          We are open 24 hours — for urgent needs, call {CLINIC.phone}.
        </p>
        <button type="button" className="ps-btn" onClick={reset}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <>
      <h2>{title}</h2>
      <p className="ps-form-lead">{lead}</p>
      <form className={`ps-form${compact ? ' ps-form-compact' : ''}`} onSubmit={handleSubmit}>
        <div className="ps-form-row">
          <label>
            <span>Full name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              required
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              placeholder="For call back"
            />
          </label>
        </div>

        <label>
          <span>Email <em className="ps-optional">(optional)</em></span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>How can we help?</span>
          <select
            required
            value={form.purpose}
            onChange={(e) =>
              setForm({ ...form, purpose: e.target.value as EnquiryPurpose | '' })
            }
          >
            <option value="" disabled>
              Select purpose
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
            <span>Preferred call-back time <em className="ps-optional">(optional)</em></span>
            <select
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
            >
              <option value="">Any time (24 hours)</option>
              <option value="morning">Morning (9 AM – 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
              <option value="evening">Evening (4 PM – 8 PM)</option>
              <option value="night">Night (8 PM – 9 AM)</option>
            </select>
          </label>
        )}

        <label>
          <span>Message <em className="ps-optional">(optional)</em></span>
          <textarea
            rows={compact ? 3 : 4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Share a few details so we can help faster…"
          />
        </label>

        <button type="submit" className="ps-btn ps-btn-block">
          {submitLabel}
        </button>
      </form>
    </>
  )
}
