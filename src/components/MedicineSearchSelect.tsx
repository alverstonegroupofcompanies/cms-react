import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { getMedicines, resolveMedicine } from '../api/client'
import type { Medicine } from '../api/types'
import { IconEnter, IconSearch } from './Icons'

type Props = {
  value?: number
  selected?: Medicine | null
  onChange: (medicine: Medicine | null) => void
  /** When true, picking a medicine clears the search for the next add. */
  clearOnSelect?: boolean
  placeholder?: string
}

function normalizeList(payload: unknown): Medicine[] {
  if (Array.isArray(payload)) return payload as Medicine[]
  const page = payload as { data?: Medicine[] }
  return Array.isArray(page?.data) ? page.data : []
}

function stockMeta(qty: number) {
  if (qty <= 0) return { label: 'Out of stock', cls: 'is-out' }
  if (qty <= 5) return { label: `Low stock · ${qty}`, cls: 'is-low' }
  return { label: `In stock · ${qty}`, cls: 'is-ok' }
}

function formatInr(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function MedicineSearchSelect({
  value = 0,
  selected,
  onChange,
  clearOnSelect = false,
  placeholder = 'Search medicine by name…',
}: Props) {
  const [q, setQ] = useState(selected?.name || '')
  const [options, setOptions] = useState<Medicine[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)

  const selectable = useMemo(
    () => options.filter((m) => Number(m.stock_quantity) > 0),
    [options],
  )

  useEffect(() => {
    if (!clearOnSelect && selected?.name && selected.id === value) {
      setQ(selected.name)
    }
  }, [selected, value, clearOnSelect])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    setActiveIdx(selectable.length ? 0 : -1)
  }, [selectable])

  const search = (term: string) => {
    if (timer.current) window.clearTimeout(timer.current)
    const trimmed = term.trim()
    if (trimmed.length < 2) {
      setOptions([])
      setOpen(trimmed.length > 0)
      return
    }
    timer.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await getMedicines({ q: trimmed, per_page: 30, page: 1 })
        setOptions(normalizeList(data))
        setOpen(true)
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 280)
  }

  const pick = async (m: Medicine) => {
    if (m.stock_quantity <= 0) return
    setOpen(false)
    setActiveIdx(-1)
    if (!m.clinic_product_id) {
      onChange(m)
      if (clearOnSelect) {
        setQ('')
        setOptions([])
      } else {
        setQ(m.name)
      }
      return
    }
    setResolving(true)
    try {
      const { data } = await resolveMedicine({
        clinic_product_id: m.clinic_product_id,
        name: m.name,
        generic_name: m.generic_name,
        sku: m.sku,
        strength: m.strength,
        manufacturer: m.manufacturer,
        unit: m.unit,
        stock_quantity: m.stock_quantity,
        unit_price: Number(m.unit_price),
        clinic_external_id: m.clinic_external_id,
        is_active: m.is_active,
      })
      onChange(data as Medicine)
      if (clearOnSelect) {
        setQ('')
        setOptions([])
      } else {
        setQ((data as Medicine).name)
      }
    } catch {
      onChange(null)
      setQ('')
    } finally {
      setResolving(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open && options.length) setOpen(true)
      if (!selectable.length) return
      setActiveIdx((i) => (i + 1) % selectable.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!selectable.length) return
      setActiveIdx((i) => (i <= 0 ? selectable.length - 1 : i - 1))
      return
    }

    if (e.key === 'Enter') {
      const pickable =
        (activeIdx >= 0 && selectable[activeIdx]) ||
        selectable[0] ||
        null
      if (pickable) {
        e.preventDefault()
        void pick(pickable)
      }
    }
  }

  return (
    <div className="rx-search" ref={wrapRef}>
      <div className="rx-search-field">
        <span className="rx-search-icon" aria-hidden>
          <IconSearch size={16} />
        </span>
        <input
          value={q}
          placeholder={placeholder}
          autoComplete="off"
          disabled={resolving}
          aria-autocomplete="list"
          aria-expanded={open}
          onFocus={() => {
            if (options.length) setOpen(true)
            else if (q.trim().length >= 2) search(q)
          }}
          onChange={(e) => {
            const next = e.target.value
            setQ(next)
            if (value && !clearOnSelect) onChange(null)
            search(next)
          }}
          onKeyDown={onKeyDown}
        />
        {selectable.length > 0 && open && (
          <span className="rx-search-enter" title="Press Enter to add">
            <IconEnter size={14} />
            Enter
          </span>
        )}
      </div>
      {resolving && <p className="rx-search-hint">Saving selection…</p>}
      {open && (
        <ul className="rx-search-menu" role="listbox">
          {loading && <li className="rx-search-status">Searching…</li>}
          {!loading && q.trim().length < 2 && (
            <li className="rx-search-status">Keep typing (min 2 letters)</li>
          )}
          {!loading && q.trim().length >= 2 && options.length === 0 && (
            <li className="rx-search-status">No matches</li>
          )}
          {options.map((m) => {
            const stock = stockMeta(Number(m.stock_quantity) || 0)
            const detail = [m.manufacturer, m.generic_name || m.strength].filter(Boolean).join(' · ')
            const out = stock.cls === 'is-out'
            const selectableIdx = selectable.findIndex(
              (s) => (s.clinic_product_id || s.id) === (m.clinic_product_id || m.id) && s.name === m.name,
            )
            const isActive = !out && selectableIdx === activeIdx
            return (
              <li key={`${m.clinic_product_id || m.id}-${m.name}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`rx-search-row${out ? ' is-disabled' : ''}${isActive ? ' is-active' : ''}`}
                  disabled={out || resolving}
                  onMouseEnter={() => {
                    if (!out && selectableIdx >= 0) setActiveIdx(selectableIdx)
                  }}
                  onClick={() => void pick(m)}
                >
                  <div className="rx-search-copy">
                    <strong>{m.name}</strong>
                    {detail && <span>{detail}</span>}
                  </div>
                  <span className={`rx-stock ${stock.cls}`}>{stock.label}</span>
                  <em className="rx-price">{formatInr(Number(m.unit_price) || 0)}</em>
                  <span className={`rx-add-btn${out ? '' : ' is-ready'}`} aria-hidden>
                    +
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
