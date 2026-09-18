import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  Camera,
  RefreshCw,
  X,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Layers,
  HelpCircle,
  Compass
} from 'lucide-react'

export default function DeskCameraAR({ onClose, clkFreq = 2.0, isCircuitPowered = true }) {
  const videoRef = useRef(null)
  const mountRef = useRef(null)
  const streamRef = useRef(null)

  // Modes: 'prompt' | 'granted' | 'denied' | 'virtualDesk'
  const [arMode, setArMode] = useState('prompt')
  const [errorMessage, setErrorMessage] = useState('')
  const [facingMode, setFacingMode] = useState('environment') // 'environment' | 'user'
  
  // Transform states (for UI display)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: -0.4, z: 0 })
  
  // Active interaction tool: 'drag' | 'rotate'
  const [interactTool, setInteractTool] = useState('drag')
  const [isInteracting, setIsInteracting] = useState(false)
  const [snapshotTaken, setSnapshotTaken] = useState(null)

  // Ref to hold live transforms so Three.js renders 60fps without recreating the scene
  const transformRef = useRef({
    scale: 1.0,
    rotation: 0,
    position: { x: 0, y: -0.4, z: 0 }
  })

  // Synchronize ref whenever state updates
  useEffect(() => {
    transformRef.current = { scale, rotation, position }
  }, [scale, rotation, position])

  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const breadboardGroupRef = useRef(null)
  const virtualDeskPlaneRef = useRef(null)

  // ── 1. Request Camera Permission & Start Video Stream ──
  const requestCamera = useCallback(async (mode = facingMode) => {
    try {
      setErrorMessage('')
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }

      // Check if getUserMedia is supported in current context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          !window.isSecureContext
            ? 'Mobile browsers require HTTPS or localhost for camera access. You can use Virtual Desk Mode below!'
            : 'Camera API (getUserMedia) not supported in this browser. You can use Virtual Desk Mode below!'
        )
      }

      let stream = null
      // Attempt 1: Specific facing mode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode ? { ideal: mode } : { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
      } catch (err1) {
        console.warn('Initial camera constraint failed, trying generic video constraint...', err1)
        // Attempt 2: Fallback to basic video
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        videoRef.current.muted = true
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('Video play caught:', playErr)
        }
      }

      setArMode('granted')

      // Request iOS device orientation permission if available
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          await DeviceOrientationEvent.requestPermission()
        } catch (e) {
          // non-blocking
        }
      }
    } catch (err) {
      console.error('Camera permission/access error:', err)
      setArMode('denied')
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Tap the site settings/lock icon in your browser to allow camera access.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device was detected on your hardware.')
      } else {
        setErrorMessage(err.message || 'Unable to access live camera.')
      }
    }
  }, [facingMode])

  // Flip between rear and front camera
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    requestCamera(nextMode)
  }

  // Switch to Virtual Desk Tabletop mode (Zero camera permission required)
  const enableVirtualDeskMode = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setArMode('virtualDesk')
  }

  // ── 2. Three.js Transparent Scene Overlay (Mounted Once) ──
  useEffect(() => {
    if (arMode !== 'granted' && arMode !== 'virtualDesk') return

    const container = mountRef.current
    if (!container) return

    // Clear previous contents if any
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 4.5, 7.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(4, 10, 6)
    sun.castShadow = true
    sun.shadow.mapSize.width = 1024
    sun.shadow.mapSize.height = 1024
    scene.add(sun)

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6)
    fillLight.position.set(-5, 6, -3)
    scene.add(fillLight)

    // Virtual Desk Plane / Contact Shadow
    if (arMode === 'virtualDesk') {
      // Photorealistic lab desk texture
      const deskGeo = new THREE.PlaneGeometry(24, 18)
      const deskMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.8,
        metalness: 0.1
      })
      const deskMesh = new THREE.Mesh(deskGeo, deskMat)
      deskMesh.rotation.x = -Math.PI / 2
      deskMesh.position.y = -0.5
      deskMesh.receiveShadow = true
      scene.add(deskMesh)
      virtualDeskPlaneRef.current = deskMesh

      // Desk Grid texture lines
      const grid = new THREE.GridHelper(20, 20, 0x3b82f6, 0x334155)
      grid.position.y = -0.49
      scene.add(grid)
    } else {
      // Live camera passthrough: transparent shadow receiver plane
      const shadowGeo = new THREE.PlaneGeometry(16, 12)
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 })
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -0.42
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)
    }

    // ── 3D Dual-IC Breadboard Circuit Assembly ──
    const bbGroup = new THREE.Group()
    breadboardGroupRef.current = bbGroup

    // Breadboard body
    const bodyGeo = new THREE.BoxGeometry(6.8, 0.38, 3.4)
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    body.receiveShadow = true
    bbGroup.add(body)

    // Divider groove
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.12, 0.28),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8 })
    )
    groove.position.set(0, 0.14, 0)
    bbGroup.add(groove)

    // Power Rails (Red & Blue lines)
    const rTopRed = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#ef4444' }))
    rTopRed.position.set(0, 0.2, -1.4); bbGroup.add(rTopRed)
    const rTopBlue = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#3b82f6' }))
    rTopBlue.position.set(0, 0.2, -1.25); bbGroup.add(rTopBlue)
    const rBotRed = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#ef4444' }))
    rBotRed.position.set(0, 0.2, 1.25); bbGroup.add(rBotRed)
    const rBotBlue = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#3b82f6' }))
    rBotBlue.position.set(0, 0.2, 1.4); bbGroup.add(rBotBlue)

    // Dual IC 4051 chips
    const makeIC = (xPos, label) => {
      const ic = new THREE.Group()
      ic.position.set(xPos, 0.32, 0)

      const icBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.24, 0.58),
        new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.3, metalness: 0.2 })
      )
      icBody.castShadow = true
      ic.add(icBody)

      // Silver lead pins
      const pinGeo = new THREE.BoxGeometry(0.06, 0.18, 0.07)
      const pinMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 })
      for (let i = 0; i < 8; i++) {
        const px = -0.65 + i * 0.18
        const p1 = new THREE.Mesh(pinGeo, pinMat); p1.position.set(px, -0.09, -0.31); ic.add(p1)
        const p2 = new THREE.Mesh(pinGeo, pinMat); p2.position.set(px, -0.09, 0.31); ic.add(p2)
      }

      // Notch
      const notch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), new THREE.MeshStandardMaterial({ color: '#27272a' }))
      notch.position.set(-0.75, 0.12, 0)
      ic.add(notch)

      return ic
    }

    const icMux = makeIC(-1.5, 'CD4051 MUX')
    const icDemux = makeIC(1.5, 'CD4051 DEMUX')
    bbGroup.add(icMux)
    bbGroup.add(icDemux)

    // RC low-pass filter components
    const res = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 12), new THREE.MeshStandardMaterial({ color: '#d6c7a1' }))
    res.rotation.z = Math.PI / 2
    res.position.set(2.5, 0.28, 0.75)
    bbGroup.add(res)

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16), new THREE.MeshStandardMaterial({ color: '#f59e0b' }))
    cap.rotation.x = Math.PI / 2
    cap.position.set(2.8, 0.28, 1.05)
    bbGroup.add(cap)

    // Curved 3D Jumper Wires
    const makeWire = (p1, p2, color) => {
      const mid = new THREE.Vector3((p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + 0.55, (p1.z + p2.z) / 2)
      const curve = new THREE.CatmullRomCurve3([p1, mid, p2])
      return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 16, 0.03, 8, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
      )
    }

    bbGroup.add(makeWire(new THREE.Vector3(-2.1, 0.2, -1.4), new THREE.Vector3(-2.1, 0.2, 0.3), '#ef4444'))
    bbGroup.add(makeWire(new THREE.Vector3(0.9, 0.2, -1.4), new THREE.Vector3(0.9, 0.2, 0.3), '#ef4444'))
    bbGroup.add(makeWire(new THREE.Vector3(-0.9, 0.2, -1.25), new THREE.Vector3(-0.9, 0.2, -0.3), '#1e293b'))
    bbGroup.add(makeWire(new THREE.Vector3(2.1, 0.2, -1.25), new THREE.Vector3(2.1, 0.2, -0.3), '#1e293b'))
    bbGroup.add(makeWire(new THREE.Vector3(-1.7, 0.2, -0.3), new THREE.Vector3(1.3, 0.2, -0.3), '#9333ea'))
    bbGroup.add(makeWire(new THREE.Vector3(-1.3, 0.2, 0.3), new THREE.Vector3(1.7, 0.2, 0.3), '#2563eb'))

    scene.add(bbGroup)

    // ── 60 FPS Animation Loop (Reads from transformRef smoothly) ──
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (breadboardGroupRef.current) {
        const { scale: s, rotation: r, position: pos } = transformRef.current
        breadboardGroupRef.current.scale.set(s, s, s)
        breadboardGroupRef.current.rotation.y = r
        breadboardGroupRef.current.position.set(pos.x, pos.y, pos.z)
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
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [arMode]) // Only mounts when arMode changes, NEVER tearing down on drag or rotate!

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  // ── 3. High-Performance Drag & Rotate Pointer Handlers ──
  const pointerRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    pointers: new Map(),
    initialPinchDist: 0,
    initialScale: 1.0,
    initialAngle: 0,
    initialRotation: 0
  })

  const onPointerDown = (e) => {
    e.preventDefault()
    setIsInteracting(true)
    pointerRef.current.isDown = true
    pointerRef.current.startX = e.clientX
    pointerRef.current.startY = e.clientY
    pointerRef.current.lastX = e.clientX
    pointerRef.current.lastY = e.clientY
    pointerRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // Two-finger pinch / twist tracking
    if (pointerRef.current.pointers.size === 2) {
      const pts = Array.from(pointerRef.current.pointers.values())
      pointerRef.current.initialPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      pointerRef.current.initialScale = transformRef.current.scale
      pointerRef.current.initialAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x)
      pointerRef.current.initialRotation = transformRef.current.rotation
    }
  }

  const onPointerMove = (e) => {
    if (!pointerRef.current.isDown) return
    e.preventDefault()

    pointerRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // Two-pointer pinch & rotate
    if (pointerRef.current.pointers.size === 2) {
      const pts = Array.from(pointerRef.current.pointers.values())
      const currentDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      if (pointerRef.current.initialPinchDist > 10) {
        const scaleFactor = currentDist / pointerRef.current.initialPinchDist
        const nextScale = Math.min(2.5, Math.max(0.35, pointerRef.current.initialScale * scaleFactor))
        setScale(nextScale)
      }

      const currentAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x)
      const angleDiff = currentAngle - pointerRef.current.initialAngle
      setRotation(pointerRef.current.initialRotation + angleDiff)
      return
    }

    // Single pointer move (drag or rotate depending on active tool)
    const dx = e.clientX - pointerRef.current.lastX
    const dy = e.clientY - pointerRef.current.lastY
    pointerRef.current.lastX = e.clientX
    pointerRef.current.lastY = e.clientY

    if (interactTool === 'rotate' || e.shiftKey) {
      // Horizontal drag spins around Y-axis
      setRotation(prev => prev + dx * 0.015)
    } else {
      // Drag tool: moves on desk plane
      const sensitivity = 0.0075
      setPosition(prev => ({
        ...prev,
        x: prev.x + dx * sensitivity,
        z: prev.z + dy * sensitivity
      }))
    }
  }

  const onPointerUp = (e) => {
    pointerRef.current.pointers.delete(e.pointerId)
    if (pointerRef.current.pointers.size === 0) {
      pointerRef.current.isDown = false
      setIsInteracting(false)
    }
  }

  // Mouse wheel zoom
  const onWheel = (e) => {
    e.preventDefault()
    const delta = -Math.sign(e.deltaY) * 0.1
    setScale(prev => Math.min(2.5, Math.max(0.35, prev + delta)))
  }

  // ── 4. Photo Snapshot Capture ──
  const takeSnapshot = () => {
    const video = videoRef.current
    const renderer = rendererRef.current
    if (!renderer) return

    const canvas = document.createElement('canvas')
    const width = video && arMode === 'granted' ? video.videoWidth || 1280 : 1280
    const height = video && arMode === 'granted' ? video.videoHeight || 720 : 720
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (video && arMode === 'granted' && video.readyState >= 2) {
      // Draw live camera frame
      ctx.drawImage(video, 0, 0, width, height)
    } else {
      // Draw lab workbench background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)
    }

    // Draw 3D WebGL circuit overlay
    ctx.drawImage(renderer.domElement, 0, 0, width, height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setSnapshotTaken(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none touch-none">
      {/* ── TOP AR HEADER BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {arMode === 'virtualDesk' ? 'Virtual Tabletop Desk View' : 'Live Augmented Reality (AR) Desk View'}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                arMode === 'granted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                arMode === 'virtualDesk' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {arMode === 'granted' ? 'Live Camera Active' : arMode === 'virtualDesk' ? 'Tabletop 3D Mode' : 'Permission Required'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300">
              {arMode === 'virtualDesk'
                ? 'Tabletop placement active • Drag or rotate to inspect circuit'
                : 'Projecting dual-IC breadboard onto your physical desk via camera'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(arMode === 'granted' || arMode === 'virtualDesk') && (
            <>
              {arMode === 'granted' && (
                <button
                  onClick={flipCamera}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur transition-colors"
                  title="Flip Front/Rear Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={takeSnapshot}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Snap Photo</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-xl backdrop-blur transition-colors"
            title="Close AR"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── PERMISSION REQUEST SCREEN (Before Camera is Granted) ── */}
      {arMode === 'prompt' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-slate-950/92 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Camera Access Required</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                CurioLabs asks for your camera permission so you can see your physical desk and place the virtual dual-IC breadboard directly on top of it.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-left text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>100% Private: Video is processed locally in your browser</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Touch to drag, slide, scale, and rotate on your desk</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Supports Android Chrome, iOS Safari, and Desktop Laptops</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => requestCamera('environment')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Allow Camera & Start Desk AR</span>
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Or No Camera Fallback</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              <button
                onClick={enableVirtualDeskMode}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Use Virtual Tabletop Desk (No Camera Needed)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel and return to Lab Bench
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSION DENIED OR INSECURE HTTP ERROR SCREEN ── */}
      {arMode === 'denied' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95">
          <div className="max-w-md w-full bg-slate-900 border border-rose-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Camera Access Not Available</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {errorMessage || 'Your browser blocked camera permission or the connection is not HTTPS.'}
              </p>
            </div>

            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-left text-xs text-rose-200 space-y-1">
              <span className="font-bold block text-white">Quick Fixes:</span>
              <p>• <strong>If on mobile:</strong> Tap the lock/tune icon beside the URL in your browser and toggle <strong>Camera</strong> to <strong>Allow</strong>.</p>
              <p>• <strong>If on local HTTP IP:</strong> Mobile browsers restrict cameras to HTTPS or localhost. Click <strong>Virtual Tabletop Desk</strong> below to enjoy the full 3D desk experience instantly!</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={enableVirtualDeskMode}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Switch to Virtual Tabletop Desk AR</span>
              </button>

              <button
                onClick={() => requestCamera('environment')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Retry Camera Access
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Return to 3D Bench
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE CAMERA BACKGROUND VIDEO (playsInline for iOS) ── */}
      {arMode === 'granted' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* ── THREE.JS 3D CANVAS OVERLAY WITH HIGH-PERFORMANCE POINTER EVENT LISTENERS ── */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      />

      {/* ── INTERACTIVE TOUCH/MOUSE CONTROLS OVERLAY ── */}
      {(arMode === 'granted' || arMode === 'virtualDesk') && (
        <>
          {/* Status badge & drag/rotate feedback */}
          <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="bg-black/75 backdrop-blur border border-white/20 px-3 py-1.5 rounded-xl text-[11px] text-white/90 flex items-center gap-2 shadow-lg">
              {interactTool === 'drag' ? (
                <>
                  <Move className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Drag Mode:</strong> Drag 1 finger / mouse to slide on desk</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  <span><strong>Rotate Mode:</strong> Drag horizontally to spin 360°</span>
                </>
              )}
            </div>

            {isInteracting && (
              <div className="bg-emerald-500/90 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start shadow-md animate-pulse">
                {interactTool === 'drag' ? 'SLIDING ON DESK' : 'ROTATING CIRCUIT'}
              </div>
            )}
          </div>

          {/* Bottom Floating Control Dock */}
          <div className="absolute bottom-6 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
            {/* Tool Mode Selector: Drag vs Rotate */}
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
              <button
                onClick={() => setInteractTool('drag')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  interactTool === 'drag'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Drag to slide across desk"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move / Slide</span>
              </button>

              <button
                onClick={() => setInteractTool('rotate')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  interactTool === 'rotate'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Rotate circuit 360°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 360°</span>
              </button>
            </div>

            {/* Quick Actions: Rotate Left/Right, Zoom, Reset */}
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
              <button
                onClick={() => setRotation(r => r - Math.PI / 8)}
                className="p-2 text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all"
                title="Rotate Left -22.5°"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRotation(r => r + Math.PI / 8)}
                className="p-2 text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all"
                title="Rotate Right +22.5°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-white/20 mx-0.5" />

              <button
                onClick={() => setScale(s => Math.max(0.35, s - 0.15))}
                className="p-2 text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all"
                title="Zoom Out / Scale Down"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-emerald-400 px-1 min-w-[42px] text-center">
                {(scale * 100).toFixed(0)}%
              </span>

              <button
                onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
                className="p-2 text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all"
                title="Zoom In / Scale Up"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-white/20 mx-0.5" />

              <button
                onClick={() => {
                  setScale(1.0)
                  setRotation(0)
                  setPosition({ x: 0, y: -0.4, z: 0 })
                }}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/20 rounded-xl font-mono transition-colors"
                title="Reset Position, Angle, and Scale"
              >
                Reset
              </button>
            </div>
          </div>
        </>
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
