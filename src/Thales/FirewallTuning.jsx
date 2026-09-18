import { useState, useEffect } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Inspect Traffic Stream', description: 'Monitor incoming packet headers, protocols, and port requests' },
  { title: 'Define Access Rules', description: 'Add ALLOW/DROP filters for malicious ports and suspicious subnets' },
  { title: 'Enable Stateful Inspection', description: 'Track TCP connection 3-way handshakes to drop spoofed packets' },
  { title: 'Evaluate Threat Block Rate', description: 'Ensure zero false positives on legitimate student traffic' }
]

const observations = [
  'Stateful packet inspection (SPI) tracks TCP connection state (SYN, SYN-ACK, ESTABLISHED), rejecting unsolicited inbound packets',
  'Stateless packet filtering only inspects static packet headers (src/dst IP, port, protocol) without session awareness',
  'Default-deny (whitelist) posture is significantly more secure than default-allow (blacklist)',
  'Common exploit vectors target unencrypted Telnet (port 23), legacy SMB (port 445), and remote desktops (port 3389)',
  'Next-generation firewalls (NGFW) combine SPI with application-layer deep packet inspection (DPI) and IPS'
]

export default function FirewallTuning() {
  const { t } = useLanguage()
  const [trafficRate, setTrafficRate] = useState(20) // packets / sec
  const [blockPort23, setBlockPort23] = useState(true)
  const [blockPort445, setBlockPort445] = useState(true)
  const [blockPort3389, setBlockPort3389] = useState(false)
  const [statefulEnabled, setStatefulEnabled] = useState(true)
  const [isRunning, setIsRunning] = useState(false)

  const [stats, setStats] = useState({ allowed: 0, dropped: 0, threatsBlocked: 0, falsePositives: 0 })
  const [log, setLog] = useState([])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const packetTypes = [
        { ip: '192.168.1.45', port: 443, proto: 'TCP', threat: false, desc: 'HTTPS Web Request' },
        { ip: '192.168.1.88', port: 80, proto: 'TCP', threat: false, desc: 'HTTP Web Request' },
        { ip: '10.0.0.12', port: 53, proto: 'UDP', threat: false, desc: 'DNS Resolution' },
        { ip: '45.134.20.1', port: 23, proto: 'TCP', threat: true, desc: 'Telnet Brute Force' },
        { ip: '185.220.101.4', port: 445, proto: 'TCP', threat: true, desc: 'EternalBlue SMB Probe' },
        { ip: '91.240.118.2', port: 3389, proto: 'TCP', threat: true, desc: 'RDP Exploit Scan' },
        { ip: '103.21.244.0', port: 443, proto: 'TCP', threat: true, invalidState: true, desc: 'Spoofed TCP SYN Flag' }
      ]

      const pkt = packetTypes[Math.floor(Math.random() * packetTypes.length)]
      let shouldDrop = false

      if (pkt.port === 23 && blockPort23) shouldDrop = true
      if (pkt.port === 445 && blockPort445) shouldDrop = true
      if (pkt.port === 3389 && blockPort3389) shouldDrop = true
      if (pkt.invalidState && statefulEnabled) shouldDrop = true

      setStats(prev => ({
        allowed: prev.allowed + (shouldDrop ? 0 : 1),
        dropped: prev.dropped + (shouldDrop ? 1 : 0),
        threatsBlocked: prev.threatsBlocked + (pkt.threat && shouldDrop ? 1 : 0),
        falsePositives: prev.falsePositives + (!pkt.threat && shouldDrop ? 1 : 0)
      }))

      setLog(prev => [
        { ...pkt, action: shouldDrop ? 'DROP' : 'ALLOW', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 15)
      ])
    }, 1000 / Math.max(1, trafficRate / 5))

    return () => clearInterval(interval)
  }, [isRunning, trafficRate, blockPort23, blockPort445, blockPort3389, statefulEnabled])

  const handleReset = () => {
    setIsRunning(false)
    setStats({ allowed: 0, dropped: 0, threatsBlocked: 0, falsePositives: 0 })
    setLog([])
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🛡️ {t('Firewall Rule Configuration', 'ಫೈರ್‌ವಾಲ್ ನಿಯಮಗಳು')}</h3>
        <LabeledSlider label="Inbound Packet Rate" value={trafficRate} onChange={setTrafficRate} min={5} max={50} step={5} unit=" pkt/s" accentColor="#0284c7" />

        <div className="mt-4 space-y-2 text-xs">
          <label className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border cursor-pointer">
            <span className="font-semibold text-gray-700">Block Telnet (Port 23)</span>
            <input type="checkbox" checked={blockPort23} onChange={e => setBlockPort23(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border cursor-pointer">
            <span className="font-semibold text-gray-700">Block SMB (Port 445)</span>
            <input type="checkbox" checked={blockPort445} onChange={e => setBlockPort445(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border cursor-pointer">
            <span className="font-semibold text-gray-700">Block RDP (Port 3389)</span>
            <input type="checkbox" checked={blockPort3389} onChange={e => setBlockPort3389(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 border border-cyan-200 cursor-pointer">
            <span className="font-semibold text-cyan-900">Stateful TCP Inspection (SPI)</span>
            <input type="checkbox" checked={statefulEnabled} onChange={e => setStatefulEnabled(e.target.checked)} className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            {isRunning ? '⏸️ Pause Traffic' : '▶️ Stream Packets'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📊 {t('Security Performance Metrics', 'ಕಾರ್ಯಕ್ಷಮತೆ ಮಾಪನ')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-emerald-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Allowed Packets</span>
            <span className="text-base font-bold text-emerald-700 font-display">{stats.allowed}</span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Threats Blocked</span>
            <span className="text-base font-bold text-rose-700 font-display">{stats.threatsBlocked}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Dropped Packets</span>
            <span className="text-base font-bold text-blue-700 font-display">{stats.dropped}</span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">False Positives</span>
            <span className="text-base font-bold text-amber-700 font-display">{stats.falsePositives}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">📡 {t('Live Deep Packet Inspection Console', 'ಡೀಪ್ ಪ್ಯಾಕೆಟ್ ತಪಾಸಣೆ')}</h3>
          <span className="text-xs font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded font-bold">STATEFUL SPI ENGINE</span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold sticky top-0">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Source IP</th>
                <th className="py-2 px-3">Port</th>
                <th className="py-2 px-3">Payload Description</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {log.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400 font-sans">
                    Click "Stream Packets" to initiate synthetic network traffic
                  </td>
                </tr>
              ) : (
                log.map((entry, idx) => (
                  <tr key={idx} className={entry.action === 'DROP' ? 'bg-rose-50/40' : 'bg-emerald-50/30'}>
                    <td className="py-1.5 px-3 text-gray-500">{entry.time}</td>
                    <td className="py-1.5 px-3 font-semibold text-gray-800">{entry.ip}</td>
                    <td className="py-1.5 px-3 text-cyan-700">{entry.port} ({entry.proto})</td>
                    <td className="py-1.5 px-3 text-gray-600">{entry.desc}</td>
                    <td className="py-1.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.action === 'DROP' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {entry.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🔒 {t('Firewall Architecture Blueprint', 'ಫೈರ್‌ವಾಲ್ ಆರ್ಕಿಟೆಕ್ಚರ್')}</h3>
        <div className="p-4 bg-slate-900 rounded-xl text-center flex items-center justify-between text-xs text-slate-300">
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="block text-rose-400 font-bold mb-1">External WAN</span>
            <span className="text-[10px] text-slate-400">Untrusted Internet</span>
          </div>
          <div className="text-cyan-400 text-lg">➔</div>
          <div className="p-3 bg-cyan-950 border border-cyan-600 rounded-lg text-cyan-200">
            <span className="block font-bold mb-1">Stateful Inspection</span>
            <span className="text-[10px] text-cyan-300">SPI Rule Evaluator</span>
          </div>
          <div className="text-cyan-400 text-lg">➔</div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="block text-emerald-400 font-bold mb-1">Internal DMZ / LAN</span>
            <span className="text-[10px] text-slate-400">Protected Core Services</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Stateful Firewall Rule Engineering', 'ಸ್ಟೇಟ್‌ಫುಲ್ ಫೈರ್‌ವಾಲ್ ನಿಯಮ ಎಂಜಿನಿಯರಿಂಗ್')}
      domain="Cybersecurity & Defense"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
