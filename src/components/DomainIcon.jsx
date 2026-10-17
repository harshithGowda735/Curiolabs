import React from 'react'
import {
  Atom,
  FlaskConical,
  Dna,
  Laptop,
  CircuitBoard,
  ShieldCheck,
  Plane,
  Bot,
  Brain,
  GraduationCap,
  Cpu,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react'

const ICON_MAP = {
  // Academic Levels
  puc: GraduationCap,
  engineering: Cpu,

  // PUC Foundation Domains
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  'cs-puc': Laptop,

  // Engineering Branches
  electronics: CircuitBoard,
  cybersecurity: ShieldCheck,
  aeronautics: Plane,
  robotics: Bot,
  aiml: Brain,

  // Common aliases/fallbacks
  'computer-science': Laptop,
  cs: Laptop,
  cyber: ShieldCheck,
  aerospace: Plane,
  energy: Zap,
  default: Sparkles
}

export default function DomainIcon({ id, name, size = 22, className = '', strokeWidth = 2.2 }) {
  const key = (id || name || '').toLowerCase()
  const IconComponent = ICON_MAP[key] || ICON_MAP.default

  return <IconComponent size={size} strokeWidth={strokeWidth} className={className} />
}
