import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Build Graph', description: 'Click nodes to set source and destination' }, { title: 'Run Algorithm', description: "Click Run to execute Dijkstra's algorithm" }, { title: 'Trace Path', description: 'See the shortest path highlighted step by step' }]
const observations = ["Dijkstra's finds the shortest path from source to all other vertices", 'Time complexity: O(V² ) with adjacency matrix, O((V+E)log V) with min-heap', 'Does NOT work with negative edge weights — use Bellman-Ford instead', 'Greedy approach: always picks the unvisited vertex with smallest distance', 'Used in GPS navigation, network routing (OSPF), and many other applications']

const defaultNodes = [
  { id: 0, x: 50, y: 100, label: 'A' }, { id: 1, x: 150, y: 40, label: 'B' },
  { id: 2, x: 250, y: 40, label: 'C' }, { id: 3, x: 150, y: 160, label: 'D' },
  { id: 4, x: 250, y: 160, label: 'E' }, { id: 5, x: 350, y: 100, label: 'F' },
]
const defaultEdges = [
  { from: 0, to: 1, w: 4 }, { from: 0, to: 3, w: 2 }, { from: 1, to: 2, w: 5 },
  { from: 1, to: 3, w: 1 }, { from: 2, to: 5, w: 2 }, { from: 3, to: 4, w: 3 },
  { from: 4, to: 5, w: 1 }, { from: 1, to: 4, w: 8 },
]

function dijkstra(nodes, edges, src) {
  const dist = {}; const prev = {}; const visited = new Set()
  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[src] = 0
  for (let i = 0; i < nodes.length; i++) {
    let u = null
    nodes.forEach(n => { if (!visited.has(n.id) && (u === null || dist[n.id] < dist[u])) u = n.id })
    if (u === null || dist[u] === Infinity) break
    visited.add(u)
    edges.filter(e => e.from === u || e.to === u).forEach(e => {
      const v = e.from === u ? e.to : e.from
      const alt = dist[u] + e.w
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u }
    })
  }
  return { dist, prev }
}

export default function DijkstraPathfinding() {
  const { t } = useLanguage()
  const [source, setSource] = useState(0)
  const [dest, setDest] = useState(5)
  const [showResult, setShowResult] = useState(false)

  const { dist, prev } = useMemo(() => dijkstra(defaultNodes, defaultEdges, source), [source])
  const path = useMemo(() => {
    if (!showResult) return []
    const p = []; let cur = dest
    while (cur !== null) { p.unshift(cur); cur = prev[cur] }
    return p[0] === source ? p : []
  }, [showResult, dest, prev, source])

  const pathEdges = useMemo(() => {
    const edges = []
    for (let i = 0; i < path.length - 1; i++) {
      edges.push({ from: path[i], to: path[i + 1] })
    }
    return edges
  }, [path])

  const isPathEdge = (e) => pathEdges.some(pe => (pe.from === e.from && pe.to === e.to) || (pe.from === e.to && pe.to === e.from))

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🗺️ {t('Pathfinding', 'ಪಥ ಹುಡುಕಾಟ')}</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('Source', 'ಮೂಲ')}</p>
            <select value={source} onChange={e => { setSource(Number(e.target.value)); setShowResult(false) }} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
              {defaultNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('Destination', 'ಗಮ್ಯಸ್ಥಾನ')}</p>
            <select value={dest} onChange={e => { setDest(Number(e.target.value)); setShowResult(false) }} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
              {defaultNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => setShowResult(true)} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-violet-500/20">
          🚀 {t('Run Dijkstra', 'ಡಿಜ್ಕ್‌ಸ್ಟ್ರಾ ರನ್ ಮಾಡಿ')}
        </button>
        {showResult && (
          <div className="mt-3 bg-violet-50 rounded-lg p-3 text-center">
            <p className="text-sm text-violet-600">{t('Shortest Distance', 'ಕಡಿಮೆ ದೂರ')}</p>
            <p className="text-3xl font-display font-bold text-violet-700">{dist[dest] === Infinity ? '∞' : dist[dest]}</p>
            <p className="text-xs text-violet-500 mt-1">Path: {path.map(id => defaultNodes[id].label).join(' → ')}</p>
          </div>
        )}
      </div>
      {showResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-display font-bold text-gray-800 mb-2">{t('Distance Table', 'ದೂರ ಕೋಷ್ಟಕ')}</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-gray-500"><th className="py-1 px-2 text-left">Node</th><th className="py-1 px-2">Distance</th></tr></thead>
            <tbody>{defaultNodes.map(n => (
              <tr key={n.id} className={`border-b border-gray-50 ${path.includes(n.id) ? 'bg-violet-50' : ''}`}>
                <td className="py-1 px-2 font-bold">{n.label}</td>
                <td className="py-1 px-2 text-center">{dist[n.id] === Infinity ? '∞' : dist[n.id]}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Graph', 'ಗ್ರಾಫ್')}</h3>
      <svg viewBox="0 0 400 200" className="w-full h-auto bg-gradient-to-b from-violet-50 to-white rounded-lg">
        {/* Edges */}
        {defaultEdges.map((e, i) => {
          const n1 = defaultNodes[e.from], n2 = defaultNodes[e.to]
          const onPath = isPathEdge(e)
          return (
            <g key={i}>
              <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={onPath ? '#8b5cf6' : '#cbd5e1'} strokeWidth={onPath ? 3 : 1.5} />
              <text x={(n1.x + n2.x) / 2 + 5} y={(n1.y + n2.y) / 2 - 5} fill={onPath ? '#7c3aed' : '#94a3b8'} fontSize="10" fontWeight="bold">{e.w}</text>
            </g>
          )
        })}
        {/* Nodes */}
        {defaultNodes.map(n => {
          const isOnPath = path.includes(n.id)
          const isSrc = n.id === source
          const isDst = n.id === dest
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={16} fill={isSrc ? '#22c55e' : isDst ? '#ef4444' : isOnPath ? '#8b5cf6' : '#f1f5f9'} stroke={isOnPath ? '#7c3aed' : '#94a3b8'} strokeWidth={isOnPath ? 2 : 1} />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill={isSrc || isDst || isOnPath ? 'white' : '#475569'} fontSize="12" fontWeight="bold">{n.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex gap-4 justify-center mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Source</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Dest</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block"></span> Path</span>
      </div>
    </div>
  )

  return <MissionShell title={t('Dijkstra Pathfinding', 'ಡಿಜ್ಕ್‌ಸ್ಟ್ರಾ ಪಥ ಹುಡುಕಾಟ')} titleEmoji="🗺️" subject="CS" accentColor="violet" gradientFrom="from-violet-500" gradientTo="to-purple-600" steps={steps} currentStep={showResult ? 2 : 0} controls={controls} visualization={visualization} observations={observations} />
}
