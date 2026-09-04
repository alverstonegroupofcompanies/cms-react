import PatientLayout from './PatientLayout'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function PatientPage({ title, subtitle, children }: Props) {
  return (
    <PatientLayout>
      <div className="ph-page">
        <header className="ph-page-header">
          <h1 className="ph-page-title">{title}</h1>
          {subtitle && <p className="ph-page-sub">{subtitle}</p>}
        </header>
        <div className="ph-page-body">{children}</div>
      </div>
    </PatientLayout>
  )
}
