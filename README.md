# MedHome — AI-Powered Healthcare. Built for Every Home.

[![National Hackathon 2026](https://img.shields.io/badge/Hackathon-Submission_2026-E53935?style=for-the-badge)](https://github.com/aryanbhojgaria/MedHome)
[![React Version](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**MedHome** is a unified, intelligent healthcare navigation platform designed to bridge the gap between initial patient symptoms and professional medical care. By mapping symptom clusters to the correct medical specialty, tracking real-time emergency capacity, and providing seamless appointment booking, MedHome eliminates fragmentation in healthcare access.

---

## 🔗 Presentation & Technical Documents

We have created standalone, highly visual HTML assets tailored for evaluation panels and slide-show pitches:

- 📊 **[System Architecture Diagram](architecture_diagram.html)** — A detailed breakdown of the client, backend, database, and AI engine layers.
- 🧬 **[Entity Relationship Diagram (ERD)](erd_diagram.html)** — Interactive database schema, primary/foreign key mappings, and cardinality lines.
- 🎤 **[Hackathon Presentation Deck](presentation.html)** — Slide deck optimized for judging criteria with keyboard controls (`F` for fullscreen, `←` / `→` to navigate).
- 📄 **[Technical Documentation Manual](technical_documentation.html)** — Fully detailed, print-optimized 16-section document (prints cleanly to 6–7 pages).
- 📝 **[Raw Markdown Specification](TECHNICAL_DOCUMENTATION.md)** — Core text report of the system design and project objectives.

---

## 🛠 Key Features

### 1. Clinical AI Symptom Checker
- **9-Stage Reasoning Pipeline:** Ingests symptoms via text or voice, matches symptoms against 642 database relationships, determines disease confidence (clinically capped at 98%), and assigns triage risk categories.
- **Triage Risk Assessments:** Classifies cases into Low, Moderate, High, and Critical based on clinical indicator severity weights.
- **Specialist Router Engine:** Combines disease-level overrides (e.g., Pneumonia → Pulmonologist) with symptom-pattern match rules (e.g., chest pain + palpitations → Cardiologist) to identify the correct specialist category.

### 2. High-Performance Geographic Mapping
- **OpenStreetMap & Leaflet.js:** Custom-rendered map canvas plots 5,132+ health facilities with zero external licensing fees or API usage caps.
- **Viewport Bounds Pruning:** Monitors visible viewport coordinates dynamically to render markers only inside active bounds, keeping DOM layout frame rates high.
- **Map Container Resize Fix:** Solves hidden bounds initialization bugs by automatically invalidating and recalculating tile sizes post-mount.
- **ICU Emergency Filter:** Toggles nearest trauma centers showing real-time bed capacity and ratings.

### 3. Personal Healthcare Workspace & Role Workflows
- **Interactive Analytics:** Displays monthly appointment trends, frequent symptoms, and disease incidence distributions using responsive, clean SVG graphics.
- **Patients Dashboard:** Log diagnostic histories, check upcoming consultations, and manage custom personal emergency contacts.
- **Doctors Portal:** View patient bookings, reschedule slots, and approve scheduled visits.
- **Administrators panel:** Verify medical credentials, license numbers, and manage facility ICU beds.

### 4. Multilingual Speech Recognition
- Voice symptom dictation in **Hindi** and **English** using native Web Speech API integration, visualised by a live CSS waveform canvas.

---

## 🧬 Database Schema

MedHome runs on a relational PostgreSQL backend containing **10 core tables**:

```
                  +-------------------+
                  |       users       |
                  +---------+---------+
                            | 1
                            |
                            | 1..*
                  +---------v---------+
                  |   appointments    |
                  +---------+---------+
                            |
                            | *..1
                  +---------v---------+
                  |      doctors      |
                  +---------+---------+
                            |
                            | *..1
                  +---------v---------+
                  |     hospitals     |
                  +-------------------+
```

- **`users`:** Holds user profiles, contact numbers, age, gender, and authorization roles.
- **`hospitals`:** Registry of 5,132+ ABDM-registered facilities in India.
- **`doctors`:** 1,000+ verified doctor profiles mapped to specific hospital facilities.
- **`appointments`:** Transaction workflow tracking booking dates, times, and approval states.
- **`ai_reports`:** Stores patient symptom checks, severity results, and precautions.
- **`emergency_contacts`:** User-scoped personal helplines.
- **`disease_symptoms` / `disease_descriptions` / `precautions` / `symptom_severity`:** Internal static datasets representing clinical knowledge maps.

---

## 🖥 Technology Stack

- **Frontend:** React 19, TypeScript 6.0, Vite 8.0, Framer Motion 12.0
- **Styles:** Tailwind CSS 4.0 (Custom dark-theme variables, glassmorphic styles)
- **Backend-as-a-Service:** Supabase (Auth, JWT Sessions, Real-Time WebSockets)
- **Database:** PostgreSQL (with indexed foreign key queries & Row Level Security)
- **GIS Services:** Leaflet.js, OpenStreetMap
- **STT Voice Engine:** Web Speech API

---

## 🚀 Setup & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/aryanbhojgaria/MedHome.git
   cd MedHome
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the project and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
   ```
   *Note: If no connection keys are provided, the application automatically falls back to local storage sandboxing, allowing full execution for showcase purposes.*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

5. **Type Verification Check:**
   Ensure zero TypeScript compilation errors before building:
   ```bash
   npx tsc --noEmit
   ```

---

## 📈 Platform Dataset Metrics

- **Registered Hospitals:** 5,132 ABDM Health Facilities
- **Verified Doctors:** 1,000 Practitioners
- **Symptom-Disease Maps:** 642 Mappings
- **Disease Modules:** 41 Medical Conditions
- **Severity Indicator Rules:** 133 Symptoms

---

## 📄 License
This project is licensed under the MIT License.
