# Project Command Center

A lightweight, mobile-first static market dashboard.

## Repository and hosting status

- This repository is **public** on GitHub. Do not place credentials, account balances, broker information, or private project data here.
- The separate `JastoMk/operation-golden-shield` repository is currently **private**.
- The dashboard source is `index.html`; it is a static page and does not require a paid backend.
- GitHub Pages is enabled and the latest deployment completed successfully. Pushes to `main` trigger the deployment workflow.
- Public market requests try `data-api.binance.vision` first and fall back to `api.binance.com`, with request timeouts to avoid indefinite loading.
- A published GitHub Pages site is publicly accessible. The dashboard uses public Binance market endpoints and has no private API credentials.

## Dashboard capabilities and limitations

- Binance public REST market data; no API keys required.
- Top 100 eligible USDT spot markets, refreshed every 30 seconds when the public feed is reachable.
- TradingView chart embed, including an XAU/USD chart view.
- The browser-side crypto signal calculator and backtest are separate from the private Golden Shield engine. They must not be represented as Golden Shield output until an authenticated, tested data bridge is implemented.
- Gold chart display is not a validated XAUUSDc trading signal. The crypto model is not calibrated for gold.
- Research only. No live broker execution.

## Golden Shield snapshot connection

The dashboard has a separate **Operation Golden Shield** panel. It reads only the published file `data/shield-latest.json`; it does not connect directly to the private Shield repository or call the Shield API from a browser.

The private Shield repository can publish an hourly read-only snapshot for BTC, ETH and SOL through GitHub Actions. To activate that bridge:

1. Create a fine-grained GitHub personal access token restricted to **JastoMk/Name-Project-Command-Center** only, with **Contents: Read and write** permission. Do not grant access to other repositories.
2. In the private `JastoMk/operation-golden-shield` repository, open **Settings → Secrets and variables → Actions → New repository secret**.
3. Save the token as `COMMAND_CENTER_PUBLISH_TOKEN`. Never paste the token into chat or commit it to a file.
4. Run the Shield workflow **Publish Golden Shield research snapshot to Command Center** once from its Actions tab. It then runs hourly.

The snapshot contains categorical BUY/SELL/WAIT research assessments, confidence labels, weighted scores, reasons, warnings and completed-candle timeframe readings. It does **not** contain a numeric probability, entry, stop-loss, take-profit or gold/XAUUSDc signal. The dashboard polls the published snapshot every minute and flags snapshots older than two hours.

## Zero-budget operating model

- Static dashboard hosting: GitHub Pages.
- Validation and scheduled research: GitHub Actions, subject to GitHub usage limits.
- No Render, paid hosting, paid database, or always-on server is assumed.
- GitHub Actions is scheduled automation, not a continuously running server. Market data shown by the page refreshes in the user's browser.

## Safety

- Never commit credentials, API keys, broker details, account balances, or private trading data.
- A passing workflow confirms code checks only; it does not prove strategy profitability or signal accuracy.
- Keep all trade decisions subject to independent verification and risk controls.
