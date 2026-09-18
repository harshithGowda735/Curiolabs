import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * DomainCard — card for domain hubs on dashboard.
 * Props:
 * - title, description, emoji, path, accentColor, count (number of experiments)
 */
export default function DomainCard({ title, description, emoji, path, accentColor = 'teal', count = 5 }) {
  return (
    <Link
      to={path}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{emoji}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${accentColor}-50 text-${accentColor}-600`}>
          {count} labs
        </span>
      </div>
      <h3 className="font-display font-bold text-gray-800 text-lg mb-1 group-hover:text-teal-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <div className={`flex items-center gap-1 text-sm font-medium text-${accentColor}-600 group-hover:gap-2 transition-all`}>
        <span>Explore Labs</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  )
}
