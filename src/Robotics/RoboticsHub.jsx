import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'

const experiments = [
  { title: '2-DOF Robotic Arm (IK)', description: 'Inverse kinematics, joint angles, end-effector control + AR 3D Arm View', path: '/robotics/inverse-kinematics', icon: '🦾', difficulty: 'Hard', duration: '15 min', hasAR: true },
  { title: 'Line Following (PID)', description: 'Tune Proportional-Integral-Derivative parameters for track following', path: '/robotics/line-following', icon: '🤖', difficulty: 'Medium', duration: '12 min' },
  { title: 'Obstacle Avoidance', description: 'LiDAR & ultrasonic sensor ranges, path planning around static obstacles', path: '/robotics/obstacle-avoidance', icon: '⚡', difficulty: 'Medium', duration: '15 min' },
  { title: 'DC Motor PWM & Torque', description: 'Duty cycle control, back-EMF, RPM vs load torque curves + AR Motor View', path: '/robotics/motor-torque', icon: '⚙️', difficulty: 'Medium', duration: '10 min', hasAR: true },
  { title: 'Differential Drive Robot', description: 'Dual-wheel velocity control, turning radius, trajectory simulations', path: '/robotics/diff-drive', icon: '🏎️', difficulty: 'Easy', duration: '12 min' },
]

export default function RoboticsHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">🤖 {t('Robotics & Automation Lab', 'ರೋಬೋಟಿಕ್ಸ್ ಮತ್ತು ಆಟೋಮೇಷನ್ ಲ್ಯಾಬ್')}</h1>
          <p className="text-amber-100">{t('Kinematics, PID controllers, autonomous navigation, and AR-enabled hardware', 'ಕಿನಮ್ಯಾಟಿಕ್ಸ್, PID ನಿಯಂತ್ರಕಗಳು ಮತ್ತು AR ಯಂತ್ರಾಂಶಗಳು')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((e, i) => (
            <ExperimentCard key={i} {...e} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
