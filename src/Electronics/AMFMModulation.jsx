import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Set Carrier', description: 'Adjust carrier frequency and amplitude' }, { title: 'Set Message', description: 'Adjust message signal frequency and amplitude' }, { title: 'Choose Mode', description: 'Switch between AM and FM modulation' }, { title: 'Observe', description: 'See how the modulated waveform changes' }]
const observations = ['AM varies the carrier amplitude proportional to the message signal', 'FM varies the carrier frequency proportional to the message signal', 'AM modulation index m = Am/Ac — must be ≤ 1 to avoid distortion', 'FM is more resistant to noise than AM', 'Bandwidth: AM ≈ 2fm, FM ≈ 2(Δf + fm) by Carson\'s rule']

export default function AMFMModulation() {
  const { t } = useLanguage()
  const [mode, setMode] = useState('AM')
  const [carrierFreq, setCarrierFreq] = useState(100)
  const [carrierAmp, setCarrierAmp] = useState(1)
  const [msgFreq, setMsgFreq] = useState(10)
  const [msgAmp, setMsgAmp] = useState(0.5)
  const modIndex = mode === 'AM' ? msgAmp / carrierAmp : msgAmp * 50

  const gW = 450, gH = 150, gPad = 30, pts = 300
  const makeWave = (type) => {
    const data = []
    for (let i = 0; i < pts; i++) {
      const t = (i / pts) * 0.1
      const msg = msgAmp * Math.sin(2 * Math.PI * msgFreq * t)
      let y
      if (type === 'carrier') y = carrierAmp * Math.sin(2 * Math.PI * carrierFreq * t)
      else if (type === 'message') y = msg
      else if (mode === 'AM') y = (carrierAmp + msg) * Math.sin(2 * Math.PI * carrierFreq * t)
      else y = carrierAmp * Math.sin(2 * Math.PI * carrierFreq * t + modIndex * Math.sin(2 * Math.PI * msgFreq * t))
      data.push(y)
    }
    return data
  }

  const renderWave = (data, color, label) => {
    const maxAmp = mode === 'AM' ? carrierAmp + msgAmp + 0.2 : carrierAmp + 0.2
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
        <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto">
          <line x1={gPad} y1={gH / 2} x2={gW - gPad} y2={gH / 2} stroke="#e2e8f0" strokeWidth="0.5" />
          <polyline points={data.map((y, i) => `${gPad + (i / pts) * (gW - 2 * gPad)},${gH / 2 - (y / maxAmp) * (gH / 2 - gPad)}`).join(' ')} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      </div>
    )
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📻 {t('Modulation', 'ಮಾಡ್ಯುಲೇಶನ್')}</h3>
        <div className="flex gap-2 mb-4">
          {['AM', 'FM'].map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${mode === m ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{m}</button>)}
        </div>
        <LabeledSlider label="Carrier Freq (Hz)" value={carrierFreq} onChange={setCarrierFreq} min={50} max={500} step={10} unit=" Hz" accentColor="#3b82f6" />
        <div className="mt-2"><LabeledSlider label="Carrier Amp" value={carrierAmp} onChange={setCarrierAmp} min={0.1} max={2} step={0.1} unit="" accentColor="#3b82f6" /></div>
        <div className="mt-2"><LabeledSlider label="Message Freq (Hz)" value={msgFreq} onChange={setMsgFreq} min={1} max={50} step={1} unit=" Hz" accentColor="#f59e0b" /></div>
        <div className="mt-2"><LabeledSlider label="Message Amp" value={msgAmp} onChange={setMsgAmp} min={0.1} max={1.5} step={0.1} unit="" accentColor="#f59e0b" /></div>
        <div className="mt-3 bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-600">{mode} Modulation Index</p>
          <p className="text-xl font-bold text-emerald-700">{modIndex.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-3">
      {renderWave(makeWave('message'), '#f59e0b', t('Message Signal', 'ಸಂದೇಶ ಸಿಗ್ನಲ್'))}
      {renderWave(makeWave('carrier'), '#3b82f6', t('Carrier Signal', 'ಕ್ಯಾರಿಯರ್ ಸಿಗ್ನಲ್'))}
      {renderWave(makeWave('modulated'), '#10b981', `${mode} ${t('Modulated Output', 'ಮಾಡ್ಯುಲೇಟೆಡ್ ಔಟ್‌ಪುಟ್')}`)}
    </div>
  )

  return <MissionShell title={t('AM/FM Modulation', 'AM/FM ಮಾಡ್ಯುಲೇಶನ್')} titleEmoji="📻" subject="Electronics" accentColor="emerald" gradientFrom="from-emerald-500" gradientTo="to-teal-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
