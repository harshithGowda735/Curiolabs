/**
 * EduConvergence SPICE Core Simulator
 * Lightweight math engine to handle time-domain signal processing
 */

export class SpiceCore {
  /**
   * Generates a simple sine wave array.
   */
  static generateSine(freq, amp, sampleRate, duration) {
    const data = []
    const points = sampleRate * duration
    for (let i = 0; i < points; i++) {
      const t = i / sampleRate
      data.push(amp * Math.sin(2 * Math.PI * freq * t))
    }
    return data
  }

  /**
   * Calculates the low pass RC filter discharge curve (envelope detector).
   */
  static rcDischarge(v0, t, r, c) {
    const tau = r * c
    return v0 * Math.exp(-t / tau)
  }

  /**
   * Generates a pulse train for PAM switching.
   */
  static generatePulseTrain(freq, dutyCycle, sampleRate, duration) {
    const data = []
    const points = sampleRate * duration
    const periodPts = sampleRate / freq
    const highPts = periodPts * dutyCycle
    for (let i = 0; i < points; i++) {
      const p = i % periodPts
      data.push(p < highPts ? 1 : 0)
    }
    return data
  }

  /**
   * Performs standard AM modulation.
   */
  static modulateAM(carrierFreq, carrierAmp, msgFreq, msgAmp, sampleRate, duration) {
    const data = []
    const points = sampleRate * duration
    for (let i = 0; i < points; i++) {
      const t = i / sampleRate
      const msg = msgAmp * Math.sin(2 * Math.PI * msgFreq * t)
      const carrier = Math.sin(2 * Math.PI * carrierFreq * t)
      data.push((carrierAmp + msg) * carrier)
    }
    return data
  }
}
