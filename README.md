# Gov Contract Market Radar

A static HTML/JavaScript dashboard that scans the public USAspending API for recent federal contract obligations tied to a curated watchlist of publicly traded contractors.

## What it does

- Calls `https://api.usaspending.gov/api/v2/search/spending_over_time/` for aggregate obligation momentum.
- Calls `https://api.usaspending.gov/api/v2/search/spending_by_transaction/` for the largest recent transaction rows.
- Ranks companies by recent net obligation size, acceleration versus a prior baseline, transaction count, and freshness.
- Lets you add custom tickers and recipient-name searches from the browser.
- Exports the ranked scan to CSV.

## Important caveats

This is a research tool, not investment advice. Public contract obligations can already be priced in, revised, delayed, protested, deobligated, or immaterial to a large company's revenue. Aggregate totals are net obligations, while the proof trail highlights large positive transaction rows. The ticker mapping is an editable watchlist, because matching federal recipient names to public-company securities is imperfect. Always validate signals against SEC filings, earnings guidance, valuation, liquidity, and your own risk controls before trading.

## Run locally

The app is static. You can open `index.html` directly in a browser, or use any static file server. If Python is available, this works from the project folder:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```
