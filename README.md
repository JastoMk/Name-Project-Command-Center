# Project Command Center

A lightweight, mobile-first static dashboard for tracking the project portfolio.

## Repository privacy and delivery

This repository is intentionally **private**. Keep it private.

GitHub Pages on GitHub Free requires a public repository. Publishing this dashboard from a private repository would require an eligible paid plan, so Pages deployment is not enabled. Do not make this repository public merely to host the dashboard.

The dashboard is plain HTML/CSS/JavaScript and can be opened locally in a mobile browser after saving `index.html`. It has no backend, package dependencies, or network requirement for its basic interface.

## Current integration status

- Three GitHub-hosted runner workflows are installed in Golden Shield, MyBiopure, and ARTEMIS.
- Each runner passed its initial health-check execution.
- The dashboard currently displays a manually verified snapshot; it does not yet query private repository APIs or update statuses live.
- Polymarket Intelligence remains at planning stage and has no repository or runner.
- Task checkboxes are saved only in the current browser on the current device.

## Safety

- Never commit credentials, personal account data, broker details, API keys, or secrets.
- Golden Shield is research-only; no live broker execution is connected.
- Do not describe scheduled health checks as autonomous AI agents.

## Cost

No external service, database, framework, or package installation is required for the local dashboard.
