/**
 * vivaQuestions.js — Experiment-Specific Question Bank & Rubric Evaluator.
 * Supplies exactly 4 viva voce oral questions per experiment with conceptual keywords,
 * model answers, and a grading engine that evaluates spoken/transcribed student answers.
 */

export const VIVA_QUESTION_BANK = {
  // ── 1. TDM & DEMULTIPLEXING USING IC 4051 ──
  tdm: {
    matchKeys: ['tdm', 'time division', '4051', 'multiplex'],
    title: 'Time Division Multiplexing & Demultiplexing',
    questions: [
      {
        id: 1,
        question: 'What is the primary governing principle of Time Division Multiplexing, and why is it used in telecommunications?',
        keywords: ['share', 'single channel', 'time slots', 'bandwidth', 'sampling theorem', 'interleave', 'composite'],
        modelAnswer: 'TDM interleaves multiple discrete low-frequency baseband signals into independent time slots over a single shared transmission channel to maximize channel capacity and transmission bandwidth efficiency.',
        minWords: 6
      },
      {
        id: 2,
        question: 'What is the role of the Select A clock line connected to Pin 11 of the CD4051 multiplexer?',
        keywords: ['select', 'clock', 'pin 11', 'channel', 'switch', 'alternate', 'sampling rate', 'binary', 'ch0', 'ch1'],
        modelAnswer: 'The control clock on Pin 11 toggles the internal analog bidirectional switch between Channel 0 (Pin 13) and Channel 1 (Pin 14) at the clock sampling rate.',
        minWords: 5
      },
      {
        id: 3,
        question: 'How does the receiver demultiplexer separate the composite TDM pulse train back into the original signals?',
        keywords: ['synchronized', 'clock', 'demux', 'switch', 'rc filter', 'low pass', 'reconstruct', 'smooth', 'integrate'],
        modelAnswer: 'The demultiplexer uses a synchronized clock to route PAM pulses to their respective output lines, and an RC low-pass filter eliminates switching harmonics to reconstruct the original smooth waveforms.',
        minWords: 6
      },
      {
        id: 4,
        question: 'What happens if the clock frequency falls below the Nyquist rate for the highest message frequency?',
        keywords: ['aliasing', 'nyquist', 'distortion', 'overlap', 'spectral', 'loss of information', 'interference'],
        modelAnswer: 'If the clock sampling frequency is less than twice the maximum message frequency (fs < 2fm), spectral overlapping occurs resulting in aliasing distortion where signals cannot be reconstructed.',
        minWords: 5
      }
    ]
  },

  // ── 2. STANDARD AMPLITUDE MODULATION & DETECTION ──
  am: {
    matchKeys: ['amplitude modulation', 'am detector', 'standard am', 'envelope detector'],
    title: 'Generation & Detection of Standard AM',
    questions: [
      {
        id: 1,
        question: 'What is standard Amplitude Modulation, and how does the modulation index μ affect the carrier envelope?',
        keywords: ['amplitude', 'carrier', 'message', 'modulation index', 'envelope', 'under modulation', 'over modulation'],
        modelAnswer: 'In AM, the instantaneous amplitude of high-frequency carrier varies linearly with the baseband message. When μ <= 1, the envelope cleanly outlines the audio wave; when μ > 1, envelope phase reversal causes envelope clipping.',
        minWords: 6
      },
      {
        id: 2,
        question: 'Explain how the 1N4148 diode envelope detector extracts the audio message from the RF modulated wave.',
        keywords: ['diode', 'rectify', 'positive half', 'capacitor', 'filter', 'rc', 'carrier ripples', 'discharge'],
        modelAnswer: 'The diode conducts on positive half cycles rectifying the RF carrier. The shunt capacitor charges to peak values and discharges slowly through the resistor, filtering out high-frequency RF ripples.',
        minWords: 6
      },
      {
        id: 3,
        question: 'What is diagonal peak clipping in an envelope detector, and what circuit condition causes it?',
        keywords: ['diagonal clipping', 'rc time constant', 'too large', 'slow discharge', 'cannot follow', 'envelope', 'distortion'],
        modelAnswer: 'Diagonal clipping happens when the RC time constant is too large. The capacitor discharges more slowly than the fastest rate of change of the modulating envelope, failing to trace peak valleys.',
        minWords: 6
      },
      {
        id: 4,
        question: 'Why is standard AM considered power inefficient compared to DSB-SC or SSB systems?',
        keywords: ['carrier power', 'no information', 'two-thirds', 'sidebands', 'efficiency', 'waste', 'transmitted'],
        modelAnswer: 'In standard AM, the unmodulated carrier transmits no baseband information yet consumes at least 66.7% of total power. Sidebands carrying the actual intelligence only receive up to 33.3% of total power.',
        minWords: 6
      }
    ]
  },

  // ── 3. OHM'S LAW EXPERIMENT ──
  ohmsLaw: {
    matchKeys: ['ohm', 'resistor', 'voltage', 'current', 'v=ir'],
    title: "Ohm's Law Laboratory",
    questions: [
      {
        id: 1,
        question: "State Ohm's Law and the physical conditions under which it strictly holds true.",
        keywords: ['current', 'directly proportional', 'voltage', 'potential difference', 'constant temperature', 'resistance', 'conductor'],
        modelAnswer: "Ohm's law states that current through a conductor between two points is directly proportional to voltage across it, provided temperature and physical dimensions remain constant.",
        minWords: 6
      },
      {
        id: 2,
        question: 'What does the slope of a Voltage versus Current (V-I) characteristic graph represent?',
        keywords: ['slope', 'resistance', 'conductance', 'straight line', 'ohmic', 'v/i', 'ratio'],
        modelAnswer: 'For an ohmic conductor, the slope of a V vs I graph (ΔV / ΔI) directly represents the electrical resistance R in ohms.',
        minWords: 5
      },
      {
        id: 3,
        question: 'If you double the resistance in a circuit while maintaining a constant 5V supply, what happens to current and power?',
        keywords: ['current halves', 'decreases by half', 'power halves', 'inverse', 'i=v/r', 'p=v*i'],
        modelAnswer: 'Current is halved because I = V / R. Power dissipated (P = V² / R) is also halved because resistance doubled at constant voltage.',
        minWords: 5
      },
      {
        id: 4,
        question: 'Why do non-ohmic devices like semiconductor diodes or filament lamps deviate from a straight V-I line?',
        keywords: ['non-ohmic', 'temperature', 'heating', 'carrier injection', 'barrier potential', 'dynamic resistance', 'nonlinear'],
        modelAnswer: 'Filament lamps heat up increasing lattice vibrations and resistance, while semiconductor diodes require crossing a threshold barrier potential, resulting in an exponential, non-linear characteristic.',
        minWords: 6
      }
    ]
  },

  // ── 4. PULSE AMPLITUDE MODULATION (PAM) ──
  pam: {
    matchKeys: ['pulse amplitude modulation', 'pam', 'sampling'],
    title: 'Pulse Amplitude Modulation & Demodulation',
    questions: [
      {
        id: 1,
        question: 'What is Pulse Amplitude Modulation (PAM), and how does it differ from continuous wave AM?',
        keywords: ['pulses', 'discrete', 'amplitude', 'carrier is pulse train', 'sampling', 'continuous', 'duty cycle'],
        modelAnswer: 'In PAM, the carrier is a periodic train of rectangular pulses whose amplitudes are modulated in proportion to the instantaneous message sample values, rather than a continuous sine wave.',
        minWords: 6
      },
      {
        id: 2,
        question: 'What is the key difference between Natural PAM sampling and Flat-Top PAM sampling?',
        keywords: ['natural', 'flat-top', 'follows wave', 'constant amplitude', 'aperture effect', 'sample and hold'],
        modelAnswer: 'Natural sampling retains the curved shape of the analog message during pulse duration, whereas flat-top sampling holds a constant amplitude during the pulse using sample-and-hold.',
        minWords: 6
      },
      {
        id: 3,
        question: 'What is the Aperture Effect in flat-top PAM, and how is it compensated during demodulation?',
        keywords: ['aperture effect', 'high frequency attenuation', 'sinc distortion', 'equalizer', 'low pass filter'],
        modelAnswer: 'Flat-top pulses introduce sinc-shaped high-frequency amplitude attenuation known as the aperture effect, which is corrected using an equalizer circuit with an inverse sinc response.',
        minWords: 6
      },
      {
        id: 4,
        question: 'State the Nyquist sampling criterion and the consequences of undersampling in PAM.',
        keywords: ['fs >= 2fm', 'nyquist rate', 'aliasing', 'overlapping', 'distortion', 'sampling theorem'],
        modelAnswer: 'The sampling frequency fs must be at least twice the maximum message frequency 2fm. Undersampling causes spectral overlap and irreversible aliasing distortion.',
        minWords: 6
      }
    ]
  },

  // ── 5. PRE-EMPHASIS & DE-EMPHASIS ──
  preEmphasis: {
    matchKeys: ['pre-emphasis', 'de-emphasis', 'fm noise', 'high frequency'],
    title: 'Pre-Emphasis & De-Emphasis Circuits',
    questions: [
      {
        id: 1,
        question: 'Why do frequency modulation (FM) communication systems require pre-emphasis at the transmitter?',
        keywords: ['noise increases', 'triangular noise', 'high frequency', 'signal to noise ratio', 'boost', 'snr', 'transmitter'],
        modelAnswer: 'FM demodulation produces a triangular noise spectrum where noise increases linearly with frequency. Pre-emphasis artificially boosts high-frequency message components to overcome this noise.',
        minWords: 6
      },
      {
        id: 2,
        question: 'What type of filter circuit is used for pre-emphasis versus de-emphasis?',
        keywords: ['high pass', 'low pass', 'rc', 'differentiator', 'integrator', '75 microseconds', 'time constant'],
        modelAnswer: 'Pre-emphasis uses a high-pass RC network (or differentiator) at the transmitter, while de-emphasis uses a matching low-pass RC network (integrator) at the receiver.',
        minWords: 6
      },
      {
        id: 3,
        question: 'What standard RC time constant is standardized for FM broadcasting in North America vs Europe/India?',
        keywords: ['75 microseconds', '50 microseconds', 'time constant', 'rc', 'cutoff frequency', '2.1 khz'],
        modelAnswer: 'North America standardizes on a 75 microsecond time constant (~2.1 kHz cutoff), while Europe and India generally utilize 50 microseconds (~3.18 kHz cutoff).',
        minWords: 5
      },
      {
        id: 4,
        question: 'How does de-emphasis restore the original audio balance while suppressing high-frequency channel hiss?',
        keywords: ['attenuates', 'restores flat', 'equalizer', 'rolls off noise', 'snr improvement', 'hiss'],
        modelAnswer: 'De-emphasis attenuates boosted high frequencies back to their natural flat response while simultaneously rolling off channel noise and hiss by up to 13 dB.',
        minWords: 6
      }
    ]
  },

  // ── 6. ACID-BASE TITRATION ──
  titration: {
    matchKeys: ['titration', 'acid', 'base', 'neutralization', 'ph'],
    title: 'Acid-Base Neutralization Titration',
    questions: [
      {
        id: 1,
        question: 'What is the definition of the equivalence point versus the endpoint in an acid-base titration?',
        keywords: ['equivalence point', 'stoichiometric', 'moles of acid', 'moles of base', 'endpoint', 'indicator changes color'],
        modelAnswer: 'The equivalence point is the theoretical point where moles of acid exactly equal moles of base stoichiometrically. The endpoint is the observed point where the chemical indicator changes color.',
        minWords: 6
      },
      {
        id: 2,
        question: 'Why does phenolphthalein turn pink specifically at pH 8.2 to 10 during strong acid-strong base titration?',
        keywords: ['deprotonation', 'conjugate base', 'color change', 'ph range', 'indicator', 'phenolphthalein'],
        modelAnswer: 'Phenolphthalein loses protons in basic pH conditions, altering its conjugated pi-electron structure to an ionized quinoid form that strongly absorbs green light and transmits pink.',
        minWords: 6
      },
      {
        id: 3,
        question: 'Explain why the titration curve for a strong acid with a strong base exhibits a steep vertical pH jump near equivalence.',
        keywords: ['buffer capacity', 'steep jump', 'neutralization', 'logarithmic ph scale', 'excess h+ consumed', 'drop'],
        modelAnswer: 'Because pH is logarithmic, neutralizing the final trace concentrations of hydronium ions causes an immense several-order-of-magnitude jump in pH (from ~4 to ~10) with just a fraction of a drop.',
        minWords: 6
      },
      {
        id: 4,
        question: 'How do you mathematically calculate the unknown concentration of acid using titration telemetry?',
        keywords: ['m1v1 = m2v2', 'molarity', 'volume', 'stoichiometry', 'concentration', 'moles'],
        modelAnswer: 'Using the volumetric neutralization formula M_acid × V_acid × n_acid = M_base × V_base × n_base, where known burette volume and base molarity yield the unknown concentration.',
        minWords: 6
      }
    ]
  },

  // ── 7. DIGITAL LOGIC GATES ──
  logicGates: {
    matchKeys: ['logic gates', 'and gate', 'nand', 'nor', 'xor', 'boolean'],
    title: 'Digital Logic Gates Design',
    questions: [
      {
        id: 1,
        question: 'Why are NAND and NOR gates classified as Universal Logic Gates in digital electronics?',
        keywords: ['universal', 'implement any function', 'and or not', 'boolean algebra', 'completeness'],
        modelAnswer: 'NAND and NOR gates are universal because combinations of either gate alone can synthesize all basic Boolean logic operations including AND, OR, NOT, XOR, and complex microprocessors.',
        minWords: 6
      },
      {
        id: 2,
        question: 'State the truth table and logical boolean expression for a 2-input XOR gate.',
        keywords: ['xor', 'odd parity', 'different inputs', 'a bbar + abar b', 'high when unequal', '0 when same'],
        modelAnswer: 'The XOR expression is Y = A⊕B = A·B̄ + Ā·B. The output is HIGH (1) only when the two inputs are distinct from each other (0,1 or 1,0), and LOW (0) when identical.',
        minWords: 6
      },
      {
        id: 3,
        question: 'What are propagation delay and fan-out in integrated TTL logic IC families like 74LS00?',
        keywords: ['propagation delay', 'switching time', 'fan-out', 'maximum load gates', 'output drive capacity', 'nanoseconds'],
        modelAnswer: 'Propagation delay is the latency between an input transition and the resulting output change. Fan-out is the maximum number of standard logic inputs that an output gate can safely drive.',
        minWords: 6
      },
      {
        id: 4,
        question: 'What is the danger of leaving floating unused input pins on high-impedance CMOS logic circuits?',
        keywords: ['floating input', 'high impedance', 'static charge', 'noise susceptibility', 'unpredictable switching', 'current drain', 'tie to vcc or gnd'],
        modelAnswer: 'Floating CMOS inputs pick up ambient electrostatic noise causing rapid indeterminate switching between high and low states, leading to massive supply current draw and potential thermal runaway.',
        minWords: 6
      }
    ]
  }
}

