import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Maximize2, RotateCcw, Eye, Zap, Sparkles, Smartphone, Volume2, Power, Camera, Sliders, Radio } from 'lucide-react'
import DeskCameraAR from './DeskCameraAR'
import { createRealisticBreadboardMesh } from '../components/Hardware/createRealisticBreadboardMesh'

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
  const [showDeskCameraAR, setShowDeskCameraAR] = useState(false)
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
    scene.background = new THREE.Color('#10141b')
    scene.fog = new THREE.FogExp2('#10141b', 0.01)

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100)
    camera.position.set(0, 18, 26)
    cameraRef.current = camera

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2 - 0.03
    controls.minDistance = 4
    controls.maxDistance = 45
    controls.target.set(0, 2.2, 0)
    controlsRef.current = controls

    // 4. University Laboratory Studio Lighting
    const ambientLight = new THREE.AmbientLight('#faf5eb', 0.8)
    scene.add(ambientLight)

    // Warm overhead laboratory key spotlight
    const mainSpot = new THREE.SpotLight('#fffbeb', 3.0, 70, Math.PI / 3.2, 0.35, 1.2)
    mainSpot.position.set(8, 28, 18)
    mainSpot.castShadow = true
    mainSpot.shadow.mapSize.width = 2048
    mainSpot.shadow.mapSize.height = 2048
    mainSpot.shadow.bias = -0.0001
    scene.add(mainSpot)

    // Cool fill light from front-left
    const fillLight = new THREE.DirectionalLight('#bae6fd', 0.7)
    fillLight.position.set(-16, 14, 10)
    scene.add(fillLight)

    // Warm rim light from back-right
    const rimLight = new THREE.DirectionalLight('#fef08a', 0.45)
    rimLight.position.set(16, 10, -18)
    scene.add(rimLight)

    // Overhead bench desk lamp over the breadboard area
    const benchLamp = new THREE.PointLight('#fef3c7', 1.4, 18)
    benchLamp.position.set(0, 12, 4)
    scene.add(benchLamp)

    // 5. Solid Wood Laboratory Workbench & Anti-Static ESD Bench Mat
    // Polished teak lab bench tabletop
    const benchGeo = new THREE.BoxGeometry(48, 1.4, 30)
    const benchMat = new THREE.MeshStandardMaterial({
      color: '#261a14',
      roughness: 0.38,
      metalness: 0.05
    })
    const bench = new THREE.Mesh(benchGeo, benchMat)
    bench.position.y = -0.7
    bench.receiveShadow = true
    scene.add(bench)

    // ESD Anti-Static High-Precision Bench Mat under the breadboard and instruments
    const matGeo = new THREE.BoxGeometry(38, 0.06, 22)
    const esdMat = new THREE.MeshStandardMaterial({
      color: '#152536',
      roughness: 0.6,
      metalness: 0.08
    })
    const esdMesh = new THREE.Mesh(matGeo, esdMat)
    esdMesh.position.set(0, 0.02, 1)
    esdMesh.receiveShadow = true
    scene.add(esdMesh)

    // ESD Mat subtle border bevel
    const esdBorderGeo = new THREE.BoxGeometry(38.4, 0.04, 22.4)
    const esdBorderMat = new THREE.MeshStandardMaterial({ color: '#0c1622', roughness: 0.8 })
    const esdBorder = new THREE.Mesh(esdBorderGeo, esdBorderMat)
    esdBorder.position.set(0, 0.01, 1)
    scene.add(esdBorder)

    // Reset interactive objects array
    interactiveObjectsRef.current = []

    // ════════════════════════════════════════════════════════
    // 6. CATHODE RAY / DIGITAL STORAGE OSCILLOSCOPE (DSO)
    // ════════════════════════════════════════════════════════
    const croGroup = new THREE.Group()
    croGroup.position.set(0, 4.3, -6.5)

    // CRO Main Metal Case
    const croBody = new THREE.Mesh(
      new THREE.BoxGeometry(16.5, 7.8, 6.2),
      new THREE.MeshStandardMaterial({ color: '#272c36', roughness: 0.35, metalness: 0.25 })
    )
    croBody.castShadow = true
    croGroup.add(croBody)

    // Top Sturdy Carry Handle
    const handleGeo = new THREE.TorusGeometry(2.1, 0.16, 12, 32, Math.PI)
    const handleMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.85, roughness: 0.2 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.position.set(0, 3.95, 0)
    croGroup.add(handle)

    // Front Beveled Screen Bezel
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 6.0, 0.35),
      new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.75 })
    )
    screenBezel.position.set(-2.6, 0.2, 3.12)
    croGroup.add(screenBezel)

    // ── HIGH-RESOLUTION 1024x640 DSO PHOSPHOR DISPLAY CANVAS ──
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 1024
    screenCanvas.height = 640
    screenCanvasRef.current = screenCanvas
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.anisotropy = 16
    screenTextureRef.current = screenTexture

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9.2, 5.6),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    )
    screenMesh.position.set(-2.6, 0.2, 3.32)
    croGroup.add(screenMesh)

    // Screen Glow Light (casts green/purple ambient illumination)
    const croLight = new THREE.PointLight(croPower ? '#38bdf8' : '#000000', 1.4, 12)
    croLight.position.set(-2.6, 0.2, 4.0)
    croGroup.add(croLight)

    // ── CRO Interactive Front Panel Controls ──
    const btnGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.22, 18)
    btnGeo.rotateX(Math.PI / 2)

    // CRO Power Button
    const pwrBtnMat = new THREE.MeshStandardMaterial({
      color: croPower ? '#22c55e' : '#ef4444',
      roughness: 0.2,
      emissive: croPower ? '#22c55e' : '#7f1d1d',
      emissiveIntensity: 0.5
    })
    const croPwrBtn = new THREE.Mesh(btnGeo, pwrBtnMat)
    croPwrBtn.position.set(6.4, 2.7, 3.2)
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
        emissive: isChActive ? '#38bdf8' : '#000000',
        emissiveIntensity: isChActive ? 0.4 : 0,
        roughness: 0.35
      })
      const chBtn = new THREE.Mesh(btnGeo, chBtnMat)
      chBtn.position.set(3.2 + idx * 0.75, 1.4, 3.2)
      chBtn.userData = { id: `cro_ch_${chId}`, label: `Select ${chLabels[idx]} Channel` }
      croGroup.add(chBtn)
      interactiveObjectsRef.current.push(chBtn)
    })

    // Rotary Knobs (Volts/Div & Time/Div)
    const knobGeo = new THREE.CylinderGeometry(0.44, 0.48, 0.38, 24)
    knobGeo.rotateX(Math.PI / 2)
    const knobMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.7, roughness: 0.25 })

    const voltsKnob = new THREE.Mesh(knobGeo, knobMat)
    voltsKnob.position.set(3.6, -0.6, 3.25)
    voltsKnob.userData = { id: 'cro_volts_div', label: `Volts/Div Knob (${voltsDiv}V/div)` }
    croGroup.add(voltsKnob)
    interactiveObjectsRef.current.push(voltsKnob)

    const timeKnob = new THREE.Mesh(knobGeo, knobMat)
    timeKnob.position.set(5.5, -0.6, 3.25)
    timeKnob.userData = { id: 'cro_time_div', label: `Time/Div Knob (${timeDiv}ms/div)` }
    croGroup.add(timeKnob)
    interactiveObjectsRef.current.push(timeKnob)

    // BNC Input Ports on CRO
    const bncPortGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.45, 18)
    bncPortGeo.rotateX(Math.PI / 2)
    const bncMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', metalness: 0.95, roughness: 0.1 })
    for (let i = 0; i < 3; i++) {
      const bnc = new THREE.Mesh(bncPortGeo, bncMat)
      bnc.position.set(3.4 + i * 1.35, -2.4, 3.2)
      croGroup.add(bnc)
    }

    scene.add(croGroup)

    // ════════════════════════════════════════════════════════
    // 7. DUAL BENCHTOP FUNCTION GENERATORS (FG1 & FG2)
    // ════════════════════════════════════════════════════════
    const makeBenchFG = (xPos, title, freqStr, waveType, mainColor) => {
      const fgGroup = new THREE.Group()
      fgGroup.position.set(xPos, 2.5, -4.5)

      // Main casing
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(7.4, 4.5, 6.5),
        new THREE.MeshStandardMaterial({ color: '#1e2430', roughness: 0.35, metalness: 0.2 })
      )
      box.castShadow = true
      fgGroup.add(box)

      // Bezel
      const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 3.9, 0.22),
        new THREE.MeshStandardMaterial({ color: '#0f131a', roughness: 0.75 })
      )
      bezel.position.set(0, 0, 3.28)
      fgGroup.add(bezel)

      // Digital 7-Segment Screen Texture (512x256 High-DPI)
      const fgCanvas = document.createElement('canvas')
      fgCanvas.width = 512
      fgCanvas.height = 256
      const fgCtx = fgCanvas.getContext('2d')
      fgCtx.fillStyle = '#060a0f'
      fgCtx.fillRect(0, 0, 512, 256)

      // Header
      fgCtx.fillStyle = '#64748b'
      fgCtx.font = 'bold 24px monospace'
      fgCtx.fillText(`${title} • ARBITRARY FUNCTION GENERATOR`, 24, 42)

      // Digital readout with glow
      fgCtx.fillStyle = mainColor
      fgCtx.shadowColor = mainColor
      fgCtx.shadowBlur = 12
      fgCtx.font = 'bold 64px monospace'
      fgCtx.fillText(freqStr, 24, 120)

      fgCtx.shadowBlur = 0
      fgCtx.fillStyle = '#f8fafc'
      fgCtx.font = 'bold 28px monospace'
      fgCtx.fillText(waveType, 24, 180)
      fgCtx.fillStyle = '#94a3b8'
      fgCtx.font = 'bold 22px monospace'
      fgCtx.fillText('OUTPUT: 50Ω LOAD • ON', 24, 222)

      const fgTexture = new THREE.CanvasTexture(fgCanvas)
      const fgDisp = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 2.0),
        new THREE.MeshBasicMaterial({ map: fgTexture })
      )
      fgDisp.position.set(-1.2, 0.6, 3.42)
      fgGroup.add(fgDisp)

      // Frequency + / - Buttons
      const plusBtn = new THREE.Mesh(btnGeo, new THREE.MeshStandardMaterial({ color: '#38bdf8' }))
      plusBtn.position.set(1.6, 1.1, 3.42)
      plusBtn.userData = { id: `fg_plus_${title}`, label: `${title} Freq +` }
      fgGroup.add(plusBtn)
      interactiveObjectsRef.current.push(plusBtn)

      const minusBtn = new THREE.Mesh(btnGeo, new THREE.MeshStandardMaterial({ color: '#64748b' }))
      minusBtn.position.set(1.6, 0.3, 3.42)
      minusBtn.userData = { id: `fg_minus_${title}`, label: `${title} Freq -` }
      fgGroup.add(minusBtn)
      interactiveObjectsRef.current.push(minusBtn)

      // Output BNC port
      const bnc = new THREE.Mesh(bncPortGeo, bncMat)
      bnc.position.set(1.8, -1.0, 3.42)
      fgGroup.add(bnc)

      return fgGroup
    }

    const fg1 = makeBenchFG(-13.5, 'FG1', `${activeF1} Hz`, 'SINE 1.00Vpp', '#38bdf8')
    const fg2 = makeBenchFG(13.5, 'FG2', `${activeF2} Hz`, 'TRIANGLE 1.00Vpp', '#34d399')
    scene.add(fg1)
    scene.add(fg2)

    // ════════════════════════════════════════════════════════
    // 8. 3D DUAL-IC SOLDERLESS BREADBOARD ASSEMBLY
    // ════════════════════════════════════════════════════════
    const bbGroup = createRealisticBreadboardMesh({
      isCircuitPowered: isPowered,
      clkFreq
    })
    bbGroup.position.set(0, 0.48, 3.8)
    bbGroup.scale.set(1.7, 1.7, 1.7)
    scene.add(bbGroup)

    // ════════════════════════════════════════════════════════
    // 9. ANIMATION & LIVE RAZOR-SHARP DSO TRACE RENDERING
    // ════════════════════════════════════════════════════════
    let animId
    let time = 0

    const renderDSOTrace = () => {
      const cvs = screenCanvasRef.current
      if (!cvs) return
      const ctx = cvs.getContext('2d')
      const W = cvs.width
      const H = cvs.height

      // ── Deep Cathode Phosphor Background ──
      ctx.fillStyle = '#04090e'
      ctx.fillRect(0, 0, W, H)

      // ── Oscilloscope Phosphor Graticule (10 cols x 8 rows) ──
      ctx.strokeStyle = '#0a2333'
      ctx.lineWidth = 1.5
      for (let x = 0; x <= W; x += W / 10) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y <= H; y += H / 8) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Micro-subdivision ticks on center axes (5 ticks per division)
      ctx.strokeStyle = '#103952'
      ctx.lineWidth = 1.0
      const tickW = 5
      for (let x = 0; x <= W; x += W / 50) {
        ctx.beginPath()
        ctx.moveTo(x, H / 2 - tickW)
        ctx.lineTo(x, H / 2 + tickW)
        ctx.stroke()
      }
      for (let y = 0; y <= H; y += H / 40) {
        ctx.beginPath()
        ctx.moveTo(W / 2 - tickW, y)
        ctx.lineTo(W / 2 + tickW, y)
        ctx.stroke()
      }

      // Center crosshairs
      ctx.strokeStyle = '#18547a'
      ctx.lineWidth = 1.8
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.moveTo(W / 2, 0)
      ctx.lineTo(W / 2, H)
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      ctx.setLineDash([])

      if (croPower && isPowered) {
        const fClock = clkFreq * 14
        const vScale = 140 / voltsDiv

        // ── 1. CH1 Sine Wave Trace (Sky Blue Phosphor Glow) ──
        if (croChannel === 'ch1' || croChannel === 'dual') {
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 12
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 3.5
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const y = (H / 2) - Math.sin(t * 1.5) * vScale
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // ── 2. CH2 Triangle Wave Trace (Emerald Green Phosphor Glow) ──
        if (croChannel === 'ch2' || croChannel === 'dual') {
          ctx.shadowColor = '#34d399'
          ctx.shadowBlur = 12
          ctx.strokeStyle = '#34d399'
          ctx.lineWidth = 3.5
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const triVal = ((t * 4.5) % 2) - 1
            const y = (H / 2) - triVal * vScale
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // ── 3. TDM Composite Interleaved Pulse Train (Neon Magenta Phosphor Glow) ──
        if (croChannel === 'tdm') {
          ctx.shadowColor = '#d946ef'
          ctx.shadowBlur = 14
          ctx.strokeStyle = '#e879f9'
          ctx.lineWidth = 4.0
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

        // ── 4. Reconstructed Filtered Output Signals (Cyan Phosphor Glow) ──
        if (croChannel === 'recon') {
          ctx.shadowColor = '#22d3ee'
          ctx.shadowBlur = 12
          ctx.strokeStyle = '#22d3ee'
          ctx.lineWidth = 3.5
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            const t = time * 0.05 + (x / W) * 8 * (timeDiv / 0.2)
            const y = (H / 2) - Math.sin(t * 1.5 - 0.25) * vScale * 0.94
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        // Reset shadow blur for crisp text overlay
        ctx.shadowBlur = 0

        // ── Professional DSO On-Screen Telemetry Overlay ──
        // Top status bar
        ctx.fillStyle = 'rgba(6, 15, 24, 0.75)'
        ctx.fillRect(0, 0, W, 48)

        ctx.fillStyle = '#38bdf8'
        ctx.font = 'bold 20px monospace'
        ctx.textAlign = 'left'
        ctx.fillText('● TRIG\'D', 24, 32)

        ctx.fillStyle = '#f8fafc'
        ctx.fillText(`CURIOLABS DSO-4051 • MODE: ${croChannel.toUpperCase()} MULTIPLEXED`, 150, 32)

        ctx.textAlign = 'right'
        ctx.fillStyle = '#22c55e'
        ctx.fillText('AUTO 2.50GSa/s', W - 24, 32)

        // Bottom measurement telemetry badges
        ctx.fillStyle = 'rgba(6, 15, 24, 0.75)'
        ctx.fillRect(0, H - 52, W, 52)

        ctx.textAlign = 'left'
        ctx.font = 'bold 18px monospace'

        // CH1 indicator
        ctx.fillStyle = '#38bdf8'
        ctx.fillText(`1: ${voltsDiv}V/div`, 24, H - 20)

        // CH2 indicator
        ctx.fillStyle = '#34d399'
        ctx.fillText(`2: ${voltsDiv}V/div`, 180, H - 20)

        // Timebase
        ctx.fillStyle = '#f8fafc'
        ctx.fillText(`TIME: ${timeDiv}ms/div`, 340, H - 20)

        // Master Clock
        ctx.fillStyle = '#c084fc'
        ctx.fillText(`CLK: ${clkFreq}kHz (5V)`, 540, H - 20)

        // Real-time Measurements
        ctx.textAlign = 'right'
        ctx.fillStyle = '#fde047'
        ctx.fillText(`Vpp = ${(2.0 / voltsDiv).toFixed(2)}V  |  Freq = ${f1}.0Hz`, W - 24, H - 20)
      } else {
        // Standby Screen
        ctx.fillStyle = '#475569'
        ctx.font = 'bold 28px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('STANDBY — INSTRUMENT POWER OFF', W / 2, H / 2 - 10)
        ctx.font = '20px monospace'
        ctx.fillText('Press "CRO ON" button on the front panel or bottom toolbar', W / 2, H / 2 + 30)
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
      camera.position.set(0, 18, 26)
      controls.target.set(0, 2.2, 0)
    } else if (mode === 'cro') {
      camera.position.set(-1.5, 4.8, 1.2)
      controls.target.set(-2.6, 4.3, -6.5)
    } else if (mode === 'breadboard') {
      camera.position.set(0, 9.5, 8.2)
      controls.target.set(0, 1.2, 3.8)
    } else if (mode === 'fg') {
      camera.position.set(-11, 4.2, 1.2)
      controls.target.set(-13.5, 2.5, -4.5)
    }
  }

  return (
    <div className="space-y-3">
      {/* 3D View Container */}
      <div className="relative rounded-2xl overflow-hidden bg-[#10141b] border-2 border-[#221611]/20 shadow-2xl">
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-[520px] block" />

        {/* 3D Top Floating HUD Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between pointer-events-none gap-2">
          <div className="bg-[#221611]/90 backdrop-blur border border-[#FAF5EB]/15 px-3.5 py-1.5 rounded-xl shadow-xl pointer-events-auto flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A4C93B]" />
            <span className="text-xs font-bold text-[#FAF5EB]">Photorealistic 3D Virtual Electronics Bench</span>
            <span className="text-[10px] bg-[#A4C93B]/20 text-[#A4C93B] font-mono px-2 py-0.5 rounded border border-[#A4C93B]/40 font-bold">
              WebGL Direct Interactive
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Camera View Switcher */}
            <div className="bg-[#221611]/90 backdrop-blur border border-[#FAF5EB]/15 p-1 rounded-xl shadow-xl flex items-center gap-1">
              <button
                onClick={() => switchCameraView('bench')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  cameraMode === 'bench' ? 'bg-[#A4C93B] text-[#221611] shadow' : 'text-[#FAF5EB]/70 hover:text-[#FAF5EB]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => switchCameraView('cro')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  cameraMode === 'cro' ? 'bg-[#A4C93B] text-[#221611] shadow' : 'text-[#FAF5EB]/70 hover:text-[#FAF5EB]'
                }`}
              >
                CRO Scope Screen
              </button>
              <button
                onClick={() => switchCameraView('breadboard')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  cameraMode === 'breadboard' ? 'bg-[#A4C93B] text-[#221611] shadow' : 'text-[#FAF5EB]/70 hover:text-[#FAF5EB]'
                }`}
              >
                Breadboard ICs
              </button>
              <button
                onClick={() => switchCameraView('fg')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  cameraMode === 'fg' ? 'bg-[#A4C93B] text-[#221611] shadow' : 'text-[#FAF5EB]/70 hover:text-[#FAF5EB]'
                }`}
              >
                Function Gen
              </button>
            </div>

            {/* Mobile AR Mode Toggle */}
            <button
              onClick={() => setShowARCard(prev => !prev)}
              className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{showARCard ? 'Close AR Mode' : 'View in Mobile AR'}</span>
            </button>
          </div>
        </div>

        {/* 3D Raycasting Hover Tooltip */}
        {hoveredObject && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#A4C93B] text-[#221611] font-mono font-bold text-xs px-3.5 py-1 rounded-full shadow-2xl pointer-events-none animate-bounce border border-[#221611]/30">
            👉 {hoveredObject} (Click to interact in 3D)
          </div>
        )}

        {/* Bottom Interactive Quick Dials Bar */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between pointer-events-none text-xs text-[#FAF5EB] bg-[#221611]/90 backdrop-blur px-3.5 py-2 rounded-xl border border-[#FAF5EB]/15 gap-2 shadow-2xl">
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#FAF5EB]/70 font-bold">DSO Scope:</span>
            <button
              onClick={() => setCroPower(p => !p)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                croPower ? 'bg-[#A4C93B] text-[#221611]' : 'bg-[#332219] text-[#FAF5EB]/50 border border-[#FAF5EB]/20'
              }`}
            >
              <Power className="w-3 h-3" />
              {croPower ? 'CRO ON' : 'CRO OFF'}
            </button>
            {['tdm', 'ch1', 'ch2', 'recon', 'dual'].map(ch => (
              <button
                key={ch}
                onClick={() => setCroChannel(ch)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-mono font-bold uppercase transition-all ${
                  croChannel === ch ? 'bg-purple-600 text-white shadow' : 'bg-[#332219] text-[#FAF5EB]/70 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-[#FAF5EB]/70 font-mono">
            3D Raycasting Active: Click buttons and knobs on instruments directly!
          </div>
        </div>
      </div>

      {/* ── LIVE FULLSCREEN CAMERA DESK AR (Asks Camera Permission) ── */}
      {showDeskCameraAR && (
        <DeskCameraAR
          onClose={() => setShowDeskCameraAR(false)}
          clkFreq={clkFreq}
          isCircuitPowered={isPowered}
        />
      )}

      {/* ── MOBILE AR DESK SELECTION CARD ── */}
      {showARCard && (
        <div className="bg-[#FAF5EB] rounded-2xl p-5 border-2 border-[#221611]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-[#221611] text-[#FAF5EB] rounded-2xl text-xl">📱</span>
              <div>
                <h4 className="font-bold text-sm text-[#221611]">Mobile Augmented Reality (AR) Tabletop Projection</h4>
                <p className="text-xs text-[#221611]/70">Project the dual-IC TDM circuit directly onto your physical desk in 1:1 scale</p>
              </div>
            </div>
            <button
              onClick={() => setShowARCard(false)}
              className="text-xs text-[#221611]/60 hover:text-[#221611] font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Option A: Live Camera WebAR */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-emerald-50/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Live Camera AR (Desk Passthrough)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prompts for camera permission and streams your real physical desk behind the 3D breadboard. Touch and drag to position on your desk!
                </p>
              </div>

              <button
                onClick={() => setShowDeskCameraAR(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Grant Permission & Start Live AR</span>
              </button>
            </div>

            {/* Option B: Native Device QuickLook / SceneViewer */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white/70 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>Native WebXR / QuickLook</span>
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                    Apple / Android
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uses Google Play Services for AR (Android) or Apple Quick Look (iOS) to place the 3D model into your space.
                </p>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-950 h-28 border border-slate-800">
                <model-viewer
                  src={arModelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
                  alt="Dual-IC Solderless Breadboard Setup"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale="auto"
                  camera-controls
                  auto-rotate
                  style={{ width: '100%', height: '100%' }}
                >
                  <button
                    slot="ar-button"
                    className="absolute inset-x-3 bottom-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>📱</span>
                    <span>Launch Native AR</span>
                  </button>
                </model-viewer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
