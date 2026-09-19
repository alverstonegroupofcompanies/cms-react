import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from './Layout'
import { createMedicine, getMedicines } from '../api/client'
import type { Medicine } from '../api/types'
import type { NavItem } from '../config/navigation'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const PER_PAGE = 40

function formatInr(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function normalizeList(payload: unknown): {
  medicines: Medicine[]
  total?: number
  lastPage?: number
  source?: string
  message?: string
} {
  if (Array.isArray(payload)) {
    return { medicines: payload as Medicine[], source: 'local' }
  }
  const page = payload as {
    data?: Medicine[]
    meta?: { total?: number; last_page?: number; current_page?: number }
    source?: string
    message?: string
  }
  return {
    medicines: Array.isArray(page?.data) ? page.data : [],
    total: page?.meta?.total,
    lastPage: page?.meta?.last_page,
    source: page?.source,
    message: page?.message,
  }
}

type Props = {
  title?: string
  subtitle?: string
  nav: NavItem[]
  allowCreate?: boolean
}

export default function MedicineCatalog({
  title = 'Medicine Catalog',
  subtitle = 'Search the pharmacy store — thousands of products',
  nav,
  allowCreate = false,
}: Props) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [letter, setLetter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [source, setSource] = useState<string | undefined>()
  const [inStockOnly, setInStockOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    generic_name: '',
    unit: 'tablet',
    stock_quantity: 100,
    unit_price: 0,
  })

  const activeQuery = useMemo(() => {
    if (letter) return letter
    return q.trim()
  }, [letter, q])

  const canQuery = activeQuery.length >= 1

  const load = async (opts: {
    query: string
    page: number
    append?: boolean
    inStock?: boolean
  }) => {
    const { query, page: nextPage, append = false, inStock = inStockOnly } = opts
    if (!query.trim()) {
      setMedicines([])
      setTotal(0)
      setLastPage(1)
      setHasSearched(false)
      return
    }

    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const { data } = await getMedicines({
        q: query.trim(),
        page: nextPage,
        per_page: PER_PAGE,
        in_stock: inStock ? 1 : undefined,
      })
      const normalized = normalizeList(data)
      setMedicines((prev) => (append ? [...prev, ...normalized.medicines] : normalized.medicines))
      setTotal(normalized.total ?? normalized.medicines.length)
      setLastPage(normalized.lastPage ?? 1)
      setSource(normalized.source)
      setPage(nextPage)
      if (normalized.message && normalized.medicines.length === 0) {
        setError(normalized.message)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not load pharmacy catalog')
      if (!append) setMedicines([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const runSearch = (term: string) => {
    setLetter(null)
    setQ(term)
    setPage(1)
    void load({ query: term, page: 1, append: false })
  }

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const term = draft.trim()
      if (letter) return
      if (term.length === 0) {
        setQ('')
        setMedicines([])
        setHasSearched(false)
        setTotal(0)
        return
      }
      if (term.length < 2) return
      runSearch(term)
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const pickLetter = (L: string) => {
    setDraft('')
    setQ(L)
    setLetter(L)
    setPage(1)
    void load({ query: L, page: 1, append: false })
  }

  const clearFilters = () => {
    setDraft('')
    setQ('')
    setLetter(null)
    setMedicines([])
    setHasSearched(false)
    setTotal(0)
    setPage(1)
    setError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allowCreate || source === 'clinic') return
    await createMedicine(form)
    setForm({ name: '', generic_name: '', unit: 'tablet', stock_quantity: 100, unit_price: 0 })
    if (activeQuery) void load({ query: activeQuery, page: 1 })
  }

  return (
    <Layout title={title} subtitle={subtitle} nav={nav}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card med-catalog">
        <div className="med-catalog-hero">
          <h3>Find a medicine</h3>
          <p className="muted">
            Catalog has thousands of products — search by name / brand, or jump by letter. Results load in batches.
          </p>
          <div className="med-catalog-search">
            <input
              className="med-catalog-input"
              placeholder="Type at least 2 letters (e.g. amox, dolo, vitamin)…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            {(draft || letter) && (
              <button type="button" className="btn btn-sm btn-secondary" onClick={clearFilters}>
                Clear
              </button>
            )}
            <label className="med-catalog-stock">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  const checked = e.target.checked
                  setInStockOnly(checked)
                  if (canQuery) {
                    void load({ query: activeQuery, page: 1, append: false, inStock: checked })
                  }
                }}
              />
              In stock only
            </label>
          </div>

          <div className="med-catalog-letters" role="group" aria-label="Browse by letter">
            {LETTERS.map((L) => (
              <button
                key={L}
                type="button"
                className={`med-letter${letter === L ? ' is-on' : ''}`}
                onClick={() => pickLetter(L)}
              >
                {L}
              </button>
            ))}
          </div>
        </div>

        {allowCreate && source !== 'clinic' && (
          <form onSubmit={handleCreate} className="inline-form" style={{ marginBottom: '1rem' }}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input
              placeholder="Generic name"
              value={form.generic_name}
              onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
            />
            <button type="submit" className="btn btn-secondary">
              Add Medicine
            </button>
          </form>
        )}

        {!hasSearched && (
          <p className="med-catalog-hint">
            Start typing a medicine name, or tap a letter above. Full dump of 3,000+ rows is skipped on purpose so the page stays fast.
          </p>
        )}

        {hasSearched && (
          <div className="med-catalog-meta">
            <strong>
              {loading ? 'Searching…' : `${medicines.length.toLocaleString('en-IN')} shown`}
            </strong>
            {total > 0 && (
              <span className="muted">
                of {total.toLocaleString('en-IN')} match
                {letter ? ` · letter ${letter}` : q ? ` · “${q}”` : ''}
              </span>
            )}
          </div>
        )}

        {hasSearched && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Generic / strength</th>
                  <th>Manufacturer</th>
                  <th>Stock</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {!loading && medicines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No medicines match. Try another spelling or letter.
                    </td>
                  </tr>
                ) : (
                  medicines.map((m) => (
                    <tr key={`${m.clinic_product_id || m.id}-${m.name}`}>
                      <td>
                        <strong>{m.name}</strong>
                        {m.sku ? <div className="muted">SKU {m.sku}</div> : null}
                      </td>
                      <td>
                        {m.generic_name || '—'}
                        {m.strength ? <div className="muted">{m.strength}</div> : null}
                      </td>
                      <td>{m.manufacturer || '—'}</td>
                      <td>
                        {m.stock_quantity} {m.unit}
                      </td>
                      <td>{formatInr(Number(m.unit_price))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {hasSearched && page < lastPage && medicines.length > 0 && (
          <div className="med-catalog-more">
            <button
              type="button"
              className="btn btn-primary"
              disabled={loadingMore}
              onClick={() => void load({ query: activeQuery, page: page + 1, append: true })}
            >
              {loadingMore ? 'Loading…' : `Load more (${PER_PAGE} more)`}
            </button>
            <span className="muted">
              Page {page} of {lastPage}
            </span>
          </div>
        )}
      </div>
    </Layout>
  )
}
