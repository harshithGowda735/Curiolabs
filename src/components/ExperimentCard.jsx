import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Clock } from 'lucide-react'

/**
 * ExperimentCard — card for individual experiments within a domain hub.
 * Props:
 * - title, description, path, icon (emoji), difficulty, duration, completed, hasAR
 */
export default function ExperimentCard({ 
  title, description, path, icon = '🔬', 
  difficulty = 'Medium', duration = '15 min', 
  completed = false, hasAR = false 
}) {
  return (
    <Link
      to={path}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
    >
      {completed && (
        <div className="absolute top-3 right-3">
          <CheckCircle size={20} className="text-green-500" />
        </div>
      )}
      {hasAR && (
        <span className="absolute top-3 right-3 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
          AR
        </span>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-display font-bold text-gray-800 text-base mb-1 group-hover:text-teal-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className={`px-1.5 py-0.5 rounded font-medium ${
            difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
            difficulty === 'Hard' ? 'bg-red-50 text-red-600' :
            'bg-amber-50 text-amber-600'
          }`}>
            {difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {duration}
          </span>
        </div>
        <ArrowRight size={16} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
      </div>
    </Link>
  )
}
