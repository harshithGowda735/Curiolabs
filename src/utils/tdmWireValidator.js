/**
 * Intelligent Manual Wire Validation Engine for IC 4051 TDM Lab
 * Validates manual wire connections and provides friendly educational error diagnostics
 * when students connect to the wrong pins or terminals.
 */

// Helper to parse hole id e.g. "hole-F-10" or "hole-R_TP-5"
export function parseNode(nodeId) {
  if (!nodeId) return { type: 'unknown' }

  if (nodeId.startsWith('term-') || !nodeId.startsWith('hole-')) {
    const raw = nodeId.replace('term-', '')
    return { type: 'terminal', id: raw }
  }

  // hole-ROW-COL or hole-R_TP-COL
  const parts = nodeId.replace('hole-', '').split('-')
  if (parts.length >= 2) {
    const row = parts[0]
    const col = parseInt(parts[1], 10)
    const isTopRail = row === 'R_TP' || row === 'R_TM' || row === 'tp' || row === 'tm'
    const isBotRail = row === 'R_BP' || row === 'R_BM' || row === 'bp' || row === 'bm'
    const isPosRail = row === 'R_TP' || row === 'R_BP' || row === 'tp' || row === 'bp'
    const isNegRail = row === 'R_TM' || row === 'R_BM' || row === 'tm' || row === 'bm'
    const isTopSection = 'ABCDE'.includes(row)
    const isBotSection = 'FGHIJ'.includes(row)

    return {
      type: 'hole',
      row,
      col,
      isRail: isTopRail || isBotRail,
      isPosRail,
      isNegRail,
      isTopSection,
      isBotSection
    }
  }

  return { type: 'unknown' }
}

/**
 * Validates a connection between fromNode and toNode
 * Returns { isValid: boolean, error?: { title, where, why, fix, targetHoleId, targetLabel }, connection?: object }
 */
