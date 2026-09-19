import {
  formatDoseSchedule,
  parseDoseSchedule,
  type DoseSlots,
  EMPTY_DOSE,
} from '../utils/doseSchedule'

type Props = {
  value: string
  onChange: (frequency: string) => void
  disabled?: boolean
}

function slotsFromValue(value: string): DoseSlots {
  return parseDoseSchedule(value) || EMPTY_DOSE
}

export default function DoseSchedulePicker({ value, onChange, disabled }: Props) {
  const slots = slotsFromValue(value)

  const toggle = (key: keyof DoseSlots) => {
    if (disabled) return
    const next = { ...slots, [key]: !slots[key] }
    onChange(formatDoseSchedule(next))
  }

  return (
    <div className="dose-picker" role="group" aria-label="Dose schedule Day Noon Evening Night">
      <div className="dose-picker-label">
        <span>Day · Noon · Evening · Night</span>
        <strong>{formatDoseSchedule(slots)}</strong>
      </div>
      <div className="dose-picker-toggles">
        {(
          [
            ['day', 'Day'],
            ['noon', 'Noon'],
            ['evening', 'Evening'],
            ['night', 'Night'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`dose-toggle${slots[key] ? ' is-on' : ''}`}
            aria-pressed={slots[key]}
            disabled={disabled}
            onClick={() => toggle(key)}
          >
            <span className="dose-toggle-bit">{slots[key] ? '1' : '0'}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
