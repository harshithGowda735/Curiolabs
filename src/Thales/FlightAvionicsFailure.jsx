import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Monitor Primary Flight Display', description: 'Observe airspeed tape, attitude indicator, and altitude readout' },
  { title: 'Simulate Pitot Tube Icing', description: 'Freeze the dynamic pressure port to observe false airspeed behavior' },
  { title: 'Analyze Sensor Disagreement', description: 'Notice disparity between Air Data Computer 1 and Air Data Computer 2' },
  { title: 'Engage Reversionary Standby', description: 'Transfer flight instrumentation to the independent backup ISIS gauge' }
]

const observations = [
  'Pitot tubes measure total pressure (static + dynamic) to calculate Indicated Airspeed (IAS)',
  'When a pitot tube freezes closed while the drain remains open, indicated airspeed drops to zero',
  'If both the tip and drain freeze, the pitot tube behaves like an altimeter, falsely indicating higher speed during climbs',
  'Triple-modular redundancy (TMR) with voting algorithms prevents single-sensor failures from corrupting fly-by-wire laws',
  'Commercial avionics alert pilots with NAV AIRSPEED DISAGREE messages when sensors drift apart by > 10 knots'
]

export default function FlightAvionicsFailure() {
  const { t } = useLanguage()
  const [actualAirspeed, setActualAirspeed] = useState(250) // knots
  const [pitchDeg, setPitchDeg] = useState(5) // degrees
  const [pitotIced, setPitotIced] = useState(false)
  const [standbyActive, setStandbyActive] = useState(false)

  // In pitot freeze: ADC 1 reads erroneous low or frozen value
  const adc1Speed = pitotIced ? 115 : actualAirspeed
  const adc2Speed = actualAirspeed
  const isDisagree = Math.abs(adc1Speed - adc2Speed) > 10

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">✈️ {t('Flight Dynamics Controls', 'ಹಾರಾಟದ ನಿಯಂತ್ರಣ')}</h3>
        <LabeledSlider label="True Airspeed (TAS)" value={actualAirspeed} onChange={setActualAirspeed} min={140} max={380} step={5} unit=" kts" accentColor="#0284c7" />
        <div className="mt-3">
          <LabeledSlider label="Aircraft Pitch Attitude" value={pitchDeg} onChange={setPitchDeg} min={-15} max={20} step={1} unit="°" accentColor="#3b82f6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🚨 {t('Avionics Fault Injection', 'ಏವಿಯಾನಿಕ್ಸ್ ದೋಷ ಇಂಜೆಕ್ಷನ್')}</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer">
            <div>
              <span className="font-semibold text-rose-900 text-xs block">Simulate Pitot Probe 1 Icing</span>
              <span className="text-[10px] text-rose-600">Block dynamic pressure port due to severe ice crystal icing</span>
            </div>
            <input
              type="checkbox"
              checked={pitotIced}
              onChange={e => setPitotIced(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
          </label>

          <button
            onClick={() => setStandbyActive(!standbyActive)}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              standbyActive ? 'bg-sky-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {standbyActive ? '✅ Backup ISIS Standby Engaged' : '🔄 Transfer to Standby Instruments (ISIS)'}
          </button>
        </div>
      </div>

      {isDisagree && !standbyActive && (
        <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-xl text-amber-900 text-xs font-bold animate-pulse text-center">
          ⚠️ CAUTION: IAS DISAGREE — Pitot 1 & Pitot 2 reading disparity exceeds 10 kts!
        </div>
      )}
    </div>
  )

  const activeDisplaySpeed = standbyActive ? adc2Speed : adc1Speed

  const visualization = (
    <div className="space-y-4">
      {/* Primary Flight Display (PFD) Graphic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-gray-800">🛩️ {t('Electronic Flight Instrument System (PFD)', 'PFD ಪ್ರದರ್ಶನ')}</h3>
          <span className={`text-xs px-2.5 py-0.5 rounded font-bold font-mono ${
            standbyActive ? 'bg-sky-100 text-sky-800' : isDisagree ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {standbyActive ? 'SOURCE: ISIS STANDBY' : isDisagree ? 'SOURCE: ADC 1 (UNRELIABLE)' : 'SOURCE: ADC 1 (NORMAL)'}
          </span>
        </div>

        {/* PFD Glass Cockpit Canvas */}
        <div className="w-full h-64 bg-black rounded-xl overflow-hidden relative border-4 border-slate-800 flex items-center justify-center font-mono">
          {/* Artificial Horizon Sky/Ground */}
          <div
            className="absolute w-[200%] h-[200%] transition-transform duration-200"
            style={{
              transform: `translateY(${pitchDeg * 4}px)`,
              background: 'linear-gradient(to bottom, #0284c7 50%, #854d0e 50%)'
            }}
          />

          {/* Pitch Ladder Marks */}
          <div className="absolute z-10 pointer-events-none text-white text-[10px]">
            <div className="w-32 border-b-2 border-white/60 mx-auto my-6" />
            <div className="w-20 border-b-2 border-white/60 mx-auto my-6 text-center">10°</div>
            <div className="w-12 border-b border-white/40 mx-auto my-6 text-center">5°</div>
          </div>

          {/* Fixed Aircraft Symbol (Yellow) */}
          <div className="absolute z-20 pointer-events-none flex items-center justify-center">
            <div className="w-12 h-1.5 bg-amber-400" />
            <div className="w-3 h-3 border-2 border-amber-400 rounded-full mx-1" />
            <div className="w-12 h-1.5 bg-amber-400" />
          </div>

          {/* Left Airspeed Tape */}
          <div className="absolute left-2 top-4 bottom-4 w-16 bg-slate-950/80 border border-slate-700 rounded z-30 p-1 flex flex-col justify-between text-right text-xs">
            <span className="text-[10px] text-gray-400 block text-center">IAS (KTS)</span>
            <div className="my-auto text-center">
              <span className={`text-base font-bold block ${pitotIced && !standbyActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                {activeDisplaySpeed}
              </span>
              <span className="text-[9px] text-gray-400">Target: 250</span>
            </div>
            <div className="text-[10px] text-slate-500 text-center">Mach 0.62</div>
          </div>

          {/* Right Altitude Tape */}
          <div className="absolute right-2 top-4 bottom-4 w-16 bg-slate-950/80 border border-slate-700 rounded z-30 p-1 flex flex-col justify-between text-left text-xs">
            <span className="text-[10px] text-gray-400 block text-center">ALT (FT)</span>
            <div className="my-auto text-center">
              <span className="text-base font-bold text-cyan-400 block">18,500</span>
              <span className="text-[9px] text-gray-400">STD 1013</span>
            </div>
            <div className="text-[10px] text-slate-500 text-center">V/S +0</div>
          </div>
        </div>
      </div>

      {/* Sensor Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📡 {t('Multi-Sensor Air Data Comparison', 'ಸಂವೇದಕ ಹೋಲಿಕೆ')}</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-lg border ${pitotIced ? 'bg-rose-50 border-rose-200' : 'bg-gray-50'}`}>
            <span className="text-gray-500 block">ADC 1 (Captain)</span>
            <span className="text-sm font-bold font-mono text-gray-800">{adc1Speed} kts</span>
            <span className="text-[10px] text-rose-600 block mt-1">{pitotIced ? 'ICED FAULT' : 'HEALTHY'}</span>
          </div>
          <div className="p-2.5 rounded-lg border bg-gray-50">
            <span className="text-gray-500 block">ADC 2 (First Officer)</span>
            <span className="text-sm font-bold font-mono text-gray-800">{adc2Speed} kts</span>
            <span className="text-[10px] text-emerald-600 block mt-1">HEALTHY</span>
          </div>
          <div className="p-2.5 rounded-lg border bg-sky-50 border-sky-200">
            <span className="text-sky-700 block font-semibold">ISIS Backup</span>
            <span className="text-sm font-bold font-mono text-sky-900">{actualAirspeed} kts</span>
            <span className="text-[10px] text-sky-600 block mt-1">STANDBY OK</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Flight Avionics Failure & Pitot Redundancy', 'ಏವಿಯಾನಿಕ್ಸ್ ದೋಷ ಮತ್ತು ಪಿಟಾಟ್ ರಿಡಂಡನ್ಸಿ')}
      domain="Aerospace & Flight Systems"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
