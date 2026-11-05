# Project Command Center

A lightweight, mobile-first static market dashboard.

## Repository and hosting status

- This repository is **public** on GitHub. Do not place credentials, account balances, broker information, or private project data here.
- The separate `JastoMk/operation-golden-shield` repository is currently **private**.
- The dashboard source is `index.html`; it is a static page and does not require a paid backend.
- GitHub Pages deployment is not yet verified. The previous workflow failed because it attempted to enable/create the Pages site through a workflow token that lacked the required administrative API permission.
- To deploy for free, enable GitHub Pages once in **Settings → Pages → Build and deployment → Source → GitHub Actions**. Then run the deployment workflow or push to `main`.
- A published GitHub Pages site is publicly accessible. The dashboard currently uses public Binance market endpoints and has no private API credentials.

## Dashboard capabilities and limitations

- Binance public REST market data; no API keys required.
- Top 100 eligible USDT spot markets, refreshed periodically.
- TradingView chart embed, including an XAU/USD chart view.
- The browser-side crypto signal calculator and backtest are separate from the private Golden Shield engine. They must not be represented as Golden Shield output until an authenticated, tested data bridge is implemented.
- Gold chart display is not a validated XAUUSDc trading signal. The crypto model is not calibrated for gold.
- Research only. No live broker execution.

## Zero-budget operating model

- Static dashboard hosting: GitHub Pages.
- Validation and scheduled research: GitHub Actions, subject to GitHub usage limits.
- No Render, paid hosting, paid database, or always-on server is assumed.
- GitHub Actions is scheduled automation, not a continuously running server. Market data shown by the page refreshes in the user's browser.

## Safety

- Never commit credentials, API keys, broker details, account balances, or private trading data.
- A passing workflow confirms code checks only; it does not prove strategy profitability or signal accuracy.
- Keep all trade decisions subject to independent verification and risk controls.