/**
 * Retrieve 4 questions for any given experiment.
 * If experiment is not in curated bank, dynamically synthesizes 4 targeted questions.
 */
export function getVivaQuestions(experimentTitle = '', domainName = '', observations = [], steps = []) {
  const normTitle = (experimentTitle || '').toLowerCase()
  const normDomain = (domainName || '').toLowerCase()

  // 1. Check curated bank
  for (const entry of Object.values(VIVA_QUESTION_BANK)) {
    if (entry.matchKeys.some(k => normTitle.includes(k) || normDomain.includes(k))) {
      return entry.questions
    }
  }

  // 2. Dynamic synthesis from observations and steps
  const keyObs1 = observations[0] || 'the fundamental mathematical relation governing the system'
  const keyObs2 = observations[1] || 'transient parameter sensitivity and error tolerance'
  const stepKey1 = steps[0]?.description || 'calibrating primary experimental inputs'
  const stepKey2 = steps[steps.length - 1]?.description || 'analyzing telemetric output convergence'

  return [
    {
      id: 1,
      question: `What fundamental theoretical law governs the operation of ${experimentTitle || 'this experiment'}?`,
      keywords: ['governing law', 'principle', 'equilibrium', 'proportional', 'conservation', 'equation', 'theory'],
      modelAnswer: `The primary theoretical framework for ${experimentTitle} models systemic equilibrium based on: ${keyObs1}.`,
      minWords: 5
    },
    {
      id: 2,
      question: `How did adjusting your input parameters during the lab alter the observed outcome curves?`,
      keywords: ['increase', 'decrease', 'curve', 'response', 'proportional', 'variation', 'slope', 'stability'],
      modelAnswer: `Adjusting input thresholds directly shifted operational curves: ${keyObs2}.`,
      minWords: 5
    },
    {
      id: 3,
      question: `Which anomalous condition, noise factor, or calibration error must engineers guard against in this apparatus?`,
      keywords: ['calibration', 'tolerance', 'error', 'noise', 'distortion', 'drift', 'grounding', 'offset'],
      modelAnswer: `Critical error mitigation requires verifying datum alignment during ${stepKey1} to avoid sensor saturation or phase distortion.`,
      minWords: 5
    },
    {
      id: 4,
      question: `What practical engineering or industrial application relies directly on the principles demonstrated here?`,
      keywords: ['application', 'industry', 'engineering', 'automation', 'signal processing', 'telecommunications', 'safety'],
      modelAnswer: `This principle is universally employed in modern industrial instrumentation, automated feedback control, and precision telemetric acquisition systems.`,
      minWords: 5
    }
  ]
}

