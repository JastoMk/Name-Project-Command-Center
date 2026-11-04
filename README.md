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

Current baseline:
- Golden Shield: research code exists; runner passed; strategy profitability is not established; live execution is disabled.
- MyBiopure: runner scaffold exists; storefront implementation remains pending; initial budget R0.
- ARTEMIS: runner scaffold exists; Android automation implementation and device tests remain pending.
- Polymarket Intelligence: planning only; no repository or runner configured.

## Automation

The workflow in `.github/workflows/deploy-pages.yml` is now a private-source validation check only. It does not attempt a Pages deployment. It runs on pushes to `main` and manual dispatch.

## Security and cost

- No credentials, API keys, broker details, account balances, or private trading data belong in this repository.
- No external service, database, package installation, or paid hosting is required to edit and validate the static source.
- Deployment is intentionally pending a compatible private-repository hosting choice.
