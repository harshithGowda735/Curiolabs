import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Place the Beaker', description: 'Place the Beaker filled with water' },
  { title: 'Add the Aquatic Plant', description: 'Add the Aquatic Plant (Hydrilla) into the beaker' },
  { title: 'Position the Funnel', description: 'Position the Funnel over the plant' },
  { title: 'Place the Test Tube', description: 'Place the Test Tube filled with water over the funnel' },
  { title: 'Add the Lamp', description: 'Add the Lamp as light source' },
  { title: 'Insert the Thermometer', description: 'Insert the Thermometer to monitor temperature' },
]
const observations = [
  'Photosynthesis produces oxygen gas (O₂) as a byproduct',
  'Rate of O₂ production increases with light intensity up to a saturation point',
  'Temperature affects the rate — optimal around 25-35°C, decreases beyond 40°C',
  'CO₂ concentration is also a limiting factor in photosynthesis',
  '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (overall equation)',
]

export default function Photosynthesis() {
  const { t } = useLanguage()
  const [lightIntensity, setLightIntensity] = useState(50)
  const [temperature, setTemperature] = useState(25)
  const [co2, setCo2] = useState(0.04)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [dataPoints, setDataPoints] = useState([])
  const intervalRef = useRef(null)

  // Photosynthesis rate model (arbitrary units)
  const rate = (() => {
    const lightFactor = lightIntensity / (lightIntensity + 30) // Michaelis-Menten-like
    const tempFactor = temperature < 10 ? 0.1 : temperature > 45 ? 0.1 : Math.exp(-((temperature - 30) ** 2) / 200)
    const co2Factor = co2 / (co2 + 0.02)
    return (lightFactor * tempFactor * co2Factor * 10).toFixed(2)
  })()

  const bubbleCount = Math.floor(parseFloat(rate) * 3)

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        const t = prev + 5
        setDataPoints(dp => [...dp.slice(-30), { time: t, bubbles: bubbleCount, rate: parseFloat(rate), light: lightIntensity, temp: temperature }])
        return t
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, rate, bubbleCount, lightIntensity, temperature])

  const clearData = () => { setDataPoints([]); setTime(0); setRunning(false) }

  const controls = (
    <div className="space-y-4">
      <div className={`rounded-xl px-4 py-3 flex items-center gap-2 ${running ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span>{running ? '✅' : '⚠️'}</span>
        <div>
          <p className={`font-semibold text-sm ${running ? 'text-green-700' : 'text-red-700'}`}>
            {t('Setup Status', 'ಸೆಟಪ್ ಸ್ಥಿತಿ')}: {running ? t('COMPLETE ✅', 'ಪೂರ್ಣ ✅') : t('INCOMPLETE ❌', 'ಅಪೂರ್ಣ ❌')}
          </p>
          {!running && <p className="text-xs text-red-600">{t('Click Start Experiment to begin', 'ಪ್ರಾರಂಭಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ')}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🌿 {t('Experiment Controls', 'ಪ್ರಯೋಗ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <LabeledSlider label={t('Light Intensity (%)', 'ಬೆಳಕಿನ ತೀವ್ರತೆ (%)')} value={lightIntensity} onChange={setLightIntensity} min={0} max={100} step={5} unit="%" accentColor="#f59e0b" />
        <div className="mt-3"><LabeledSlider label={t('Temperature (°C)', 'ತಾಪಮಾನ (°C)')} value={temperature} onChange={setTemperature} min={5} max={50} step={1} unit="°C" accentColor="#ef4444" /></div>
        <div className="mt-3"><LabeledSlider label={t('CO₂ Concentration (%)', 'CO₂ ಸಾಂದ್ರತೆ (%)')} value={co2} onChange={setCo2} min={0.01} max={0.1} step={0.005} unit="%" accentColor="#22c55e" /></div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setRunning(!running)} className={`flex-1 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${running ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20'}`}>
            {running ? `⏹ ${t('Stop', 'ನಿಲ್ಲಿಸಿ')}` : `🔬 ${t('Start Experiment', 'ಪ್ರಯೋಗ ಪ್ರಾರಂಭಿಸಿ')}`}
          </button>
          <button onClick={clearData} className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-2.5 rounded-xl text-sm">🔄 {t('Reset', 'ರೀಸೆಟ್')}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Live Readings', 'ಲೈವ್ ರೀಡಿಂಗ್‌ಗಳು')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">O₂ Rate</p>
            <p className="text-xl font-bold text-green-700">{rate}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Bubbles</p>
            <p className="text-xl font-bold text-blue-700">{bubbleCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">Time</p>
            <p className="text-xl font-bold text-amber-700">{time}s</p>
          </div>
        </div>
      </div>
    </div>
  )

  const gW = 400, gH = 200, gPad = 40
  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-gray-800">{t('Experimental Data', 'ಪ್ರಾಯೋಗಿಕ ಡೇಟಾ')}</h3>
          <button onClick={clearData} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold">{t('Clear Data', 'ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="py-2 px-2 text-left text-gray-500 font-semibold">Time (s)</th>
              <th className="py-2 px-2 text-left text-gray-500 font-semibold">O₂ Bubbles</th>
              <th className="py-2 px-2 text-left text-gray-500 font-semibold">Rate</th>
              <th className="py-2 px-2 text-left text-gray-500 font-semibold">Light %</th>
              <th className="py-2 px-2 text-left text-gray-500 font-semibold">Temp °C</th>
            </tr></thead>
            <tbody>
              {dataPoints.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('No data collected yet. Start the experiment to collect data.', 'ಇನ್ನೂ ಡೇಟಾ ಸಂಗ್ರಹಿಸಿಲ್ಲ.')}</td></tr>
              ) : dataPoints.slice(-10).map((d, i) => (
                <tr key={i} className="border-b border-gray-50"><td className="py-1.5 px-2">{d.time}</td><td className="py-1.5 px-2">{d.bubbles}</td><td className="py-1.5 px-2">{d.rate}</td><td className="py-1.5 px-2">{d.light}%</td><td className="py-1.5 px-2">{d.temp}°C</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Oxygen Production Over Time', 'ಕಾಲಾನಂತರ ಆಮ್ಲಜನಕ ಉತ್ಪಾದನೆ')}</h3>
        {dataPoints.length < 2 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">{t('No data to display. Start the experiment to see the graph.', 'ಡೇಟಾ ಇಲ್ಲ. ಗ್ರಾಫ್ ನೋಡಲು ಪ್ರಯೋಗವನ್ನು ಪ್ರಾರಂಭಿಸಿ.')}</div>
        ) : (
          <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto">
            <line x1={gPad} y1={gH - gPad} x2={gW - gPad} y2={gH - gPad} stroke="#e2e8f0" strokeWidth="1" />
            <line x1={gPad} y1={gPad} x2={gPad} y2={gH - gPad} stroke="#e2e8f0" strokeWidth="1" />
            <polyline points={dataPoints.map((d, i) => {
              const x = gPad + (i / Math.max(dataPoints.length - 1, 1)) * (gW - 2 * gPad)
              const y = gH - gPad - (d.rate / 10) * (gH - 2 * gPad)
              return `${x},${y}`
            }).join(' ')} fill="none" stroke="#22c55e" strokeWidth="2" />
            {dataPoints.map((d, i) => {
              const x = gPad + (i / Math.max(dataPoints.length - 1, 1)) * (gW - 2 * gPad)
              const y = gH - gPad - (d.rate / 10) * (gH - 2 * gPad)
              return <circle key={i} cx={x} cy={y} r="3" fill="#22c55e" />
            })}
            <text x={gW / 2} y={gH - 5} textAnchor="middle" fill="#64748b" fontSize="9">Time</text>
            <text x={10} y={gH / 2} fill="#64748b" fontSize="9" transform={`rotate(-90, 10, ${gH / 2})`}>O₂ Rate</text>
          </svg>
        )}
      </div>
    </div>
  )

  return (
    <MissionShell title={t('Interactive Photosynthesis Lab', 'ಸಂವಾದಾತ್ಮಕ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಲ್ಯಾಬ್')} titleEmoji="🌿" subject="Biology" accentColor="green" gradientFrom="from-green-500" gradientTo="to-emerald-600" steps={steps} currentStep={running ? 5 : 0} controls={controls} visualization={visualization} observations={observations} setupStatus={running ? 'complete' : 'incomplete'} setupMessage={running ? '' : t('Drag and drop all apparatus into their marked slots to complete the setup.', 'ಸೆಟಪ್ ಪೂರ್ಣಗೊಳಿಸಲು ಎಲ್ಲಾ ಉಪಕರಣಗಳನ್ನು ಎಳೆಯಿರಿ.')} />
  )
}
