# MedHome — Technical Documentation

**AI-Powered Healthcare. Built for Every Home.**

*Submitted for National Hackathon Evaluation — June 2026*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Objectives](#4-objectives)
5. [System Overview](#5-system-overview)
6. [Technology Stack](#6-technology-stack)
7. [Database Design](#7-database-design)
8. [System Architecture](#8-system-architecture)
9. [AI Health Analysis Engine](#9-ai-health-analysis-engine)
10. [Implementation Details](#10-implementation-details)
11. [Key Features](#11-key-features)
12. [User Experience Design](#12-user-experience-design)
13. [Scalability](#13-scalability)
14. [Security Considerations](#14-security-considerations)
15. [Social Impact](#15-social-impact)
16. [Conclusion](#16-conclusion)

---

## 1. Executive Summary

MedHome is a healthcare navigation platform that connects patients to the right doctors, hospitals, and emergency services through a single, intelligent interface. The platform ingests a patient's symptoms, runs them through a knowledge-base-driven analysis engine, and produces actionable healthcare decisions — from identifying the probable condition and recommending the correct specialist, to surfacing nearby hospitals with real-time ICU bed availability and enabling instant appointment booking.

The core thesis behind MedHome is simple: healthcare in India is not lacking in supply — it is fragmented in access. Patients routinely visit three to four wrong specialists before reaching the right one, not because doctors are unavailable, but because patients lack the tools to make informed initial decisions. MedHome eliminates that gap.

The platform is built on actual Indian healthcare datasets — 5,132 ABDM-registered hospital facilities, 1,000 verified doctor profiles, 642 symptom-disease relationships, 41 disease knowledge modules, and 133 severity indicators. The backend runs on Supabase (PostgreSQL), the frontend is built with React 19 and TypeScript, and geographic services use OpenStreetMap with Leaflet.js. The result is a working product — not a prototype — that can be deployed, tested, and scaled.

---

## 2. Problem Statement

Healthcare navigation in India is fundamentally fragmented. While the country has over 70,000 hospitals and 1.3 million registered doctors, the path from symptoms to treatment remains disconnected and confusing for most patients.

### Core Challenges

- **Specialist Identification Failure.** A patient presenting with recurring headaches, dizziness, and blurred vision may consult a general physician, then an ophthalmologist, then a cardiologist — before finally being referred to a neurologist. Each visit costs money, takes time, and delays proper treatment. There is no widely accessible tool that maps symptom clusters to the correct specialist.
- **Hospital Discovery.** When a patient needs emergency care, the question is not whether a hospital exists — it is whether the nearest hospital has available ICU beds, an emergency department that is currently operational, and the right infrastructure for the patient's condition. This information is scattered across individual hospital websites, phone lines, and word-of-mouth networks.
- **Information Fragmentation.** A patient's medical history, previous diagnoses, doctor visits, and test results live across multiple clinics, labs, and paper files. No unified view exists for the patient to reference or share with a new provider.
- **Emergency Response Delays.** During a cardiac event or accident, critical minutes are lost determining which facility to approach. There is no consumer-facing platform that combines real-time bed availability with proximity-based routing.

These are not theoretical problems. They are experienced daily by millions of patients across India, and they directly contribute to delayed treatment, increased healthcare costs, and preventable deterioration.

---

## 3. Proposed Solution

MedHome addresses these problems by unifying the entire healthcare navigation journey into one platform. The user journey follows a structured pipeline:

```
Symptom Input → Disease Matching → Severity Scoring → Specialist Recommendation
    → Doctor Discovery → Hospital Discovery → Appointment Booking → Emergency Support
```

- **Step 1 — Symptom Input.** Patients enter their symptoms through text input or voice dictation (supporting English and Hindi). The system autocompletes against a database of 642 known symptom-disease mappings.
- **Step 2 — AI Analysis.** The symptom analysis engine matches the patient's symptoms against all known disease profiles in the knowledge base. Each disease receives a match score based on the number of overlapping symptoms and the total symptom count for that disease.
- **Step 3 — Specialist Recommendation.** Using a combination of disease-level specialist overrides (e.g., "Pneumonia" → Pulmonologist) and symptom-pattern matching rules (e.g., chest pain + palpitations → Cardiologist), the engine determines the appropriate specialist category.
- **Step 4 — Doctor and Hospital Discovery.** The platform queries verified doctor profiles filtered by the recommended specialization and surfaces nearby hospitals with emergency bed data. Hospital locations are plotted on interactive maps using OpenStreetMap.
- **Step 5 — Appointment Booking.** Patients can book consultation slots directly through the platform. Appointments flow through a role-based workflow: patients request, doctors approve or reschedule, and admins manage facility-wide operations.
- **Step 6 — Emergency Support.** For critical severity scores, the platform provides one-tap SOS alerts, surfaces the nearest hospitals with emergency capacity, and displays pre-configured emergency contacts.

The key differentiator is that these are not independent features. They are a connected pipeline — the AI analysis feeds the specialist recommendation, which filters the doctor search, which links to the appointment system. The patient never has to leave the platform or start over.

---

## 4. Objectives

### Primary Objectives

- **Reduce specialist discovery time** from an average of 3–4 misdirected visits to a single informed consultation by mapping symptom clusters to the correct medical specialty.
- **Surface real-time hospital data** including facility type, location, ratings, and emergency bed availability for ABDM-registered institutions.
- **Provide explainable health analysis** where every diagnosis includes confidence scores, severity assessments, matched symptoms, and actionable precautions — not opaque predictions.
- **Enable structured appointment workflows** with role-based access control for patients, doctors, and administrators.
- **Deliver emergency preparedness tools** including SOS alerts, emergency contact management, and nearest-facility routing.

### Secondary Objectives

- Support multilingual input to extend accessibility beyond English-speaking populations.
- Build a modular architecture that supports incremental feature additions (telemedicine, wearables, EHR integration) without rewriting core systems.
- Maintain a premium, accessible user interface that meets modern design standards across desktop and mobile devices.

---

## 5. System Overview

MedHome is organized into eight core modules, each addressing a specific user need:

| Module | Core Functionality | Key Technology |
| :--- | :--- | :--- |
| **Landing Page** | Value proposition, quick diagnostic entry, premium theme toggle | React 19, Tailwind CSS |
| **AI Symptom Checker** | Symptom matching, severity analysis, specialist recommendation | PostgreSQL, Supabase Client |
| **Doctor Finder** | Specialization filtering, rating-based ranking, profile views | React 19, Supabase RPC |
| **Hospital Finder** | Interactive geographic plotting, filters, ICU bed toggle | Leaflet.js, OpenStreetMap |
| **User Dashboard** | AI reports logs, upcoming appointments, charts, saved items | SVG Rendering, Framer Motion |
| **Emergency SOS** | One-tap emergency trigger, proximity routing, alerts | Browser Geolocation API |
| **Appointments** | Request, rescheduling, approval state-machine | Supabase Real-time, DB Triggers |
| **Copilot Chat** | Interactive medical support and FAQs | React State, Context API |

---

## 6. Technology Stack

The platform is designed to be lightweight, cost-effective, and easy to deploy:

- **Frontend Core:** **React 19** and **TypeScript 6.0** for building high-performance, type-safe interactive interfaces.
- **Styling:** **Tailwind CSS 4.0** with custom color systems for premium aesthetics (Dark Mode defaults, glassmorphic filters).
- **Backend-as-a-Service:** **Supabase** providing PostgreSQL database hosting, JWT authentication, and real-time WebSockets.
- **Mapping & GIS:** **OpenStreetMap** tiles rendered via **Leaflet.js** for zero-cost, high-performance geographic visualization.
- **Voice Recognition:** Web Speech API for multilingual voice-to-text input (English & Hindi) without external API costs.
- **Animations:** **Framer Motion 12.0** for micro-interactions, layout transitions, and slide-out panels.

### Rationale

- **No Google Maps API Key Dependency:** Leaflet.js and OpenStreetMap eliminate licensing costs, usage quotas, and configuration blockers.
- **Fast Build Times:** Vite 8.0 acts as the build engine, maintaining sub-second HMR times and producing compact production bundles.
- **PostgreSQL Fallback:** Supabase queries fallback to client-side localStorage synchronization, ensuring the platform remains functional during network drops.

---

## 7. Database Design

The data architecture is structured across ten relational tables in Supabase PostgreSQL:

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

### Table Schemas

#### 1. `users`
Stores user profile information and application roles.
- `id` (uuid, PK): Matches Supabase Auth user ID.
- `email` (text, Unique): User's primary email.
- `full_name` (text): Full name.
- `role` (text): Enforced role (`patient`, `doctor`, or `admin`).
- `created_at` (timestamp): Row creation date.

#### 2. `hospitals`
Contains registry details for 5,132 ABDM-registered facilities in India.
- `id` (bigint, PK): Unique facility ID.
- `name` (text): Name of the hospital or clinic.
- `state` (text): Geographic state.
- `city` (text): District or city.
- `address` (text): Detailed physical address.
- `rating` (numeric): User rating (0.0 to 5.0).
- `emergency_available` (boolean): Flag for ICU or trauma capacity.
- `latitude` (numeric): Coordinate latitude.
- `longitude` (numeric): Coordinate longitude.
- `phone` (text): Contact phone number.

#### 3. `doctors`
Contains verified profiles for 1,000 medical practitioners.
- `id` (bigint, PK): Unique doctor ID.
- `name` (text): Doctor's name.
- `specialization` (text): Specialization (Cardiologist, Neurologist, etc.).
- `experience` (integer): Years of active practice.
- `rating` (numeric): Average user review score.
- `qualification` (text): Medical credentials (MBBS, MD, DM).
- `hospital_id` (bigint, FK -> hospitals.id): Primary affiliated hospital.
- `available_today` (boolean): Current shift status.

#### 4. `appointments`
Tracks patient bookings and approvals.
- `id` (bigint, PK): Unique booking ID.
- `user_id` (uuid, FK -> users.id): Reference to booking patient.
- `doctor_id` (bigint, FK -> doctors.id): Reference to booked physician.
- `appointment_date` (date): Date of the visit.
- `appointment_time` (text): Time slot.
- `status` (text): Workflow state (`pending`, `scheduled`, `cancelled`).
- `created_at` (timestamp): Creation timestamp.

#### 5. `ai_reports`
Stores historical symptom checks.
- `id` (bigint, PK): Report ID.
- `user_id` (uuid, FK -> users.id): Reference to the patient.
- `predicted_disease` (text): Probable condition.
- `severity` (text): Calculated triage risk (`Low`, `Moderate`, `High`, `Critical`).
- `specialist` (text): Recommended medical specialty.
- `confidence` (integer): Match confidence percentage.
- `precautions` (jsonb): Array of recovery guidelines.
- `symptoms` (text): Original symptom list inputted by the patient.
- `created_at` (timestamp): Diagnostic timestamp.

#### 6. `emergency_contacts`
Tracks custom helplines scoped to the user.
- `id` (bigint, PK): Contact ID.
- `user_id` (uuid, FK -> users.id): Owner profile.
- `contact_name` (text): Contact label or name.
- `phone` (text): Mobile number.

#### 7. `disease_symptoms`
Maps diseases to their clinical presentations.
- `id` (bigint, PK): Mapping ID.
- `disease` (text): Disease name.
- `symptom` (text): Symptom description.

#### 8. `disease_descriptions`
Stores descriptive summaries of conditions.
- `id` (bigint, PK): Entry ID.
- `disease` (text, Unique): Target condition.
- `description` (text): Detailed clinical explanation.

#### 9. `precautions`
Holds self-care directions for recovery.
- `id` (bigint, PK): Entry ID.
- `disease` (text, Unique): Target condition.
- `precaution1..4` (text): Precautions 1 to 4.

#### 10. `symptom_severity`
Assigns triage weights to individual symptoms.
- `id` (bigint, PK): Entry ID.
- `symptom` (text, Unique): Symptom name.
- `weight` (integer): Severity score (1 to 7).

---

## 8. System Architecture

The platform follows a clean, decoupled layers model:

```
[USERS]
  ├── Patients (Symptom analysis, Doctor discovery, SOS trigger)
  ├── Doctors (Consultation lifecycle, Approvals)
  └── Admins (Platform configuration, Hospital data management)
       ↓
[FRONTEND APPLICATION (Client Layer)]
  ├── Landing Page (CTA & Quick Diagnosis Entry)
  ├── Dashboard Core (SVG Charts, SVG Map Containers, Slide Drawer)
  └── Routing & Global State Engine (localStorage Sync Engine)
       ↓
[SUPABASE BAAS (Authentication & Security Layer)]
  └── Row Level Security (RLS) & JWT Token Verification
       ↓
[POSTGRESQL DATABASE (Data Layer)]
  └── Relational Schema (10 Tables) & Views
       ↓
[HEALTHCARE INTELLIGENCE (AI Engine Layer)]
  ├── Symptom Matcher & Confidence Scorer
  └── Severity Evaluator & Specialist Rule Router
       ↓
[EXTERNAL SERVICES]
  ├── OpenStreetMap & Leaflet.js Tile Provider
  ├── Web Speech API (Local STT Module)
  └── Browser Geolocation API
```

---

## 9. AI Health Analysis Engine

The Symptom Checker utilizes a transparent, rule-driven clinical knowledge base compiled from real-world epidemiological charts.

### The 9-Stage Diagnostic Pipeline

1. **Symptom Ingestion:** User inputs raw text or dictates voice.
2. **Symptom Extraction:** Text is tokenized, trimmed, and mapped to the 642 unique symptoms in the registry (e.g., "high fever" -> `high_fever`).
3. **Database Match Query:** The system queries `disease_symptoms` to pull all diseases presenting with at least two inputted symptoms.
4. **Confidence Computation:** Scores each candidate disease by measuring overlapping symptoms:
   $$\text{Confidence} = \min\left(\text{Round}\left(\frac{\text{SymptomsMatched}}{\text{TotalUserSymptoms}} \times 100\right), 98\right)$$
   *Note: Confidence is clinically capped at 98% to reflect that a pure symptom checklist cannot replace diagnostic imaging or bloodwork.*
5. **Triage Severity Calculation:** The engine pulls the weights for all matched symptoms from `symptom_severity` (weights range from 1 to 7). It aggregates the score:
   - **Critical (Score $\ge 29$):** Requires immediate emergency department admission.
   - **High (Score $19 - 28$):** Requires urgent specialist care.
   - **Moderate (Score $9 - 18$):** Requires clinical consultation.
   - **Low (Score $0 - 8$):** Recommends home rest and monitoring.
6. **Specialist Determination Routing:** Specialist mapping combines disease-level overrides with symptom-pattern match groups:
   - *Disease Level Override:* Direct lookup in a mapping array. (e.g., Pneumonia is mapped directly to a Pulmonologist).
   - *Symptom Pattern Rules:* Evaluates symptom arrays. (e.g., if symptoms include `chest_pain` + `palpitations` -> Cardiologist).
   - *Fallback:* Defaults to a General Physician.
7. **Doctor Recommendation Filtering:** Queries the `doctors` table for providers matching the selected specialization, ranking them by rating and availability.
8. **Hospital Recommendation Filtering:** Queries `hospitals`. If severity is `Critical` or `High`, the search filters exclusively for facilities where `emergency_available` is true.
9. **EHR Record Storage:** Inserts the final payload as an `ai_report` entry into Supabase, linking it to the patient's ID.

---

## 10. Implementation Details

### Bounding Box Map Pruning
With over 5,132 hospitals, rendering all markers simultaneously would bottleneck browser rendering pipelines. To solve this, Leaflet's viewport bounds are monitored dynamically. Markers are only added to the DOM if their coordinates fall within the map's current bounding box (`map.getBounds().contains(latLng)`).

### Map Resize Bug Fix
A known Leaflet issue involves initializing a map inside a hidden display container (e.g. tabs or drawers) before CSS layout calculates the parent's width/height. This causes Leaflet to report a 0x0 size and fail to render tiles correctly. MedHome resolved this by attaching an effect that calls `map.invalidateSize()` after a 100ms timeout post-mount and right before viewport drawing.

### Geolocation Proximity Calculations
Coordinates are projected from the database. India's boundaries (Latitude $8^{\circ} - 38^{\circ}$ N, Longitude $68^{\circ} - 98^{\circ}$ E) are normalized to a grid when running on fallback mode, and mapped to real coordinates when Supabase is online. Distance is computed using the Haversine formula:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lng}}{2}\right)}\right)$$
where $R = 6371 \text{ km}$.

---

## 11. Key Features

- **Multilingual Voice Input:** Dictate symptoms in Hindi or English. Visualized with a live SVG audio waveform canvas.
- **Explainable Diagnostics:** Reports clearly list matched symptoms, alternative conditions, risk assessments, and recovery guidelines.
- **Interactive Leaflet Map:** View hospital clusters, toggle ICU emergency vacancies, and filter by city/state.
- **Role-Based Workflows:**
  - **Patients:** View report histories, check appointments, manage emergency contacts.
  - **Doctors:** View scheduled consultations, reschedule, or approve pending slots.
  - **Admins:** Manage hospital facilities, verify licensing, view platform analytics.
- **Analytics Dashboard:** Beautifully displays disease distributions, frequent symptoms, and monthly bookings using responsive SVG graphics.

---

## 12. User Experience Design

The MedHome user interface is built around premium, professional design aesthetics:
- ** harmonious Palette:** Sleek dark background (`#0A0A0A`), primary crimson red branding (`#E53935`), emerald green success tones (`#10B981`), and soft border guidelines.
- **Typography:** Google Fonts Inter is imported for modern, readable content. Hierarchy is maintained with heavy-contrast headings.
- **Glassmorphism:** Navigation menus, popup cards, and panels use semi-transparent backdrops (`backdrop-filter: blur(20px)`) with thin white inner borders.
- **Interactive State Transitions:** Smooth micro-animations for hover states, checklist completions, and tab switches.

---

## 13. Scalability

### Architectural Scalability
By hosting the database on Supabase, the storage layer scales seamlessly with concurrent traffic. Read performance is optimized through custom indexes on foreign keys:
```sql
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
```

### Local Storage Fallback
If the network drops or connection limits are reached, database writing automatically shifts to local storage, merging datasets once connection is restored:
```typescript
const local = localStorage.getItem('medhome_appointments');
return local ? JSON.parse(local) : [];
```

### Future ABDM ABHA Registry Integration
The system architecture matches the schema specifications of India's Ayushman Bharat Digital Mission (ABDM). Hospital license formats (`HFR-IN-XXXXXX`) are designed to sync with the National Health Authority registries, paving the path for official certification.

---

## 14. Security Considerations

- **Row Level Security (RLS):** Enabled on all Supabase tables. Users can only select or update rows matching their own `user_id`:
  ```sql
  ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can only view their own reports"
    ON ai_reports FOR SELECT
    USING (auth.uid() = user_id);
  ```
- **JWT Authentication:** Sessions are secured with signed JSON Web Tokens refreshed automatically by the Supabase SDK.
- **Role Validation:** Roles are stored in user metadata and verified via backend functions to prevent escalation exploits.
- **HIPAA Data Encryption:** All database transmissions are encrypted over SSL/TLS (HTTPS/WSS) to protect sensitive diagnostic histories.

---

## 15. Social Impact

- **Decentralizing Care Navigation:** Helps individuals identify the correct specialists without wasting time on misdirected clinical visits.
- **Emergency Optimization:** Directs patients to centers with active ICU bed capacity, helping optimize hospital load distribution.
- **Linguistic Inclusivity:** Multilingual support reduces access barriers for users speaking regional languages.
- **ABDM Alignment:** Designed to integrate directly into India's growing digital health infrastructure, preparing for future EHR expansions.

---

## 16. Conclusion

MedHome is a cohesive healthcare navigation ecosystem. By merging rule-based clinical intelligence with live registry datasets, geographic mapping, and structured appointment workflows, the platform bridges the gap between patient symptoms and treatment. Built with React 19, TypeScript, and Supabase, it is highly scalable, secure, and ready for deployment.
