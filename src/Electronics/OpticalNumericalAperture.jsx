import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Align Fiber Output with Target Screen', description: 'Position cleaved fiber tip at distance L (10 mm - 40 mm) perpendicularly in front of graduated screen' },
  { title: 'Project Laser Spot and Measure Diameter (W)', description: 'Record diameter W of the circular illuminated spot at varying screen distances L' },
  { title: 'Compute Numerical Aperture (NA)', description: 'Calculate NA using the formula: NA = W / sqrt(4·L² + W²) and acceptance angle θa = arcsin(NA)' },
  { title: 'Determine Cable Attenuation Loss (dB/km)', description: 'Measure input vs output optical power over varying fiber lengths (100 m - 2000 m)' },
  { title: 'Inspect NA Measurement Jig in AR', description: 'View the optical bench, laser source, fiber mount, and graduated screen in 3D WebAR' }
]

const observations = [
  'Numerical Aperture (NA) is a dimensionless figure of merit measuring the light-gathering capacity of an optical fiber: NA = sin(θa) = sqrt(n1² - n2²)',
  'A higher NA allows easier coupling of light from wide-angle emitters (e.g. LEDs), but increases modal dispersion in multi-mode fibers',
  'Acceptance angle θa defines the maximum incidence angle from the fiber axis at which light undergoes Total Internal Reflection (TIR)',
  'Fiber attenuation coefficient α is measured in dB/km: α = (10 / L_km) · log10(Pin / Pout); typical silica fiber loss at 1550 nm is ~0.2 dB/km',
  'Intrinsic attenuation mechanisms include Rayleigh scattering (proportional to 1/λ⁴) and absorption by hydroxyl (OH⁻) impurity ions'
]

