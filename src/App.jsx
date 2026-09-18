import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { OfflineAccessProvider } from './contexts/OfflineAccessContext'
import ProtectedRoute from './components/ProtectedRoute'
import OfflineModeBanner from './components/OfflineModeBanner'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import LevelSelection from './pages/LevelSelection'
import DomainCatalog from './pages/DomainCatalog'
import NotFound from './pages/NotFound'

// Teacher
import TeacherDashboard from './Teacher/TeacherDashboard'

// Physics
import PhysicsHub from './Physics/PhysicsHub'
import OhmsLaw from './Physics/OhmsLaw'
import MagneticHysteresis from './Physics/MagneticHysteresis'
import ClippingClamping from './Physics/ClippingClamping'
import Pendulum from './Physics/Pendulum'
import ProjectileMotion from './Physics/ProjectileMotion'

// Chemistry
import ChemistryHub from './Chemistry/ChemistryHub'
import AcidBaseTitration from './Chemistry/AcidBaseTitration'
import Crystallization from './Chemistry/Crystallization'
import Electrochemistry from './Chemistry/Electrochemistry'
import ChemicalEquilibrium from './Chemistry/ChemicalEquilibrium'
import GasLaws from './Chemistry/GasLaws'

// Biology
import BiologyHub from './Biology/BiologyHub'
import Photosynthesis from './Biology/Photosynthesis'
import MicroscopyTechniques from './Biology/MicroscopyTechniques'
import CellDivision from './Biology/CellDivision'
import DNAReplication from './Biology/DNAReplication'
import Enzymes from './Biology/Enzymes'

// Electronics
import ElectronicsHub from './Electronics/ElectronicsHub'
import RCFilterTuning from './Electronics/RCFilterTuning'
import DigitalLogicGates from './Electronics/DigitalLogicGates'
import AMFMModulation from './Electronics/AMFMModulation'
import OpAmpGain from './Electronics/OpAmpGain'
import AntennaRadiation from './Electronics/AntennaRadiation'

// Electronics: Part - A Discrete Hardware Experiments
import TimeDivisionMultiplexing from './Electronics/TimeDivisionMultiplexing'
import AmplitudeModulationDetection from './Electronics/AmplitudeModulationDetection'
import PulseAmplitudeModulation from './Electronics/PulseAmplitudeModulation'
import PreEmphasisDeEmphasis from './Electronics/PreEmphasisDeEmphasis'
import OpticalFiberBendingLoss from './Electronics/OpticalFiberBendingLoss'
import OpticalNumericalAperture from './Electronics/OpticalNumericalAperture'

// Computer Science
import CSHub from './CS/CSHub'
import SortingRace from './CS/SortingRace'
import CPUScheduling from './CS/CPUScheduling'
import DijkstraPathfinding from './CS/DijkstraPathfinding'
import CacheSimulator from './CS/CacheSimulator'
import BSTOperations from './CS/BSTOperations'

// Robotics
import RoboticsHub from './Robotics/RoboticsHub'
import InverseKinematics from './Robotics/InverseKinematics'
import LineFollowingPID from './Robotics/LineFollowingPID'
import ObstacleAvoidance from './Robotics/ObstacleAvoidance'
import MotorPWMTorque from './Robotics/MotorPWMTorque'
import DifferentialDrive from './Robotics/DifferentialDrive'

// Thales Cyber & Aerospace
import CyberHub from './Thales/CyberHub'
import FirewallTuning from './Thales/FirewallTuning'
import DDoSMitigation from './Thales/DDoSMitigation'
import EncryptionPerformance from './Thales/EncryptionPerformance'
import PhishingRansomware from './Thales/PhishingRansomware'
import RedBlueBattle from './Thales/RedBlueBattle'

