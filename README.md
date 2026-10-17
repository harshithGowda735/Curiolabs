## Inspiration

We believe every student should have the opportunity to experiment, not just memorize theories. However, limited laboratory access, expensive equipment, safety constraints, and unreliable internet connectivity can prevent students from gaining practical experience. As an Electronics and Communication Engineering student, I wanted to bridge this gap by making hands-on learning accessible from anywhere. This inspired **CurioLabs**, a platform where students can explore, experiment, and learn beyond the boundaries of a traditional laboratory.

## What it does

CurioLabs is a browser-based Virtual and Augmented Reality laboratory platform designed for school and college students. It brings interactive experiments across Physics, Chemistry, Biology, Electronics, Computer Science, Robotics, Cybersecurity, and Aerospace into one platform.

Students can adjust experiment parameters, observe real-time visualizations, follow guided instructions, and explore 3D models through AR on supported devices.

CurioLabs also focuses on accessibility through an installable Progressive Web App (PWA), enabling students to revisit previously cached laboratory experiences offline. This is particularly valuable for learners in areas with limited or unreliable internet connectivity.

The platform also incorporates student progress tracking, teacher dashboards, completion certificates, and bilingual learning support to create a more inclusive learning experience.

Our goal is to complement physical laboratories by helping students understand concepts, explore possibilities, and build confidence before applying their knowledge in the real world.

## How we built it

We built CurioLabs using **React, Vite, JavaScript, and Tailwind CSS** to create a responsive, component-based interface. React Router manages navigation between student dashboards, teacher dashboards, and individual laboratory experiences.

JavaScript powers the experiment calculations, algorithms, and interactive behavior, while SVG and Canvas enable real-time visualizations. Google's Model Viewer provides 3D model rendering and browser-based AR on supported devices.

We use **Firebase Authentication and Cloud Firestore** for user accounts, roles, and learning progress. Progressive Web App technologies, including a web app manifest and service worker, support installation and offline caching of selected resources. The Web Speech API adds text-to-speech accessibility.

A reusable laboratory structure brings together guided steps, interactive controls, live visualizations, and learning takeaways. We prioritize established scientific equations and algorithms so that experiment results come from calculations rather than AI-generated answers.

## Challenges we ran into

- **Supporting multiple disciplines:** Each subject requires different calculations, algorithms, and visualizations. We addressed this challenge through reusable components and experiment-specific logic.
- **Making AR educationally meaningful:** Displaying a 3D model is not enough. The experience must connect interactive parameters with the underlying experiment and its scientific calculations.
- **Ensuring scientific credibility:** Simulations must produce reliable results. We approach this through mathematical test cases, boundary testing, and comparison with reference data or physical measurements for selected experiments.
- **Building useful offline functionality:** Offline learning requires careful caching and fallback behavior. We must distinguish between resources available offline and features that depend on Firebase, connectivity, or device capabilities.
- **Balancing scope and reliability:** Covering several domains while maintaining a consistent, mobile-friendly experience requires prioritization and continuous testing.

## Accomplishments that we're proud of

- Bringing multiple scientific and engineering disciplines together within one learning platform.
- Designing a reusable framework for guided, interactive laboratory experiences.
- Connecting virtual experimentation with browser-based 3D and AR experiences.
- Making offline accessibility a core design consideration rather than an afterthought.
- Designing for both students and teachers, combining practical learning with progress monitoring and accountability.
- Establishing an architecture that can accommodate additional experiments and educational features over time.

We are especially proud of the vision behind CurioLabs: making experimentation more accessible without losing sight of scientific correctness and meaningful learning.

## What we learned

We learned that effective educational technology requires much more than attractive visuals. Scientific accuracy, intuitive interactions, accessibility, and clear explanations are equally important.

Separating simulation logic from the user interface makes calculations easier to test and reuse across different experiences. We also learned that AR should enhance understanding rather than act as a gimmick, and that offline functionality requires deliberate planning for caching, connectivity, and data synchronization.

Most importantly, we learned to approach a broad vision incrementally: build a reliable foundation, validate the core experience, and expand based on real learning needs.

## What's next for Curio Labs

Our next steps include expanding the experiment library, validating more simulations against physical laboratory measurements, adding interactive 3D models, and improving teacher dashboards and student progress tracking.

We aim to strengthen offline learning by making more previously visited experiments available without internet access, preserving supported learning progress locally, and synchronizing changes when connectivity returns.

We also plan to improve English-Kannada support and explore AI-assisted explanations and personalized learning recommendations, while keeping scientific calculations grounded in established equations and verified data.

Our long-term vision is to make practical learning accessible regardless of a student's location, internet connectivity, or access to expensive laboratory equipment.

**CurioLabs — Learn by experimenting, anywhere.**
