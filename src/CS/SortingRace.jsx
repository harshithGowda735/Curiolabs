import { useState, useEffect, useRef, useCallback } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [{ title: 'Generate Array', description: 'Create a random array to sort' }, { title: 'Choose Algorithms', description: 'Select which sorting algorithms to race' }, { title: 'Start Race', description: 'Watch algorithms compete in real time' }, { title: 'Compare', description: 'Check comparison counts and time taken' }]
const observations = ['Bubble sort: O(n²) average — very slow on large arrays', 'Merge sort: O(n log n) guaranteed — consistently fast', 'Quick sort: O(n log n) average, O(n²) worst — usually fastest in practice', 'Selection sort: O(n²) — always performs same number of comparisons', 'Time complexity matters more as array size grows']

function generateArray(size) { return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1) }

async function bubbleSort(arr, update, delay) {
  const a = [...arr]; let comps = 0
  for (let i = 0; i < a.length; i++) { for (let j = 0; j < a.length - i - 1; j++) { comps++; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]] }; if (comps % 5 === 0) { update([...a], comps); await new Promise(r => setTimeout(r, delay)) } } }
  update([...a], comps); return comps
}
async function selectionSort(arr, update, delay) {
  const a = [...arr]; let comps = 0
  for (let i = 0; i < a.length; i++) { let min = i; for (let j = i + 1; j < a.length; j++) { comps++; if (a[j] < a[min]) min = j }; [a[i], a[min]] = [a[min], a[i]]; if (i % 2 === 0) { update([...a], comps); await new Promise(r => setTimeout(r, delay)) } }
  update([...a], comps); return comps
}
async function mergeSort(arr, update, delay) {
  const a = [...arr]; let comps = 0
  async function merge(l, r) {
    let i = 0, j = 0; const res = []
    while (i < l.length && j < r.length) { comps++; if (l[i] <= r[j]) res.push(l[i++]); else res.push(r[j++]) }
    return [...res, ...l.slice(i), ...r.slice(j)]
  }
  async function sort(a) {
    if (a.length <= 1) return a
    const mid = Math.floor(a.length / 2)
    const left = await sort(a.slice(0, mid))
    const right = await sort(a.slice(mid))
    const result = await merge(left, right)
    update(result, comps); await new Promise(r => setTimeout(r, delay))
    return result
  }
  const result = await sort(a); update(result, comps); return comps
}

export default function SortingRace() {
  const { t } = useLanguage()
  const [size, setSize] = useState(30)
  const [original, setOriginal] = useState(() => generateArray(30))
  const [arrays, setArrays] = useState({})
  const [comparisons, setComparisons] = useState({})
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const newArray = () => { const a = generateArray(size); setOriginal(a); setArrays({}); setComparisons({}); setDone(false) }

  const startRace = async () => {
    setRunning(true); setDone(false)
    setArrays({ bubble: [...original], selection: [...original], merge: [...original] })
    setComparisons({ bubble: 0, selection: 0, merge: 0 })
    const delay = Math.max(1, 50 - size)
    await Promise.all([
      bubbleSort(original, (a, c) => { setArrays(prev => ({ ...prev, bubble: a })); setComparisons(prev => ({ ...prev, bubble: c })) }, delay),
      selectionSort(original, (a, c) => { setArrays(prev => ({ ...prev, selection: a })); setComparisons(prev => ({ ...prev, selection: c })) }, delay),
      mergeSort(original, (a, c) => { setArrays(prev => ({ ...prev, merge: a })); setComparisons(prev => ({ ...prev, merge: c })) }, delay),
    ])
    setRunning(false); setDone(true)
  }

  const renderBars = (arr, color) => (
    <div className="flex items-end gap-px h-24">
      {(arr || original).map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-75" style={{ height: `${v}%`, backgroundColor: color, minWidth: '2px' }} />
      ))}
    </div>
  )

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Race Setup', 'ರೇಸ್ ಸೆಟಪ್')}</h3>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-medium text-gray-600">{t('Array Size', 'ಅರೇ ಗಾತ್ರ')}:</label>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setOriginal(generateArray(Number(e.target.value))); setArrays({}); setDone(false) }} className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
            {[10, 20, 30, 50, 80].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={newArray} disabled={running} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm disabled:opacity-50">🔀 {t('New Array', 'ಹೊಸ ಅರೇ')}</button>
          <button onClick={startRace} disabled={running} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 shadow-lg shadow-violet-500/20">🏁 {running ? t('Racing...', 'ಓಡುತ್ತಿದೆ...') : t('Start Race', 'ರೇಸ್ ಪ್ರಾರಂಭಿಸಿ')}</button>
        </div>
      </div>
      {done && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-display font-bold text-gray-800 mb-3">🏆 {t('Results', 'ಫಲಿತಾಂಶಗಳು')}</h3>
          {Object.entries(comparisons).sort((a, b) => a[1] - b[1]).map(([algo, count], i) => (
            <div key={algo} className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span className="text-sm font-medium capitalize">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {algo}</span>
              <span className="text-sm font-bold text-violet-600">{count} comparisons</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {[['bubble', 'Bubble Sort', '#ef4444'], ['selection', 'Selection Sort', '#f59e0b'], ['merge', 'Merge Sort', '#22c55e']].map(([key, label, color]) => (
        <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-gray-800 text-sm">{label}</h3>
            <span className="text-xs font-mono text-gray-500">{comparisons[key] || 0} comps</span>
          </div>
          {renderBars(arrays[key], color)}
        </div>
      ))}
    </div>
  )

  return <MissionShell title={t('Sorting Algorithm Race', 'ಸಾರ್ಟಿಂಗ್ ಅಲ್ಗಾರಿದಮ್ ರೇಸ್')} titleEmoji="📊" subject="CS" accentColor="violet" gradientFrom="from-violet-500" gradientTo="to-purple-600" steps={steps} currentStep={running ? 2 : done ? 3 : 0} controls={controls} visualization={visualization} observations={observations} />
}
