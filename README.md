[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/VCff7GBH)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=24175984&assignment_repo_type=AssignmentRepo)
# DCIT208 Client Project 2026 - Team Engineering Repository

This repository is the official engineering workspace for a DCIT208 client project.
## Project Summary
InspectoFleet is a digital vehicle inspection and fleet-tracking system 
built for Kal Car Rentals, replacing their paper-based inspection process 
with photo/timestamp evidence capture and fleet status visibility.

## Problem Statement
Kal Car Rentals currently relies on manual paper checklists for vehicle 
inspections, leading to disputes over pre-existing damage and a lack of 
real-time visibility into vehicle location and fuel/battery status.

Each team will work with a real client to engineer, test, deploy, document, and hand over a working software solution. The project will be assessed not only by the final application but also by engineering evidence: requirements, backlog, issues, pull requests, code reviews, tests, CI logs, deployment records, client feedback, sprint reports, AI usage logs, individual contributions, and final reflection.

## Team size

Maximum team size: **7 students**.

## Bring Your Own Stack (BYOS)

Teams may choose an appropriate technology stack for the client problem. Examples include React/Node, Django, Laravel, Flutter/Firebase, Java/Spring, .NET, Python/FastAPI, or any suitable combination.

However, every team must obey the same repository contract:

```bash
make setup
make lint
make test
```

Your chosen stack must be mapped to those commands in the root `Makefile`.

## Required evidence

Maintain the following evidence in this repository:

1. Client brief and problem statement
2. Requirements documentation
3. Use cases, user stories, acceptance criteria, and traceability
4. Product backlog and sprint backlog
5. Architecture decisions and diagrams
6. Source code
7. Automated tests and validation evidence
8. CI/CD workflow evidence
9. Pull requests and peer reviews
10. AI usage log
11. Deployment instructions and release notes
12. User manual
13. Demo links
14. Final handoff and post-mortem

## Engineering rule

No feature is considered complete unless it has:

- a linked requirement or user story;
- a GitHub Issue;
- a pull request;
- reviewer comments;
- test evidence or clear validation evidence;
- updated documentation where necessary;
- AI usage disclosure where applicable.

## AI policy

AI tools may be used for support, but AI must not replace understanding.

Every AI-assisted contribution must be logged in `AI_USAGE_LOG.md`. You must be able to explain, defend, test, and modify anything you submit. Work that cannot be explained by the contributor may receive little or no credit.

## Suggested release tags

Use GitHub Releases or Git tags for major submissions:

```text
D1-team-info
D2-client-brief
D3-requirements-baseline
D4-product-backlog
D5-sprint-1-review
D6-midsem-architecture-defense
D7-sprint-2-review
D8-testing-and-deployment
D9-final-demo
D10-final-handoff
```

## Definition of Done

A user story is considered done when:
- Code is committed via a Pull Request — no direct unreviewed commits to main
- At least one non-author has reviewed and commented on the PR
- CI passes or any failure is documented with a remediation plan
- Tests are written or updated for the story's acceptance criteria
- Screenshots or demo evidence are attached for any visible UI change
- The GitHub Issue is moved to Done only after all acceptance criteria are met
- AI assistance is disclosed in the PR and AI_USAGE_LOG.md if used
- 
## Final repository freeze

All final work must be completed by **Friday, August 28, 2026 at 5:00pm**.

Any commit, release, document, video link, or upload after 5:00pm will not be considered unless officially authorized by the lecturer.
