import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Apple-style minimalist Breadcrumbs component.
 * Props:
 * - items: Array of { label: string, path?: string, icon?: ReactNode }
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-2.5 px-4 bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-14 z-30 overflow-x-auto whitespace-nowrap">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <Home size={13} />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-gray-300" />
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-gray-900 transition-colors font-medium flex items-center gap-1"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-1 ${isLast ? 'text-gray-900 font-semibold' : ''}`}>
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
