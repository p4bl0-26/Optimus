# OPTIMUS: AI Chief of Staff

## What is OPTIMUS?
OPTIMUS is an autonomous, high-intelligence executive dashboard and operator. Designed with a strict "military command-center/intel-card" aesthetic, OPTIMUS moves beyond standard productivity trackers and Kanban boards by analyzing your obligations and telling you exactly what you need to do, when you need to do it, and what happens if you fail.

Instead of generic reminders, OPTIMUS uses deterministic intelligence engines to generate comprehensive risk profiles, future outcome projections, and highly optimized execution plans. It acts as your personal AI Chief of Staff.

## Everything We Have Built (Phase 1 to Phase 10)

### Phase 1–4: Foundational Architecture & Aesthetics
- **Core Stack:** Initialized with Next.js 15 (App Router, Turbopack) and React 19.
- **UI/UX Design:** Implemented the strict visual language—hard borders, Orbitron typography, Framer Motion transitions, and a dark, premium intelligence dashboard look.
- **Command Center:** Built the `CommandCenterRepository`, establishing the core principle of a "Unified Obligation Graph." Calendar events, classroom assignments, and personal tasks all flow through a single deterministic data fetch, avoiding scattered API calls.

### Phase 5–7: Intelligence Engines
Replaced LLM latency and ambiguity with fast, deterministic, server-side intelligence engines:
- **`riskEngine`:** Mathematically evaluates every obligation to assign an urgency score and bucketizes them into Risk Tiers (Critical, High, Medium, Low).
- **`futureOutcomeEngine`:** Projects downstream "cascading failures." If a database assignment is missed, it maps out how that impacts final grades, sleep schedules, and weekend availability.
- **`rescuePlanEngine`:** Identifies tasks deep in the red and breaks them down into hyper-actionable, 90-minute execution blocks to "rescue" the deadline.
- **`chiefOfStaffEngine`:** Identifies mathematically overloaded days and extracts the top strategic objectives for the week.

### Phase 8–9: Deep Drill-Downs & Executive Features
- **Obligation Intelligence (`/obligations/[id]`):** A deep-dive view into specific tasks, outlining risk history, cascading failures, and intervention histories.
- **What-If Simulator:** A dynamic range slider that allows the user to simulate pushing a deadline back by 1-7 days, recalculating and rendering projected risk in real-time.
- **Accountability Escalation:** Integrated an "Escalate to Partner" protocol, creating high-urgency social pressure interventions in the database when discipline fails.
- **Weekly Executive Reports (`/reports`):** A data-dense review route featuring deterministic SVG sparklines (noise-free linear interpolation), sleek tooltips, and a flawlessly configured `@media print` layout engineered for perfect A4 PDF exports.
- **Focus Mode:** An aggressive, full-screen HUD that hides distractions and locks the user into current execution blocks.

### Phase 10: Autonomous Scheduling Engine
- **The Execution Operator:** Upgraded OPTIMUS from an analytical dashboard to an active operator via `autonomousScheduler.ts`.
- **Deterministic Prioritization:** Schedules the week using a strict hierarchy: Critical Tasks → High Risk Tasks → Chief Recommended Constraints → Calendar Constraints.
- **Memory-Aware Rules:** Enforces behavioral patterns natively, such as `ACADEMIC_CLUSTER` (pushing coursework earlier in the day) and `EVENING_PRODUCTIVITY_DROP` (preventing deep work scheduling after 7 PM).
- **Crisis Mode:** Continuously monitors systemic risk. If Average Risk exceeds 85, or 3+ Critical obligations appear, OPTIMUS triggers a UI lockdown, flashing a red warning banner and surfacing absolute "Primary Objectives" to survive the week.
- **Dedicated UI (`/schedule`):** Built the unified weekly execution plan view, keeping the strict command-center aesthetic and enabling immediate PDF exports for physical deployment.

### Phase 10.8–10.10: The Autonomous Execution Stack
- **AI Work Accelerator (10.8):** A system designed to help the user *produce* work, rather than just plan it. Generates execution blueprints, research topics, references, and initial drafts utilizing Gemini 2.5 Flash, accelerating the user from zero to a first draft.
- **Adaptive Executive Summarizer (10.9):** Transforms the executive summary into a dynamic, 4-tier intelligence layer (NORMAL, MODERATE, HIGH, CRITICAL). The higher the operational risk, the more assistance OPTIMUS provides, escalating from simple timelines to full crisis mode and autonomous drafting. 
- **Autonomous Form Assistant (10.10):** An execution accelerator capable of preparing real-world forms automatically. OPTIMUS detects forms (hackathons, internships, scholarships, etc.), pre-fills information extracted from Agent Memory, flags missing fields, and packages it for human review. It strictly adheres to safety rules: *human approval is mandatory*, and it never clicks "Submit" autonomously.

## Current Status
**OPTIMUS_EXECUTION_LAYER_COMPLETE = TRUE**

The application is a fully operational execution engine. We have achieved a fully unified obligation graph, a complete set of deterministic intelligence and execution layers, zero TypeScript errors, zero ESLint warnings, and a highly polished, command-center UI.
