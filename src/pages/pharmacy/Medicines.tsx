import MedicineCatalog from '../../components/MedicineCatalog'
import { pharmacyNav } from '../../config/navigation'

export default function PharmacyMedicines() {
  return (
    <MedicineCatalog
      title="Pharmacy Catalog"
      subtitle="Search-first catalog — type a name or pick A–Z (thousands of store products)"
      nav={pharmacyNav}
    />
  )
}
