/** Keyboard / focus helpers for walk-in and booking forms. */

export function openSelect(el: HTMLSelectElement | null | undefined) {
  if (!el || el.disabled) return
  el.focus()
  const picker = (el as HTMLSelectElement & { showPicker?: () => void }).showPicker
  if (typeof picker === 'function') {
    try {
      picker.call(el)
      return
    } catch {
      /* Not allowed without user gesture in some browsers — focus is still set. */
    }
  }
}

export function focusField(
  el: HTMLElement | null | undefined,
  options?: { openSelect?: boolean }
) {
  if (!el || (el instanceof HTMLButtonElement && el.disabled)) return
  if (el instanceof HTMLSelectElement) {
    el.focus()
    // Delay opening so the Enter key that moved focus here does not
    // also activate the first option ("snap to default").
    if (options?.openSelect !== false) {
      window.setTimeout(() => openSelect(el), 60)
    }
    return
  }
  el.focus()
  if (el instanceof HTMLInputElement && el.type !== 'email' && el.type !== 'password') {
    try {
      el.select()
    } catch {
      /* ignore */
    }
  }
}

/** Enter on text inputs → next field (opens select if next is a dropdown). */
export function focusNextOnEnter(
  e: React.KeyboardEvent<HTMLElement>,
  next: HTMLElement | null | undefined,
  submit?: () => void
) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  e.stopPropagation()
  if (next) {
    focusField(next)
    return
  }
  submit?.()
}

/**
 * Enter on a <select>: never submit the form.
 * - No value yet → open the list
 * - Has value → move to next (or submit)
 */
export function selectEnterNav(
  e: React.KeyboardEvent<HTMLSelectElement>,
  next: HTMLElement | null | undefined,
  submit?: () => void
) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  e.stopPropagation()

  const value = e.currentTarget.value
  if (!value) {
    openSelect(e.currentTarget)
    return
  }
  if (next) {
    focusField(next)
    return
  }
  submit?.()
}

/** After choosing a select option (mouse or keyboard), advance. */
export function afterSelectValue(
  value: string,
  next: HTMLElement | null | undefined,
  submit?: () => void
) {
  if (!value) return
  window.setTimeout(() => {
    if (next) {
      focusField(next)
      return
    }
    submit?.()
  }, 30)
}
