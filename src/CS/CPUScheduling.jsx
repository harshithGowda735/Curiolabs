import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Add Processes', description: 'Define processes with arrival time and burst time' }, { title: 'Select Algorithm', description: 'Choose FCFS, SJF, or Round Robin scheduling' }, { title: 'Set Quantum', description: 'For Round Robin, set the time quantum' }, { title: 'View Gantt', description: 'Examine the Gantt chart and compute metrics' }]
const observations = ['FCFS: Simple but can cause convoy effect (long process delays short ones)', 'SJF: Optimal average waiting time but requires knowing burst times', 'Round Robin: Fair time-sharing, performance depends on quantum size', 'Turnaround Time = Completion - Arrival', 'Waiting Time = Turnaround - Burst']

const defaultProcesses = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 1, burst: 4 },
  { id: 'P3', arrival: 2, burst: 2 },
  { id: 'P4', arrival: 3, burst: 3 },
]
const processColors = { P1: '#3b82f6', P2: '#22c55e', P3: '#f59e0b', P4: '#ef4444', P5: '#8b5cf6' }

function scheduleFCFS(procs) {
  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival)
  const gantt = []; let time = 0
  sorted.forEach(p => {
    if (time < p.arrival) time = p.arrival
    gantt.push({ id: p.id, start: time, end: time + p.burst })
    time += p.burst
  })
  return gantt
}
function scheduleSJF(procs) {
  const remaining = [...procs].map(p => ({ ...p })); const gantt = []; let time = 0
  while (remaining.length) {
    const available = remaining.filter(p => p.arrival <= time)
    if (!available.length) { time++; continue }
    available.sort((a, b) => a.burst - b.burst)
    const p = available[0]
    gantt.push({ id: p.id, start: time, end: time + p.burst })
    time += p.burst
    remaining.splice(remaining.findIndex(r => r.id === p.id), 1)
  }
  return gantt
}
function scheduleRR(procs, quantum) {
  const queue = [...procs].sort((a, b) => a.arrival - b.arrival).map(p => ({ ...p, remaining: p.burst }))
  const gantt = []; let time = 0; const ready = []
  let idx = 0
  while (ready.length || idx < queue.length) {
    while (idx < queue.length && queue[idx].arrival <= time) { ready.push(queue[idx]); idx++ }
    if (!ready.length) { time = queue[idx]?.arrival || time + 1; continue }
    const p = ready.shift()
    const run = Math.min(quantum, p.remaining)
    gantt.push({ id: p.id, start: time, end: time + run })
    time += run; p.remaining -= run
    while (idx < queue.length && queue[idx].arrival <= time) { ready.push(queue[idx]); idx++ }
    if (p.remaining > 0) ready.push(p)
  }
  return gantt
}

export default function CPUScheduling() {
  const { t } = useLanguage()
  const [processes, setProcesses] = useState(defaultProcesses)
  const [algo, setAlgo] = useState('FCFS')
  const [quantum, setQuantum] = useState(2)

  const gantt = useMemo(() => {
    if (algo === 'FCFS') return scheduleFCFS(processes)
    if (algo === 'SJF') return scheduleSJF(processes)
    return scheduleRR(processes, quantum)
  }, [processes, algo, quantum])

  const totalTime = gantt.length ? gantt[gantt.length - 1].end : 0
  const metrics = useMemo(() => {
    return processes.map(p => {
      const slots = gantt.filter(g => g.id === p.id)
      const completion = slots.length ? slots[slots.length - 1].end : 0
      const turnaround = completion - p.arrival
      const waiting = turnaround - p.burst
      return { ...p, completion, turnaround, waiting }
    })
  }, [gantt, processes])

  const avgWait = metrics.reduce((s, m) => s + m.waiting, 0) / metrics.length
  const avgTurn = metrics.reduce((s, m) => s + m.turnaround, 0) / metrics.length

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⏱️ {t('Scheduler Config', 'ಶೆಡ್ಯೂಲರ್')}</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['FCFS', 'SJF', 'RR'].map(a => (
            <button key={a} onClick={() => setAlgo(a)} className={`py-2 rounded-lg text-sm font-bold ${algo === a ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{a}</button>
          ))}
        </div>
        {algo === 'RR' && (
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">Time Quantum: {quantum}</label>
            <input type="range" min={1} max={5} value={quantum} onChange={e => setQuantum(Number(e.target.value))} className="w-full" style={{ '--slider-color': '#8b5cf6' }} />
          </div>
        )}
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('Processes', 'ಪ್ರಕ್ರಿಯೆಗಳು')}</h4>
        <div className="space-y-1">
          {processes.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-8 font-bold" style={{ color: processColors[p.id] }}>{p.id}</span>
              <span className="text-gray-500">Arr:</span>
              <input type="number" value={p.arrival} onChange={e => { const np = [...processes]; np[i].arrival = Number(e.target.value); setProcesses(np) }} className="w-12 border rounded px-1 py-0.5 text-center" min={0} />
              <span className="text-gray-500">Burst:</span>
              <input type="number" value={p.burst} onChange={e => { const np = [...processes]; np[i].burst = Number(e.target.value); setProcesses(np) }} className="w-12 border rounded px-1 py-0.5 text-center" min={1} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-violet-50 rounded-xl border border-violet-200 p-4 text-center">
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-violet-600">Avg Wait</p><p className="text-xl font-bold text-violet-700">{avgWait.toFixed(1)}</p></div>
          <div><p className="text-xs text-violet-600">Avg Turnaround</p><p className="text-xl font-bold text-violet-700">{avgTurn.toFixed(1)}</p></div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Gantt Chart', 'ಗ್ಯಾಂಟ್ ಚಾರ್ಟ್')} ({algo})</h3>
        <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
          {gantt.map((g, i) => (
            <div key={i} className="flex items-center justify-center text-white text-xs font-bold relative" style={{ width: `${((g.end - g.start) / totalTime) * 100}%`, backgroundColor: processColors[g.id] || '#64748b', borderRight: '1px solid white' }}>
              {g.id}
              <span className="absolute -bottom-5 left-0 text-gray-400 text-[8px]">{g.start}</span>
            </div>
          ))}
        </div>
        <div className="text-right text-[8px] text-gray-400 mt-1">{totalTime}</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Metrics', 'ಮೆಟ್ರಿಕ್ಸ್')}</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2 px-2 text-left">Process</th><th className="py-2 px-2">Arrival</th><th className="py-2 px-2">Burst</th><th className="py-2 px-2">Completion</th><th className="py-2 px-2">Turnaround</th><th className="py-2 px-2">Wait</th>
          </tr></thead>
          <tbody>{metrics.map(m => (
            <tr key={m.id} className="border-b border-gray-50 text-center">
              <td className="py-1.5 px-2 text-left font-bold" style={{ color: processColors[m.id] }}>{m.id}</td>
              <td className="py-1.5 px-2">{m.arrival}</td><td className="py-1.5 px-2">{m.burst}</td><td className="py-1.5 px-2">{m.completion}</td><td className="py-1.5 px-2">{m.turnaround}</td><td className="py-1.5 px-2">{m.waiting}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )

  return <MissionShell title={t('CPU Scheduling', 'CPU ಶೆಡ್ಯೂಲಿಂಗ್')} titleEmoji="⏱️" subject="CS" accentColor="violet" gradientFrom="from-violet-500" gradientTo="to-purple-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
