# Sprint Review and Retrospective

## Sprint number
Sprint 4 (Final)

## Sprint dates
7 August 2026 – 14 August 2026

## Sprint goal
Implement US-06 (complete inspection), US-07 (inspection history
search) and US-08 (fleet dashboard) to bring InspectoFleet to a
demonstrable release candidate for the client.

## Planned work
| Story/Issue | Planned? | Owner | Story points |
|-------------|----------|-------|--------------|
| US-06: Counter agent can mark inspection as complete | Yes | Paa Kweku / Ocloo | 2 |
| US-07: Counter agent can search inspection history | Yes | Paa Kweku / Ocloo | 3 |
| US-08: Fleet manager can view fleet dashboard | Yes | Siatey / Ocloo | 5 |

## Completed work
| Story/Issue | Completed? | Evidence/PR | Notes |
|-------------|------------|-------------|-------|
| US-06: Complete and lock inspection | Yes | Commit 3741425 | Complete button on /inspections/[id] updates status to complete and locks record. Tested on Vercel. |
| US-07: Inspection history search | Yes | PR #25 — merged | Search by registration number returns past inspections with type, date, status. Tested on Vercel. |
| US-08: Fleet dashboard | Yes | Commit 3741425 | Shows all vehicles with status badges. Filter by Available/Rented. Tested on Vercel. |

## Functionality available at end of sprint
Five user flows are live at https://inspecto-fleet.vercel.app:
1. Login at /login with Supabase Auth
2. Start new inspection at /inspections/new
3. Complete and lock inspection at /inspections/[id]
4. Search inspection history at /inspections
5. View fleet dashboard at /fleet

## Changes to requirements/user stories
No stories were changed or split. US-03 (photo capture) and US-09
through US-13 remain out of scope for this semester and are
documented as future work in the handoff pack (D9).

## Testing and quality evidence
- CI runs: GitHub Actions passing — npm install, npm run lint,
  npm run build all succeed (commit 3741425)
- Test results: Manual tests performed on all 5 live features
  against Vercel deployment. All core flows verified.
- Known defects: BUG-01 (no session persistence), BUG-02 (no
  role-based redirect), BUG-03 (no logout).

## Client/user feedback
Client (Phanuel K. A. Wagba, Director, Kal Car Rentals) last
updated 22 July 2026. Final demo to be scheduled before D9
submission on 21 August 2026.

## Velocity
- Planned story points: 10
- Completed story points: 10
- Previous velocity: 3 points (Sprint 3)
- Interpretation: First sprint to meet planned velocity. Focused
  scope and shorter stories were key to delivery.

## Lessons learned
- **Continue:** Small focused sprints with 1-3 stories work much
  better than large ambitious sprints.
- **Stop:** Adding features without testing TypeScript compatibility
  first — caused several CI failures this sprint.
- **Improve:** Schedule client demo earlier so feedback can be
  incorporated before the final deadline.
