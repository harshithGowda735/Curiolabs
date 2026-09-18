import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Select Cryptographic Cipher', description: 'Choose between AES-GCM, ChaCha20-Poly1305, or RSA asymmetric encryption' },
  { title: 'Toggle Hardware Acceleration', description: 'Evaluate speedup with dedicated CPU instructions (Intel AES-NI)' },
  { title: 'Adjust Data Payload Size', description: 'Scale from 1 MB micro-messages to 100 MB bulk enterprise transfers' },
  { title: 'Benchmark Ciphertext Expansion', description: 'Examine authentication tags, initialization vectors, and padding' }
]

const observations = [
  'Hardware-accelerated AES (AES-NI) achieves throughput exceeding 4,000 MB/s by performing rounds in CPU silicon',
  'ChaCha20-Poly1305 outperforms AES on mobile devices without hardware acceleration (ARM NEON or legacy chips)',
  'RSA asymmetric encryption is roughly 1,000x slower than symmetric AES and is only used for key exchange',
  'Galois/Counter Mode (GCM) provides Authenticated Encryption with Associated Data (AEAD) to prevent tampering',
  'Post-quantum cryptography (PQC) standards like ML-KEM (Kyber) are replacing traditional RSA key exchange'
]

export default function EncryptionPerformance() {
  const { t } = useLanguage()
  const [selectedCipher, setSelectedCipher] = useState('aes128')
  const [payloadMb, setPayloadMb] = useState(25) // MB
  const [aesNiEnabled, setAesNiEnabled] = useState(true)
  const [benchmarking, setBenchmarking] = useState(false)
  const [progress, setProgress] = useState(0)

  // Cipher database
  const ciphers = {
    aes128: { name: 'AES-128-GCM', type: 'Symmetric AEAD', keyBits: 128, baseSpeed: 3200, noNiSpeed: 420, tagOverhead: 16 },
    aes256: { name: 'AES-256-GCM', type: 'Symmetric AEAD', keyBits: 256, baseSpeed: 2400, noNiSpeed: 310, tagOverhead: 16 },
    chacha: { name: 'ChaCha20-Poly1305', type: 'Stream AEAD', keyBits: 256, baseSpeed: 1450, noNiSpeed: 1350, tagOverhead: 16 },
    rsa2048: { name: 'RSA-2048 (OAEP)', type: 'Asymmetric Public-Key', keyBits: 2048, baseSpeed: 2.8, noNiSpeed: 2.8, tagOverhead: 256 },
    rsa4096: { name: 'RSA-4096 (OAEP)', type: 'Asymmetric Public-Key', keyBits: 4096, baseSpeed: 0.6, noNiSpeed: 0.6, tagOverhead: 512 }
  }

  const activeCipher = ciphers[selectedCipher]

  const metrics = useMemo(() => {
    const effectiveSpeedMbS = (selectedCipher.startsWith('aes') && !aesNiEnabled)
      ? activeCipher.noNiSpeed
      : activeCipher.baseSpeed

    const timeSeconds = payloadMb / effectiveSpeedMbS
    const timeMs = timeSeconds * 1000
    const ciphertextBytes = (payloadMb * 1024 * 1024) + activeCipher.tagOverhead

    return {
      speed: effectiveSpeedMbS,
      timeMs: timeMs < 1 ? timeMs.toFixed(3) : timeMs.toFixed(1),
      ciphertextMb: (ciphertextBytes / (1024 * 1024)).toFixed(3)
    }
  }, [selectedCipher, payloadMb, aesNiEnabled, activeCipher])

  const runBenchmark = () => {
    setBenchmarking(true)
    setProgress(0)
    let p = 0
    const interval = setInterval(() => {
      p += 20
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setBenchmarking(false)
      }
    }, 80)
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔐 {t('Cipher Algorithm Selection', 'ಸೈಫರ್ ಅಲ್ಗಾರಿದಮ್')}</h3>
        <div className="space-y-2">
          {Object.entries(ciphers).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedCipher(key)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                selectedCipher === key
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div>
                <span className="block font-display">{item.name}</span>
                <span className="text-[10px] text-gray-500 font-normal">{item.type}</span>
              </div>
              <span className="font-mono text-xs text-cyan-700">{item.keyBits} bit</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚙️ {t('Data Payload & CPU Features', 'ಡೇಟಾ ಮತ್ತು CPU ವೈಶಿಷ್ಟ್ಯ')}</h3>
        <LabeledSlider label="Payload Size" value={payloadMb} onChange={setPayloadMb} min={1} max={100} step={5} unit=" MB" accentColor="#0284c7" />

        <label className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border mt-4 cursor-pointer">
          <div>
            <span className="font-semibold text-gray-800 text-xs block">Hardware AES-NI Acceleration</span>
            <span className="text-[10px] text-gray-500">Hardware CPU vector instructions</span>
          </div>
          <input
            type="checkbox"
            checked={aesNiEnabled}
            onChange={e => setAesNiEnabled(e.target.checked)}
            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
          />
        </label>

        <button
          onClick={runBenchmark}
          disabled={benchmarking}
          className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {benchmarking ? `Running Benchmarks (${progress}%)...` : '⚡ Run Crypto Benchmark'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📊 {t('Benchmark Results', 'ಫಲಿತಾಂಶಗಳು')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-cyan-50 p-2.5 rounded-lg border border-cyan-100">
            <span className="text-gray-500 block">Throughput</span>
            <span className="text-base font-bold text-cyan-800 font-display">{metrics.speed} MB/s</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
            <span className="text-gray-500 block">Processing Time</span>
            <span className="text-base font-bold text-emerald-800 font-display">{metrics.timeMs} ms</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Throughput comparison chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🚀 {t('Algorithm Throughput Comparison (MB/s)', 'ಅಲ್ಗಾರಿದಮ್ ಹೋಲಿಕೆ')}</h3>
        <div className="space-y-3">
          {Object.entries(ciphers).map(([key, item]) => {
            const speed = (key.startsWith('aes') && !aesNiEnabled) ? item.noNiSpeed : item.baseSpeed
            const maxSpeed = 3500
            const pct = Math.min(100, Math.max(1, (speed / maxSpeed) * 100))
            const isSelected = selectedCipher === key

            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium ${isSelected ? 'text-cyan-700 font-bold' : 'text-gray-700'}`}>
                    {item.name} {isSelected && '👈'}
                  </span>
                  <span className="font-mono text-gray-500">{speed} MB/s</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isSelected ? 'bg-cyan-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AEAD Encapsulation diagram */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📦 {t('Authenticated Ciphertext Layout', 'ದೃಢೀಕೃತ ಸೈಫರ್‌ಟೆಕ್ಸ್ಟ್ ವಿನ್ಯಾಸ')}</h3>
        <div className="p-4 bg-slate-900 rounded-xl text-center">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-blue-900/60 border border-blue-400 rounded-lg text-blue-200">
              <span className="block font-bold">12-Byte IV</span>
              <span className="text-[10px] text-blue-300">Nonce Vector</span>
            </div>
            <div className="p-2.5 bg-cyan-900/60 border border-cyan-400 rounded-lg text-cyan-200">
              <span className="block font-bold">Encrypted Payload</span>
              <span className="text-[10px] text-cyan-300">{payloadMb} MB Ciphertext</span>
            </div>
            <div className="p-2.5 bg-emerald-900/60 border border-emerald-400 rounded-lg text-emerald-200">
              <span className="block font-bold">16-Byte GMAC Tag</span>
              <span className="text-[10px] text-emerald-300">AEAD Integrity</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Total wire transmission size: <span className="font-mono text-cyan-300 font-bold">{metrics.ciphertextMb} MB</span>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Cryptographic Encryption Performance Benchmarks', 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಎನ್‌ಕ್ರಿಪ್ಶನ್ ಬೆಂಚ್‌ಮಾರ್ಕ್')}
      domain="Cybersecurity & Defense"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
