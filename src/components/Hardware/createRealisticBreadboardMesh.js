import * as THREE from 'three'

/**
 * Creates an ultra-realistic, university lab-grade 3D breadboard assembly
 * matching the exact schematic, pinout, and aesthetics of CurioLabs main page.
 */
export function createRealisticBreadboardMesh({ isCircuitPowered = true, clkFreq = 2.0 } = {}) {
  const group = new THREE.Group()

  // ════════════════════════════════════════════════════════
  // 1. GENERATE HIGH-RESOLUTION 2048x1024 BREADBOARD TEXTURE
  // ════════════════════════════════════════════════════════
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Dimensions & coordinate mapping on the canvas
  const W = 2048
  const H = 1024
  const COLS = 30
  const startX = 180
  const colSpacing = (W - 360) / (COLS - 1)

  // Top and Bottom row Y-coordinates on the texture
  const railTopPos = 110
  const railTopNeg = 160
  const rowsTop = [240, 285, 330, 375, 420] // A, B, C, D, E
  const centerGrooveY = 512
  const rowsBot = [604, 649, 694, 739, 784] // F, G, H, I, J
  const railBotPos = 864
  const railBotNeg = 914

  // Helper to get X position for a column (1-indexed)
  const getColX = (c) => startX + (c - 1) * colSpacing

  // --- Background: Matte Lab Ivory / White Plastic Housing ---
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, H)

  // Outer beveled border & rounded casing effect
  ctx.lineWidth = 14
  ctx.strokeStyle = '#cbd5e1'
  ctx.strokeRect(14, 14, W - 28, H - 28)

  ctx.lineWidth = 4
  ctx.strokeStyle = '#e2e8f0'
  ctx.strokeRect(30, 30, W - 60, H - 60)

  // Brand and Silkscreen Header on Top Border
  ctx.fillStyle = '#64748b'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('CURIOLABS ELECTRONICS & COMMUNICATION ENGINEERING BENCH', 70, 68)
  ctx.textAlign = 'right'
  ctx.fillText('LAB KIT 4051-TDM • REV 2.4', W - 70, 68)

  // --- Center Divider Ravine (IC Valley) ---
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(startX - 50, centerGrooveY - 32, (COLS - 1) * colSpacing + 100, 64)
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 3
  ctx.strokeRect(startX - 50, centerGrooveY - 32, (COLS - 1) * colSpacing + 100, 64)

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('• • • IC DIP SOCKET RAVINE (COLUMNS 1 TO 30) • • •', W / 2, centerGrooveY + 6)

  // --- Power Rails: Red (+) and Blue (-) Lines & Labels ---
  const drawPowerRail = (y, color, isPos) => {
    // Background highlight strip
    ctx.fillStyle = isPos ? 'rgba(254, 226, 226, 0.6)' : 'rgba(219, 234, 254, 0.6)'
    ctx.fillRect(startX - 50, y - 18, (COLS - 1) * colSpacing + 100, 36)

    // Solid line
    ctx.strokeStyle = color
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(startX - 40, isPos ? y - 18 : y + 18)
    ctx.lineTo(startX + (COLS - 1) * colSpacing + 40, isPos ? y - 18 : y + 18)
    ctx.stroke()

    // Polarity sign on left and right
    ctx.fillStyle = color
    ctx.font = 'bold 32px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(isPos ? '+' : '−', startX - 70, y + 10)
    ctx.fillText(isPos ? '+' : '−', startX + (COLS - 1) * colSpacing + 70, y + 10)
  }

  drawPowerRail(railTopPos, '#ef4444', true)
  drawPowerRail(railTopNeg, '#3b82f6', false)
  drawPowerRail(railBotPos, '#ef4444', true)
  drawPowerRail(railBotNeg, '#3b82f6', false)

  // --- Contact Tie-Point Holes Drawing Helper ---
  const drawHole = (x, y) => {
    // Outer metallic bevel ring
    ctx.beginPath()
    ctx.arc(x, y, 7.5, 0, Math.PI * 2)
    ctx.fillStyle = '#e2e8f0'
    ctx.fill()
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Dark square/round metallic phosphor bronze receptacle center
    ctx.beginPath()
    ctx.rect(x - 3.8, y - 3.8, 7.6, 7.6)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
  }

  // Draw holes on Power Rails
  for (let c = 1; c <= COLS; c++) {
    const x = getColX(c)
    drawHole(x, railTopPos)
    drawHole(x, railTopNeg)
    drawHole(x, railBotPos)
    drawHole(x, railBotNeg)
  }

  // Draw Column Numbers at Top and Bottom
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  for (let c = 1; c <= COLS; c++) {
    const x = getColX(c)
    if (c === 1 || c % 5 === 0) {
      ctx.fillText(c.toString(), x, 215)
      ctx.fillText(c.toString(), x, 830)
    }
  }

  // Draw Row Letters A-E and F-J on Left and Right
  const lettersTop = ['A', 'B', 'C', 'D', 'E']
  const lettersBot = ['F', 'G', 'H', 'I', 'J']

  ctx.fillStyle = '#475569'
  ctx.font = 'bold 18px monospace'

  lettersTop.forEach((letter, idx) => {
    const y = rowsTop[idx]
    ctx.textAlign = 'center'
    ctx.fillText(letter, startX - 70, y + 6)
    ctx.fillText(letter, startX + (COLS - 1) * colSpacing + 70, y + 6)

    for (let c = 1; c <= COLS; c++) {
      drawHole(getColX(c), y)
    }
  })

  lettersBot.forEach((letter, idx) => {
    const y = rowsBot[idx]
    ctx.textAlign = 'center'
    ctx.fillText(letter, startX - 70, y + 6)
    ctx.fillText(letter, startX + (COLS - 1) * colSpacing + 70, y + 6)

    for (let c = 1; c <= COLS; c++) {
      drawHole(getColX(c), y)
    }
  })

  // --- IC 1 & IC 2 Silkscreen Footprint Outlines on Breadboard ---
  const drawICFootprint = (startCol, endCol, icName, desc, accentColor) => {
    const x1 = getColX(startCol) - 26
    const x2 = getColX(endCol) + 26
    const w = x2 - x1
    const y = rowsTop[4] + 8
    const h = rowsBot[0] - rowsTop[4] - 16

    // Semi-transparent colored footprint
    ctx.fillStyle = 'rgba(15, 23, 42, 0.04)'
    ctx.fillRect(x1, y, w, h)

    ctx.strokeStyle = accentColor
    ctx.lineWidth = 2.5
    ctx.setLineDash([6, 4])
    ctx.strokeRect(x1, y, w, h)
    ctx.setLineDash([])

    // Pin 1 Index Notch on Left
    ctx.beginPath()
    ctx.arc(x1, centerGrooveY, 12, -Math.PI / 2, Math.PI / 2)
    ctx.fillStyle = accentColor
    ctx.fill()

    // Footprint Text
    ctx.fillStyle = accentColor
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(icName, (x1 + x2) / 2, centerGrooveY - 8)
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(desc, (x1 + x2) / 2, centerGrooveY + 16)
  }

  drawICFootprint(7, 14, 'IC1: CD4051BE', '8-CHANNEL MULTIPLEXER', '#0284c7')
  drawICFootprint(17, 24, 'IC2: CD4051BE', '8-CHANNEL DEMULTIPLEXER', '#7c3aed')

  // --- IC Pin Legend Badges Printed on Breadboard ---
  const drawPinTag = (col, isTop, label, color) => {
    const x = getColX(col)
    const y = isTop ? rowsTop[0] - 28 : rowsBot[4] + 32

    ctx.fillStyle = color || '#334155'
    ctx.beginPath()
    ctx.roundRect(x - 22, y - 11, 44, 18, 4)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y + 3)
  }

  // IC1 MUX Pinout Tags
  drawPinTag(7, true, 'CH4', '#475569')
  drawPinTag(8, true, 'CH6', '#475569')
  drawPinTag(9, true, 'TDM', '#9333ea')
  drawPinTag(10, true, 'CH7', '#475569')
  drawPinTag(11, true, 'CH5', '#475569')
  drawPinTag(12, true, 'INH', '#1e293b')
  drawPinTag(13, true, 'VEE', '#1e293b')
  drawPinTag(14, true, 'VSS', '#1e293b')

  drawPinTag(7, false, 'VDD', '#ef4444')
  drawPinTag(8, false, 'CH2', '#475569')
  drawPinTag(9, false, 'X1', '#10b981')
  drawPinTag(10, false, 'X0', '#0284c7')
  drawPinTag(11, false, 'CH3', '#475569')
  drawPinTag(12, false, 'CLK', '#2563eb')
  drawPinTag(13, false, 'B', '#1e293b')
  drawPinTag(14, false, 'C', '#1e293b')

  // IC2 DEMUX Pinout Tags
  drawPinTag(17, true, 'Y4', '#475569')
  drawPinTag(18, true, 'Y6', '#475569')
  drawPinTag(19, true, 'COM', '#9333ea')
  drawPinTag(20, true, 'Y7', '#475569')
  drawPinTag(21, true, 'Y5', '#475569')
  drawPinTag(22, true, 'INH', '#1e293b')
  drawPinTag(23, true, 'VEE', '#1e293b')
  drawPinTag(24, true, 'VSS', '#1e293b')

  drawPinTag(17, false, 'VDD', '#ef4444')
  drawPinTag(18, false, 'Y2', '#475569')
  drawPinTag(19, false, 'REC1', '#059669')
  drawPinTag(20, false, 'REC0', '#0284c7')
  drawPinTag(21, false, 'Y3', '#475569')
  drawPinTag(22, false, 'CLK', '#2563eb')
  drawPinTag(23, false, 'B', '#1e293b')
  drawPinTag(24, false, 'C', '#1e293b')

  // --- RC Low-Pass Filter Region Silkscreen ---
  ctx.fillStyle = '#065f46'
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('LPF FILTER 1: R1 (10kΩ) + C1 (0.1µF)', getColX(25), rowsBot[4] + 28)
  ctx.fillText('LPF FILTER 2: R2 (10kΩ) + C2 (0.1µF)', getColX(25), rowsBot[4] + 48)

  // Power Rail Status Silkscreen on Far Right
  ctx.fillStyle = isCircuitPowered ? '#059669' : '#dc2626'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(isCircuitPowered ? '● POWER ON (+5.0V)' : '○ POWER OFF (0.0V)', W - 60, railTopPos + 6)
  ctx.fillText(isCircuitPowered ? '● COMMON GND (0V)' : '○ COMMON GND', W - 60, railTopNeg + 6)

  // Create CanvasTexture
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true

  // ════════════════════════════════════════════════════════
  // 2. 3D BREADBOARD BASE GEOMETRY
  // ════════════════════════════════════════════════════════
  const boardWidth = 10.0
  const boardHeight = 0.45
  const boardDepth = 5.0

  // Multi-material box so top face displays the photorealistic canvas texture
  const sideMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.6,
    metalness: 0.05
  })
  const topMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.45,
    metalness: 0.05
  })

  // Box faces order: +X, -X, +Y (Top), -Y (Bottom), +Z, -Z
  const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]
  const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth), materials)
  boardMesh.castShadow = true
  boardMesh.receiveShadow = true
  group.add(boardMesh)

  // ════════════════════════════════════════════════════════
  // 3. PHYSICAL 3D DUAL-IC 4051 CHIPS
  // ════════════════════════════════════════════════════════
  // 3D coordinate converter from 2D canvas column/row to 3D position
  const to3D = (col, rowName) => {
    // X axis: startX -> -boardWidth/2 * 0.88 to +boardWidth/2 * 0.88
    const normX = (getColX(col) - startX) / (getColX(COLS) - startX) // 0 to 1
    const x3D = (normX - 0.5) * (boardWidth * 0.84)

    let yPixel = centerGrooveY
    if (rowName === 'topRailPos') yPixel = railTopPos
    else if (rowName === 'topRailNeg') yPixel = railTopNeg
    else if (rowName === 'botRailPos') yPixel = railBotPos
    else if (rowName === 'botRailNeg') yPixel = railBotNeg
    else if (rowsTop.includes(rowName)) yPixel = rowName
    else if (rowsBot.includes(rowName)) yPixel = rowName
    else {
      const topIdx = lettersTop.indexOf(rowName)
      if (topIdx >= 0) yPixel = rowsTop[topIdx]
      const botIdx = lettersBot.indexOf(rowName)
      if (botIdx >= 0) yPixel = rowsBot[botIdx]
    }

    // Z axis: 0 (top) to H (bottom) mapped to -boardDepth/2 to +boardDepth/2
    const normZ = yPixel / H // 0 to 1
    const z3D = (normZ - 0.5) * boardDepth

    return new THREE.Vector3(x3D, boardHeight / 2 + 0.01, z3D)
  }

  const make3DIC = (startCol, endCol, labelText) => {
    const icGroup = new THREE.Group()

    const pStart = to3D(startCol, 'E')
    const pEnd = to3D(endCol, 'E')
    const centerX = (pStart.x + pEnd.x) / 2
    const icWidth = Math.abs(pEnd.x - pStart.x) + 0.5
    const icDepth = 0.95
    const icHeight = 0.32

    // Matte black molded epoxy case with beveled edges
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.35,
      metalness: 0.2
    })
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(icWidth, icHeight, icDepth), bodyMat)
    bodyMesh.position.set(centerX, boardHeight / 2 + icHeight / 2 + 0.05, 0)
    bodyMesh.castShadow = true
    icGroup.add(bodyMesh)

    // Pin 1 Indicator Semi-Circle Notch
    const notchGeo = new THREE.CylinderGeometry(0.08, 0.08, icHeight + 0.01, 16, 1, false, 0, Math.PI)
    notchGeo.rotateZ(Math.PI / 2)
    const notchMat = new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.5 })
    const notch = new THREE.Mesh(notchGeo, notchMat)
    notch.position.set(centerX - icWidth / 2, boardHeight / 2 + icHeight / 2 + 0.05, 0)
    icGroup.add(notch)

    // Silver metallic lead pins
    const pinGeo = new THREE.BoxGeometry(0.06, 0.28, 0.08)
    const pinMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.95,
      roughness: 0.15
    })

    const numPinsPerSide = endCol - startCol + 1
    for (let i = 0; i < numPinsPerSide; i++) {
      const col = startCol + i
      const pTop = to3D(col, 'E')
      const pBot = to3D(col, 'F')

      const pin1 = new THREE.Mesh(pinGeo, pinMat)
      pin1.position.set(pTop.x, boardHeight / 2 + 0.1, -icDepth / 2)
      icGroup.add(pin1)

      const pin2 = new THREE.Mesh(pinGeo, pinMat)
      pin2.position.set(pBot.x, boardHeight / 2 + 0.1, icDepth / 2)
      icGroup.add(pin2)
    }

    // Top laser-etched text texture
    const tCanvas = document.createElement('canvas')
    tCanvas.width = 256
    tCanvas.height = 64
    const tCtx = tCanvas.getContext('2d')
    tCtx.fillStyle = '#18181b'
    tCtx.fillRect(0, 0, 256, 64)
    tCtx.fillStyle = '#cbd5e1'
    tCtx.font = 'bold 24px monospace'
    tCtx.textAlign = 'center'
    tCtx.fillText(labelText, 128, 40)

    const topTex = new THREE.CanvasTexture(tCanvas)
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(icWidth * 0.9, icDepth * 0.6),
      new THREE.MeshBasicMaterial({ map: topTex })
    )
    labelMesh.rotation.x = -Math.PI / 2
    labelMesh.position.set(centerX, boardHeight / 2 + icHeight + 0.06, 0)
    icGroup.add(labelMesh)

    return icGroup
  }

  group.add(make3DIC(7, 14, 'CD4051BE TDM'))
  group.add(make3DIC(17, 24, 'CD4051BE DEMUX'))

  // ════════════════════════════════════════════════════════
  // 4. PHYSICAL 3D DISCRETE PASSIVES (R1, R2, C1, C2)
  // ════════════════════════════════════════════════════════
  // 10 kΩ Resistor with color bands (Brown, Black, Orange, Gold)
  const makeResistor = (pos1, pos2) => {
    const resGroup = new THREE.Group()
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5)
    mid.y += 0.18

    // Body (Tan ceramic)
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#f5deb3', roughness: 0.4 })
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 16), bodyMat)
    body.rotation.z = Math.PI / 2
    body.position.copy(mid)
    resGroup.add(body)

    // Color bands: Brown (1), Black (0), Orange (1k), Gold (5%)
    const bandColors = ['#854d0e', '#18181b', '#ea580c', '#eab308']
    bandColors.forEach((color, i) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.082, 0.05, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
      )
      band.rotation.z = Math.PI / 2
      band.position.set(mid.x - 0.14 + i * 0.09, mid.y, mid.z)
      resGroup.add(band)
    })

    // Metal lead wire bent into holes
    const curve = new THREE.CatmullRomCurve3([pos1, new THREE.Vector3(pos1.x, mid.y, pos1.z), mid, new THREE.Vector3(pos2.x, mid.y, pos2.z), pos2])
    const lead = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.02, 8, false),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 })
    )
    resGroup.add(lead)
    return resGroup
  }

  // Capacitor (0.1 µF tan ceramic disc with leads)
  const makeCapacitor = (pos1, pos2) => {
    const capGroup = new THREE.Group()
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5)
    mid.y += 0.22

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 })
    )
    disc.rotation.x = Math.PI / 2
    disc.position.copy(mid)
    capGroup.add(disc)

    const curve = new THREE.CatmullRomCurve3([pos1, new THREE.Vector3(pos1.x, mid.y, pos1.z), mid, new THREE.Vector3(pos2.x, mid.y, pos2.z), pos2])
    const lead = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.02, 8, false),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 })
    )
    capGroup.add(lead)
    return capGroup
  }

  // R1 on Demux output Y0 (Col 20 to Col 26) & C1 to Ground Rail
  const pY0 = to3D(20, 'G')
  const pFilt0 = to3D(26, 'G')
  const pGndBot = to3D(26, 'botRailNeg')
  group.add(makeResistor(pY0, pFilt0))
  group.add(makeCapacitor(pFilt0, pGndBot))

  // R2 on Demux output Y1 (Col 19 to Col 28) & C2 to Ground Rail
  const pY1 = to3D(19, 'H')
  const pFilt1 = to3D(28, 'H')
  const pGndBot2 = to3D(28, 'botRailNeg')
  group.add(makeResistor(pY1, pFilt1))
  group.add(makeCapacitor(pFilt1, pGndBot2))

  // ════════════════════════════════════════════════════════
  // 5. HIGH-FIDELITY 3D JUMPER WIRES WITH GOLD TERMINALS
  // ════════════════════════════════════════════════════════
  const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 12)
  const pinMat = new THREE.MeshStandardMaterial({
    color: '#facc15',
    metalness: 0.9,
    roughness: 0.2
  })

  const makeJumperWire = (p1, p2, color, arc = 0.5) => {
    const wireGroup = new THREE.Group()

    // Gold terminal pins at insertion points
    const t1 = new THREE.Mesh(pinGeo, pinMat)
    t1.position.copy(p1)
    t1.position.y += 0.08
    wireGroup.add(t1)

    const t2 = new THREE.Mesh(pinGeo, pinMat)
    t2.position.copy(p2)
    t2.position.y += 0.08
    wireGroup.add(t2)

    // Smooth arched natural wire curve
    const dist = p1.distanceTo(p2)
    const mid = new THREE.Vector3(
      (p1.x + p2.x) / 2,
      Math.max(p1.y, p2.y) + arc + dist * 0.12,
      (p1.z + p2.z) / 2
    )

    const curve = new THREE.CatmullRomCurve3([p1, mid, p2])
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 28, 0.055, 10, false),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.35,
        metalness: 0.15
      })
    )
    wireGroup.add(tube)
    return wireGroup
  }

  // --- 1. Power Supply (+5V VDD) Wires (Red) ---
  // Top rail +5V to IC1 Pin 16 (Col 7, Row F)
  group.add(makeJumperWire(to3D(7, 'topRailPos'), to3D(7, 'J'), '#ef4444', 0.55))
  // Top rail +5V to IC2 Pin 16 (Col 17, Row F)
  group.add(makeJumperWire(to3D(17, 'topRailPos'), to3D(17, 'J'), '#dc2626', 0.55))

  // --- 2. Ground Reference (0V VSS, VEE, INH) Wires (Dark Slate) ---
  // IC1 Ground: Pin 8 (Col 14, Row E) to Top Rail (-)
  group.add(makeJumperWire(to3D(14, 'A'), to3D(14, 'topRailNeg'), '#1e293b', 0.45))
  // IC1 INH & VEE: Pins 6 & 7 (Col 12 & 13) to Top Rail (-)
  group.add(makeJumperWire(to3D(12, 'A'), to3D(12, 'topRailNeg'), '#334155', 0.4))
  // IC1 Address B & C Grounding: Pins 10 & 9 (Col 13 & 14, Row F) to Bottom Rail (-)
  group.add(makeJumperWire(to3D(13, 'J'), to3D(13, 'botRailNeg'), '#1e293b', 0.4))
  group.add(makeJumperWire(to3D(14, 'J'), to3D(14, 'botRailNeg'), '#1e293b', 0.4))

  // IC2 Ground: Pin 8 (Col 24, Row E) to Top Rail (-)
  group.add(makeJumperWire(to3D(24, 'A'), to3D(24, 'topRailNeg'), '#1e293b', 0.45))
  // IC2 INH & VEE: Pin 6 (Col 22) to Top Rail (-)
  group.add(makeJumperWire(to3D(22, 'A'), to3D(22, 'topRailNeg'), '#334155', 0.4))
  // IC2 Address B & C Grounding: Pins 10 & 9 (Col 23 & 24, Row F) to Bottom Rail (-)
  group.add(makeJumperWire(to3D(23, 'J'), to3D(23, 'botRailNeg'), '#1e293b', 0.4))
  group.add(makeJumperWire(to3D(24, 'J'), to3D(24, 'botRailNeg'), '#1e293b', 0.4))

  // --- 3. Step 6: TDM Composite Bus Bridge (Pin 3 MUX -> Pin 3 DEMUX) (Hot Magenta) ---
  // IC1 Pin 3 (Col 9, Row E) to IC2 Pin 3 (Col 19, Row E)
  group.add(makeJumperWire(to3D(9, 'B'), to3D(19, 'B'), '#d946ef', 0.75))

  // --- 4. Step 4: Clock Synchronous Bus Bridge (Pin 11 MUX -> Pin 11 DEMUX) (Electric Blue) ---
  // IC1 Pin 11 (Col 12, Row F) to IC2 Pin 11 (Col 22, Row F)
  group.add(makeJumperWire(to3D(12, 'I'), to3D(22, 'I'), '#3b82f6', 0.7))

  // --- 5. Step 3: Message Signal 1 (100Hz Sine) to IC1 Pin 13 (Col 10, Row F) (Bright Sky Cyan) ---
  // Comes from virtual bench generator on left
  const pSig0Input = new THREE.Vector3(-boardWidth / 2 - 0.6, boardHeight / 2 + 0.35, to3D(10, 'I').z)
  group.add(makeJumperWire(pSig0Input, to3D(10, 'I'), '#0284c7', 0.65))

  // --- 6. Step 3: Message Signal 2 (300Hz Triangle) to IC1 Pin 14 (Col 9, Row F) (Emerald Green) ---
  const pSig1Input = new THREE.Vector3(-boardWidth / 2 - 0.6, boardHeight / 2 + 0.25, to3D(9, 'I').z)
  group.add(makeJumperWire(pSig1Input, to3D(9, 'I'), '#10b981', 0.65))

  // --- 7. Step 4: Control Clock Input (2kHz Square) to IC1 Pin 11 (Col 12, Row F) (Royal Blue) ---
  const pClkInput = new THREE.Vector3(-boardWidth / 2 - 0.6, boardHeight / 2 + 0.15, to3D(12, 'I').z + 0.2)
  group.add(makeJumperWire(pClkInput, to3D(12, 'H'), '#2563eb', 0.6))

  // --- 8. Oscilloscope Test Probes with Glowing Probe Clips ---
  const makeProbeClip = (targetPos, color, labelText) => {
    const probeGroup = new THREE.Group()

    // Clip body
    const clipMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      metalness: 0.3,
      roughness: 0.2
    })
    const clip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.45, 14), clipMat)
    clip.position.copy(targetPos)
    clip.position.y += 0.26
    clip.rotation.x = -0.3
    probeGroup.add(clip)

    // Silver probe tip hooked into hole
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: '#f1f5f9', metalness: 0.95 })
    )
    tip.position.copy(targetPos)
    tip.position.y += 0.08
    probeGroup.add(tip)

    // Coiled cable exiting to the right
    const exitPos = new THREE.Vector3(boardWidth / 2 + 0.6, boardHeight / 2 + 0.2, targetPos.z)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(targetPos.x, targetPos.y + 0.45, targetPos.z),
      new THREE.Vector3(targetPos.x + 0.6, targetPos.y + 0.6, targetPos.z),
      exitPos
    ])
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.035, 8, false),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 })
    )
    probeGroup.add(cable)

    return probeGroup
  }

  // Probe 1: TDM Bus Output (IC1 Pin 3)
  group.add(makeProbeClip(to3D(9, 'A'), '#a855f7', 'PROBE TDM'))
  // Probe 2: Filter 0 Output (Recovered 100Hz Sine)
  group.add(makeProbeClip(pFilt0, '#0284c7', 'PROBE REC0'))
  // Probe 3: Filter 1 Output (Recovered 300Hz Triangle)
  group.add(makeProbeClip(pFilt1, '#059669', 'PROBE REC1'))

  // ════════════════════════════════════════════════════════
  // 6. LIVE POWER & CLOCK STATUS LEDS
  // ════════════════════════════════════════════════════════
  // Power Status LED on breadboard rail
  const pLedPos = to3D(2, 'topRailPos')
  pLedPos.y += 0.12
  const ledColor = isCircuitPowered ? '#22c55e' : '#64748b'
  const ledMat = new THREE.MeshStandardMaterial({
    color: ledColor,
    emissive: ledColor,
    emissiveIntensity: isCircuitPowered ? 0.9 : 0.05,
    roughness: 0.1
  })
  const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), ledMat)
  ledMesh.position.copy(pLedPos)
  group.add(ledMesh)

  // Point light for vivid realistic illumination over breadboard
  if (isCircuitPowered) {
    const ledLight = new THREE.PointLight('#22c55e', 0.8, 2.5)
    ledLight.position.copy(pLedPos)
    ledLight.position.y += 0.15
    group.add(ledLight)
  }

  return group
}
