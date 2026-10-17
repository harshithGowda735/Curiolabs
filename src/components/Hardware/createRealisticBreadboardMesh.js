import * as THREE from 'three'

/**
 * Creates an ultra-realistic, university lab-grade 3D breadboard assembly
 * matching authentic 830-tie-point physical solderless breadboards (e.g. MB-102),
 * with dual CD4051BE DIP-16 ICs, passive filter components, realistic PVC jumper wires,
 * DuPont connector boots, binding post banana terminals, and live status LEDs.
 */
export function createRealisticBreadboardMesh({ isCircuitPowered = true, clkFreq = 2.0 } = {}) {
  const group = new THREE.Group()

  // ════════════════════════════════════════════════════════
  // 1. GENERATE ULTRA-HIGH RESOLUTION 2048x1024 BREADBOARD TEXTURE
  // ════════════════════════════════════════════════════════
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  const W = 2048
  const H = 1024
  const COLS = 30
  const startX = 200
  const colSpacing = (W - 400) / (COLS - 1)

  // Top and Bottom row Y-coordinates on the texture
  const railTopPos = 104
  const railTopNeg = 156
  const rowsTop = [240, 286, 332, 378, 424] // A, B, C, D, E
  const centerGrooveY = 512
  const rowsBot = [600, 646, 692, 738, 784] // F, G, H, I, J
  const railBotPos = 868
  const railBotNeg = 920

  const getColX = (c) => startX + (c - 1) * colSpacing

  // --- Background: Authentic Off-White / Cream Lab ABS Plastic ---
  ctx.fillStyle = '#faf8f5'
  ctx.fillRect(0, 0, W, H)

  // Subtle fine textured ABS plastic grain overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.015)'
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * W
    const ry = Math.random() * H
    ctx.fillRect(rx, ry, 2, 2)
  }

  // Outer beveled rounded casing margin
  ctx.lineWidth = 12
  ctx.strokeStyle = '#e2ded5'
  ctx.strokeRect(12, 12, W - 24, H - 24)

  ctx.lineWidth = 4
  ctx.strokeStyle = '#d5cebf'
  ctx.strokeRect(26, 26, W - 52, H - 52)

  // Silkscreen Brand & Lab Identification
  ctx.fillStyle = '#473b33'
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('CURIOLABS SOLDERLESS BREADBOARD • MB-102 HIGH PRECISION', 70, 64)

  ctx.textAlign = 'right'
  ctx.font = 'bold 20px monospace'
  ctx.fillStyle = '#786b59'
  ctx.fillText('TDM & DEMUX DUAL CD4051BE TESTBENCH', W - 70, 64)

  // --- Center IC DIP Ravine (Center Divider Trench) ---
  ctx.fillStyle = '#ebe6db'
  ctx.fillRect(startX - 60, centerGrooveY - 34, (COLS - 1) * colSpacing + 120, 68)
  
  // Center trench shadow for 3D depth
  ctx.strokeStyle = '#cfc6b4'
  ctx.lineWidth = 3
  ctx.strokeRect(startX - 60, centerGrooveY - 34, (COLS - 1) * colSpacing + 120, 68)

  // Center trench inner shadow lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.fillRect(startX - 60, centerGrooveY - 34, (COLS - 1) * colSpacing + 120, 6)
  ctx.fillRect(startX - 60, centerGrooveY + 28, (COLS - 1) * colSpacing + 120, 6)

  ctx.fillStyle = '#8c7e6c'
  ctx.font = 'bold 15px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('◄◄◄ IC DIP-16 SOCKET CHANNEL (PINS 1–8 TOP / PINS 9–16 BOTTOM) ►►►', W / 2, centerGrooveY + 5)

  // --- Power Bus Strips: Red (+) and Blue (-) Lines & Labels ---
  const drawPowerRail = (y, color, isPos) => {
    // Subtle background tint for rail identification
    ctx.fillStyle = isPos ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)'
    ctx.fillRect(startX - 60, y - 20, (COLS - 1) * colSpacing + 120, 40)

    // Vibrant solid polarity stripe
    ctx.strokeStyle = color
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(startX - 50, isPos ? y - 18 : y + 18)
    ctx.lineTo(startX + (COLS - 1) * colSpacing + 50, isPos ? y - 18 : y + 18)
    ctx.stroke()

    // Polarity Symbols (+ and -)
    ctx.fillStyle = color
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(isPos ? '+' : '−', startX - 85, y + 12)
    ctx.fillText(isPos ? '+' : '−', startX + (COLS - 1) * colSpacing + 85, y + 12)
  }

  drawPowerRail(railTopPos, '#ef4444', true)
  drawPowerRail(railTopNeg, '#2563eb', false)
  drawPowerRail(railBotPos, '#ef4444', true)
  drawPowerRail(railBotNeg, '#2563eb', false)

  // --- Contact Tie-Point Holes Drawing Helper ---
  // Real breadboards feature square holes with internal phosphor bronze spring clips
  const drawTieHole = (x, y) => {
    // Outer plastic bevel chamfer
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#e8e3d8'
    ctx.fill()
    ctx.strokeStyle = '#d0c8b8'
    ctx.lineWidth = 1.2
    ctx.stroke()

    // Receptacle hole opening (slightly rounded square)
    ctx.fillStyle = '#1e1c18'
    ctx.beginPath()
    ctx.roundRect(x - 4.2, y - 4.2, 8.4, 8.4, 1.5)
    ctx.fill()

    // Internal phosphor bronze spring contacts (golden-metallic glint inside hole)
    ctx.fillStyle = '#92784e'
    ctx.fillRect(x - 2.8, y - 1.2, 1.5, 2.4)
    ctx.fillRect(x + 1.3, y - 1.2, 1.5, 2.4)
  }

  // Draw holes on Power Rails
  for (let c = 1; c <= COLS; c++) {
    const x = getColX(c)
    drawTieHole(x, railTopPos)
    drawTieHole(x, railTopNeg)
    drawTieHole(x, railBotPos)
    drawTieHole(x, railBotNeg)
  }

  // Draw Column Numbers at Top and Bottom
  ctx.fillStyle = '#524538'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  for (let c = 1; c <= COLS; c++) {
    const x = getColX(c)
    if (c === 1 || c % 5 === 0) {
      ctx.fillText(c.toString(), x, 214)
      ctx.fillText(c.toString(), x, 832)
    }
  }

  // Draw Row Letters A-E and F-J on Left and Right
  const lettersTop = ['A', 'B', 'C', 'D', 'E']
  const lettersBot = ['F', 'G', 'H', 'I', 'J']

  ctx.fillStyle = '#524538'
  ctx.font = 'bold 18px monospace'

  lettersTop.forEach((letter, idx) => {
    const y = rowsTop[idx]
    ctx.textAlign = 'center'
    ctx.fillText(letter, startX - 85, y + 6)
    ctx.fillText(letter, startX + (COLS - 1) * colSpacing + 85, y + 6)

    for (let c = 1; c <= COLS; c++) {
      drawTieHole(getColX(c), y)
    }
  })

  lettersBot.forEach((letter, idx) => {
    const y = rowsBot[idx]
    ctx.textAlign = 'center'
    ctx.fillText(letter, startX - 85, y + 6)
    ctx.fillText(letter, startX + (COLS - 1) * colSpacing + 85, y + 6)

    for (let c = 1; c <= COLS; c++) {
      drawTieHole(getColX(c), y)
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
    ctx.fillStyle = 'rgba(34, 22, 17, 0.05)'
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
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.fillText(desc, (x1 + x2) / 2, centerGrooveY + 16)
  }

  drawICFootprint(7, 14, 'IC1: CD4051BE', '8-CH ANALOG MUX', '#0284c7')
  drawICFootprint(17, 24, 'IC2: CD4051BE', '8-CH ANALOG DEMUX', '#7c3aed')

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

  // Power Rail Status Silkscreen on Far Right
  ctx.fillStyle = isCircuitPowered ? '#059669' : '#dc2626'
  ctx.font = 'bold 15px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(isCircuitPowered ? '● +5.0V ACTIVE' : '○ 0.0V INACTIVE', W - 60, railTopPos + 6)
  ctx.fillText('● 0V COMMON GND', W - 60, railTopNeg + 6)

  // Create CanvasTexture
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16
  texture.needsUpdate = true

  // ════════════════════════════════════════════════════════
  // 2. 3D BREADBOARD BASE GEOMETRY WITH INTERLOCKING TABS
  // ════════════════════════════════════════════════════════
  const boardWidth = 10.4
  const boardHeight = 0.52
  const boardDepth = 5.2

  // Multi-material box so top face displays the photorealistic canvas texture
  const sideMat = new THREE.MeshStandardMaterial({
    color: '#eae5d9',
    roughness: 0.55,
    metalness: 0.04
  })
  const topMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.42,
    metalness: 0.03
  })

  // Box faces order: +X, -X, +Y (Top), -Y (Bottom), +Z, -Z
  const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]
  const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth), materials)
  boardMesh.castShadow = true
  boardMesh.receiveShadow = true
  group.add(boardMesh)

  // Real breadboard side interlocking tabs (dovetail joints)
  const tabGeo = new THREE.BoxGeometry(0.18, 0.32, 0.45)
  const tabPositions = [
    [-boardWidth / 2 - 0.08, 0, -1.2],
    [-boardWidth / 2 - 0.08, 0, 1.2],
    [boardWidth / 2 + 0.08, 0, -1.2],
    [boardWidth / 2 + 0.08, 0, 1.2]
  ]
  tabPositions.forEach(([tx, ty, tz]) => {
    const tab = new THREE.Mesh(tabGeo, sideMat)
    tab.position.set(tx, ty, tz)
    group.add(tab)
  })

  // Underneath: 4 molded black rubber feet
  const footGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 16)
  const footMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9 })
  const footPositions = [
    [-boardWidth / 2 + 0.6, -boardHeight / 2 - 0.05, -boardDepth / 2 + 0.6],
    [boardWidth / 2 - 0.6, -boardHeight / 2 - 0.05, -boardDepth / 2 + 0.6],
    [-boardWidth / 2 + 0.6, -boardHeight / 2 - 0.05, boardDepth / 2 - 0.6],
    [boardWidth / 2 - 0.6, -boardHeight / 2 - 0.05, boardDepth / 2 - 0.6]
  ]
  footPositions.forEach(([fx, fy, fz]) => {
    const foot = new THREE.Mesh(footGeo, footMat)
    foot.position.set(fx, fy, fz)
    group.add(foot)
  })

  // ════════════════════════════════════════════════════════
  // 3. TOP HEAVY-DUTY BINDING POST BANANA TERMINALS
  // ════════════════════════════════════════════════════════
  // Aluminum mounting bracket strip at the top
  const bracketGeo = new THREE.BoxGeometry(boardWidth * 0.92, 0.1, 0.7)
  const bracketMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.85, roughness: 0.25 })
  const bracket = new THREE.Mesh(bracketGeo, bracketMat)
  bracket.position.set(0, boardHeight / 2 + 0.05, -boardDepth / 2 - 0.35)
  group.add(bracket)

  const makeBindingPost = (xPos, color, labelText) => {
    const postGroup = new THREE.Group()
    postGroup.position.set(xPos, boardHeight / 2 + 0.1, -boardDepth / 2 - 0.35)

    // Base hex nut
    const nutGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 6)
    const nutMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 })
    const nut = new THREE.Mesh(nutGeo, nutMat)
    nut.position.y = 0.05
    postGroup.add(nut)

    // Colored insulated knurled post body
    const capMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.15 })
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.45, 18)
    const body = new THREE.Mesh(bodyGeo, capMat)
    body.position.y = 0.32
    body.castShadow = true
    postGroup.add(body)

    // Banana jack center hole
    const holeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 16)
    const holeMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.8 })
    const hole = new THREE.Mesh(holeGeo, holeMat)
    hole.position.y = 0.52
    postGroup.add(hole)

    return postGroup
  }

  // Red (+5V / VDD), Black (GND), Green (CHASSIS EARTH)
  group.add(makeBindingPost(-2.2, '#ef4444', '+5V VDD'))
  group.add(makeBindingPost(0.0, '#18181b', 'GND 0V'))
  group.add(makeBindingPost(2.2, '#15803d', 'EARTH'))

  // ════════════════════════════════════════════════════════
  // 4. PHYSICAL 3D DUAL-IC 4051 CHIPS (DIP-16)
  // ════════════════════════════════════════════════════════
  const to3D = (col, rowName) => {
    const normX = (getColX(col) - startX) / (getColX(COLS) - startX)
    const x3D = (normX - 0.5) * (boardWidth * 0.83)

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

    const normZ = yPixel / H
    const z3D = (normZ - 0.5) * boardDepth

    return new THREE.Vector3(x3D, boardHeight / 2 + 0.01, z3D)
  }

  const make3DIC = (startCol, endCol, chipTitle, partCode) => {
    const icGroup = new THREE.Group()

    const pStart = to3D(startCol, 'E')
    const pEnd = to3D(endCol, 'E')
    const centerX = (pStart.x + pEnd.x) / 2
    const icWidth = Math.abs(pEnd.x - pStart.x) + 0.52
    const icDepth = 1.05
    const icHeight = 0.36

    // Matte black molded epoxy case with beveled edges
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#1a1918',
      roughness: 0.32,
      metalness: 0.18
    })
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(icWidth, icHeight, icDepth), bodyMat)
    bodyMesh.position.set(centerX, boardHeight / 2 + icHeight / 2 + 0.08, 0)
    bodyMesh.castShadow = true
    icGroup.add(bodyMesh)

    // Pin 1 Index Notch on Left
    const notchGeo = new THREE.CylinderGeometry(0.1, 0.1, icHeight + 0.01, 16, 1, false, 0, Math.PI)
    notchGeo.rotateZ(Math.PI / 2)
    const notchMat = new THREE.MeshStandardMaterial({ color: '#262422', roughness: 0.5 })
    const notch = new THREE.Mesh(notchGeo, notchMat)
    notch.position.set(centerX - icWidth / 2, boardHeight / 2 + icHeight / 2 + 0.08, 0)
    icGroup.add(notch)

    // Pin 1 Dot Indentation
    const dotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12)
    const dotMat = new THREE.MeshStandardMaterial({ color: '#2c2927' })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(centerX - icWidth / 2 + 0.22, boardHeight / 2 + icHeight + 0.08, -icDepth / 3)
    icGroup.add(dot)

    // Silver metallic DIP lead pins (bent into breadboard)
    const pinGeo = new THREE.BoxGeometry(0.07, 0.36, 0.09)
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
      pin1.position.set(pTop.x, boardHeight / 2 + 0.12, -icDepth / 2)
      icGroup.add(pin1)

      const pin2 = new THREE.Mesh(pinGeo, pinMat)
      pin2.position.set(pBot.x, boardHeight / 2 + 0.12, icDepth / 2)
      icGroup.add(pin2)
    }

    // Top laser-etched text texture
    const tCanvas = document.createElement('canvas')
    tCanvas.width = 512
    tCanvas.height = 128
    const tCtx = tCanvas.getContext('2d')
    tCtx.fillStyle = '#1a1918'
    tCtx.fillRect(0, 0, 512, 128)
    
    // Laser etched markings
    tCtx.fillStyle = '#e2e8f0'
    tCtx.font = 'bold 36px monospace'
    tCtx.textAlign = 'center'
    tCtx.fillText(partCode, 256, 52)
    tCtx.font = 'bold 22px system-ui, sans-serif'
    tCtx.fillStyle = '#94a3b8'
    tCtx.fillText(chipTitle, 256, 92)

    const topTex = new THREE.CanvasTexture(tCanvas)
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(icWidth * 0.92, icDepth * 0.7),
      new THREE.MeshBasicMaterial({ map: topTex })
    )
    labelMesh.rotation.x = -Math.PI / 2
    labelMesh.position.set(centerX, boardHeight / 2 + icHeight + 0.082, 0)
    icGroup.add(labelMesh)

    return icGroup
  }

  group.add(make3DIC(7, 14, 'ANALOG MULTIPLEXER', 'CD4051BE (IC1)'))
  group.add(make3DIC(17, 24, 'ANALOG DEMULTIPLEXER', 'CD4051BE (IC2)'))

  // ════════════════════════════════════════════════════════
  // 5. PHYSICAL 3D DISCRETE PASSIVES (R1, R2, C1, C2)
  // ════════════════════════════════════════════════════════
  // 5.6 kΩ Resistor with color bands (Green, Blue, Red, Gold)
  const makeResistor = (pos1, pos2) => {
    const resGroup = new THREE.Group()
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5)
    mid.y += 0.22

    // Ceramic body (Tan/Beige)
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#fde68a', roughness: 0.35 })
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.46, 18), bodyMat)
    body.rotation.z = Math.PI / 2
    body.position.copy(mid)
    resGroup.add(body)

    // Color bands: Green (5), Blue (6), Red (x100), Gold (5%)
    const bandColors = ['#15803d', '#2563eb', '#dc2626', '#eab308']
    bandColors.forEach((color, i) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.093, 0.093, 0.05, 18),
        new THREE.MeshStandardMaterial({ color, roughness: 0.25 })
      )
      band.rotation.z = Math.PI / 2
      band.position.set(mid.x - 0.15 + i * 0.1, mid.y, mid.z)
      resGroup.add(band)
    })

    // Metal lead wire bent into holes
    const curve = new THREE.CatmullRomCurve3([
      pos1,
      new THREE.Vector3(pos1.x, mid.y, pos1.z),
      mid,
      new THREE.Vector3(pos2.x, mid.y, pos2.z),
      pos2
    ])
    const lead = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.024, 8, false),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.15 })
    )
    resGroup.add(lead)
    return resGroup
  }

  // 0.1 µF Disc Ceramic Capacitor
  const makeCapacitor = (pos1, pos2) => {
    const capGroup = new THREE.Group()
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5)
    mid.y += 0.26

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.07, 24),
      new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.45 })
    )
    disc.rotation.x = Math.PI / 2
    disc.position.copy(mid)
    capGroup.add(disc)

    const curve = new THREE.CatmullRomCurve3([
      pos1,
      new THREE.Vector3(pos1.x, mid.y, pos1.z),
      mid,
      new THREE.Vector3(pos2.x, mid.y, pos2.z),
      pos2
    ])
    const lead = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.024, 8, false),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.15 })
    )
    capGroup.add(lead)
    return capGroup
  }

  // Filter 0 (DEMUX Y0 out): R1 to Col 26, C1 to GND Rail
  const pY0 = to3D(20, 'G')
  const pFilt0 = to3D(26, 'G')
  const pGndBot = to3D(26, 'botRailNeg')
  group.add(makeResistor(pY0, pFilt0))
  group.add(makeCapacitor(pFilt0, pGndBot))

  // Filter 1 (DEMUX Y1 out): R2 to Col 28, C2 to GND Rail
  const pY1 = to3D(19, 'H')
  const pFilt1 = to3D(28, 'H')
  const pGndBot2 = to3D(28, 'botRailNeg')
  group.add(makeResistor(pY1, pFilt1))
  group.add(makeCapacitor(pFilt1, pGndBot2))

  // ════════════════════════════════════════════════════════
  // 6. HIGH-FIDELITY JUMPER WIRES WITH DUPONT PIN COLLARS
  // ════════════════════════════════════════════════════════
  const bootGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12)
  const bootMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.6 })

  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 10)
  const pinMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.2 })

  const makeJumperWire = (p1, p2, color, arc = 0.55) => {
    const wireGroup = new THREE.Group()

    // Dupont molded connector boots at insertion points
    const b1 = new THREE.Mesh(bootGeo, bootMat)
    b1.position.set(p1.x, p1.y + 0.11, p1.z)
    wireGroup.add(b1)

    const b2 = new THREE.Mesh(bootGeo, bootMat)
    b2.position.set(p2.x, p2.y + 0.11, p2.z)
    wireGroup.add(b2)

    // Smooth arched natural wire curve
    const dist = p1.distanceTo(p2)
    const mid = new THREE.Vector3(
      (p1.x + p2.x) / 2,
      Math.max(p1.y, p2.y) + arc + dist * 0.14,
      (p1.z + p2.z) / 2
    )

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(p1.x, p1.y + 0.18, p1.z),
      mid,
      new THREE.Vector3(p2.x, p2.y + 0.18, p2.z)
    ])

    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, 0.055, 12, false),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.22,
        metalness: 0.08
      })
    )
    tube.castShadow = true
    wireGroup.add(tube)
    return wireGroup
  }

  // --- 1. Power Supply (+5V VDD) Wires (Glossy Red) ---
  group.add(makeJumperWire(to3D(7, 'topRailPos'), to3D(7, 'J'), '#ef4444', 0.55))
  group.add(makeJumperWire(to3D(17, 'topRailPos'), to3D(17, 'J'), '#ef4444', 0.55))

  // --- 2. Ground Reference (0V VSS, VEE, INH) Wires (Deep Matte Charcoal) ---
  group.add(makeJumperWire(to3D(14, 'A'), to3D(14, 'topRailNeg'), '#18181b', 0.42))
  group.add(makeJumperWire(to3D(12, 'A'), to3D(12, 'topRailNeg'), '#27272a', 0.38))
  group.add(makeJumperWire(to3D(13, 'J'), to3D(13, 'botRailNeg'), '#18181b', 0.38))
  group.add(makeJumperWire(to3D(14, 'J'), to3D(14, 'botRailNeg'), '#18181b', 0.38))

  group.add(makeJumperWire(to3D(24, 'A'), to3D(24, 'topRailNeg'), '#18181b', 0.42))
  group.add(makeJumperWire(to3D(22, 'A'), to3D(22, 'topRailNeg'), '#27272a', 0.38))
  group.add(makeJumperWire(to3D(23, 'J'), to3D(23, 'botRailNeg'), '#18181b', 0.38))
  group.add(makeJumperWire(to3D(24, 'J'), to3D(24, 'botRailNeg'), '#18181b', 0.38))

  // --- 3. TDM Composite Bus Bridge (Pin 3 MUX -> Pin 3 DEMUX) (Vivid Magenta) ---
  group.add(makeJumperWire(to3D(9, 'B'), to3D(19, 'B'), '#c026d3', 0.78))

  // --- 4. Clock Synchronous Bus Bridge (Pin 11 MUX -> Pin 11 DEMUX) (Royal Blue) ---
  group.add(makeJumperWire(to3D(12, 'I'), to3D(22, 'I'), '#2563eb', 0.72))

  // --- 5. Message Signal 1 (100Hz Sine) to IC1 Pin 13 (Sky Cyan) ---
  const pSig0Input = new THREE.Vector3(-boardWidth / 2 - 0.7, boardHeight / 2 + 0.35, to3D(10, 'I').z)
  group.add(makeJumperWire(pSig0Input, to3D(10, 'I'), '#0284c7', 0.65))

  // --- 6. Message Signal 2 (300Hz Triangle) to IC1 Pin 14 (Emerald Green) ---
  const pSig1Input = new THREE.Vector3(-boardWidth / 2 - 0.7, boardHeight / 2 + 0.25, to3D(9, 'I').z)
  group.add(makeJumperWire(pSig1Input, to3D(9, 'I'), '#059669', 0.65))

  // --- 7. Control Clock Input (2kHz Square) to IC1 Pin 11 (Vibrant Indigo) ---
  const pClkInput = new THREE.Vector3(-boardWidth / 2 - 0.7, boardHeight / 2 + 0.15, to3D(12, 'I').z + 0.2)
  group.add(makeJumperWire(pClkInput, to3D(12, 'H'), '#4f46e5', 0.6))

  // ════════════════════════════════════════════════════════
  // 7. OSCILLOSCOPE TEST PROBES WITH GRABBER HOOKS & COAXIAL LEADS
  // ════════════════════════════════════════════════════════
  const makeProbeClip = (targetPos, color, labelText) => {
    const probeGroup = new THREE.Group()

    // Cylindrical probe body with channel identification colored ring
    const probeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.52, 16),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
    )
    probeBody.position.copy(targetPos)
    probeBody.position.y += 0.32
    probeBody.rotation.x = -0.32
    probeGroup.add(probeBody)

    // Channel color identification collar
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.082, 0.1, 16),
      new THREE.MeshStandardMaterial({ color, roughness: 0.2 })
    )
    band.position.copy(targetPos)
    band.position.y += 0.42
    band.rotation.x = -0.32
    probeGroup.add(band)

    // Fine metallic needle probe tip
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.95 })
    )
    tip.position.copy(targetPos)
    tip.position.y += 0.09
    probeGroup.add(tip)

    // Flexible coaxial cable exiting rightwards to oscilloscope
    const exitPos = new THREE.Vector3(boardWidth / 2 + 0.9, boardHeight / 2 + 0.25, targetPos.z)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(targetPos.x, targetPos.y + 0.55, targetPos.z),
      new THREE.Vector3(targetPos.x + 0.8, targetPos.y + 0.7, targetPos.z),
      exitPos
    ])
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.038, 8, false),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.65 })
    )
    probeGroup.add(cable)

    return probeGroup
  }

  // Probe 1: TDM Bus Output (IC1 Pin 3)
  group.add(makeProbeClip(to3D(9, 'A'), '#c026d3', 'PROBE TDM'))
  // Probe 2: Filter 0 Output (Recovered 100Hz Sine)
  group.add(makeProbeClip(pFilt0, '#0284c7', 'PROBE REC0'))
  // Probe 3: Filter 1 Output (Recovered 300Hz Triangle)
  group.add(makeProbeClip(pFilt1, '#059669', 'PROBE REC1'))

  // ════════════════════════════════════════════════════════
  // 8. LIVE POWER LED & AMBIENT ILLUMINATION
  // ════════════════════════════════════════════════════════
  const pLedPos = to3D(2, 'topRailPos')
  pLedPos.y += 0.14
  const ledColor = isCircuitPowered ? '#22c55e' : '#64748b'
  const ledMat = new THREE.MeshStandardMaterial({
    color: ledColor,
    emissive: ledColor,
    emissiveIntensity: isCircuitPowered ? 1.0 : 0.05,
    roughness: 0.1
  })
  const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), ledMat)
  ledMesh.position.copy(pLedPos)
  group.add(ledMesh)

  if (isCircuitPowered) {
    const ledLight = new THREE.PointLight('#22c55e', 0.9, 3.2)
    ledLight.position.copy(pLedPos)
    ledLight.position.y += 0.18
    group.add(ledLight)
  }

  return group
}
