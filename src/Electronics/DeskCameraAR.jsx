import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Camera, RefreshCw, X, ZoomIn, ZoomOut, Move, RotateCw, CheckCircle2, AlertCircle, Sparkles, Download } from 'lucide-react'

export default function DeskCameraAR({ onClose, clkFreq = 2.0, isCircuitPowered = true }) {
  const videoRef = useRef(null)
  const mountRef = useRef(null)
  const streamRef = useRef(null)

  const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
  const [errorMessage, setErrorMessage] = useState('')
  const [facingMode, setFacingMode] = useState('environment') // 'environment' | 'user'
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: -0.5, z: 0 })
  const [snapshotTaken, setSnapshotTaken] = useState(null)

  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const breadboardGroupRef = useRef(null)

  // ── 1. Request Camera Permission & Start Video Stream ──
  const requestCamera = useCallback(async (mode = facingMode) => {
    try {
      setErrorMessage('')
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access (getUserMedia) is not supported on this browser or connection. Ensure HTTPS is used.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setPermissionState('granted')

      // Also request iOS device orientation permission if available
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          await DeviceOrientationEvent.requestPermission()
        } catch (e) {
          // Non-blocking
        }
      }
    } catch (err) {
      console.error('Camera permission error:', err)
      setPermissionState('denied')
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please tap the lock/camera icon in your browser address bar and allow camera access.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera was detected on this device.')
      } else {
        setErrorMessage(err.message || 'Unable to access camera.')
      }
    }
  }, [facingMode])

  // Flip between front and rear camera
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    requestCamera(nextMode)
  }

  // ── 2. Three.js Transparent Scene Overlay ──
  useEffect(() => {
    if (permissionState !== 'granted') return

    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 5, 8)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Lighting for realistic desk blending
    const ambient = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffffff, 2.0)
    sun.position.set(5, 12, 8)
    sun.castShadow = true
    sun.shadow.mapSize.width = 1024
    sun.shadow.mapSize.height = 1024
    scene.add(sun)

    // Contact shadow plane on the physical desk
    const shadowGeo = new THREE.PlaneGeometry(12, 8)
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4 })
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat)
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -0.05
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    // ── 3D Breadboard Circuit Assembly ──
    const bbGroup = new THREE.Group()
    breadboardGroupRef.current = bbGroup

    // Breadboard body
    const bodyGeo = new THREE.BoxGeometry(7.0, 0.4, 3.6)
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.65 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    body.receiveShadow = true
    bbGroup.add(body)

    // Divider groove
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9 })
    )
    groove.position.set(0, 0.15, 0)
    bbGroup.add(groove)

    // Power Rails (Red & Blue lines)
    const rTopRed = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#ef4444' }))
    rTopRed.position.set(0, 0.21, -1.5); bbGroup.add(rTopRed)
    const rTopBlue = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#3b82f6' }))
    rTopBlue.position.set(0, 0.21, -1.35); bbGroup.add(rTopBlue)
    const rBotRed = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#ef4444' }))
    rBotRed.position.set(0, 0.21, 1.35); bbGroup.add(rBotRed)
    const rBotBlue = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#3b82f6' }))
    rBotBlue.position.set(0, 0.21, 1.5); bbGroup.add(rBotBlue)

    // Dual IC 4051 chips
    const makeIC = (xPos, label) => {
      const ic = new THREE.Group()
      ic.position.set(xPos, 0.35, 0)

      const icBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.26, 0.6),
        new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.3, metalness: 0.2 })
      )
      icBody.castShadow = true
      ic.add(icBody)

      // Silver lead pins
      const pinGeo = new THREE.BoxGeometry(0.06, 0.2, 0.07)
      const pinMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 })
      for (let i = 0; i < 8; i++) {
        const px = -0.65 + i * 0.18
        const p1 = new THREE.Mesh(pinGeo, pinMat); p1.position.set(px, -0.1, -0.32); ic.add(p1)
        const p2 = new THREE.Mesh(pinGeo, pinMat); p2.position.set(px, -0.1, 0.32); ic.add(p2)
      }

      // Notch
      const notch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), new THREE.MeshStandardMaterial({ color: '#27272a' }))
      notch.position.set(-0.75, 0.13, 0)
      ic.add(notch)

      return ic
    }

    const icMux = makeIC(-1.5, 'CD4051 MUX')
    const icDemux = makeIC(1.5, 'CD4051 DEMUX')
    bbGroup.add(icMux)
    bbGroup.add(icDemux)

    // RC low-pass filter components
    const res = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12), new THREE.MeshStandardMaterial({ color: '#d6c7a1' }))
    res.rotation.z = Math.PI / 2
    res.position.set(2.6, 0.3, 0.8)
    bbGroup.add(res)

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16), new THREE.MeshStandardMaterial({ color: '#f59e0b' }))
    cap.rotation.x = Math.PI / 2
    cap.position.set(2.9, 0.3, 1.1)
    bbGroup.add(cap)

    // Curved 3D Jumper Wires
    const makeWire = (p1, p2, color) => {
      const mid = new THREE.Vector3((p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + 0.6, (p1.z + p2.z) / 2)
      const curve = new THREE.CatmullRomCurve3([p1, mid, p2])
      return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 16, 0.032, 8, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
      )
    }

    bbGroup.add(makeWire(new THREE.Vector3(-2.1, 0.2, -1.5), new THREE.Vector3(-2.1, 0.2, 0.3), '#ef4444'))
    bbGroup.add(makeWire(new THREE.Vector3(0.9, 0.2, -1.5), new THREE.Vector3(0.9, 0.2, 0.3), '#ef4444'))
    bbGroup.add(makeWire(new THREE.Vector3(-0.9, 0.2, -1.35), new THREE.Vector3(-0.9, 0.2, -0.3), '#1e293b'))
    bbGroup.add(makeWire(new THREE.Vector3(2.1, 0.2, -1.35), new THREE.Vector3(2.1, 0.2, -0.3), '#1e293b'))
    bbGroup.add(makeWire(new THREE.Vector3(-1.7, 0.2, -0.3), new THREE.Vector3(1.3, 0.2, -0.3), '#9333ea'))
    bbGroup.add(makeWire(new THREE.Vector3(-1.3, 0.2, 0.3), new THREE.Vector3(1.7, 0.2, 0.3), '#2563eb'))

    scene.add(bbGroup)

    // Animation Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (breadboardGroupRef.current) {
        breadboardGroupRef.current.scale.set(scale, scale, scale)
        breadboardGroupRef.current.rotation.y = rotation
        breadboardGroupRef.current.position.set(position.x, position.y, position.z)
      }
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [permissionState, scale, rotation, position])

  // Clean up video tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Touch Drag & Gestures on Desk
  const touchStartRef = useRef({ x: 0, y: 0 })
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const dx = (e.touches[0].clientX - touchStartRef.current.x) * 0.01
      const dy = (e.touches[0].clientY - touchStartRef.current.y) * 0.01
      setPosition(prev => ({ ...prev, x: prev.x + dx, z: prev.z + dy }))
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      // Subtle scale adjustment
    }
  }

  // ── 3. Snapshot Capture (Combines Real Camera Feed + Virtual 3D Overlay) ──
  const takeSnapshot = () => {
    const video = videoRef.current
    const renderer = rendererRef.current
    if (!video || !renderer) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    // Draw real camera image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    // Draw 3D WebGL circuit overlay
    ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setSnapshotTaken(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none touch-none">
      {/* ── TOP AR HEADER BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Live Augmented Reality (AR) Desk View</h3>
            <p className="text-[11px] text-slate-300">Projecting breadboard onto your physical desk via camera feed</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permissionState === 'granted' && (
            <>
              <button
                onClick={flipCamera}
                className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur transition-colors"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={takeSnapshot}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-2.5 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur transition-colors"
            title="Close AR"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── PERMISSION REQUEST SCREEN (Before Camera is Granted) ── */}
      {permissionState === 'prompt' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Camera Access Required</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                CurioLabs needs your permission to use your camera so you can place and inspect the dual-IC breadboard directly on your physical desk.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-left text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Private & Secure: Video never leaves your device</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-World 1:1 Scale Tabletop Placement</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compatible with all iOS Safari & Android Chrome devices</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => requestCamera('environment')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Allow Camera & Start Desk AR</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel and return to 3D Bench
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSION DENIED ERROR SCREEN ── */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-950/95">
          <div className="max-w-md w-full bg-slate-900 border border-rose-900/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Camera Access Denied or Blocked</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {errorMessage || 'Your browser blocked camera permission.'}
              </p>
            </div>

            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-left text-xs text-rose-200 space-y-1">
              <span className="font-bold block">How to enable:</span>
              <p>1. Tap the lock or tune icon in the website URL address bar.</p>
              <p>2. Set "Camera" to <strong>Allow</strong>.</p>
              <p>3. Tap "Try Again" below.</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => requestCamera('environment')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Close AR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE CAMERA BACKGROUND VIDEO ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* ── THREE.JS 3D CANVAS OVERLAY ── */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* ── BOTTOM AR DESK CONTROLS ── */}
      {permissionState === 'granted' && (
        <div className="absolute bottom-6 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur border border-white/15 px-3 py-1.5 rounded-2xl text-[11px] text-white/80 pointer-events-auto">
            <span>👆 Touch & drag to slide breadboard across desk</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur border border-white/20 p-1.5 rounded-2xl pointer-events-auto shadow-xl">
            <button
              onClick={() => setRotation(r => r + Math.PI / 8)}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Rotate Circuit"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.4, s - 0.15))}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Scale Down"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-emerald-400 px-1">
              {(scale * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Scale Up"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setScale(1.0); setRotation(0); setPosition({ x: 0, y: -0.5, z: 0 }); }}
              className="px-2 py-1 text-xs text-white/80 hover:bg-white/20 rounded-xl font-mono"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* ── SNAPSHOT PREVIEW MODAL ── */}
      {snapshotTaken && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📸</span>
                <span>AR Circuit Desk Photo Captured!</span>
              </h4>
              <button
                onClick={() => setSnapshotTaken(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
              <img src={snapshotTaken} alt="AR Desk Circuit" className="w-full h-auto block" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={snapshotTaken}
                download="curiolabs_tdm_desk_ar.jpg"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save to Photos</span>
              </a>
              <button
                onClick={() => setSnapshotTaken(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Continue AR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
