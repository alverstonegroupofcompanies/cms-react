import MedicineCatalog from '../../components/MedicineCatalog'
import { adminNav } from '../../config/navigation'

export default function AdminMedicines() {
  return (
    <MedicineCatalog
      title="Medicine Catalog"
      subtitle="Synced from the linked Lamstone pharmacy store"
      nav={adminNav}
      allowCreate
    />
  )
}
