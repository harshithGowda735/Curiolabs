import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">🔬</span>
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-6">This experiment doesn't exist... yet!</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          <Home size={18} />
          Back to CurioLabs
        </Link>
      </div>
    </div>
  )
}
