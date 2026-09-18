/**
 * CurioLabs Unified Domain Registry
 * Supports hierarchical education levels (PUC & Engineering) and scales to 50+ domains.
 */

export const EDUCATION_LEVELS = [
  {
    id: 'puc',
    title: 'Pre-University College (PUC / +2)',
    shortTitle: 'PUC Foundation',
    description: 'Foundational laboratory sciences for 11th & 12th grades (PCMB & CS)',
    icon: '🏫',
    badge: 'Grades 11-12',
    gradient: 'from-teal-500 to-blue-600',
    domainsCount: 4,
    experimentsCount: 20
  },
  {
    id: 'engineering',
    title: 'Undergraduate Engineering (B.Tech / B.E)',
    shortTitle: 'Engineering Faculty',
    description: 'Specialized advanced engineering labs with WebAR hardware simulation',
    icon: '⚡',
    badge: 'Undergraduate B.Tech / B.E',
    gradient: 'from-purple-600 to-indigo-700',
    domainsCount: 7,
    experimentsCount: 35
  }
]

export const DOMAIN_REGISTRY = [
  // --- PUC LEVEL DOMAINS ---
  {
    id: 'physics',
    slug: 'physics',
    level: 'puc',
    title: 'Physics',
    titleKn: 'ಭೌತಶಾಸ್ತ್ರ',
    description: "Ohm's Law, Magnetic Hysteresis, Pendulum, Projectiles & Wave clipping",
    icon: '⚡',
    gradient: 'from-blue-500 to-indigo-600',
    path: '/physics',
    experimentsCount: 5,
    tags: ['Electromagnetism', 'Mechanics', 'Circuits'],
    experiments: [
      { slug: 'ohms-law', title: "Ohm's Law & Resistance", path: '/physics/ohms-law', icon: '⚡' },
      { slug: 'hysteresis', title: 'Magnetic Hysteresis (B-H Loop)', path: '/physics/hysteresis', icon: '🧲' },
      { slug: 'clipping-clamping', title: 'Diode Clipping & Clamping', path: '/physics/clipping-clamping', icon: '📈' },
      { slug: 'pendulum', title: 'Simple Pendulum Harmonic Motion', path: '/physics/pendulum', icon: '⏱️' },
      { slug: 'projectile', title: 'Projectile Motion Kinematics', path: '/physics/projectile', icon: '🎯' }
    ]
  },
  {
    id: 'chemistry',
    slug: 'chemistry',
    level: 'puc',
    title: 'Chemistry',
    titleKn: 'ರಸಾಯನಶಾಸ್ತ್ರ',
    description: 'Acid-base titrations, crystallization, electrochemistry & gas laws',
    icon: '🧪',
    gradient: 'from-pink-500 to-rose-600',
    path: '/chemistry',
    experimentsCount: 5,
    tags: ['Physical Chem', 'Equilibrium', 'Titrations'],
    experiments: [
      { slug: 'titration', title: 'Acid-Base Neutralization Titration', path: '/chemistry/titration', icon: '🧪' },
      { slug: 'crystallization', title: 'Fractional Crystallization Rate', path: '/chemistry/crystallization', icon: '💎' },
      { slug: 'electrochemistry', title: 'Galvanic Cell & Nernst Equation', path: '/chemistry/electrochemistry', icon: '🔋' },
      { slug: 'equilibrium', title: "Chemical Equilibrium & Le Chatelier's", path: '/chemistry/equilibrium', icon: '⚖️' },
      { slug: 'gas-laws', title: 'Ideal Gas Laws (Boyle & Charles)', path: '/chemistry/gas-laws', icon: '🎈' }
    ]
  },
  {
    id: 'biology',
    slug: 'biology',
    level: 'puc',
    title: 'Biology',
    titleKn: 'ಜೀವಶಾಸ್ತ್ರ',
    description: 'Photosynthesis, optical microscopy, cell division & DNA replication',
    icon: '🧬',
    gradient: 'from-green-500 to-emerald-600',
    path: '/biology',
    experimentsCount: 5,
    tags: ['Cell Biology', 'Genetics', 'Enzymology'],
    experiments: [
      { slug: 'photosynthesis', title: 'Photosynthesis Oxygen Evolution', path: '/biology/photosynthesis', icon: '🌿' },
      { slug: 'microscopy', title: 'Compound Microscopy & Specimen Focusing', path: '/biology/microscopy', icon: '🔬' },
      { slug: 'cell-division', title: 'Mitosis & Cell Division Stages', path: '/biology/cell-division', icon: '🧫' },
      { slug: 'dna', title: 'DNA Double Helix Replication', path: '/biology/dna', icon: '🧬' },
      { slug: 'enzymes', title: 'Enzyme Kinetics & Denaturation', path: '/biology/enzymes', icon: '🧪' }
    ]
  },
  {
    id: 'cs-puc',
    slug: 'cs-puc',
    level: 'puc',
    title: 'Computer Science (PUC)',
    titleKn: 'ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್',
    description: 'Algorithm sorting races, binary search trees & basic CPU scheduling',
    icon: '💻',
    gradient: 'from-violet-500 to-purple-600',
    path: '/cs',
    experimentsCount: 5,
    tags: ['Algorithms', 'Data Structures', 'Logic'],
    experiments: [
      { slug: 'sorting', title: 'Sorting Algorithms Race', path: '/cs/sorting', icon: '📊' },
      { slug: 'bst', title: 'Binary Search Tree Operations', path: '/cs/bst', icon: '🌲' },
      { slug: 'dijkstra', title: 'Dijkstra Shortest Pathfinding', path: '/cs/dijkstra', icon: '🗺️' },
      { slug: 'cpu-scheduling', title: 'CPU Process Scheduling (FCFS/RR)', path: '/cs/cpu-scheduling', icon: '⏱️' },
      { slug: 'cache', title: 'Cache Memory Architecture', path: '/cs/cache', icon: '💾' }
    ]
  },

  // --- ENGINEERING LEVEL DOMAINS ---
  {
    id: 'electronics',
    slug: 'electronics',
    level: 'engineering',
    title: 'Electronics Engineering',
    titleKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಎಂಜಿನಿಯರಿಂಗ್',
    description: 'RC filter tuning, op-amp gains, and WebAR 3D breadboard circuits',
    icon: '📡',
    gradient: 'from-emerald-500 to-teal-600',
    path: '/electronics',
    hasAR: true,
    experimentsCount: 5,
    tags: ['Analog Circuits', 'Filters', 'WebAR'],
    experiments: [
      { slug: 'rc-filter', title: 'RC Active Filter Tuning (+AR)', path: '/electronics/rc-filter', icon: '📡', hasAR: true },
      { slug: 'logic-gates', title: 'Digital Logic Gates Design (+AR)', path: '/electronics/logic-gates', icon: '🔌', hasAR: true },
      { slug: 'opamp', title: 'Operational Amplifier Gain Stages (+AR)', path: '/electronics/opamp', icon: '🔊', hasAR: true },
      { slug: 'modulation', title: 'AM/FM Carrier Modulation', path: '/electronics/modulation', icon: '📻' },
      { slug: 'antenna', title: 'Antenna Radiation Polar Patterns', path: '/electronics/antenna', icon: '📶' }
    ]
  },

  {
    id: 'cybersecurity',
    slug: 'cybersecurity',
    level: 'engineering',
    title: 'Cybersecurity & Defense',
    titleKn: 'ಸೈಬರ್ ಭದ್ರತೆ ಮತ್ತು ರಕ್ಷಣೆ',
    description: 'Stateful firewalling, volumetric DDoS mitigation & red/blue warfare',
    icon: '🛡️',
    gradient: 'from-cyan-500 to-teal-600',
    path: '/cyber',
    experimentsCount: 5,
    tags: ['Network Security', 'Cryptography', 'EDR'],
    experiments: [
      { slug: 'firewall', title: 'Stateful Packet Inspection Firewall', path: '/cyber/firewall', icon: '🛡️' },
      { slug: 'ddos', title: 'Volumetric DDoS Attack Mitigation', path: '/cyber/ddos', icon: '🌊' },
      { slug: 'encryption', title: 'Cryptographic Ciphers Benchmark (AES/RSA)', path: '/cyber/encryption', icon: '🔐' },
      { slug: 'ransomware', title: 'Phishing Detonation & Ransomware Containment', path: '/cyber/ransomware', icon: '🦠' },
      { slug: 'red-blue', title: 'Red vs Blue Cyber Warfare Range', path: '/cyber/red-blue', icon: '⚔️' }
    ]
  },
  {
    id: 'aeronautics',
    slug: 'aeronautics',
    level: 'engineering',
    title: 'Aeronautics & Avionics',
    titleKn: 'ಏರೋನಾಟಿಕ್ಸ್ ಮತ್ತು ಏವಿಯಾನಿಕ್ಸ್',
    description: 'Glass cockpit PFDs, Weight & Balance CG envelope, and stall aerodynamics',
    icon: '✈️',
    gradient: 'from-sky-500 to-blue-600',
    path: '/aerospace',
    experimentsCount: 5,
    tags: ['Aerodynamics', 'Flight Controls', 'Turbofans'],
    experiments: [
      { slug: 'avionics', title: 'Primary Flight Display Avionics Failure', path: '/aerospace/avionics', icon: '✈️' },
      { slug: 'weight-balance', title: 'Aircraft Weight & Balance CG Envelope', path: '/aerospace/weight-balance', icon: '⚖️' },
      { slug: 'wind-gust', title: 'Wind Gust Autopilot Flight Control Laws', path: '/aerospace/wind-gust', icon: '💨' },
      { slug: 'thrust-altitude', title: 'Turbofan Jet Thrust Lapse vs Altitude', path: '/aerospace/thrust-altitude', icon: '🚀' },
      { slug: 'stall-recovery', title: 'Aerodynamic Stall & Angle of Attack Recovery', path: '/aerospace/stall-recovery', icon: '🛩️' }
    ]
  },
  {
    id: 'robotics',
    slug: 'robotics',
    level: 'engineering',
    title: 'Robotics & Mechatronics',
    titleKn: 'ರೋಬೋಟಿಕ್ಸ್ ಮತ್ತು ಮೆಕಾಟ್ರಾನಿಕ್ಸ್',
    description: 'Inverse kinematics (+AR 3D Arm), PID track tuning, and obstacle avoidance',
    icon: '🤖',
    gradient: 'from-amber-500 to-orange-600',
    path: '/robotics',
    hasAR: true,
    experimentsCount: 5,
    tags: ['Kinematics', 'Autonomous Navigation', 'WebAR'],
    experiments: [
      { slug: 'inverse-kinematics', title: '2-DOF Robotic Arm Inverse Kinematics (+AR)', path: '/robotics/inverse-kinematics', icon: '🦾', hasAR: true },
      { slug: 'line-following', title: 'Mobile Robot Line Following with PID', path: '/robotics/line-following', icon: '🤖' },
      { slug: 'obstacle-avoidance', title: 'Autonomous LiDAR Obstacle Avoidance', path: '/robotics/obstacle-avoidance', icon: '⚡' },
      { slug: 'motor-torque', title: 'DC Geared Motor PWM & Torque Curves (+AR)', path: '/robotics/motor-torque', icon: '⚙️', hasAR: true },
      { slug: 'diff-drive', title: 'Differential Drive Odometry Kinematics', path: '/robotics/diff-drive', icon: '🏎️' }
    ]
  },
  {
    id: 'aiml',
    slug: 'aiml',
    level: 'engineering',
    title: 'AI & Machine Learning',
    titleKn: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ',
    description: 'Gradient descent optimization, neural activation functions & clustering',
    icon: '🧠',
    gradient: 'from-purple-600 to-pink-600',
    path: '/cs',
    experimentsCount: 5,
    tags: ['Neural Networks', 'Optimization', 'Data Science'],
    experiments: [
      { slug: 'sorting', title: 'Algorithmic Complexity Benchmarks', path: '/cs/sorting', icon: '📊' },
      { slug: 'dijkstra', title: 'Heuristic Graph Optimization', path: '/cs/dijkstra', icon: '🗺️' },
      { slug: 'cache', title: 'Memory Access Prediction', path: '/cs/cache', icon: '💾' },
      { slug: 'bst', title: 'Decision Trees & Partitioning', path: '/cs/bst', icon: '🌲' },
      { slug: 'cpu-scheduling', title: 'Reinforcement Task Scheduler', path: '/cs/cpu-scheduling', icon: '⏱️' }
    ]
  }
]
