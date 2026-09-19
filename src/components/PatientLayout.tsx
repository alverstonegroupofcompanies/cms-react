import PatientSiteLayout from './PatientSiteLayout'

interface Props {
  children: React.ReactNode
}

/** Signed-in patient pages share the same website chrome (nav + footer). */
export default function PatientLayout({ children }: Props) {
  return <PatientSiteLayout portal>{children}</PatientSiteLayout>
}
