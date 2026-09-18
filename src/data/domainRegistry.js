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
    experimentsCount: 32
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
    description: "Ohm's Law, Pendulum, Diode Clipping, Hysteresis, Projectiles, Double Slit & Prism",
    icon: '⚡',
    gradient: 'from-blue-500 to-indigo-600',
    path: '/physics',
    experimentsCount: 8,
    tags: ['Electromagnetism', 'Optics', 'Mechanics', 'Semiconductors'],
    experiments: [
      { slug: 'ohms-law', title: "Ohm's Law & Circuit Resistance", path: '/physics/ohms-law', icon: '⚡' },
      { slug: 'pendulum', title: 'Simple Pendulum Acceleration due to Gravity (g)', path: '/physics/pendulum', icon: '⏱️' },
      { slug: 'clipping-clamping', title: 'Diode Clipping & Clamping Circuits', path: '/physics/clipping-clamping', icon: '📈' },
      { slug: 'hysteresis', title: 'Magnetic Hysteresis Loop (B-H Curve)', path: '/physics/hysteresis', icon: '🧲' },
      { slug: 'projectile', title: 'Projectile Motion Kinematics & Range', path: '/physics/projectile', icon: '🎯' },
      { slug: 'double-slit', title: "Young's Double Slit Light Interference", path: '/physics', icon: '🌊' },
      { slug: 'prism-spectrometer', title: 'Refractive Index of Prism Spectrometer', path: '/physics', icon: '📐' },
      { slug: 'diode-bias', title: 'PN Junction Diode Forward & Reverse Bias', path: '/physics/clipping-clamping', icon: '🔌' }
    ]
  },
  {
    id: 'chemistry',
    slug: 'chemistry',
    level: 'puc',
    title: 'Chemistry',
    titleKn: 'ರಸಾಯನಶಾಸ್ತ್ರ',
    description: 'Acid-base titrations, crystallization, electrochemistry, gas laws & salt analysis',
    icon: '🧪',
    gradient: 'from-pink-500 to-rose-600',
    path: '/chemistry',
    experimentsCount: 8,
    tags: ['Physical Chem', 'Equilibrium', 'Titrations', 'Inorganic'],
    experiments: [
      { slug: 'titration', title: 'Acid-Base Neutralization Titration', path: '/chemistry/titration', icon: '🧪' },
      { slug: 'crystallization', title: 'Fractional Crystallization Rate', path: '/chemistry/crystallization', icon: '💎' },
      { slug: 'electrochemistry', title: 'Galvanic Cell & Nernst Equation EMF', path: '/chemistry/electrochemistry', icon: '🔋' },
      { slug: 'equilibrium', title: "Chemical Equilibrium & Le Chatelier's", path: '/chemistry/equilibrium', icon: '⚖️' },
      { slug: 'gas-laws', title: 'Ideal Gas Laws (Boyle & Charles)', path: '/chemistry/gas-laws', icon: '🎈' },
      { slug: 'calorimetry', title: 'Thermochemical Calorimetry Enthalpy', path: '/chemistry/titration', icon: '🌡️' },
      { slug: 'chromatography', title: 'Paper Chromatography of Plant Pigments', path: '/chemistry/crystallization', icon: '📄' },
      { slug: 'salt-analysis', title: 'Qualitative Inorganic Salt Analysis', path: '/chemistry/equilibrium', icon: '⚗️' }
    ]
  },
  {
    id: 'biology',
    slug: 'biology',
    level: 'puc',
    title: 'Biology',
    titleKn: 'ಜೀವಶಾಸ್ತ್ರ',
    description: 'Photosynthesis, optical microscopy, cell division, DNA & enzyme kinetics',
    icon: '🧬',
    gradient: 'from-green-500 to-emerald-600',
    path: '/biology',
    experimentsCount: 8,
    tags: ['Cell Biology', 'Genetics', 'Enzymology', 'Physiology'],
    experiments: [
      { slug: 'photosynthesis', title: 'Photosynthesis Oxygen Evolution', path: '/biology/photosynthesis', icon: '🌿' },
      { slug: 'microscopy', title: 'Compound Optical Microscopy Focusing', path: '/biology/microscopy', icon: '🔬' },
      { slug: 'cell-division', title: 'Mitosis Stages in Onion Root Tip', path: '/biology/cell-division', icon: '🧫' },
      { slug: 'dna', title: 'Genomic DNA Extraction & Replication', path: '/biology/dna', icon: '🧬' },
      { slug: 'enzymes', title: 'Enzyme Kinetics & Denaturation', path: '/biology/enzymes', icon: '🧪' },
      { slug: 'plasmolysis', title: 'Plasmolysis & Deplasmolysis in Plant Cells', path: '/biology/microscopy', icon: '💧' },
      { slug: 'transpiration', title: 'Transpiration Rate using Ganong Potometer', path: '/biology/photosynthesis', icon: '🌱' },
      { slug: 'respiration', title: 'Respiration Rate in Germinating Seeds', path: '/biology/enzymes', icon: '🫁' }
    ]
  },
  {
    id: 'cs-puc',
    slug: 'cs-puc',
    level: 'puc',
    title: 'Computer Science (PUC)',
    titleKn: 'ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್',
    description: 'Algorithm sorting races, binary search trees, CPU scheduling & SQL visualizer',
    icon: '💻',
    gradient: 'from-violet-500 to-purple-600',
    path: '/cs',
    experimentsCount: 8,
    tags: ['Algorithms', 'Data Structures', 'OS', 'Databases'],
    experiments: [
      { slug: 'sorting', title: 'Sorting Algorithms Race & Complexity', path: '/cs/sorting', icon: '📊' },
      { slug: 'bst', title: 'Binary Search Tree Operations', path: '/cs/bst', icon: '🌲' },
      { slug: 'dijkstra', title: 'Dijkstra Shortest Pathfinding', path: '/cs/dijkstra', icon: '🗺️' },
      { slug: 'cpu-scheduling', title: 'CPU Process Scheduling (FCFS/SJF/RR)', path: '/cs/cpu-scheduling', icon: '⏱️' },
      { slug: 'cache', title: 'Cache Memory Architecture & Hit/Miss', path: '/cs/cache', icon: '💾' },
      { slug: 'search-comparison', title: 'Linear Search vs Binary Search Comparison', path: '/cs/sorting', icon: '🔍' },
      { slug: 'stack-queue', title: 'Stack & Queue Data Structure Operations', path: '/cs/bst', icon: '🥞' },
      { slug: 'sql-visualizer', title: 'SQL Relational Database Query Visualizer', path: '/cs/dijkstra', icon: '🗄️' }
    ]
  },

  // --- ENGINEERING LEVEL DOMAINS ---
  {
    id: 'electronics',
    slug: 'electronics',
    level: 'engineering',
    title: 'Electronics Engineering',
    titleKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಎಂಜಿನಿಯರಿಂಗ್',
    description: 'Part-A Discrete Hardware: TDM (IC 4051), AM/PAM detection, Pre/De-Emphasis & Fiber Optics with WebAR 3D',
    icon: '📡',
    gradient: 'from-emerald-500 to-teal-600',
    path: '/electronics',
    hasAR: true,
    experimentsCount: 6,
    tags: ['Discrete Hardware', 'WebAR', 'IC 4051', 'Fiber Optics', 'Modulation'],
    experiments: [
      { slug: 'tdm', title: 'TDM & De-Multiplexing using IC 4051', path: '/electronics/tdm', icon: '🔀', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' },
      { slug: 'am-detection', title: 'Standard AM Generation & Detection', path: '/electronics/am-detection', icon: '📻', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' },
      { slug: 'pam', title: 'Pulse Amplitude Modulation & Detection', path: '/electronics/pam', icon: '📊', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' },
      { slug: 'pre-emphasis', title: 'Pre-Emphasis & De-Emphasis Circuits', path: '/electronics/pre-emphasis', icon: '⚡', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' },
      { slug: 'fiber-bending-loss', title: 'Coupling & Bending Loss in Optical Fiber', path: '/electronics/fiber-bending-loss', icon: '💡', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' },
      { slug: 'numerical-aperture', title: 'Attenuation Loss & Numerical Aperture', path: '/electronics/numerical-aperture', icon: '🔦', hasAR: true, hours: '2h', blooms: 'L1, L2, L3' }
    ]
  },
  {
    id: 'communication',
    slug: 'communication',
    level: 'engineering',
    title: 'Communication Systems',
    titleKn: 'ಸಂವಹನ ವ್ಯವಸ್ಥೆಗಳು',
    description: 'Analog & digital carrier transmission, PAM, optical fiber loss, and numerical aperture',
    icon: '📶',
    gradient: 'from-blue-600 to-cyan-600',
    path: '/electronics',
    hasAR: true,
    experimentsCount: 6,
    tags: ['RF & Optical', 'Multiplexing', 'Fiber Optics'],
    experiments: [
      { slug: 'tdm', title: 'TDM Multiplexing / Demultiplexing', path: '/electronics/tdm', icon: '🔀', hasAR: true },
      { slug: 'am-detection', title: 'Standard AM Generation & Detection', path: '/electronics/am-detection', icon: '📻', hasAR: true },
      { slug: 'pam', title: 'Pulse Amplitude Modulation', path: '/electronics/pam', icon: '📊', hasAR: true },
      { slug: 'pre-emphasis', title: 'Pre-Emphasis & De-Emphasis', path: '/electronics/pre-emphasis', icon: '⚡', hasAR: true },
      { slug: 'fiber-bending-loss', title: 'Optical Fiber Coupling & Bending Loss', path: '/electronics/fiber-bending-loss', icon: '💡', hasAR: true },
      { slug: 'numerical-aperture', title: 'Attenuation Loss & Numerical Aperture', path: '/electronics/numerical-aperture', icon: '🔦', hasAR: true }
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
  },
  {
    id: 'iot',
    slug: 'iot',
    level: 'engineering',
    title: 'Internet of Things (IoT)',
    titleKn: 'ಇಂಟರ್ನೆಟ್ ಆಫ್ ಥಿಂಗ್ಸ್',
    description: 'Sensor telemetry networks, digital logic interfaces and edge controls',
    icon: '🌐',
    gradient: 'from-teal-500 to-emerald-600',
    path: '/electronics',
    experimentsCount: 5,
    tags: ['Embedded Sensors', 'Telemetry', 'Actuators'],
    experiments: [
      { slug: 'logic-gates', title: 'GPIO Hardware Logic & Decoding', path: '/electronics/logic-gates', icon: '🔌' },
      { slug: 'rc-filter', title: 'ADC Sensor Signal Conditioning', path: '/electronics/rc-filter', icon: '📡' },
      { slug: 'opamp', title: 'Instrumentation Signal Amplification', path: '/electronics/opamp', icon: '🔊' },
      { slug: 'antenna', title: 'LoRa / BLE Antenna Coverage', path: '/electronics/antenna', icon: '📶' },
      { slug: 'modulation', title: 'FSK / PSK Sensor Modulation', path: '/electronics/modulation', icon: '📻' }
    ]
  }
]