import AerospaceHub from './Thales/AerospaceHub'
import FlightAvionicsFailure from './Thales/FlightAvionicsFailure'
import WeightBalance from './Thales/WeightBalance'
import WindGustControl from './Thales/WindGustControl'
import ThrustAltitude from './Thales/ThrustAltitude'
import StallRecovery from './Thales/StallRecovery'

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OfflineAccessProvider>
          <OfflineModeBanner />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role-selection" element={<Navigate to="/catalog" replace />} />
            <Route path="/roles" element={<Navigate to="/catalog" replace />} />

            {/* Education Level & Domain Catalog Flow */}
            <Route path="/level-select" element={<LevelSelection />} />
            <Route path="/catalog" element={<DomainCatalog />} />
            <Route path="/catalog/:level" element={<DomainCatalog />} />

            {/* Teacher Dashboard */}
            <Route path="/student" element={<Navigate to="/catalog" replace />} />
            <Route path="/teacher" element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/faculty" element={<TeacherDashboard />} />
            <Route path="/faculty/*" element={<TeacherDashboard />} />

            {/* Physics Domain */}
            <Route path="/physics" element={<PhysicsHub />} />
            <Route path="/physics/ohms-law" element={<OhmsLaw />} />
            <Route path="/physics/hysteresis" element={<MagneticHysteresis />} />
            <Route path="/physics/clipping-clamping" element={<ClippingClamping />} />
            <Route path="/physics/pendulum" element={<Pendulum />} />
            <Route path="/physics/projectile" element={<ProjectileMotion />} />

            {/* Chemistry Domain */}
            <Route path="/chemistry" element={<ChemistryHub />} />
            <Route path="/chemistry/titration" element={<AcidBaseTitration />} />
            <Route path="/chemistry/crystallization" element={<Crystallization />} />
            <Route path="/chemistry/electrochemistry" element={<Electrochemistry />} />
            <Route path="/chemistry/equilibrium" element={<ChemicalEquilibrium />} />
            <Route path="/chemistry/gas-laws" element={<GasLaws />} />

            {/* Biology Domain */}
            <Route path="/biology" element={<BiologyHub />} />
            <Route path="/biology/photosynthesis" element={<Photosynthesis />} />
            <Route path="/biology/microscopy" element={<MicroscopyTechniques />} />
            <Route path="/biology/cell-division" element={<CellDivision />} />
            <Route path="/biology/dna" element={<DNAReplication />} />
            <Route path="/biology/enzymes" element={<Enzymes />} />

            {/* Electronics Domain */}
            <Route path="/electronics" element={<ElectronicsHub />} />
            {/* Part - A Discrete Hardware Experiments */}
            <Route path="/electronics/tdm" element={<TimeDivisionMultiplexing />} />
            <Route path="/electronics/am-detection" element={<AmplitudeModulationDetection />} />
            <Route path="/electronics/pam" element={<PulseAmplitudeModulation />} />
            <Route path="/electronics/pre-emphasis" element={<PreEmphasisDeEmphasis />} />
            <Route path="/electronics/fiber-bending-loss" element={<OpticalFiberBendingLoss />} />
            <Route path="/electronics/numerical-aperture" element={<OpticalNumericalAperture />} />
            {/* Supplemental Simulations */}
            <Route path="/electronics/rc-filter" element={<RCFilterTuning />} />
            <Route path="/electronics/logic-gates" element={<DigitalLogicGates />} />
            <Route path="/electronics/modulation" element={<AMFMModulation />} />
            <Route path="/electronics/opamp" element={<OpAmpGain />} />
            <Route path="/electronics/antenna" element={<AntennaRadiation />} />

            {/* Computer Science Domain */}
            <Route path="/cs" element={<CSHub />} />
            <Route path="/cs/sorting" element={<SortingRace />} />
            <Route path="/cs/cpu-scheduling" element={<CPUScheduling />} />
            <Route path="/cs/dijkstra" element={<DijkstraPathfinding />} />
            <Route path="/cs/cache" element={<CacheSimulator />} />
            <Route path="/cs/bst" element={<BSTOperations />} />

            {/* Robotics Domain */}
            <Route path="/robotics" element={<RoboticsHub />} />
            <Route path="/robotics/inverse-kinematics" element={<InverseKinematics />} />
            <Route path="/robotics/line-following" element={<LineFollowingPID />} />
            <Route path="/robotics/obstacle-avoidance" element={<ObstacleAvoidance />} />
            <Route path="/robotics/motor-torque" element={<MotorPWMTorque />} />
            <Route path="/robotics/diff-drive" element={<DifferentialDrive />} />

            {/* Thales Cyber Domain (Dual routing for /thales and /cyber) */}
            <Route path="/cyber" element={<CyberHub />} />
            <Route path="/thales/cyber" element={<Navigate to="/cyber" replace />} />
            <Route path="/thales/firewall" element={<FirewallTuning />} />
            <Route path="/cyber/firewall" element={<FirewallTuning />} />
            <Route path="/thales/ddos" element={<DDoSMitigation />} />
            <Route path="/cyber/ddos" element={<DDoSMitigation />} />
            <Route path="/thales/encryption" element={<EncryptionPerformance />} />
            <Route path="/cyber/encryption" element={<EncryptionPerformance />} />
            <Route path="/thales/ransomware" element={<PhishingRansomware />} />
            <Route path="/cyber/ransomware" element={<PhishingRansomware />} />
            <Route path="/thales/red-blue" element={<RedBlueBattle />} />
            <Route path="/cyber/red-blue" element={<RedBlueBattle />} />

            {/* Thales Aerospace Domain (Dual routing for /thales and /aerospace) */}
            <Route path="/aerospace" element={<AerospaceHub />} />
            <Route path="/thales/aerospace" element={<Navigate to="/aerospace" replace />} />
            <Route path="/thales/avionics" element={<FlightAvionicsFailure />} />
            <Route path="/aerospace/avionics" element={<FlightAvionicsFailure />} />
            <Route path="/thales/weight-balance" element={<WeightBalance />} />
            <Route path="/aerospace/weight-balance" element={<WeightBalance />} />
            <Route path="/thales/wind-gust" element={<WindGustControl />} />
            <Route path="/aerospace/wind-gust" element={<WindGustControl />} />
            <Route path="/thales/thrust-altitude" element={<ThrustAltitude />} />
            <Route path="/aerospace/thrust-altitude" element={<ThrustAltitude />} />
            <Route path="/thales/stall-recovery" element={<StallRecovery />} />
            <Route path="/aerospace/stall-recovery" element={<StallRecovery />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OfflineAccessProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
