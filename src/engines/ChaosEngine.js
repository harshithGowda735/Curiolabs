/**
 * EduConvergence Chaos Engine
 * State manager for injecting simulation faults (e.g. broken sync, wrong component values)
 */

export class ChaosEngine {
  constructor() {
    this.faults = new Set()
  }

  triggerFault(faultId) {
    this.faults.add(faultId)
  }

  clearFault(faultId) {
    this.faults.delete(faultId)
  }

  hasFault(faultId) {
    return this.faults.has(faultId)
  }
}

export const globalChaosEngine = new ChaosEngine()
