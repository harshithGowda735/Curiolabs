import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
const experiments = [
  { title: 'Sorting Algorithm Race', description: 'Watch bubble, merge, quick, and heap sort race side by side', path: '/cs/sorting', icon: '📊', difficulty: 'Easy', duration: '10 min' },
  { title: 'CPU Scheduling', description: 'FCFS, SJF, Round Robin — Gantt charts and metrics', path: '/cs/scheduling', icon: '⏱️', difficulty: 'Medium', duration: '12 min' },
  { title: 'Dijkstra Pathfinding', description: 'Find shortest paths on an interactive weighted graph', path: '/cs/dijkstra', icon: '🗺️', difficulty: 'Medium', duration: '15 min' },
  { title: 'Cache Hit/Miss Simulator', description: 'Direct-mapped and set-associative cache simulation', path: '/cs/cache', icon: '💾', difficulty: 'Hard', duration: '15 min' },
  { title: 'BST Operations', description: 'Insert, delete, search with live tree visualization', path: '/cs/bst', icon: '🌳', difficulty: 'Medium', duration: '12 min' },
]
export default function CSHub() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">💻 {t('Computer Science Lab', 'ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಲ್ಯಾಬ್')}</h1>
          <p className="text-violet-100">{t('5 interactive algorithm and data structure experiments', '5 ಅಲ್ಗಾರಿದಮ್ ಪ್ರಯೋಗಗಳು')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{experiments.map((e, i) => <ExperimentCard key={i} {...e} />)}</div></div>
      <Footer />
    </div>
  )
}
