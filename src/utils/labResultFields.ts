export type LabResultField = {
  key: string
  label: string
  unit?: string
  placeholder?: string
}

/** Result entry fields by lab test code (blood / common panels). */
export function labResultFieldsForCode(code?: string | null): LabResultField[] {
  const c = (code || '').toUpperCase()
  if (c === 'BSF' || c.includes('SUGAR') || c.includes('GLUCOSE')) {
    return [
      { key: 'fasting_glucose', label: 'Fasting blood glucose', unit: 'mg/dL', placeholder: 'e.g. 92' },
      { key: 'method', label: 'Method', placeholder: 'Enzymatic / GOD-POD' },
      { key: 'remarks', label: 'Remarks', placeholder: 'Optional' },
    ]
  }
  if (c === 'CBC' || c.includes('BLOOD COUNT')) {
    return [
      { key: 'hemoglobin', label: 'Hemoglobin (Hb)', unit: 'g/dL', placeholder: 'e.g. 13.2' },
      { key: 'rbc', label: 'RBC count', unit: '10⁶/µL', placeholder: 'e.g. 4.8' },
      { key: 'wbc', label: 'WBC count', unit: '/µL', placeholder: 'e.g. 7200' },
      { key: 'platelets', label: 'Platelets', unit: '10³/µL', placeholder: 'e.g. 250' },
      { key: 'hematocrit', label: 'Hematocrit (PCV)', unit: '%', placeholder: 'e.g. 40' },
      { key: 'mcv', label: 'MCV', unit: 'fL', placeholder: 'e.g. 88' },
      { key: 'mch', label: 'MCH', unit: 'pg', placeholder: 'e.g. 29' },
      { key: 'mchc', label: 'MCHC', unit: 'g/dL', placeholder: 'e.g. 33' },
      { key: 'remarks', label: 'Remarks', placeholder: 'Optional' },
    ]
  }
  if (c === 'LIPID' || c.includes('LIPID') || c.includes('CHOLESTEROL')) {
    return [
      { key: 'total_cholesterol', label: 'Total cholesterol', unit: 'mg/dL', placeholder: 'e.g. 180' },
      { key: 'hdl', label: 'HDL', unit: 'mg/dL', placeholder: 'e.g. 45' },
      { key: 'ldl', label: 'LDL', unit: 'mg/dL', placeholder: 'e.g. 110' },
      { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', placeholder: 'e.g. 140' },
      { key: 'vldl', label: 'VLDL', unit: 'mg/dL', placeholder: 'e.g. 28' },
      { key: 'remarks', label: 'Remarks', placeholder: 'Optional' },
    ]
  }
  return [
    { key: 'value', label: 'Result value', placeholder: 'Enter result' },
    { key: 'unit', label: 'Unit', placeholder: 'e.g. mg/dL' },
    { key: 'reference_range', label: 'Reference range', placeholder: 'e.g. 70–100' },
    { key: 'remarks', label: 'Remarks', placeholder: 'Optional' },
  ]
}

export function emptyResultsForCode(code?: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  labResultFieldsForCode(code).forEach((f) => {
    out[f.key] = ''
  })
  return out
}
