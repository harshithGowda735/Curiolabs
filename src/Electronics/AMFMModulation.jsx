import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
import { Radio, Activity } from 'lucide-react'

const steps = [
  { title: 'Set Carrier', description: 'Adjust carrier frequency and amplitude parameters' },
  { title: 'Set Message', description: 'Adjust audio message signal frequency and amplitude' },
  { title: 'Choose Mode', description: 'Switch between Amplitude Modulation (AM) and Frequency Modulation (FM)' },
  { title: 'Observe Waveform', description: 'Analyze envelope variation (AM) vs instantaneous frequency variation (FM)' }
]

const apparatusList = [
  { slNo: '1.', particulars: 'Dual Channel Function Generator', range: '1 Hz – 20 MHz Sine/Square', quantity: '01' },
  { slNo: '2.', particulars: 'AM/FM Modulation Trainer Board', range: 'IC XR2206 / MC1496', quantity: '01' },
  { slNo: '3.', particulars: 'Digital Storage Oscilloscope (DSO)', range: '100 MHz, 1 GSa/s Dual Trace', quantity: '01' },
  { slNo: '4.', particulars: 'BNC to Crocodile Patch Probes', range: '50Ω Coaxial Cable', quantity: '03' }
]

const observations = [
  'AM varies carrier amplitude in direct proportion to instantaneous message amplitude.',
  'FM varies carrier frequency in direct proportion to message amplitude while keeping amplitude constant.',
  'Modulation index m = Am / Ac. For AM, m ≤ 1 prevents envelope overmodulation distortion.',
  'FM offers superior noise immunity compared to AM because atmospheric noise affects amplitude, not frequency.',
  "Bandwidth: AM requires 2·fm, whereas FM requires 2·(Δf + fm) governed by Carson's rule."
]

export default function AMFMModulation() {
  const { t } = useLanguage()
  const [mode, setMode] = useState('AM')
  const [carrierFreq, setCarrierFreq] = useState(100)
  const [carrierAmp, setCarrierAmp] = useState(1)
  const [msgFreq, setMsgFreq] = useState(10)
  const [msgAmp, setMsgAmp] = useState(0.5)
  const modIndex = mode === 'AM' ? msgAmp / carrierAmp : msgAmp * 50

  const gW = 500, gH = 130, gPad = 30, pts = 300
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

  const renderWave = (data, color, label, meta) => {
    const maxAmp = mode === 'AM' ? carrierAmp + msgAmp + 0.2 : carrierAmp + 0.2
    return (
      <div className="bg-[#1A120E] rounded-2xl border-2 border-[#221611] p-4 shadow-sm text-[#FAF5EB]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-display font-black uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </p>
          {meta && (
            <span className="text-[10px] font-mono text-[#A4C93B] bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              {meta}
            </span>
          )}
        </div>
        <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto bg-[#100B08] rounded-xl border border-white/10">
          <line x1={gPad} y1={gH / 2} x2={gW - gPad} y2={gH / 2} stroke="#3A2820" strokeWidth="1" strokeDasharray="3,3" />
          <polyline
            points={data.map((y, i) => `${gPad + (i / pts) * (gW - 2 * gPad)},${gH / 2 - (y / maxAmp) * (gH / 2 - gPad)}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      </div>
    )
  }

  const controls = (
    <div className="space-y-4">
      {/* Modulation Mode Selection */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#221611]/15 p-4 sm:p-5 text-[#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs text-[#221611] uppercase tracking-wider flex items-center gap-2">
            <Radio size={14} className="text-[#A4C93B]" />
            <span>{t('Modulation Mode', 'ಮಾಡ್ಯುಲೇಶನ್ ವಿಧಾನ')}</span>
          </h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF5EB] text-[#754F40]">
            RF Transceiver
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {['AM', 'FM'].map(m => {
            const isActive = mode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2.5 rounded-xl text-xs font-display font-black border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#221611] text-[#A4C93B] border-[#221611] shadow-[0_3px_0_#221611]'
                    : 'bg-[#FAF5EB] text-[#221611] border-[#221611]/20 hover:border-[#221611]/50'
                }`}
              >
                {m === 'AM' ? 'Amplitude (AM)' : 'Frequency (FM)'}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          <LabeledSlider
            label="Carrier Frequency (fc)"
            value={carrierFreq}
            onChange={setCarrierFreq}
            min={50}
            max={500}
            step={10}
            unit=" Hz"
            accentColor="#38bdf8"
          />
          <LabeledSlider
            label="Carrier Amplitude (Ac)"
            value={carrierAmp}
            onChange={setCarrierAmp}
            min={0.1}
            max={2}
            step={0.1}
            unit=" V"
            accentColor="#38bdf8"
          />
          <div className="pt-2 border-t border-[#221611]/10">
            <LabeledSlider
              label="Message Frequency (fm)"
              value={msgFreq}
              onChange={setMsgFreq}
              min={1}
              max={50}
              step={1}
              unit=" Hz"
              accentColor="#f59e0b"
            />
          </div>
          <LabeledSlider
            label="Message Amplitude (Am)"
            value={msgAmp}
            onChange={setMsgAmp}
            min={0.1}
            max={1.5}
            step={0.1}
            unit=" V"
            accentColor="#f59e0b"
          />
        </div>

        {/* Telemetry Index Box */}
        <div className="mt-4 bg-[#FAF5EB] rounded-xl p-3.5 border-2 border-[#221611]/15 flex items-center justify-between text-[#221611]">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#754F40]">{mode} Modulation Index (μ)</p>
            <p className="text-xl font-display font-black text-[#221611]">{modIndex.toFixed(2)}</p>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
            mode === 'AM' && modIndex > 1
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-[#A4C93B]/30 text-[#221611] border-[#221611]/30'
          }`}>
            {mode === 'AM' ? (modIndex <= 1 ? 'Under-Modulated (Clean)' : 'Over-Modulated (Distorted)') : 'Wideband FM'}
          </span>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-3">
      {renderWave(makeWave('message'), '#f59e0b', t('Baseband Message Signal m(t)', 'ಸಂದೇಶ ಸಿಗ್ನಲ್'), `${msgFreq}Hz • ${msgAmp}V`)}
      {renderWave(makeWave('carrier'), '#38bdf8', t('High-Frequency Carrier Signal c(t)', 'ಕ್ಯಾರಿಯರ್ ಸಿಗ್ನಲ್'), `${carrierFreq}Hz • ${carrierAmp}V`)}
      {renderWave(makeWave('modulated'), '#A4C93B', `${mode} ${t('Modulated Composite Signal s(t)', 'ಮಾಡ್ಯುಲೇಟೆಡ್ ಔಟ್‌ಪುಟ್')}`, `Index: ${modIndex.toFixed(2)}`)}
    </div>
  )

  return (
    <MissionShell
      title={t('AM/FM Modulation & Demodulation', 'AM/FM ಮಾಡ್ಯುಲೇಶನ್')}
      titleEmoji="📻"
      subject="Electronics"
      aim="To generate and study the waveforms of Amplitude Modulated (AM) and Frequency Modulated (FM) signals and calculate the modulation index."
      apparatus={apparatusList}
      accentColor="emerald"
      gradientFrom="from-[#221611]"
      gradientTo="to-[#3A2820]"
      steps={steps}
      currentStep={2}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
