# CurioLabs — AI-Powered Virtual & AR Engineering Laboratory Platform

CurioLabs is an adaptive spatial learning and virtual laboratory operating system for school and engineering college students.

## 🌟 Key Features

- **Dual Academic Tracks**:
  - **PUC Foundation (+2 Science)**: Physics, Chemistry, Biology, Computer Science (20 Experiments)
  - **Undergraduate Engineering (B.Tech / B.E)**: Electronics, Communication, Cybersecurity, Aeronautics, Robotics, AI/ML, IoT (35 Experiments)
- **WebAR Hardware Models**: Real-time 3D interactive circuits, breadboards, and robotic arm models projectable via `@google/model-viewer`.
- **Automated AI Viva & Evaluation**: Dynamic student viva assessment, rubric scoring (Accuracy, Theoretical, Rigor), and instant cryptographically verifiable course completion certificates.
- **Faculty Command Console**:
  - Real-time student telemetry streaming & session monitoring
  - Custom virtual laboratory authoring wizard
  - Cohort assignment scheduler & deadline manager
  - AI evaluation audit & grade override controls
  - Automated ABET & NAAC outcome attainment accreditation report generation
- **Progressive Web App (PWA)**: Full offline support via Service Workers and local caching.
- **Bilingual Accessibility**: Instant English and Kannada (ಕನ್ನಡ) UI with Web Speech API text-to-speech reading.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS v4, Apple-grade minimalist glassmorphism
- **Routing**: React Router v6
- **Augmented Reality**: `@google/model-viewer` (WebXR)
- **Icons**: Lucide React
- **PWA**: Service Worker (`sw.js`) + Web App Manifest

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm run preview
```

## Firebase backend setup

1. Create a Firebase project, enable **Google** and **Email/Password** providers in Authentication, and create a Firestore database and Storage bucket.
2. Copy `.env.example` to `.env.local` and enter the web app configuration from Firebase Console. Vite exposes only `VITE_` variables; do not put Admin SDK credentials in this project.
3. Deploy the included rules, index, and SPA hosting configuration:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage,hosting
```

The data model uses `users`, `students`, `faculty`, `experiments`, and `labRecords` collections. Student and faculty profiles are created atomically at registration. Firestore listeners power dashboard activity, and the `labRecords(studentId, timestamp desc)` index keeps individual timeline queries efficient at scale.

### Roles and operations

- Self-registration is limited to `student` and `faculty`; assign the `admin` role only through a trusted Admin SDK or Cloud Function.
- Do not allow client code to award final marks in a production rollout. Calculate AI-viva and grading results in a Cloud Function, then write the authoritative `labRecords` document with an Admin SDK.
- The project currently remains JavaScript to preserve the existing Vite lab simulators. The Firebase service boundary (`src/services`) is deliberately isolated so it can be migrated to TypeScript incrementally without rewriting the simulations.