export default function OpticalNumericalAperture() {
  const { t } = useLanguage()
  const [screenDistMm, setScreenDistMm] = useState(25) // L in mm
  const [n1, setN1] = useState(1.48) // Core index
  const [n2, setN2] = useState(1.45) // Cladding index
  const [cableLengthM, setCableLengthM] = useState(500) // m
  const [pinMilliW, setPinMilliW] = useState(2.0) // mW
  const [showAR, setShowAR] = useState(false)

  // Math calculations
  const results = useMemo(() => {
    // Theoretical NA from indices
    const theoreticalNa = Math.sqrt(Math.max(0.001, n1 * n1 - n2 * n2))
    const acceptanceAngleRad = Math.asin(Math.min(1, theoreticalNa))
    const acceptanceAngleDeg = (acceptanceAngleRad * 180) / Math.PI

    // Spot diameter W at distance L
    // NA = W / sqrt(4L^2 + W^2)  ==> W = 2L * tan(θa)
    const spotDiameterMm = 2 * screenDistMm * Math.tan(acceptanceAngleRad)

    // Experimental NA calculation check
    const expNa = spotDiameterMm / Math.sqrt(4 * Math.pow(screenDistMm, 2) + Math.pow(spotDiameterMm, 2))

    // Attenuation calculation (assume silica fiber ~ 0.5 dB/km at 1310 nm)
    const alphaDbKm = 0.55 // dB/km
    const lengthKm = cableLengthM / 1000
    const totalAttenuationDb = alphaDbKm * lengthKm
    const poutMilliW = pinMilliW * Math.pow(10, -totalAttenuationDb / 10)

    return {
      theoreticalNa: theoreticalNa.toFixed(3),
      expNa: expNa.toFixed(3),
      acceptanceAngleDeg: acceptanceAngleDeg.toFixed(1),
      spotDiameterMm: spotDiameterMm.toFixed(1),
      totalAttenuationDb: totalAttenuationDb.toFixed(2),
      poutMilliW: poutMilliW.toFixed(3),
      alphaDbKm: alphaDbKm.toFixed(2)
    }
  }, [screenDistMm, n1, n2, cableLengthM, pinMilliW])

  const W = 360, H = 140, pad = 30

  const controls = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 6: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          NA Bench & Fiber
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📐 {t('Numerical Aperture Parameters', 'ನ್ಯೂಮೆರಿಕಲ್ ಅಪರ್ಚರ್')}</h3>
        <LabeledSlider label="Screen Distance (L)" value={screenDistMm} onChange={setScreenDistMm} min={10} max={45} step={1} unit=" mm" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Core Refractive Index (n₁)" value={n1} onChange={setN1} min={1.46} max={1.52} step={0.005} unit="" accentColor="#10b981" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Cladding Refractive Index (n₂)" value={n2} onChange={setN2} min={1.43} max={1.47} step={0.005} unit="" accentColor="#8b5cf6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚡ {t('Attenuation Loss Measurement', 'ಕ್ಷೀಣತೆ ನಷ್ಟ ಅಳತೆ')}</h3>
        <LabeledSlider label="Fiber Cable Length" value={cableLengthM} onChange={setCableLengthM} min={50} max={2000} step={50} unit=" m" accentColor="#ef4444" />

        <div className="grid grid-cols-2 gap-2 mt-4 text-center text-xs">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <span className="text-gray-500 block">Numerical Aperture</span>
            <span className="text-base font-bold text-blue-700 font-display">{results.expNa}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <span className="text-gray-500 block">Acceptance Angle</span>
            <span className="text-base font-bold text-emerald-700 font-display">θa = {results.acceptanceAngleDeg}°</span>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="text-gray-500 block">Spot Diameter (W)</span>
            <span className="text-base font-bold text-amber-700 font-display">{results.spotDiameterMm} mm</span>
          </div>
          <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
            <span className="text-gray-500 block">Total Loss ({cableLengthM}m)</span>
            <span className="text-base font-bold text-purple-700 font-display">{results.totalAttenuationDb} dB</span>
          </div>
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          📱 {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View NA Measurement Jig in 3D WebAR', 'AR ನಲ್ಲಿ NA ಜಿಗ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">📱 {t('WebAR Numerical Aperture Test Bench', 'NA ಪರೀಕ್ಷಾ ಬೆಂಚ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">Measurement Jig</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="Optical NA Test Bench"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs"
              >
                <span>📱</span> Place Test Jig on Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* Optical Divergence Cone Projection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">💡 {t('Acceptance Cone & Spot Projection', 'ಕೋನ್ ಪ್ರೊಜೆಕ್ಷನ್')}</h3>
          <span className="text-xs font-mono text-gray-500">L = {screenDistMm} mm • W = {results.spotDiameterMm} mm</span>
        </div>

        <svg viewBox="0 0 360 170" className="w-full bg-slate-950 rounded-xl">
          {/* Fiber Cable Input Tip */}
          <rect x="20" y="77" width="50" height="16" rx="3" fill="#475569" />
          <rect x="20" y="82" width="50" height="6" fill="#ef4444" />
          <text x="45" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle">Fiber Tip</text>

          {/* Screen Plane */}
          {(() => {
            const screenX = 70 + (screenDistMm / 50) * 220
            const spotRadiusY = Math.min(65, (parseFloat(results.spotDiameterMm) / 2) * 2.2)

            return (
              <g>
                {/* Projected Light Cone */}
                <polygon
                  points={`70,85 ${screenX},${85 - spotRadiusY} ${screenX},${85 + spotRadiusY}`}
                  fill="#ef4444"
                  opacity="0.35"
                />

                {/* Target Screen Bar */}
                <line x1={screenX} y1="15" x2={screenX} y2="155" stroke="#94a3b8" strokeWidth="4" />

                {/* Circular Spot on Screen */}
                <ellipse cx={screenX} cy="85" rx="5" ry={spotRadiusY} fill="#ef4444" opacity="0.85" />

                {/* Distance L line */}
                <line x1="70" y1="150" x2={screenX} y2="150" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,2" />
                <text x={(70 + screenX) / 2} y="145" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  Distance L = {screenDistMm} mm
                </text>

                {/* Spot Width Dimension */}
                <line x1={screenX + 12} y1={85 - spotRadiusY} x2={screenX + 12} y2={85 + spotRadiusY} stroke="#fbbf24" strokeWidth="1.5" />
                <text x={screenX + 18} y="88" fill="#fbbf24" fontSize="9" fontWeight="bold">
                  W = {results.spotDiameterMm} mm
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Attenuation Loss vs Cable Length Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📉 {t('Optical Attenuation vs Fiber Length (0.55 dB/km)', 'ಕ್ಷೀಣತೆ ನಷ್ಟ ಗ್ರಾಫ್')}</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl p-1">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#475569" strokeWidth="1.5" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#475569" strokeWidth="1.5" />

          <text x={W - pad} y={H - pad + 18} fill="#94a3b8" fontSize="9" textAnchor="end">Length (meters)</text>
          <text x={12} y={35} fill="#94a3b8" fontSize="9" transform="rotate(-90 40 35)">Loss (dB)</text>

          {/* Linear Loss Line */}
          <line
            x1={pad}
            y1={H - pad}
            x2={W - pad}
            y2={pad + 20}
            stroke="#a855f7"
            strokeWidth="2.5"
          />

          {/* Operating Point */}
          {(() => {
            const cx = pad + (cableLengthM / 2000) * (W - 2 * pad)
            const cy = H - pad - (cableLengthM / 2000) * (H - 2 * pad - 20)
            return (
              <g transform={`translate(${cx}, ${cy})`}>
                <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                <text x="8" y="-4" fill="#fbbf24" fontSize="9" fontWeight="bold">
                  ({cableLengthM}m, {results.totalAttenuationDb} dB)
                </text>
              </g>
            )
          })()}

          <text x={pad + 10} y={H - pad - 10} fill="#94a3b8" fontSize="8">0m: 0 dB</text>
          <text x={W - pad - 10} y={pad + 15} fill="#94a3b8" fontSize="8" textAnchor="end">2km: 1.1 dB</text>
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Attenuation & Numerical Aperture in Optical Fiber', 'ಆಪ್ಟಿಕಲ್ ಫೈಬರ್‌ನಲ್ಲಿ ನ್ಯೂಮೆರಿಕಲ್ ಅಪರ್ಚರ್ ಮತ್ತು ನಷ್ಟ')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
