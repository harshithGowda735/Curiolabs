import { useState, useEffect } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Examine Phishing Email', description: 'Analyze deceptive sender headers, typo-squatted domains, and malicious attachments' },
  { title: 'Detonate in Sandbox', description: 'Execute payload in an isolated VM to monitor ransomware behavior' },
  { title: 'Trigger Endpoint Quarantine', description: 'Sever network connectivity to contain lateral malware spread' },
  { title: 'Restore Immutable Backups', description: 'Recover encrypted assets using air-gapped snapshot repositories' }
]

const observations = [
  'Modern ransomware attacks weaponize phishing vectors with macros or malicious ISO/ZIP containers',
  'Attackers execute living-off-the-land binaries (LOLBins) like vssadmin to delete Volume Shadow Copies',
  'Automated network isolation (EDR containment) halts lateral SMB propagation across the subnet',
  'Ransomware uses hybrid encryption: symmetric AES-256 for rapid file encryption and asymmetric RSA to lock keys',
  'Air-gapped and immutable WORM (Write Once Read Many) backups guarantee recovery without paying ransoms'
]

export default function PhishingRansomware() {
  const { t } = useLanguage()
  const [stage, setStage] = useState('inbox') // 'inbox', 'encrypting', 'ransom', 'contained', 'restored'
  const [isolated, setIsolated] = useState(false)
  const [files, setFiles] = useState([
    { name: 'Financials_Q4.xlsx', status: 'clean' },
    { name: 'Student_Records.db', status: 'clean' },
    { name: 'Curriculum_Plan.pdf', status: 'clean' },
    { name: 'Server_Credentials.kdbx', status: 'clean' },
    { name: 'Research_Thesis.docx', status: 'clean' },
    { name: 'Lab_Schedule.csv', status: 'clean' }
  ])

  // Detonation infection timer
  useEffect(() => {
    if (stage !== 'encrypting') return

    let currentFileIndex = 0
    const timer = setInterval(() => {
      if (currentFileIndex < files.length) {
        setFiles(prev => prev.map((f, idx) => idx === currentFileIndex ? { ...f, status: 'encrypted' } : f))
        currentFileIndex++
      } else {
        clearInterval(timer)
        setStage('ransom')
      }
    }, 450)

    return () => clearInterval(timer)
  }, [stage])

  const handleDetonate = () => {
    setStage('encrypting')
  }

  const handleIsolate = () => {
    setIsolated(true)
    setStage('contained')
  }

  const handleRestore = () => {
    setFiles(prev => prev.map(f => ({ ...f, status: 'restored' })))
    setStage('restored')
  }

  const handleReset = () => {
    setStage('inbox')
    setIsolated(false)
    setFiles(prev => prev.map(f => ({ ...f, status: 'clean' })))
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🦠 {t('Ransomware Detonation Lab', 'ರಾನ್ಸಮ್‌ವೇರ್ ಪ್ರಯೋಗಾಲಯ')}</h3>
        <p className="text-xs text-gray-600 mb-4">
          Test incident response procedures against an evasive Trojan dropper simulating the LockBit ransomware family.
        </p>

        {stage === 'inbox' && (
          <button
            onClick={handleDetonate}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors"
          >
            ⚠️ Detonate Attachment in Sandbox
          </button>
        )}

        {(stage === 'ransom' || stage === 'encrypting') && (
          <button
            onClick={handleIsolate}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors animate-pulse"
          >
            🚨 Trigger Network Quarantine & Containment
          </button>
        )}

        {(stage === 'contained' || stage === 'ransom') && (
          <button
            onClick={handleRestore}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors"
          >
            💾 Restore from Air-Gapped Immutable Backup
          </button>
        )}

        <button
          onClick={handleReset}
          className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
        >
          🔄 Reset Simulation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🛡️ {t('EDR Containment Status', 'EDR ಸ್ಥಿತಿ')}</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 rounded-lg bg-gray-50 border">
            <span>Subnet Connectivity</span>
            <span className={`font-bold ${isolated ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isolated ? '🔴 ISOLATED' : '🟢 CONNECTED'}
            </span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-gray-50 border">
            <span>Incident Stage</span>
            <span className="font-bold uppercase text-cyan-800 font-mono">{stage}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Phishing Email Inspector */}
      {stage === 'inbox' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-display font-bold text-gray-800 mb-3">📧 {t('Suspicious Email Artifact', 'ಅನುಮಾನಾಸ್ಪದ ಇಮೇಲ್')}</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 font-mono">
            <div className="border-b pb-2">
              <p><span className="text-gray-500">From:</span> IT Support &lt;payroll-urgent@it-support-portal.net&gt; <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">TYPO-SQUAT</span></p>
              <p><span className="text-gray-500">Subject:</span> IMMEDIATE ACTION REQUIRED: Salary Adjustment Notice</p>
            </div>
            <p className="text-gray-700 font-sans py-2">
              Dear Employee, Please review the attached secure document immediately to confirm your updated direct deposit instructions. Failure to do so will delay your pay cycle.
            </p>
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded flex items-center justify-between font-sans">
              <div className="flex items-center gap-2">
                <span className="text-lg">📎</span>
                <div>
                  <p className="font-bold text-gray-800">Payroll_Update_Sep2026.xlsm</p>
                  <p className="text-[10px] text-rose-600 font-medium">Contains Obfuscated VBA Macros</p>
                </div>
              </div>
              <span className="text-rose-600 text-xs font-bold">SUSPICIOUS</span>
            </div>
          </div>
        </div>
      )}

      {/* Ransom Note Screen */}
      {stage === 'ransom' && (
        <div className="bg-rose-950 text-white rounded-xl shadow-lg p-5 border-2 border-rose-600">
          <h2 className="text-xl font-display font-bold text-rose-400 mb-2 flex items-center gap-2">
            <span>☠️</span> YOUR SYSTEM FILES ARE ENCRYPTED!
          </h2>
          <p className="text-xs text-rose-200 mb-4 leading-relaxed font-mono">
            All your documents, photos, databases, and critical records have been encrypted with military-grade AES-256 + RSA-4096 algorithms. Shadow copies have been deleted.
          </p>
          <div className="p-3 bg-rose-900/50 rounded border border-rose-700 text-center font-mono text-xs">
            <span className="text-amber-300 block mb-1">Ransom Demand: 5.4 BTC</span>
            <span className="text-rose-300 text-[10px]">Do not attempt to modify encrypted files or data will be permanently corrupted.</span>
          </div>
        </div>
      )}

      {/* File System Health Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📁 {t('Local Endpoint File Integrity Matrix', 'ಸ್ಥಳೀಯ ಕಡತ ಸ್ಥಿತಿ')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {files.map((f, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                f.status === 'clean' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                f.status === 'encrypted' ? 'bg-rose-50 border-rose-300 text-rose-900' :
                'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <span className="font-mono font-semibold truncate block mb-1">{f.name}</span>
              <span className={`text-[10px] font-bold uppercase ${
                f.status === 'clean' ? 'text-emerald-700' :
                f.status === 'encrypted' ? 'text-rose-700' : 'text-blue-700'
              }`}>
                {f.status === 'clean' ? '🟢 Verified Clean' :
                 f.status === 'encrypted' ? '🔒 Locked (.locked)' : '💾 Restored (Clean)'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Phishing Analysis & Ransomware Containment', 'ಫಿಶಿಂಗ್ ಮತ್ತು ರಾನ್ಸಮ್‌ವೇರ್ ತಡೆಗಟ್ಟುವಿಕೆ')}
      domain="Cybersecurity & Defense"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
