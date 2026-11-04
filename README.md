# Project Command Center

A lightweight, mobile-first static dashboard for tracking the project portfolio.

## Repository and hosting status

- This repository is **private** by design.
- The dashboard source is `index.html`; it is a static page with no backend or external dependencies.
- The previous GitHub Pages deployment attempt failed during `Configure GitHub Pages`. The current account/repository configuration does not have a verified Pages deployment.
- No public dashboard URL is claimed or published.
- Keep the source private. A hosting provider that supports private Git integration must be explicitly selected and connected before deployment.

## Project status policy

The dashboard is a manually curated snapshot. Status labels are updated only after checking the relevant repository, workflow, or test result. A successful hosted runner means the repository health-check workflow ran; it does **not** mean the project is complete or an autonomous AI agent is operating.

Current verified baseline (4 November 2026):

- **Golden Shield:** Binance Spot/Futures foundation is in draft PR #18; its PR description records 95 passing unit tests. Draft PR #19 records exploratory price-action results that are not robust after costs. Its frozen Spot forward holdout runs 2026-11-04 through 2027-05-03 and has no results yet. Market-data adapter and fee-aware paper simulation remain. Live execution is disabled and profitability is not established.
- **MyBiopure:** repository previously contained only the generic runner scaffold. New documentation-only draft PR #1 adds a zero-budget launch plan, supplier due diligence, product acceptance gates, and mobile store-readiness checklist. No storefront or supplier integration is implemented; initial budget remains R0.
- **ARTEMIS:** offline Python task/diagnostics prototype exists. New draft PR #2 adds a read-only Termux preflight and staged llama.cpp trial guide. The shell syntax check passed, but the target Huawei phone has not been tested; Android UI automation is not implemented.
- **Polymarket Intelligence:** isolated read-only scanner is in draft PR #13 inside the Golden Shield repository. The PR records five scanner unit tests and a successful end-to-end GitHub Actions scan of 100 public Gamma market records, with JSON/CSV artifact uploaded. PR remains draft pending artifact/restriction review. Activity ranking is not a probability edge; no wallet, orders, or trading are implemented.

## Automation

A separate workflow, `.github/workflows/validate-dashboard.yml`, validates the HTML and required safety labels on pushes to `main`, pull requests targeting `main`, and manual dispatch. It also runs standard-library dashboard regression tests. The old Pages deployment workflow file has been removed from the current branch. Historical failed/cancelled runs remain in Actions history, but no active Pages deployment workflow is configured.

## Mobile accessibility

- Project filter controls have a 44px minimum touch height and expose their selected state through `aria-pressed`.
- Visible focus outlines support keyboard navigation for links, buttons, and task controls.
- Regression tests use only Python's standard library.

## Security and cost

- No credentials, API keys, broker details, account balances, or private trading data belong in this repository.
- No external service, database, package installation, or paid hosting is required to edit and validate the static source.
- Deployment is intentionally pending a compatible private-repository hosting choice. The connected Vercel account did not expose an available team/project context during the latest check, so no deployment was attempted.
