import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Launch Red Team Probes', description: 'Simulate vulnerability scanning, SQLi, and privilege escalation' },
  { title: 'Deploy Blue Team Countermeasures', description: 'Apply WAF rules, patch known CVEs, and enforce MFA' },
  { title: 'Isolate Compromised Hosts', description: 'Halt lateral movement across internal active directory subnets' },
  { title: 'Measure Cyber Resilience', description: 'Track security posture score and mean time to detect (MTTD)' }
]

const observations = [
  'Offensive security (Red Team) identifies systemic attack vectors before adversaries exploit them',
  'Defense-in-depth (Blue Team) combines perimeter firewalls, network microsegmentation, and endpoint EDR',
  'Multi-Factor Authentication (MFA) neutralizes over 99% of automated credential stuffing attacks',
  'Lateral movement relies on unpatched SMB or pass-the-hash attacks against domain controllers',
  'Security Orchestration, Automation, and Response (SOAR) playbooks reduce containment time from hours to seconds'
]

export default function RedBlueBattle() {
  const { t } = useLanguage()

  const [nodes, setNodes] = useState([
    { id: 'web', name: 'Web Portal', status: 'secure', cve: 'SQL Injection' },
    { id: 'db', name: 'Customer Database', status: 'secure', cve: 'Default Admin Pass' },
    { id: 'dc', name: 'Domain Controller', status: 'secure', cve: 'Kerberoasting' },
    { id: 'workstation', name: 'Finance PC', status: 'secure', cve: 'Unpatched Office' },
    { id: 'backup', name: 'Backup Vault', status: 'secure', cve: 'Exposed NFS Share' }
  ])

  const [redScore, setRedScore] = useState(0)
  const [blueScore, setBlueScore] = useState(100)
  const [battleLog, setBattleLog] = useState([])

  const executeAttack = (attackName, targetId, points) => {
    setNodes(prev => prev.map(n => n.id === targetId ? { ...n, status: 'compromised' } : n))
    setRedScore(s => s + points)
    setBlueScore(s => Math.max(0, s - points))
    setBattleLog(prev => [
      { team: 'RED', text: `Attacked ${targetId.toUpperCase()} with ${attackName} (+${points} pts)`, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 10)
    ])
  }

  const executeDefense = (defenseName, targetId, points) => {
    setNodes(prev => prev.map(n => n.id === targetId ? { ...n, status: 'secure' } : n))
    setBlueScore(s => s + points)
    setRedScore(s => Math.max(0, s - points))
    setBattleLog(prev => [
      { team: 'BLUE', text: `Secured ${targetId.toUpperCase()} with ${defenseName} (+${points} pts)`, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 10)
    ])
  }

  const handleReset = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'secure' })))
    setRedScore(0)
    setBlueScore(100)
    setBattleLog([])
  }

  const controls = (
    <div className="space-y-4">
      {/* Red Team Attacks */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-4">
        <h3 className="font-display font-bold text-rose-700 mb-3 flex items-center gap-2">
          <span>⚔️</span> Red Team (Offensive Operations)
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => executeAttack('SQL Injection exploit', 'web', 25)}
            className="w-full text-left p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-900 transition-colors"
          >
            💥 Exploit SQL Injection on Web Portal (+25 pts)
          </button>
          <button
            onClick={() => executeAttack('Pass-the-Hash credential dump', 'workstation', 20)}
            className="w-full text-left p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-900 transition-colors"
          >
            🔓 Dump Credentials on Finance PC (+20 pts)
          </button>
          <button
            onClick={() => executeAttack('Kerberoasting ticket forgery', 'dc', 35)}
            className="w-full text-left p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-900 transition-colors"
          >
            👑 Kerberoasting Domain Controller (+35 pts)
          </button>
        </div>
      </div>

      {/* Blue Team Defenses */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
        <h3 className="font-display font-bold text-blue-700 mb-3 flex items-center gap-2">
          <span>🛡️</span> Blue Team (SOC Defensive Operations)
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => executeDefense('Cloud WAF & Parameterized Queries', 'web', 25)}
            className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900 transition-colors"
          >
            🛡️ Deploy WAF & Patch SQL Queries (+25 pts)
          </button>
          <button
            onClick={() => executeDefense('Hardware MFA & EDR Isolation', 'workstation', 20)}
            className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900 transition-colors"
          >
            🔑 Enforce FIDO2 MFA & EDR Containment (+20 pts)
          </button>
          <button
            onClick={() => executeDefense('Rotate Kerberos KRBTGT Keys', 'dc', 35)}
            className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900 transition-colors"
          >
            🏰 Harden Active Directory & Rotate Keys (+35 pts)
          </button>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
      >
        🔄 Reset Cyber Range
      </button>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Score Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
          <span className="text-xs text-rose-600 font-bold uppercase">Red Team Infiltration</span>
          <p className="text-2xl font-display font-bold text-rose-700">{redScore}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <span className="text-xs text-blue-600 font-bold uppercase">Blue Team Resilience</span>
          <p className="text-2xl font-display font-bold text-blue-700">{blueScore}</p>
        </div>
      </div>

      {/* Enterprise Network Topology Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🌐 {t('Enterprise Network Infrastructure Map', 'ನೆಟ್‌ವರ್ಕ್ ಮ್ಯಾಪ್')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {nodes.map(n => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                n.status === 'secure'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-300 animate-pulse'
              }`}
            >
              <div>
                <span className="font-bold block text-gray-800">{n.name}</span>
                <span className="text-[10px] text-gray-500">Vulnerability: {n.cve}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                n.status === 'secure' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {n.status === 'secure' ? '🛡️ SECURE' : '💥 COMPROMISED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Engagement Event Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📜 {t('Cyber Range Engagement Telemetry', 'ಕಾರ್ಯಾಚರಣೆ ಲಾಗ್')}</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
          {battleLog.length === 0 ? (
            <p className="text-gray-400 text-center py-4 font-sans">Launch an offensive exploit or defense countermeasure to view battle events</p>
          ) : (
            battleLog.map((log, idx) => (
              <div key={idx} className={`p-1.5 rounded flex items-center justify-between ${
                log.team === 'RED' ? 'bg-rose-50 text-rose-900' : 'bg-blue-50 text-blue-900'
              }`}>
                <span>{log.text}</span>
                <span className="text-[10px] text-gray-400">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Red vs Blue Cyber Warfare Simulation', 'ರೆಡ್ vs ಬ್ಲೂ ಸೈಬರ್ ಯುದ್ಧ ಸಿಮ್ಯುಲೇಶನ್')}
      domain="Cybersecurity & Defense"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
