import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { Maximize2, RotateCcw, Eye, Zap, Sparkles, Smartphone, Volume2, Power } from 'lucide-react'

export default function TDMVirtualLab3D({
  f1 = 100,
  f2 = 300,
  clkFreq = 2.0,
  isCircuitPowered = true,
  onFreqChange
}) {
  const mountRef = useRef(null)
  const [cameraMode, setCameraMode] = useState('bench') // 'bench' | 'cro' | 'breadboard' | 'fg'
  const [croPower, setCroPower] = useState(true)
  const [croChannel, setCroChannel] = useState('tdm') // 'tdm' | 'ch1' | 'ch2' | 'recon' | 'dual'
  const [voltsDiv, setVoltsDiv] = useState(1.0)
  const [timeDiv, setTimeDiv] = useState(0.2)
  const [isPowered, setIsPowered] = useState(isCircuitPowered)
  const [hoveredObject, setHoveredObject] = useState(null)
  const [arModelUrl, setArModelUrl] = useState(null)
  const [showARCard, setShowARCard] = useState(false)
  const [activeF1, setActiveF1] = useState(f1)
  const [activeF2, setActiveF2] = useState(f2)

  const controlsRef = useRef(null)
  const cameraRef = useRef(null)
  const screenTextureRef = useRef(null)
  const screenCanvasRef = useRef(null)
  const interactiveObjectsRef = useRef([])

  // Keep state synced
  useEffect(() => {
    setIsPowered(isCircuitPowered)
  }, [isCircuitPowered])

  useEffect(() => {
    setActiveF1(f1)
  }, [f1])

  useEffect(() => {
    setActiveF2(f2)
  }, [f2])

  // ── THREE.JS SCENE SETUP & RAYCASTING ──
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 900
    const height = 520

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0c1017')
    scene.fog = new THREE.FogExp2('#0c1017', 0.012)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 19, 27)
    cameraRef.current = camera

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controls.minDistance = 4
    controls.maxDistance = 50
    controls.target.set(0, 2.5, 0)
    controlsRef.current = controls

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85)
    scene.add(ambientLight)

    const mainSpot = new THREE.SpotLight('#ffffff', 2.5, 60, Math.PI / 3.5, 0.4, 1)
    mainSpot.position.set(10, 30, 20)
    mainSpot.castShadow = true
    mainSpot.shadow.mapSize.width = 2048
    mainSpot.shadow.mapSize.height = 2048
    scene.add(mainSpot)

    const fillBlue = new THREE.DirectionalLight('#38bdf8', 0.6)
    fillBlue.position.set(-18, 12, -8)
    scene.add(fillBlue)

    const rimLight = new THREE.DirectionalLight('#a855f7', 0.4)
    rimLight.position.set(15, 8, -15)
    scene.add(rimLight)

    // 5. Wooden Laboratory Workbench
    const benchGeo = new THREE.BoxGeometry(46, 1.2, 28)
    const benchMat = new THREE.MeshStandardMaterial({
      color: '#1a1f2c',
      roughness: 0.5,
      metalness: 0.15
    })
    const bench = new THREE.Mesh(benchGeo, benchMat)
    bench.position.y = -0.6
    bench.receiveShadow = true
    scene.add(bench)

    // Workbench grid markings
    const benchGrid = new THREE.GridHelper(42, 42, '#334155', '#1e293b')
    benchGrid.position.y = 0.01
    scene.add(benchGrid)

    // Reset interactive objects array
    interactiveObjectsRef.current = []

    // ════════════════════════════════════════════════════════
    // 6. CATHODE RAY OSCILLOSCOPE (CRO / DSO)
    // ════════════════════════════════════════════════════════
    const croGroup = new THREE.Group()
    croGroup.position.set(0, 4.2, -6.5)

    // CRO Main Metal Case
    const croBody = new THREE.Mesh(
      new THREE.BoxGeometry(16, 7.5, 6),
      new THREE.MeshStandardMaterial({ color: '#2b313d', roughness: 0.4, metalness: 0.3 })
    )
    croBody.castShadow = true
    croGroup.add(croBody)

    // Top Handle
    const handleGeo = new THREE.TorusGeometry(2, 0.15, 8, 24, Math.PI)
    const handleMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.position.set(0, 3.8, 0)
    croGroup.add(handle)

    // Screen Bezel
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 5.8, 0.3),
      new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.8 })
    )
    screenBezel.position.set(-2.6, 0.2, 3.02)
    croGroup.add(screenBezel)

    // Live CRT Dynamic Screen Canvas
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 512
    screenCanvas.height = 320
    screenCanvasRef.current = screenCanvas
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTextureRef.current = screenTexture

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9.0, 5.4),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    )
    screenMesh.position.set(-2.6, 0.2, 3.18)
    croGroup.add(screenMesh)

    // Screen Glow Light (casts green/purple ambient illumination)
    const croLight = new THREE.PointLight(croPower ? '#38bdf8' : '#000000', 1.2, 10)
    croLight.position.set(-2.6, 0.2, 3.8)
    croGroup.add(croLight)

    // ── CRO Interactive Front Panel Controls ──
    const btnGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 16)
    btnGeo.rotateX(Math.PI / 2)

    // CRO Power Button
    const pwrBtnMat = new THREE.MeshStandardMaterial({ color: croPower ? '#22c55e' : '#ef4444', roughness: 0.3 })
    const croPwrBtn = new THREE.Mesh(btnGeo, pwrBtnMat)
    croPwrBtn.position.set(6.4, 2.6, 3.1)
    croPwrBtn.userData = { id: 'cro_power', label: 'CRO Power Switch' }
    croGroup.add(croPwrBtn)
    interactiveObjectsRef.current.push(croPwrBtn)

    // Channel Selector Buttons [CH1, CH2, TDM, RECON, DUAL]
    const chLabels = ['CH1', 'CH2', 'TDM', 'REC', 'DUAL']
    const chIds = ['ch1', 'ch2', 'tdm', 'recon', 'dual']
    chIds.forEach((chId, idx) => {
      const isChActive = croChannel === chId
      const chBtnMat = new THREE.MeshStandardMaterial({
        color: isChActive ? '#38bdf8' : '#475569',
        roughness: 0.4
      })
      const chBtn = new THREE.Mesh(btnGeo, chBtnMat)
      chBtn.position.set(3.2 + idx * 0.75, 1.4, 3.1)
      chBtn.userData = { id: `cro_ch_${chId}`, label: `Select ${chLabels[idx]} Channel` }
      croGroup.add(chBtn)
      interactiveObjectsRef.current.push(chBtn)
    })

    // Rotary Knobs (Volts/Div & Time/Div)
    const knobGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.35, 20)
    knobGeo.rotateX(Math.PI / 2)
    const knobMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.3 })

    const voltsKnob = new THREE.Mesh(knobGeo, knobMat)
    voltsKnob.position.set(3.6, -0.6, 3.15)
    voltsKnob.userData = { id: 'cro_volts_div', label: `Volts/Div Knob (${voltsDiv}V/div)` }
    croGroup.add(voltsKnob)
    interactiveObjectsRef.current.push(voltsKnob)

    const timeKnob = new THREE.Mesh(knobGeo, knobMat)
    timeKnob.position.set(5.4, -0.6, 3.15)
    timeKnob.userData = { id: 'cro_time_div', label: `Time/Div Knob (${timeDiv}ms/div)` }
    croGroup.add(timeKnob)
    interactiveObjectsRef.current.push(timeKnob)

    // BNC Input Ports on CRO
    const bncPortGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16)
    bncPortGeo.rotateX(Math.PI / 2)
    const bncMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.1 })
    for (let i = 0; i < 3; i++) {
      const bnc = new THREE.Mesh(bncPortGeo, bncMat)
      bnc.position.set(3.4 + i * 1.3, -2.4, 3.1)
      croGroup.add(bnc)
    }

    scene.add(croGroup)

    // ════════════════════════════════════════════════════════
    // 7. DUAL BENCHTOP FUNCTION GENERATORS
    // ════════════════════════════════════════════════════════
    const makeBenchFG = (xPos, title, freqStr, unit, waveType, mainColor) => {
      const fgGroup = new THREE.Group()
      fgGroup.position.set(xPos, 2.5, -4.5)

      // Main box
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 4.4, 6.5),
        new THREE.MeshStandardMaterial({ color: '#1f2430', roughness: 0.4, metalness: 0.2 })
      )
      box.castShadow = true
      fgGroup.add(box)

      // Bezel
      const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(6.6, 3.8, 0.2),
        new THREE.MeshStandardMaterial({ color: '#11141c', roughness: 0.8 })
      )
      bezel.position.set(0, 0, 3.26)
      fgGroup.add(bezel)

      // Digital 7-Segment Screen Texture
      const fgCanvas = document.createElement('canvas')
      fgCanvas.width = 256
      fgCanvas.height = 128
      const fgCtx = fgCanvas.getContext('2d')
      fgCtx.fillStyle = '#05070a'
      fgCtx.fillRect(0, 0, 256, 128)
      fgCtx.fillStyle = mainColor
      fgCtx.font = 'bold 36px monospace'
      fgCtx.fillText(freqStr, 20, 60)
      fgCtx.font = 'bold 18px monospace'
      fgCtx.fillText(waveType, 20, 100)

      const fgTexture = new THREE.CanvasTexture(fgCanvas)
      const fgDisp = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.8),
        new THREE.MeshBasicMaterial({ map: fgTexture })
      )
      fgDisp.position.set(-1.2, 0.6, 3.38)
      fgGroup.add(fgDisp)

      // Frequency + / - Buttons
      const plusBtn = new THREE.Mesh(btnGeo, new THREE.MeshStandardMaterial({ color: '#38bdf8' }))
      plusBtn.position.set(1.5, 1.1, 3.38)
      plusBtn.userData = { id: `fg_plus_${title}`, label: `${title} Freq +` }
      fgGroup.add(plusBtn)
      interactiveObjectsRef.current.push(plusBtn)

      const minusBtn = new THREE.Mesh(btnGeo, new THREE.MeshStandardMaterial({ color: '#64748b' }))
      minusBtn.position.set(1.5, 0.3, 3.38)
      minusBtn.userData = { id: `fg_minus_${title}`, label: `${title} Freq -` }
      fgGroup.add(minusBtn)
      interactiveObjectsRef.current.push(minusBtn)

      // Output BNC port
      const bnc = new THREE.Mesh(bncPortGeo, bncMat)
      bnc.position.set(1.8, -1.0, 3.38)
      fgGroup.add(bnc)

      return fgGroup
    }

    const fg1 = makeBenchFG(-13.5, 'FG1', `${activeF1} Hz`, 'Hz', 'SINE 1.0V', '#38bdf8')
    const fg2 = makeBenchFG(13.5, 'FG2', `${activeF2} Hz`, 'Hz', 'TRIANGLE 1.0V', '#34d399')
    scene.add(fg1)
    scene.add(fg2)

    // ════════════════════════════════════════════════════════
    // 8. 3D DUAL-IC SOLDERLESS BREADBOARD
    // ════════════════════════════════════════════════════════
    const bbGroup = new THREE.Group()
    bbGroup.position.set(0, 0.45, 3.8)

    // Breadboard cream body
    const bbBody = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.85, 9),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.65, metalness: 0.05 })
    )
    bbBody.castShadow = true
    bbBody.receiveShadow = true
    bbGroup.add(bbBody)

    // Center divider groove
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(17, 0.25, 0.7),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9 })
    )
    groove.position.set(0, 0.36, 0)
    bbGroup.add(groove)

    // Power Rails (Red & Blue lines)
    const railMatRed = new THREE.MeshBasicMaterial({ color: '#ef4444' })
    const railMatBlue = new THREE.MeshBasicMaterial({ color: '#3b82f6' })
    const stripGeo = new THREE.BoxGeometry(16.5, 0.04, 0.16)

    const rTopRed = new THREE.Mesh(stripGeo, railMatRed); rTopRed.position.set(0, 0.44, -3.8); bbGroup.add(rTopRed)
    const rTopBlue = new THREE.Mesh(stripGeo, railMatBlue); rTopBlue.position.set(0, 0.44, -3.5); bbGroup.add(rTopBlue)
    const rBotRed = new THREE.Mesh(stripGeo, railMatRed); rBotRed.position.set(0, 0.44, 3.5); bbGroup.add(rBotRed)
    const rBotBlue = new THREE.Mesh(stripGeo, railMatBlue); rBotBlue.position.set(0, 0.44, 3.8); bbGroup.add(rBotBlue)

    // Dual IC 4051 DIP-16 Chips in 3D
    const make3DIC = (xPos, chipLabel) => {
      const ic = new THREE.Group()
      ic.position.set(xPos, 0.65, 0)

      // Epoxy body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.6, 1.5),
        new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.3, metalness: 0.2 })
      )
      body.castShadow = true
      ic.add(body)

      // Silver lead pins
      const pinGeo = new THREE.BoxGeometry(0.14, 0.42, 0.16)
      const pinMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 })
      for (let i = 0; i < 8; i++) {
        const px = -1.6 + i * 0.45
        const pTop = new THREE.Mesh(pinGeo, pinMat); pTop.position.set(px, -0.22, -0.75); ic.add(pTop)
        const pBot = new THREE.Mesh(pinGeo, pinMat); pBot.position.set(px, -0.22, 0.75); ic.add(pBot)
      }

      // Pin 1 Notch
      const notch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: '#27272a' })
      )
      notch.position.set(-1.8, 0.28, 0)
      ic.add(notch)

      return ic
    }

    const ic1Mesh = make3DIC(-3.8, 'CD4051 MUX')
    const ic2Mesh = make3DIC(3.8, 'CD4051 DEMUX')
    bbGroup.add(ic1Mesh)
    bbGroup.add(ic2Mesh)

    // Passive RC Filters (5.6k Resistors + 0.1uF Ceramic Capacitors)
    const make3DFilter = (xPos) => {
      const fGroup = new THREE.Group()
      fGroup.position.set(xPos, 0.65, 2.0)

      // Resistor with color bands (Green, Blue, Red, Gold)
      const res = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 1.0, 12),
        new THREE.MeshStandardMaterial({ color: '#d6c7a1', roughness: 0.6 })
      )
      res.rotateZ(Math.PI / 2)
      fGroup.add(res)

      // Ceramic disc capacitor
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 })
      )
      cap.rotateX(Math.PI / 2)
      cap.position.set(0.65, 0, 0.6)
      fGroup.add(cap)

      return fGroup
    }

    bbGroup.add(make3DFilter(6.6))
    bbGroup.add(make3DFilter(7.6))

    // 3D Curved Jumper Wires
    const makeWireMesh = (p1, p2, color) => {
      const midX = (p1.x + p2.x) / 2
      const midY = Math.max(p1.y, p2.y) + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.32 + 0.35
      const midZ = (p1.z + p2.z) / 2
      const curve = new THREE.CatmullRomCurve3([p1, new THREE.Vector3(midX, midY, midZ), p2])
      return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 0.07, 8, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1 })
      )
    }

    // Power, Ground, Signal, Clock, and TDM Bus 3D jumper wires
    bbGroup.add(makeWireMesh(new THREE.Vector3(-5.2, 0.45, -3.8), new THREE.Vector3(-5.2, 0.45, 0.8), '#ef4444')) // +5V Mux
    bbGroup.add(makeWireMesh(new THREE.Vector3(2.4, 0.45, -3.8), new THREE.Vector3(2.4, 0.45, 0.8), '#ef4444'))  // +5V Demux
    bbGroup.add(makeWireMesh(new THREE.Vector3(-2.2, 0.45, -3.5), new THREE.Vector3(-2.2, 0.45, -0.8), '#1e293b'))// GND Mux
    bbGroup.add(makeWireMesh(new THREE.Vector3(5.4, 0.45, -3.5), new THREE.Vector3(5.4, 0.45, -0.8), '#1e293b')) // GND Demux

    // TDM Bus Wire (IC1 Pin 3 to IC2 Pin 3)
    bbGroup.add(makeWireMesh(new THREE.Vector3(-4.4, 0.45, -0.8), new THREE.Vector3(3.2, 0.45, -0.8), '#9333ea'))
    // Clock Sync Wire (IC1 Pin 11 to IC2 Pin 11)
    bbGroup.add(makeWireMesh(new THREE.Vector3(-3.2, 0.45, 0.8), new THREE.Vector3(4.4, 0.45, 0.8), '#2563eb'))

    scene.add(bbGroup)

    // ── Generate Procedural AR GLB for Mobile QuickLook ──
    const arScene = new THREE.Scene()
    arScene.add(bbGroup.clone())
    const exporter = new GLTFExporter()
    try {
      exporter.parse(arScene, (gltf) => {
        const blob = new Blob([gltf], { type: 'model/gltf-binary' })
        const url = URL.createObjectURL(blob)
        setArModelUrl(url)
      }, { binary: true })
    } catch (e) {
      console.warn('AR GLTF export note:', e)
    }

    // ════════════════════════════════════════════════════════
    // 9. ANIMATION & LIVE REAL-TIME OSCILLOSCOPE DRAWING
    // ════════════════════════════════════════════════════════
    let animId
    let time = 0

    const renderDSOTrace = () => {
      const cvs = screenCanvasRef.current
      if (!cvs) return
      const ctx = cvs.getContext('2d')
      const W = cvs.width
      const H = cvs.height

      // Screen Phosphor Dark Background
      ctx.fillStyle = '#060d14'
      ctx.fillRect(0, 0, W, H)

      // Oscilloscope Phosphor Grid (10 divisions X, 8 divisions Y)
      ctx.strokeStyle = '#0e2b3d'
      ctx.lineWidth = 1
      for (let x = 0; x <= W; x += W / 10) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y <= H; y += H / 8) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Center crosshairs
      ctx.strokeStyle = '#1a4f6e'
      ctx.setLineDash([2, 4])
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
      ctx.setLineDash([])

      if (croPower && isPowered) {
        const fClock = clkFreq * 12
        const vScale = 65 / voltsDiv

        // 1. CH1 Sine Wave Trace (Sky Blue)
        if (croChannel === 'ch1' || croChannel === 'dual') {
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 2.2
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const y = (H / 2) - Math.sin(t * 1.5) * vScale
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // 2. CH2 Triangle Wave Trace (Emerald Green)
        if (croChannel === 'ch2' || croChannel === 'dual') {
          ctx.strokeStyle = '#34d399'
          ctx.lineWidth = 2.2
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const triVal = ((t * 4.5) % 2) - 1
            const y = (H / 2) - triVal * vScale
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // 3. TDM Composite Interleaved Pulse Train (Neon Purple)
        if (croChannel === 'tdm') {
          ctx.strokeStyle = '#c084fc'
          ctx.lineWidth = 2.6
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const isHigh = Math.sin(t * fClock) > 0
            const ch0Val = Math.sin(t * 1.5)
            const ch1Val = ((t * 4.5) % 2) - 1
            const sampleVal = isHigh ? ch1Val : ch0Val
            const y = (H / 2) - sampleVal * vScale
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // 4. Reconstructed Filtered Signals (Teal & Sky Blue)
        if (croChannel === 'recon') {
          ctx.strokeStyle = '#2dd4bf'
          ctx.lineWidth = 2.4
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const y = (H / 2) - Math.sin(t * 1.5 - 0.2) * vScale * 0.95
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // Screen HUD Text
        ctx.fillStyle = '#f8fafc'
        ctx.font = 'bold 13px monospace'
        ctx.fillText(`CURIOLABS CRO-3000 • ${croChannel.toUpperCase()} MODE`, 16, 26)
        ctx.fillStyle = '#38bdf8'
        ctx.fillText(`${voltsDiv}V/DIV`, 16, H - 16)
        ctx.fillStyle = '#e2e8f0'
        ctx.fillText(`${timeDiv}ms/DIV`, 120, H - 16)
        ctx.fillStyle = '#c084fc'
        ctx.fillText(`CLK: ${clkFreq}kHz`, 220, H - 16)
      } else {
        ctx.fillStyle = '#475569'
        ctx.font = 'bold 15px monospace'
        ctx.fillText('STANDBY — PRESS POWER BUTTON ON CRO', 70, H / 2)
      }

      if (screenTextureRef.current) {
        screenTextureRef.current.needsUpdate = true
      }
    }

    const animate = () => {
      animId = requestAnimationFrame(animate)
      time += 0.5
      renderDSOTrace()
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 10. Raycasting Click Interactions on 3D CRO and Function Generators
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactiveObjectsRef.current, true)

      if (hits.length > 0) {
        const obj = hits[0].object
        const id = obj.userData?.id

        if (id === 'cro_power') {
          setCroPower(p => !p)
        } else if (id?.startsWith('cro_ch_')) {
          const ch = id.replace('cro_ch_', '')
          setCroChannel(ch)
        } else if (id === 'cro_volts_div') {
          setVoltsDiv(v => (v === 0.5 ? 1.0 : v === 1.0 ? 2.0 : 0.5))
        } else if (id === 'cro_time_div') {
          setTimeDiv(t => (t === 0.1 ? 0.2 : t === 0.2 ? 0.5 : 0.1))
        } else if (id === 'fg_plus_FG1') {
          setActiveF1(f => f + 20)
        } else if (id === 'fg_minus_FG1') {
          setActiveF1(f => Math.max(20, f - 20))
        } else if (id === 'fg_plus_FG2') {
          setActiveF2(f => f + 50)
        } else if (id === 'fg_minus_FG2') {
          setActiveF2(f => Math.max(50, f - 50))
        }
      }
    }

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactiveObjectsRef.current, true)
      if (hits.length > 0) {
        renderer.domElement.style.cursor = 'pointer'
        setHoveredObject(hits[0].object.userData?.label)
      } else {
        renderer.domElement.style.cursor = 'default'
        setHoveredObject(null)
      }
    }

    renderer.domElement.addEventListener('click', onPointerClick)
    renderer.domElement.addEventListener('mousemove', onPointerMove)

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 900
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', onPointerClick)
      renderer.domElement.removeEventListener('mousemove', onPointerMove)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [croPower, croChannel, voltsDiv, timeDiv, isPowered, clkFreq, activeF1, activeF2])

  // Camera presets
  const switchCameraView = (mode) => {
    setCameraMode(mode)
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    if (mode === 'bench') {
      camera.position.set(0, 19, 27)
      controls.target.set(0, 2.5, 0)
    } else if (mode === 'cro') {
      camera.position.set(-1.5, 5.0, 1.5)
      controls.target.set(-2.0, 4.2, -6.5)
    } else if (mode === 'breadboard') {
      camera.position.set(0, 10, 8.5)
      controls.target.set(0, 1, 3.8)
    } else if (mode === 'fg') {
      camera.position.set(-11, 4.5, 1)
      controls.target.set(-13.5, 2.5, -4.5)
    }
  }

  return (
    <div className="space-y-3">
      {/* 3D View Container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-[520px] block" />

        {/* 3D Top Floating HUD Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between pointer-events-none gap-2">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg pointer-events-auto flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-100">Interactive 3D Virtual Electronics Laboratory</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
              WebGL Clickable Controls
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Camera View Switcher */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1 rounded-xl shadow-lg flex items-center gap-1">
              <button
                onClick={() => switchCameraView('bench')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${cameraMode === 'bench' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Overview
              </button>
              <button
                onClick={() => switchCameraView('cro')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${cameraMode === 'cro' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                CRO Scope Screen
              </button>
              <button
                onClick={() => switchCameraView('breadboard')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${cameraMode === 'breadboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Breadboard ICs
              </button>
              <button
                onClick={() => switchCameraView('fg')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${cameraMode === 'fg' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Function Gen
              </button>
            </div>

            {/* Mobile AR Mode Toggle */}
            <button
              onClick={() => setShowARCard(prev => !prev)}
              className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{showARCard ? 'Close AR Mode' : 'View in Mobile AR'}</span>
            </button>
          </div>
        </div>

        {/* 3D Raycasting Hover Tooltip */}
        {hoveredObject && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-mono font-bold text-xs px-3 py-1 rounded-full shadow-lg pointer-events-none animate-bounce">
            👉 {hoveredObject} (Click to interact in 3D)
          </div>
        )}

        {/* Bottom Interactive Quick Dials Bar */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between pointer-events-none text-xs text-slate-300 bg-slate-900/85 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-800 gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">CRO Controls:</span>
            <button
              onClick={() => setCroPower(p => !p)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                croPower ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Power className="w-3 h-3" />
              {croPower ? 'CRO ON' : 'CRO OFF'}
            </button>
            {['tdm', 'ch1', 'ch2', 'recon', 'dual'].map(ch => (
              <button
                key={ch}
                onClick={() => setCroChannel(ch)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-bold uppercase transition-all ${
                  croChannel === ch ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            3D Raycasting Active: Click buttons and knobs on instruments directly!
          </div>
        </div>
      </div>

      {/* ════════ MOBILE AR DESK VIEW CARD (WebXR & SceneViewer) ════════ */}
      {showARCard && (
        <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-purple-700 rounded-xl text-lg">📱</span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Mobile Augmented Reality (AR) Tabletop Projection</h4>
                <p className="text-xs text-slate-500">Place the dual-IC TDM circuit directly onto your physical desk in real-world scale</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
              WebXR • QuickLook • SceneViewer
            </span>
          </div>

          {/* Model-Viewer Component for Mobile AR */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[340px] border border-slate-800 shadow-inner">
            <model-viewer
              src={arModelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
              alt="Dual-IC Solderless Breadboard Setup"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              camera-controls
              auto-rotate
              shadow-intensity="1.5"
              environment-image="neutral"
              style={{ width: '100%', height: '340px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <span>📱</span>
                <span>Place Circuit on Desk in AR</span>
              </button>
            </model-viewer>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-center justify-between">
            <span>💡 Open this page on your smartphone or iPad camera and tap <strong>"Place Circuit on Desk in AR"</strong> to walk around the breadboard on your desk!</span>
          </div>
        </div>
      )}
    </div>
  )
}
