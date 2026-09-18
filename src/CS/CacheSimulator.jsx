import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Configure', description: 'Set cache size, block size, and associativity' }, { title: 'Access', description: 'Enter memory addresses to access' }, { title: 'Observe', description: 'Watch hits and misses in real time' }]
const observations = ['Cache hit: data found in cache — fast access', 'Cache miss: data not in cache — must fetch from main memory', 'Direct-mapped: each address maps to exactly one cache line', 'Higher associativity reduces conflict misses but adds complexity', 'Hit ratio = hits / (hits + misses) — higher is better']

export default function CacheSimulator() {
  const { t } = useLanguage()
  const [cacheSize, setCacheSize] = useState(8) // lines
  const [blockSize, setBlockSize] = useState(1)
  const [accesses, setAccesses] = useState([])
  const [inputAddr, setInputAddr] = useState('')
  const [cache, setCache] = useState(Array(8).fill(null))
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

  const accessMemory = () => {
    const addr = parseInt(inputAddr)
    if (isNaN(addr) || addr < 0) return
    const line = addr % cacheSize
    const isHit = cache[line] === addr
    const newCache = [...cache]
    newCache[line] = addr
    setCache(newCache)
    setAccesses(prev => [...prev, { addr, line, hit: isHit }])
    if (isHit) setHits(h => h + 1); else setMisses(m => m + 1)
    setInputAddr('')
  }

  const reset = () => { setCache(Array(cacheSize).fill(null)); setAccesses([]); setHits(0); setMisses(0) }
  const hitRatio = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0'

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">💾 {t('Cache Config', 'ಕ್ಯಾಶ್ ಸಂರಚನೆ')}</h3>
        <LabeledSlider label="Cache Lines" value={cacheSize} onChange={v => { setCacheSize(Math.round(v)); reset() }} min={4} max={16} step={1} unit="" accentColor="#8b5cf6" />
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">{t('Memory Address', 'ಮೆಮೊರಿ ವಿಳಾಸ')}</label>
          <div className="flex gap-2 mt-1">
            <input type="number" value={inputAddr} onChange={e => setInputAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && accessMemory()} placeholder="0-99" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" min={0} max={99} />
            <button onClick={accessMemory} className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Access</button>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => { setInputAddr(String(Math.floor(Math.random() * 32))); }} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm">🎲 Random</button>
          <button onClick={reset} className="flex-1 bg-red-50 text-red-600 font-semibold py-2 rounded-lg text-sm">🔄 Reset</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-xs text-green-600">Hits</p><p className="text-xl font-bold text-green-700">{hits}</p></div>
          <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-xs text-red-600">Misses</p><p className="text-xl font-bold text-red-700">{misses}</p></div>
          <div className="bg-violet-50 rounded-lg p-3 text-center"><p className="text-xs text-violet-600">Hit Ratio</p><p className="text-xl font-bold text-violet-700">{hitRatio}%</p></div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Cache State', 'ಕ್ಯಾಶ್ ಸ್ಥಿತಿ')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {cache.map((val, i) => (
            <div key={i} className={`rounded-lg p-2 text-center text-sm border ${val !== null ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-[10px] text-gray-400">Line {i}</p>
              <p className="font-bold text-gray-700">{val !== null ? `Addr ${val}` : 'Empty'}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Access Log', 'ಪ್ರವೇಶ ಲಾಗ್')}</h3>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {accesses.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">{t('No accesses yet', 'ಇನ್ನೂ ಪ್ರವೇಶಗಳಿಲ್ಲ')}</p> :
            accesses.slice(-20).reverse().map((a, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${a.hit ? 'bg-green-50' : 'bg-red-50'}`}>
                <span>Addr <b>{a.addr}</b> → Line {a.line}</span>
                <span className={`font-bold ${a.hit ? 'text-green-600' : 'text-red-600'}`}>{a.hit ? 'HIT ✓' : 'MISS ✗'}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  return <MissionShell title={t('Cache Hit/Miss Simulator', 'ಕ್ಯಾಶ್ ಹಿಟ್/ಮಿಸ್ ಸಿಮ್ಯುಲೇಟರ್')} titleEmoji="💾" subject="CS" accentColor="violet" gradientFrom="from-violet-500" gradientTo="to-purple-600" steps={steps} currentStep={accesses.length > 0 ? 2 : 0} controls={controls} visualization={visualization} observations={observations} />
}