/**
 * Evaluate a single student spoken/typed answer against question criteria.
 * Returns score (0 - 25) with detailed rubric feedback.
 */
export function evaluateVivaAnswer(question, answer = '') {
  const text = (answer || '').trim().toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  if (wordCount < 2) {
    return {
      score: 0,
      maxScore: 25,
      grade: 'Incomplete',
      feedback: 'No substantive answer detected. Please state the governing scientific concept.',
      matchedKeywords: [],
      missingKeywords: question.keywords.slice(0, 3)
    }
  }

  // Count matched keywords
  const matchedKeywords = question.keywords.filter(kw => text.includes(kw.toLowerCase()))
  const matchRatio = matchedKeywords.length / Math.max(2, question.keywords.length * 0.4)

  // Length & depth factor
  const lengthScore = Math.min(10, (wordCount / (question.minWords || 5)) * 8)
  
  // Keyword relevance factor
  const keywordScore = Math.min(15, matchRatio * 15)

  // Total out of 25
  const rawScore = Math.round(lengthScore + keywordScore)
  const score = Math.max(5, Math.min(25, rawScore))

  let feedback = ''
  if (score >= 21) {
    feedback = 'Outstanding response! Demonstrates sound conceptual grasp with accurate technical terminology.'
  } else if (score >= 16) {
    feedback = 'Good answer. Core concept addressed well, though additional precision regarding operational limits would strengthen it.'
  } else if (score >= 11) {
    feedback = 'Partially correct. Mentioned relevant principles, but missed key terms: ' + 
      question.keywords.filter(k => !matchedKeywords.includes(k)).slice(0, 2).join(', ') + '.'
  } else {
    feedback = 'Basic attempt. Review theoretical foundations: ' + question.keywords.slice(0, 2).join(', ') + '.'
  }

  return {
    score,
    maxScore: 25,
    feedback,
    matchedKeywords,
    missingKeywords: question.keywords.filter(k => !matchedKeywords.includes(k))
  }
}

