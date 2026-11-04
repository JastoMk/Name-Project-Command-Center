# Project Command Center

A lightweight, mobile-first static dashboard for tracking the user's project portfolio.

## Hosting

This repository is public and can use GitHub Pages on GitHub Free. The workflow in `.github/workflows/deploy-pages.yml` deploys the root directory on pushes to `main` and manual dispatches.

If GitHub Pages is not already enabled, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Then check the Actions tab for the deployment result.

## Important limitations

- This is a static dashboard. It does not yet query private repositories or display live workflow states.
- The task checkboxes are saved in the current browser only.
- Project status text is a manually curated baseline and must be updated only after verification.
- Never commit credentials, personal account data, broker details, API keys, or secrets here.

## Cost

No external service, database, framework, or package installation is required. GitHub Pages hosting for public repositories is available on GitHub Free.
