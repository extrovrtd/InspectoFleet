# Sprint Review and Retrospective Template

## Sprint number
Sprint 1

## Sprint dates
10 July 2026 – 24 July 2026

## Sprint goal
By the end of Sprint 1, a counter agent should be able to log in,
start a vehicle inspection, capture time-stamped photos, and complete
and lock the inspection record. An admin should be able to add vehicles
and create staff accounts.

## Planned work
| Story/Issue | Planned? | Owner | Story points |
|-------------|----------|-------|--------------|
| US-01: Counter agent can log in | Yes | Freeman / Ocloo | 3 |
| US-02: Counter agent can start a new inspection | Yes | Freeman | 3 |
| US-03: Counter agent can capture handover photos | Yes | Ali | 5 |
| US-04: Counter agent can capture return photos | Yes | Ali | 3 |
| US-06: Counter agent can mark inspection as complete | Yes | Paa Kweku | 2 |
| US-12: Admin can add a new vehicle | Yes | Ocloo | 2 |
| US-13: Admin can create a staff account | Yes | Seity | 2 |

## Completed work
| Story/Issue | Completed? | Evidence/PR | Notes |
|-------------|------------|-------------|-------|
| US-01: Counter agent can log in | Partial | PR #23 — feat: implement login page | Login UI built, Supabase Auth connected, redirect to dashboard working. PR opened and CI passing. No automated tests yet. |
| US-02 through US-13 (remaining) | No | — | Carried over to Sprint 2. Root cause: learning curve with Next.js/Supabase and D4 setup overlapping with sprint window. |

## Functionality available at end of sprint
The login page is live at https://inspecto-fleet.vercel.app/login.
Staff can enter their email and password, authenticate via Supabase
Auth, and be redirected to a dashboard placeholder page. Invalid
credentials display a clear error message. The dashboard shows the
current status of Sprint 1 stories.

No inspection workflow, fleet dashboard, or admin features are
available yet these are carried over to Sprint 2.

## Changes to requirements/user stories
No user stories were changed, split, added or removed during Sprint 1.
All 7 Sprint 1 stories remain in their original form from the D3
backlog and are carried over to Sprint 2 with the same acceptance
criteria.

## Testing and quality evidence
- CI runs: GitHub Actions passing on all commits — npm install,
  npm run lint, npm run build all succeed (run #36, commit 6a983df)
- Test results: No automated tests written during Sprint 1. Manual
  tests performed: valid login redirects to dashboard ✅, invalid
  credentials show error message ✅, empty form blocked by HTML5
  validation ✅
- Review evidence: PR #[number] opened with review requested.
  CI passing. Screenshots attached in PR.
- Known defects: No session persistence check on dashboard page.
  No role-based redirect. No logout functionality.

## Client/user feedback
Phanuel K. A. Wagba (Director, Kal Car Rentals) was updated on
22 July 2026 via WhatsApp with the live login URL and sprint
progress summary. Client response: "Thank you for the update.
I'm pleased with the progress you've made so far. It's good to
hear that the architecture, database design, and login page have
been completed, and that work on the inspection process is underway.
Please continue to keep me updated on your progress, especially
once the inspection feature is ready for testing. Keep up the
good work."

Client accepted current progress and requested notification when
the inspection feature is ready for testing.

## Velocity
- Planned story points: 20
- Completed story points: 0 (US-01 partial — not fully meeting
  Definition of Done)
- Previous velocity: N/A (first sprint)
- Interpretation: Sprint 1 velocity is 0 points. This is below
  plan due to the team's learning curve with Next.js and Supabase,
  and the overlap between D4 setup work and the sprint window.
  Sprint 2 target has been reduced to 10–12 points to match actual
  team capacity.

## Lessons learned
- **Continue:** Starting with the authentication foundation (US-01)
  was the right decision all other stories depend on it.
- **Stop:** Committing build cache files (.next/) to the repo fixed by updating .gitignore.
- **Improve:** Reduce sprint commitment to match actual capacity.
  Establish 24-hour PR review rule. Write at least one test per
  story before marking done.