/**
 * Evaluate the complete 4-question session.
 * Returns total score (0 - 100), letter grade, and verbal assessment summary.
 */
export function evaluateVivaSession(questions = [], answers = {}) {
  let totalScore = 0
  const perQuestionDetails = []

  questions.forEach((q) => {
    const studentAns = answers[q.id] || ''
    const evalResult = evaluateVivaAnswer(q, studentAns)
    totalScore += evalResult.score
    perQuestionDetails.push({
      questionId: q.id,
      question: q.question,
      studentAnswer: studentAns,
      modelAnswer: q.modelAnswer,
      ...evalResult
    })
  })

  // Normalize to 100
  totalScore = Math.min(100, Math.max(0, totalScore))

  let letterGrade = 'A+'
  let verdict = 'Exceptional'
  let spokenSummary = ''

  if (totalScore >= 90) {
    letterGrade = 'A+'
    verdict = 'Outstanding Master Level'
    spokenSummary = `Viva examination completed with distinction. You scored ${totalScore} out of 100 with grade A plus. Conceptual clarity and technical vocabulary were exemplary.`
  } else if (totalScore >= 80) {
    letterGrade = 'A'
    verdict = 'Proficient & Accurate'
    spokenSummary = `Viva examination completed successfully. You scored ${totalScore} out of 100 with grade A. Solid understanding demonstrated across all experiment modules.`
  } else if (totalScore >= 70) {
    letterGrade = 'B+'
    verdict = 'Competent Understanding'
    spokenSummary = `Viva evaluation completed. You scored ${totalScore} out of 100 with grade B plus. Core experimental concepts were addressed with minor gaps.`
  } else if (totalScore >= 60) {
    letterGrade = 'B'
    verdict = 'Foundational Understanding'
    spokenSummary = `Viva evaluation completed. You scored ${totalScore} out of 100 with grade B. Recommend reviewing system parameters and error criteria.`
  } else {
    letterGrade = 'C'
    verdict = 'Needs Revision'
    spokenSummary = `Viva evaluation completed with score ${totalScore} out of 100. Please review the lab manual observations and re-attempt.`
  }

  return {
    totalScore,
    maxScore: 100,
    letterGrade,
    verdict,
    spokenSummary,
    perQuestionDetails
  }
}
