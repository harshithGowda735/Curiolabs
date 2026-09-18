import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Simulate Volumetric Flood', description: 'Introduce botnet UDP/SYN floods up to 10,000 req/sec' },
  { title: 'Enable SYN Cookies', description: 'Mitigate half-open TCP connection table exhaustion' },
  { title: 'Apply Token-Bucket Rate Limiter', description: 'Throttle requests per client IP subnet' },
  { title: 'Deploy Anycast Scrubbing', description: 'Divert malicious traffic through distributed mitigation nodes' }
]

const observations = [
  'SYN Flood attacks exploit TCP 3-way handshake by keeping connection backlogs filled with half-open sockets',
  'SYN Cookies encode connection state into the initial TCP sequence number, eliminating memory allocation until ACK',
  'Token bucket rate limiting allows bursty normal user traffic while clipping sustained high-volume flooders',
  'Scrubbing centers use BGP Anycast routing to absorb and disperse terabit DDoS attacks globally',
  'Application-layer (L7) HTTP floods require Web Application Firewalls (WAF) and CAPTCHA challenge heuristics'
]

export default function DDoSMitigation() {
  const { t } = useLanguage()
  const [legitRate, setLegitRate] = useState(200) // req/s
  const [botnetRate, setBotnetRate] = useState(3000) // req/s
  const [rateLimitThreshold, setRateLimitThreshold] = useState(500) // req/s
  const [enableSynCookies, setEnableSynCookies] = useState(true)
  const [enableScrubbing, setEnableScrubbing] = useState(false)

  // Server capacity calculation
  const serverCapacity = 2000 // req/s max clean processing

  const metrics = useMemo(() => {
    // Scrubbing filters 85% of raw volumetric botnet traffic before it reaches server
    const scrubbedBotnet = enableScrubbing ? botnetRate * 0.15 : botnetRate
    
    // SYN cookies reduce botnet impact on connection table memory by 75%
    const effectiveBotnet = enableSynCookies ? scrubbedBotnet * 0.4 : scrubbedBotnet

    // Rate limiter clips botnet per IP
    const rateLimitedBotnet = Math.min(effectiveBotnet, rateLimitThreshold)
    const totalInbound = legitRate + botnetRate

    // What reaches server
    const serverLoadReqs = legitRate + rateLimitedBotnet
    const droppedReqs = Math.max(0, totalInbound - (legitRate + (enableScrubbing ? 0 : rateLimitedBotnet * 0.5)))
    
    const cpuLoad = Math.min(100, Math.round((serverLoadReqs / serverCapacity) * 100))
    const memoryLoad = Math.min(100, Math.round((serverLoadReqs / serverCapacity) * 85 + (enableSynCookies ? 0 : 35)))
    
    let status = 'HEALTHY'
    let latencyMs = 28 + Math.round(cpuLoad * 0.8)

    if (cpuLoad >= 100 || memoryLoad >= 98) {
      status = 'OUTAGE'
      latencyMs = 9999
    } else if (cpuLoad > 75) {
      status = 'DEGRADED'
      latencyMs = 180 + Math.round(cpuLoad * 2)
    }

    return {
      totalInbound,
      passedReqs: status === 'OUTAGE' ? 0 : Math.round(legitRate),
      blockedReqs: Math.round(droppedReqs),
      cpuLoad,
      memoryLoad,
      status,
      latencyMs
    }
  }, [legitRate, botnetRate, rateLimitThreshold, enableSynCookies, enableScrubbing])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🌊 {t('Traffic Flow Simulation', 'ಟ್ರಾಫಿಕ್ ಸಿಮ್ಯುಲೇಶನ್')}</h3>
        <LabeledSlider label="Legitimate Users" value={legitRate} onChange={setLegitRate} min={50} max={800} step={25} unit=" req/s" accentColor="#10b981" />
        <div className="mt-3">
          <LabeledSlider label="Botnet Flood Traffic" value={botnetRate} onChange={setBotnetRate} min={0} max={8000} step={200} unit=" req/s" accentColor="#ef4444" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🛡️ {t('Mitigation Defenses', 'ರಕ್ಷಣಾ ತಂತ್ರಗಳು')}</h3>
        <LabeledSlider label="Rate Limiter Threshold" value={rateLimitThreshold} onChange={setRateLimitThreshold} min={100} max={1500} step={50} unit=" req/s" accentColor="#3b82f6" />

        <div className="mt-4 space-y-2 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 block">TCP SYN Cookies</span>
              <span className="text-[11px] text-gray-500">Eliminates half-open backlog memory exhaustion</span>
            </div>
            <input type="checkbox" checked={enableSynCookies} onChange={e => setEnableSynCookies(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 cursor-pointer">
            <div>
              <span className="font-semibold text-cyan-900 block">Cloud Anycast Scrubbing</span>
              <span className="text-[11px] text-cyan-700">Disperses volumetric floods across edge POPs</span>
            </div>
            <input type="checkbox" checked={enableScrubbing} onChange={e => setEnableScrubbing(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Server Health Readout', 'ಸರ್ವರ್ ಸ್ಥಿತಿ')}</h3>
        <div className={`p-3 rounded-lg border text-center font-bold text-sm ${
          metrics.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          metrics.status === 'DEGRADED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
        }`}>
          {metrics.status === 'HEALTHY' && '🟢 SYSTEM HEALTHY — 100% AVAILABILITY'}
          {metrics.status === 'DEGRADED' && '🟡 SERVICE DEGRADED — ELEVATED LATENCY'}
          {metrics.status === 'OUTAGE' && '🔴 SYSTEM DOWN — TIMEOUT OUTAGE'}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
          <div className="bg-gray-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">HTTP Latency</span>
            <span className="text-base font-bold text-gray-800 font-display">{metrics.latencyMs} ms</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">Clean Throughput</span>
            <span className="text-base font-bold text-emerald-600 font-display">{metrics.passedReqs} req/s</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* System Hardware Gauges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🖥️ {t('Core Server Compute Utilization', 'ಕೋರ್ ಸರ್ವರ್ ಬಳಕೆ')}</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>CPU Core Load</span>
              <span className={metrics.cpuLoad > 85 ? 'text-rose-600' : 'text-gray-700'}>{metrics.cpuLoad}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  metrics.cpuLoad > 85 ? 'bg-rose-500' : metrics.cpuLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${metrics.cpuLoad}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Connection Table Memory</span>
              <span className={metrics.memoryLoad > 85 ? 'text-rose-600' : 'text-gray-700'}>{metrics.memoryLoad}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  metrics.memoryLoad > 85 ? 'bg-rose-500' : metrics.memoryLoad > 60 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${metrics.memoryLoad}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Flow Pipeline SVG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🌊 {t('Traffic Ingestion & Scrubbing Topology', 'ಸ್ಕ್ರಬ್ಬಿಂಗ್ ಟೋಪೋಲಜಿ')}</h3>
        <svg viewBox="0 0 350 180" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Legitimate Traffic Source */}
          <rect x="15" y="30" width="70" height="40" rx="6" fill="#10b981" />
          <text x="50" y="48" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Legitimate</text>
          <text x="50" y="60" fill="#d1fae5" fontSize="8" textAnchor="middle">{legitRate} req/s</text>

          {/* Botnet Traffic Source */}
          <rect x="15" y="110" width="70" height="40" rx="6" fill="#ef4444" />
          <text x="50" y="128" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Botnet Flood</text>
          <text x="50" y="140" fill="#fee2e2" fontSize="8" textAnchor="middle">{botnetRate} req/s</text>

          {/* Lines to Mitigation Layer */}
          <path d="M 85 50 L 140 80" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
          <path d="M 85 130 L 140 100" stroke="#ef4444" strokeWidth={Math.min(8, Math.max(2, botnetRate / 1000))} strokeDasharray="3,3" />

          {/* Mitigation / Scrubbing Node */}
          <rect x="140" y="60" width="80" height="60" rx="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="180" y="85" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">DDoS Filter</text>
          <text x="180" y="100" fill="#bae6fd" fontSize="8" textAnchor="middle">
            {enableScrubbing ? 'Anycast Active' : 'Edge Filter'}
          </text>

          {/* Blocked Sink Downward */}
          <path d="M 180 120 L 180 155" stroke="#ef4444" strokeWidth="2" />
          <text x="180" y="170" fill="#f87171" fontSize="8" textAnchor="middle">
            Dropped: {metrics.blockedReqs} req/s
          </text>

          {/* Clean Pipe to Protected Origin Server */}
          <path d="M 220 90 L 265 90" stroke="#38bdf8" strokeWidth="3" />

          {/* Origin Server */}
          <rect x="265" y="65" width="70" height="50" rx="6" fill="#1e293b" stroke={metrics.status === 'OUTAGE' ? '#ef4444' : '#10b981'} strokeWidth="2" />
          <text x="300" y="88" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Web Server</text>
          <text x="300" y="102" fill="#94a3b8" fontSize="8" textAnchor="middle">
            {metrics.status === 'OUTAGE' ? 'Offline' : `${metrics.passedReqs} req/s`}
          </text>
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Volumetric DDoS Attack Mitigation', 'DDoS ದಾಳಿ ತಡೆಗಟ್ಟುವಿಕೆ')}
      domain="Cybersecurity & Defense"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
