import { Link } from 'react-router-dom'
import { iconMap, type IconName } from './Icons'

interface Props {
  to: string
  title: string
  description: string
  icon: IconName
}

export default function ActionTile({ to, title, description, icon }: Props) {
  const Icon = iconMap[icon]
  return (
    <Link to={to} className="action-tile">
      <div className="action-tile-icon">
        <Icon size={28} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}
