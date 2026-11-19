# Decision Register

## D-001 Modular monolith

Status: RECOMMENDATION applied. One Next.js application preserves transaction boundaries and minimizes demo infrastructure.

## D-002 Local-only verification

Status: CONFIRMED_REQUIRED. Supabase Docker runtime is the test environment. Cloud Supabase remains untouched.

## D-003 Private-first Storage

Status: CONFIRMED_REQUIRED. All new uploads target `private-assets`; public assets require explicit publication and Storage deletion on revoke.

## D-004 Bounded LMS

Status: DEMO_ONLY. Catalog, modules, lessons, external video, enrollment, progress, quizzes, assignments, submissions, grading, and history are in scope. SCORM/xAPI, proctoring, plagiarism detection, chat, live class, payment, adaptive learning, and video hosting are outside first demonstration.

## D-005 Assessment reviewer

Status: DEMO_ONLY. A reviewer distinct from the author is recommended for demonstration. Production approval policy remains institutional/TBD.

## D-006 Consent and data

Status: CONFIRMED_REQUIRED. Dummy accounts, synthetic data, simulated consent. No diagnosis, automated risk determination, or public student ranking.

## D-007 Retention

Status: PRODUCTION_TBD. Retention configuration and demo reset are implementation placeholders; no legal or institutional compliance claim is made.

## D-008 Google Sites

Status: CONFIRMED_REQUIRED. Google Sites consumes versioned public projections/embed pages. It is not a private backend and receives no JWT, service key, counseling, student, answer-key, or private Storage data.