export function validateTdmConnection(from, to, currentWires = []) {
  if (!from || !to || from.id === to.id) {
    return { isValid: false, error: null } // No-op
  }

  const n1 = parseNode(from.id)
  const n2 = parseNode(to.id)

  // Prevent connecting terminal to terminal
  if (n1.type === 'terminal' && n2.type === 'terminal') {
    return {
      isValid: false,
      error: {
        title: 'Terminal-to-Terminal Not Allowed',
        where: `${from.label || from.id} ➔ ${to.label || to.id}`,
        why: 'Equipment terminals cannot be directly shorted together. Jumper wires must run between the bench instruments and the breadboard tie points.',
        fix: 'Connect this terminal wire into an active IC pin or power rail on the breadboard.',
        targetHoleId: null
      }
    }
  }

  // Arrange terminal first if one exists
  const termNode = n1.type === 'terminal' ? n1 : n2.type === 'terminal' ? n2 : null
  const termObj = n1.type === 'terminal' ? from : n2.type === 'terminal' ? to : null
  const holeNode = n1.type === 'hole' ? n1 : n2.type === 'hole' ? n2 : null
  const holeObj = n1.type === 'hole' ? from : n2.type === 'hole' ? to : null

  // ════════════════════════════════════════════════════════
  // 1. POWER SUPPLY CONNECTIONS (+5V DC Rail)
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'pwr') {
    // Valid: Connect to Pin 16 on IC1 (Col 7, bot) or IC2 (Col 17, bot) or +5V rail
    if (holeNode.isPosRail || (holeNode.col === 7 && holeNode.isBotSection) || (holeNode.col === 17 && holeNode.isBotSection)) {
      return {
        isValid: true,
        connection: {
          id: holeNode.col === 17 ? 'c_pwr_demux' : 'c_pwr_mux',
          label: `+5V ➔ Pin 16 (VDD)`,
          wireColor: '#ef4444'
        }
      }
    }

    // ERRORS FOR +5V
    if (holeNode.isNegRail || (holeNode.col === 14 && holeNode.isTopSection) || (holeNode.col === 24 && holeNode.isTopSection) || (holeNode.col === 12 && holeNode.isTopSection)) {
      return {
        isValid: false,
        error: {
          title: '💥 Severe Short-Circuit Hazard!',
          where: `+5V DC Supply ➔ ${holeObj.label || 'Ground Terminal'}`,
          why: 'You connected +5V DC Supply directly into Ground (0V / VSS)! This will blow the laboratory supply fuse and create a dead short.',
          fix: 'Connect +5V only to Pin 16 (VDD) at Column 7 or Column 17 (Bottom section).',
          targetHoleId: 'hole-F-7',
          targetLabel: 'IC1 Pin 16 (VDD +5V)'
        }
      }
    }

    if ((holeNode.col === 10 || holeNode.col === 9) && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Overvoltage on Signal Input',
          where: `+5V DC Supply ➔ ${holeObj.label}`,
          why: 'Pins 13 and 14 are delicate analog message inputs (X0 and X1) calibrated for 1.0 Vpp AC signals. +5V DC will saturate and damage the channel!',
          fix: 'Connect +5V supply only to Pin 16 (VDD) at Column 7 or 17.',
          targetHoleId: 'hole-F-7',
          targetLabel: 'IC1 Pin 16 (VDD)'
        }
      }
    }

    return {
      isValid: false,
      error: {
        title: '⚠ Miswired Power Line',
        where: `+5V DC Supply ➔ ${holeObj.label}`,
        why: 'IC 4051 CMOS switches require +5V strictly at Pin 16 (VDD) to energize the bilateral transmission gates.',
        fix: 'Connect the +5V supply wire to Pin 16 (Column 7 Bottom for IC1, or Column 17 Bottom for IC2).',
        targetHoleId: 'hole-F-7',
        targetLabel: 'IC1 Pin 16 (VDD)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 2. COMMON GROUND (0V GND)
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'gnd') {
    // Valid ground pins:
    // Pin 8 (VSS: Col 14 top, Col 24 top), Pin 6 (INH: Col 12, 22 top), Pin 7 (VEE: Col 13, 23 top)
    // Pin 9 & 10 (C & B: Col 14, 13 bot, Col 24, 23 bot)
    // Filter capacitor grounds (Col 26, 28 bot)
    // Ground rail holes
    const isIC1Gnd = (holeNode.col === 14 && holeNode.isTopSection) || (holeNode.col === 12 && holeNode.isTopSection) || (holeNode.col === 13 && holeNode.isTopSection) || (holeNode.col === 13 && holeNode.isBotSection) || (holeNode.col === 14 && holeNode.isBotSection)
    const isIC2Gnd = (holeNode.col === 24 && holeNode.isTopSection) || (holeNode.col === 22 && holeNode.isTopSection) || (holeNode.col === 23 && holeNode.isTopSection) || (holeNode.col === 23 && holeNode.isBotSection) || (holeNode.col === 24 && holeNode.isBotSection)
    const isCapGnd = (holeNode.col === 26 || holeNode.col === 28) && holeNode.isBotSection

    if (holeNode.isNegRail || isIC1Gnd || isIC2Gnd || isCapGnd) {
      return {
        isValid: true,
        connection: {
          id: holeNode.col >= 17 ? 'c_gnd_demux' : 'c_gnd_mux',
          label: `GND ➔ IC Ground / Rail`,
          wireColor: '#1e293b'
        }
      }
    }

    // ERRORS FOR GND
    if (holeNode.isPosRail || (holeNode.col === 7 && holeNode.isBotSection) || (holeNode.col === 17 && holeNode.isBotSection)) {
      return {
        isValid: false,
        error: {
          title: '💥 Short-Circuit Alert!',
          where: `Ground (0V) ➔ ${holeObj.label}`,
          why: 'You connected Ground into the +5V Power Rail (Pin 16 VDD)! This will short-circuit the DC power supply.',
          fix: 'Connect Ground (0V) to Pin 8 (VSS at Column 14/24 Top) or Pins 6/7 (INH/VEE).',
          targetHoleId: 'hole-E-14',
          targetLabel: 'IC1 Pin 8 (VSS Ground)'
        }
      }
    }

    if (holeNode.col === 9 && holeNode.isTopSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Signal Grounded (TDM Bus Killed)',
          where: `Ground (0V) ➔ IC1 Pin 3 (TDM Bus)`,
          why: 'Pin 3 is the multiplexed analog output! Grounding it forces the composite signal to 0V flatline.',
          fix: 'Pin 3 must bridge to IC2 Pin 3 (Demux Input), never to Ground!',
          targetHoleId: 'hole-E-19',
          targetLabel: 'IC2 Pin 3 (COM In)'
        }
      }
    }

    return {
      isValid: false,
      error: {
        title: '⚠ Incorrect Ground Connection',
        where: `Ground (0V) ➔ ${holeObj.label}`,
        why: 'In this experiment, Ground (0V) must connect to Pin 8 (VSS), Pin 6 (INH), Pin 7 (VEE), and Address Pins B & C (Pins 10 & 9).',
        fix: 'Connect Ground to Pin 8 (Column 14 Top for IC1, or Column 24 Top for IC2).',
        targetHoleId: 'hole-E-14',
        targetLabel: 'IC1 Pin 8 (VSS Ground)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 3. MESSAGE SIGNAL 1 (FG1 Sine 100Hz)
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'sig0') {
    // Valid: IC1 Pin 13 (X0: Col 10, bot)
    if (holeNode.col === 10 && holeNode.isBotSection) {
      return {
        isValid: true,
        connection: {
          id: 'c_sig_sine',
          label: 'FG1 Sine ➔ IC1 Pin 13 (X0)',
          wireColor: '#ca8a04'
        }
      }
    }

    // ERRORS
    if (holeNode.col === 9 && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Channel Allocation Mismatch',
          where: `FG1 (100Hz Sine) ➔ IC1 Pin 14 (X1 Input)`,
          why: 'You connected FG1 Sine into Pin 14 (Channel 1). As per Procedure Step 3 of the lab syllabus, Pin 14 is designated for the 300Hz Triangular wave, while Pin 13 is for the 100Hz Sinusoidal wave.',
          fix: 'Connect FG1 (Sine) to Pin 13 (X0) at Column 10 (Bottom section).',
          targetHoleId: 'hole-F-10',
          targetLabel: 'IC1 Pin 13 (X0 Sine In)'
        }
      }
    }

    if (holeNode.col === 12 && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Clock Address Miswired',
          where: `FG1 (100Hz Sine) ➔ IC1 Pin 11 (Select A)`,
          why: 'Pin 11 is the digital Address Clock line! It requires the 5V Square Wave from the Clock generator to switch channels, not an analog message wave.',
          fix: 'Connect FG1 Sine to Pin 13 (Column 10 Bottom), and connect the 2kHz Clock to Pin 11.',
          targetHoleId: 'hole-F-10',
          targetLabel: 'IC1 Pin 13 (X0 Sine In)'
        }
      }
    }

    return {
      isValid: false,
      error: {
        title: '⚠ Miswired Message Signal 1',
        where: `FG1 (100Hz Sine) ➔ ${holeObj.label}`,
        why: 'The 100Hz Sinusoidal wave must be injected into IC1 Pin 13 (Channel 0 Analog Input).',
        fix: 'Connect FG1 Sine to Pin 13 at Column 10 (Bottom section).',
        targetHoleId: 'hole-F-10',
        targetLabel: 'IC1 Pin 13 (X0 Sine In)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 4. MESSAGE SIGNAL 2 (FG2 Triangle 300Hz)
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'sig1') {
    // Valid: IC1 Pin 14 (X1: Col 9, bot)
    if (holeNode.col === 9 && holeNode.isBotSection) {
      return {
        isValid: true,
        connection: {
          id: 'c_sig_tri',
          label: 'FG2 Triangle ➔ IC1 Pin 14 (X1)',
          wireColor: '#16a34a'
        }
      }
    }

    // ERRORS
    if (holeNode.col === 10 && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Channel Allocation Mismatch',
          where: `FG2 (300Hz Triangle) ➔ IC1 Pin 13 (X0 Input)`,
          why: 'You connected FG2 Triangle into Pin 13. Pin 13 is designated for the 100Hz Sine wave, while Pin 14 is for the 300Hz Triangle wave.',
          fix: 'Connect FG2 (Triangle) to Pin 14 (X1) at Column 9 (Bottom section).',
          targetHoleId: 'hole-F-9',
          targetLabel: 'IC1 Pin 14 (X1 Triangle In)'
        }
      }
    }

    if (holeNode.col === 12 && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Clock Address Miswired',
          where: `FG2 (300Hz Triangle) ➔ IC1 Pin 11 (Select A)`,
          why: 'Pin 11 is the digital Address Clock line (Select A). It requires the 5V Square wave clock, not a triangle wave.',
          fix: 'Connect FG2 Triangle to Pin 14 at Column 9 (Bottom section).',
          targetHoleId: 'hole-F-9',
          targetLabel: 'IC1 Pin 14 (X1 Triangle In)'
        }
      }
    }

    return {
      isValid: false,
      error: {
        title: '⚠ Miswired Message Signal 2',
        where: `FG2 (300Hz Triangle) ➔ ${holeObj.label}`,
        why: 'The 300Hz Triangular wave must be injected into IC1 Pin 14 (Channel 1 Analog Input).',
        fix: 'Connect FG2 Triangle to Pin 14 at Column 9 (Bottom section).',
        targetHoleId: 'hole-F-9',
        targetLabel: 'IC1 Pin 14 (X1 Triangle In)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 5. CONTROL CLOCK SIGNAL (2kHz Square Wave)
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'clk') {
    // Valid: IC1 Pin 11 (Select A: Col 12, bot) or IC2 Pin 11 (Col 22, bot)
    if ((holeNode.col === 12 || holeNode.col === 22) && holeNode.isBotSection) {
      return {
        isValid: true,
        connection: {
          id: holeNode.col === 22 ? 'c_clk_bridge' : 'c_clk_mux',
          label: 'Clock ➔ Pin 11 (Select A)',
          wireColor: '#2563eb'
        }
      }
    }

    // ERRORS
    if ((holeNode.col === 13 || holeNode.col === 14 || holeNode.col === 23 || holeNode.col === 24) && holeNode.isBotSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Address Pin Mismatch',
          where: `Clock (5V Square) ➔ Address Pin ${holeNode.col === 13 || holeNode.col === 23 ? 'B (Pin 10)' : 'C (Pin 9)'}`,
          why: 'In this 2-channel TDM experiment, Address lines B (Pin 10) and C (Pin 9) must remain GROUNDED to lock 2-channel mode. The clock switches only Address A (Pin 11).',
          fix: 'Connect the Clock generator to Pin 11 at Column 12 (Bottom section).',
          targetHoleId: 'hole-F-12',
          targetLabel: 'IC1 Pin 11 (Select A Clock)'
        }
      }
    }

    if (holeNode.col === 9 && holeNode.isTopSection) {
      return {
        isValid: false,
        error: {
          title: '⚠ Clock Connected to TDM Bus',
          where: `Clock (5V Square) ➔ IC1 Pin 3 (TDM Bus)`,
          why: 'Pin 3 is the analog composite TDM output bus! Connecting the 5V square clock here destroys the analog multiplexed signal.',
          fix: 'Connect Clock to Address Select Pin 11 (Column 12 Bottom).',
          targetHoleId: 'hole-F-12',
          targetLabel: 'IC1 Pin 11 (Select A Clock)'
        }
      }
    }

    return {
      isValid: false,
      error: {
        title: '⚠ Miswired Switching Clock',
        where: `Clock (2kHz Square) ➔ ${holeObj.label}`,
        why: 'The 2kHz Square Wave controls channel alternation and must connect to Address line Pin 11 (Select A).',
        fix: 'Connect Clock to Pin 11 at Column 12 (Bottom section).',
        targetHoleId: 'hole-F-12',
        targetLabel: 'IC1 Pin 11 (Select A Clock)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 6. DSO OSCILLOSCOPE PROBES
  // ════════════════════════════════════════════════════════
  if (termNode && termNode.id === 'probe_tdm') {
    if ((holeNode.col === 9 || holeNode.col === 19) && holeNode.isTopSection) {
      return {
        isValid: true,
        connection: { id: 'c_probe_tdm', label: 'DSO Probe ➔ Pin 3 (TDM Bus)', wireColor: '#a855f7' }
      }
    }
    return {
      isValid: false,
      error: {
        title: '⚠ DSO TDM Probe Misplaced',
        where: `DSO Probe TDM ➔ ${holeObj.label}`,
        why: 'To view the interleaved TDM pulse train (Procedure Step 6), the probe must clip onto Pin 3 (TDM Bus).',
        fix: 'Attach this probe to IC1 Pin 3 at Column 9 (Top section).',
        targetHoleId: 'hole-E-9',
        targetLabel: 'IC1 Pin 3 (TDM Output)'
      }
    }
  }

  if (termNode && termNode.id === 'probe_rc0') {
    if (holeNode.col >= 25 && holeNode.col <= 27 && holeNode.isBotSection) {
      return {
        isValid: true,
        connection: { id: 'c_probe_rc0', label: 'DSO Probe ➔ LPF 1 Output', wireColor: '#0284c7' }
      }
    }
    return {
      isValid: false,
      error: {
        title: '⚠ Filter Probe REC0 Misplaced',
        where: `DSO Probe REC0 ➔ ${holeObj.label}`,
        why: 'To observe the reconstructed 100Hz Sine wave, this probe must monitor the junction of R1 (10kΩ) and C1 (0.1µF).',
        fix: 'Attach probe REC0 to Column 27 (Bottom section).',
        targetHoleId: 'hole-F-27',
        targetLabel: 'LPF 1 Filter Junction (Col 27)'
      }
    }
  }

  if (termNode && termNode.id === 'probe_rc1') {
    if (holeNode.col >= 28 && holeNode.col <= 30 && holeNode.isBotSection) {
      return {
        isValid: true,
        connection: { id: 'c_probe_rc1', label: 'DSO Probe ➔ LPF 2 Output', wireColor: '#059669' }
      }
    }
    return {
      isValid: false,
      error: {
        title: '⚠ Filter Probe REC1 Misplaced',
        where: `DSO Probe REC1 ➔ ${holeObj.label}`,
        why: 'To observe the reconstructed 300Hz Triangle wave, this probe must monitor the junction of R2 and C2.',
        fix: 'Attach probe REC1 to Column 28 (Bottom section).',
        targetHoleId: 'hole-F-28',
        targetLabel: 'LPF 2 Filter Junction (Col 28)'
      }
    }
  }

  // ════════════════════════════════════════════════════════
  // 7. HOLE-TO-HOLE INTERCONNECTS (TDM Bus & Clock Sync Bridge)
  // ════════════════════════════════════════════════════════
  if (n1.type === 'hole' && n2.type === 'hole') {
    // TDM Bus Bridge: IC1 Pin 3 (Col 9 top) to IC2 Pin 3 (Col 19 top)
    const isCol9Top = (n1.col === 9 && n1.isTopSection) || (n2.col === 9 && n2.isTopSection)
    const isCol19Top = (n1.col === 19 && n1.isTopSection) || (n2.col === 19 && n2.isTopSection)

    if (isCol9Top && isCol19Top) {
      return {
        isValid: true,
        connection: { id: 'c_tdm_bridge', label: 'TDM Bus: Mux Pin 3 ➔ Demux Pin 3', wireColor: '#9333ea' }
      }
    }

    // Clock Sync Bridge: IC1 Pin 11 (Col 12 bot) to IC2 Pin 11 (Col 22 bot)
    const isCol12Bot = (n1.col === 12 && n1.isBotSection) || (n2.col === 12 && n2.isBotSection)
    const isCol22Bot = (n1.col === 22 && n1.isBotSection) || (n2.col === 22 && n2.isBotSection)

    if (isCol12Bot && isCol22Bot) {
      return {
        isValid: true,
        connection: { id: 'c_clk_bridge', label: 'Clock Sync: IC1 Pin 11 ➔ IC2 Pin 11', wireColor: '#3b82f6' }
      }
    }

    // Attempted bridge starting from Pin 3 to wrong pin
    if (isCol9Top && !isCol19Top) {
      return {
        isValid: false,
        error: {
          title: '⚠ TDM Bus Bridge Miswired',
          where: `IC1 Pin 3 (TDM Out) ➔ ${n1.col === 9 ? to.label : from.label}`,
          why: 'IC1 Pin 3 carries the multiplexed composite pulse train. As per Procedure Step 1 & 7, it must bridge directly into IC2 Pin 3 (COM In) so the demultiplexer can separate the channels.',
          fix: 'Connect this wire to IC2 Pin 3 at Column 19 (Top section).',
          targetHoleId: 'hole-E-19',
          targetLabel: 'IC2 Pin 3 (COM In)'
        }
      }
    }

    // Attempted bridge starting from Pin 11 to wrong pin
    if (isCol12Bot && !isCol22Bot) {
      return {
        isValid: false,
        error: {
          title: '⚠ Clock Sync Bridge Miswired',
          where: `IC1 Pin 11 (Clock A) ➔ ${n1.col === 12 ? to.label : from.label}`,
          why: 'Multiplexer and Demultiplexer must switch in exact synchrony. Pin 11 on IC1 must bridge directly to Pin 11 on IC2.',
          fix: 'Connect this wire to IC2 Pin 11 at Column 22 (Bottom section).',
          targetHoleId: 'hole-F-22',
          targetLabel: 'IC2 Pin 11 (Select A)'
        }
      }
    }

    // Jumper from Power Rail to Pin 16 VDD
    const hasPosRail = n1.isPosRail || n2.isPosRail
    const hasPin16 = (n1.col === 7 && n1.isBotSection) || (n2.col === 7 && n2.isBotSection) || (n1.col === 17 && n1.isBotSection) || (n2.col === 17 && n2.isBotSection)
    if (hasPosRail && hasPin16) {
      return {
        isValid: true,
        connection: { id: 'c_pwr_mux', label: '+5V Rail ➔ Pin 16 (VDD)', wireColor: '#ef4444' }
      }
    }

    // Jumper from Ground Rail to Ground Pins (8, 6, 7, 9, 10)
    const hasNegRail = n1.isNegRail || n2.isNegRail
    const isGndPin = (c, top) => (c === 14 && top) || (c === 12 && top) || (c === 13 && top) || (c === 13 && !top) || (c === 14 && !top) || (c === 24 && top) || (c === 22 && top) || (c === 23 && top) || (c === 23 && !top) || (c === 24 && !top)
    const hasGndPin = isGndPin(n1.col, n1.isTopSection) || isGndPin(n2.col, n2.isTopSection)
    if (hasNegRail && hasGndPin) {
      return {
        isValid: true,
        connection: { id: 'c_gnd_mux', label: 'GND Rail ➔ Ground Pin', wireColor: '#1e293b' }
      }
    }
  }

  // Fallback generic mismatch
  return {
    isValid: false,
    error: {
      title: '⚠ Non-Standard Circuit Connection',
      where: `${from.label || 'Node A'} ➔ ${to.label || 'Node B'}`,
      why: 'This connection is not part of the standard CD4051 2-Channel TDM and Demultiplexing circuit diagram.',
      fix: 'Review the step-by-step instructions in the left panel to see the required connections.',
      targetHoleId: null
    }
  }
}

/**
 * Returns the next pending connection that the student needs to complete
 */
export function getNextPendingStepConnection(connectionStatus = []) {
  return connectionStatus.find(c => !c.connected) || null
}
