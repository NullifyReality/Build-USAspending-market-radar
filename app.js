const API_URL = "https://api.usaspending.gov/api/v2/search";
const STORAGE_KEY = "gov-contract-radar-watchlist-v1";
const CONTRACT_AWARD_TYPES = ["A", "B", "C", "D"];

const DEFAULT_WATCHLIST = [
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    exchange: "NYSE",
    sector: "Defense",
    queries: ["LOCKHEED MARTIN"]
  },
  {
    symbol: "RTX",
    name: "RTX / Raytheon",
    exchange: "NYSE",
    sector: "Defense",
    queries: ["RAYTHEON", "PRATT AND WHITNEY", "COLLINS AEROSPACE"]
  },
  {
    symbol: "NOC",
    name: "Northrop Grumman",
    exchange: "NYSE",
    sector: "Defense",
    queries: ["NORTHROP GRUMMAN"]
  },
  {
    symbol: "GD",
    name: "General Dynamics",
    exchange: "NYSE",
    sector: "Defense",
    queries: ["GENERAL DYNAMICS"]
  },
  {
    symbol: "BA",
    name: "Boeing",
    exchange: "NYSE",
    sector: "Aerospace",
    queries: ["BOEING"]
  },
  {
    symbol: "HII",
    name: "Huntington Ingalls",
    exchange: "NYSE",
    sector: "Shipbuilding",
    queries: ["HUNTINGTON INGALLS"]
  },
  {
    symbol: "LHX",
    name: "L3Harris",
    exchange: "NYSE",
    sector: "Defense",
    queries: ["L3HARRIS", "L3 HARRIS"]
  },
  {
    symbol: "TXT",
    name: "Textron",
    exchange: "NYSE",
    sector: "Aerospace",
    queries: ["TEXTRON", "BELL TEXTRON"]
  },
  {
    symbol: "LDOS",
    name: "Leidos",
    exchange: "NYSE",
    sector: "Federal IT",
    queries: ["LEIDOS"]
  },
  {
    symbol: "BAH",
    name: "Booz Allen Hamilton",
    exchange: "NYSE",
    sector: "Federal IT",
    queries: ["BOOZ ALLEN"]
  },
  {
    symbol: "SAIC",
    name: "SAIC",
    exchange: "NASDAQ",
    sector: "Federal IT",
    queries: ["SCIENCE APPLICATIONS INTERNATIONAL", "SAIC"]
  },
  {
    symbol: "CACI",
    name: "CACI",
    exchange: "NYSE",
    sector: "Federal IT",
    queries: ["CACI"]
  },
  {
    symbol: "PLTR",
    name: "Palantir",
    exchange: "NASDAQ",
    sector: "AI / Data",
    queries: ["PALANTIR"]
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    exchange: "NASDAQ",
    sector: "Cloud",
    queries: ["MICROSOFT"]
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    exchange: "NASDAQ",
    sector: "Cloud",
    queries: ["AMAZON WEB SERVICES", "AMAZON.COM"]
  },
  {
    symbol: "ORCL",
    name: "Oracle",
    exchange: "NYSE",
    sector: "Cloud",
    queries: ["ORACLE"]
  },
  {
    symbol: "IBM",
    name: "IBM",
    exchange: "NYSE",
    sector: "Federal IT",
    queries: ["INTERNATIONAL BUSINESS MACHINES", "IBM CORPORATION"]
  },
  {
    symbol: "KTOS",
    name: "Kratos Defense",
    exchange: "NASDAQ",
    sector: "Defense",
    queries: ["KRATOS"]
  },
  {
    symbol: "AVAV",
    name: "AeroVironment",
    exchange: "NASDAQ",
    sector: "Drones",
    queries: ["AEROVIRONMENT"]
  },
  {
    symbol: "KBR",
    name: "KBR",
    exchange: "NYSE",
    sector: "Engineering",
    queries: ["KBR"]
  }
];

const appState = {
  watchlist: [],
  results: [],
  selectedSymbol: "",
  scanning: false
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  appState.watchlist = loadWatchlist();
  populateSectorFilter();
  renderWatchlist();
  bindEvents();
  setStatus("Ready to scan public-company contractors.");
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function bindElements() {
  el.recentDays = document.querySelector("#recentDays");
  el.baselineDays = document.querySelector("#baselineDays");
  el.minimumAmount = document.querySelector("#minimumAmount");
  el.sectorFilter = document.querySelector("#sectorFilter");
  el.runScan = document.querySelector("#runScan");
  el.downloadCsv = document.querySelector("#downloadCsv");
  el.resetWatchlist = document.querySelector("#resetWatchlist");
  el.scanStatus = document.querySelector("#scanStatus");
  el.summaryScanned = document.querySelector("#summaryScanned");
  el.summaryHot = document.querySelector("#summaryHot");
  el.summaryObligations = document.querySelector("#summaryObligations");
  el.summaryAsOf = document.querySelector("#summaryAsOf");
  el.watchlist = document.querySelector("#watchlist");
  el.watchlistCount = document.querySelector("#watchlistCount");
  el.addCompanyForm = document.querySelector("#addCompanyForm");
  el.newSymbol = document.querySelector("#newSymbol");
  el.newQuery = document.querySelector("#newQuery");
  el.resultsGrid = document.querySelector("#resultsGrid");
  el.emptyState = document.querySelector("#emptyState");
  el.resultSearch = document.querySelector("#resultSearch");
  el.detailPanel = document.querySelector("#detailPanel");
  el.detailTitle = document.querySelector("#detailTitle");
  el.detailBody = document.querySelector("#detailBody");
  el.financeLink = document.querySelector("#financeLink");
}

function bindEvents() {
  el.runScan.addEventListener("click", runScan);
  el.downloadCsv.addEventListener("click", downloadCsv);
  el.resetWatchlist.addEventListener("click", resetWatchlist);
  el.sectorFilter.addEventListener("change", renderWatchlist);
  el.resultSearch.addEventListener("input", renderResults);
  el.addCompanyForm.addEventListener("submit", addCompany);
}

function loadWatchlist() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_WATCHLIST.map((company) => ({ ...company, selected: true }));
  }

  try {
    const parsed = JSON.parse(stored);
    return parsed.map((company) => ({
      ...company,
      selected: company.selected !== false,
      queries: normalizeQueries(company.queries || company.query || company.name)
    }));
  } catch {
    return DEFAULT_WATCHLIST.map((company) => ({ ...company, selected: true }));
  }
}

function saveWatchlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.watchlist));
}

function populateSectorFilter() {
  const sectors = Array.from(new Set(appState.watchlist.map((company) => company.sector))).sort();
  el.sectorFilter.innerHTML = '<option value="all">All sectors</option>';
  sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    el.sectorFilter.append(option);
  });
}

function renderWatchlist() {
  const sector = el.sectorFilter.value;
  const companies = appState.watchlist.filter((company) => sector === "all" || company.sector === sector);
  el.watchlist.innerHTML = "";
  el.watchlistCount.textContent = appState.watchlist.length;

  companies.forEach((company) => {
    const row = document.createElement("label");
    row.className = "watch-row";
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(company.symbol)}</strong>
        <small>${escapeHtml(company.name)} - ${escapeHtml(company.sector)}</small>
      </span>
      <input type="checkbox" ${company.selected ? "checked" : ""} aria-label="Select ${escapeHtml(company.symbol)}">
    `;
    row.querySelector("input").addEventListener("change", (event) => {
      company.selected = event.target.checked;
      saveWatchlist();
    });
    el.watchlist.append(row);
  });
}

async function runScan() {
  if (appState.scanning) return;

  appState.scanning = true;
  appState.results = [];
  appState.selectedSymbol = "";
  el.runScan.disabled = true;
  el.downloadCsv.disabled = true;
  el.resultsGrid.hidden = true;
  el.emptyState.hidden = false;
  el.detailPanel.hidden = true;
  el.resultsGrid.innerHTML = "";
  updateSummary([], null);

  const recentDays = Number(el.recentDays.value);
  const baselineDays = Number(el.baselineDays.value);
  const minimumAmount = Number(el.minimumAmount.value);
  const dates = getDateWindows(recentDays, baselineDays);
  const selectedSector = el.sectorFilter.value;
  const selectedCompanies = appState.watchlist.filter((company) => {
    return company.selected && (selectedSector === "all" || company.sector === selectedSector);
  });

  if (!selectedCompanies.length) {
    setStatus("Pick at least one ticker from the watchlist.");
    finishScan();
    return;
  }

  setStatus(`Scanning ${selectedCompanies.length} companies against USAspending...`);

  try {
    const results = await mapWithConcurrency(selectedCompanies, 3, async (company, index) => {
      setStatus(`Scanning ${company.symbol} (${index + 1}/${selectedCompanies.length})...`);
      return scanCompany(company, dates, recentDays, baselineDays, minimumAmount);
    });

    appState.results = results
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.recentTotal - a.recentTotal);

    updateSummary(appState.results, dates.recentEnd);
    renderResults();
    setStatus(`Scan complete: ${appState.results.length} companies ranked.`);
    el.downloadCsv.disabled = appState.results.length === 0;
  } catch (error) {
    setStatus(`Scan failed: ${error.message}`);
    el.emptyState.innerHTML = `
      <i data-lucide="circle-alert"></i>
      <h3>API request failed</h3>
      <p class="error-text">${escapeHtml(error.message)}</p>
      <p>USAspending may be temporarily unavailable, or the browser may have blocked the cross-origin request.</p>
    `;
    if (window.lucide) window.lucide.createIcons();
  } finally {
    finishScan();
  }
}

function finishScan() {
  appState.scanning = false;
  el.runScan.disabled = false;
}

async function scanCompany(company, dates, recentDays, baselineDays, minimumAmount) {
  const [recentSeries, baselineSeries, transactions] = await Promise.all([
    fetchSpendingOverTime(company, dates.recentStart, dates.recentEnd),
    fetchSpendingOverTime(company, dates.baselineStart, dates.baselineEnd),
    fetchTransactions(company, dates.recentStart, dates.recentEnd)
  ]);

  const recentTotal = sumSeries(recentSeries);
  const baselineTotal = sumSeries(baselineSeries);
  const newestDate = getNewestTransactionDate(transactions);
  const topTransaction = transactions[0] || null;
  const score = scoreSignal({
    recentTotal,
    baselineTotal,
    recentDays,
    baselineDays,
    transactionCount: transactions.length,
    newestDate,
    minimumAmount
  });

  return {
    ...company,
    recentTotal,
    baselineTotal,
    recentDaily: recentTotal / Math.max(1, recentDays),
    baselineDaily: baselineTotal / Math.max(1, baselineDays),
    acceleration: calculateAcceleration(recentTotal, baselineTotal, recentDays, baselineDays),
    score,
    idea: classifyIdea(score, recentTotal, minimumAmount),
    reasons: buildReasons(score, recentTotal, baselineTotal, recentDays, baselineDays, transactions, minimumAmount),
    recentSeries,
    baselineSeries,
    transactions,
    newestDate,
    topTransaction,
    error: null
  };
}

async function fetchSpendingOverTime(company, startDate, endDate) {
  if (!startDate || !endDate) return [];

  const payload = {
    filters: buildFilters(company, startDate, endDate),
    group: "month",
    subawards: false
  };

  const response = await postJson(`${API_URL}/spending_over_time/`, payload);
  return response.results || [];
}

async function fetchTransactions(company, startDate, endDate) {
  const payload = {
    filters: buildFilters(company, startDate, endDate),
    fields: [
      "Award ID",
      "Recipient Name",
      "Action Date",
      "Transaction Amount",
      "Awarding Agency",
      "Funding Agency",
      "PSC",
      "NAICS",
      "Transaction Description",
      "generated_internal_id"
    ],
    page: 1,
    limit: 20,
    sort: "Transaction Amount",
    order: "desc",
    subawards: false
  };

  const response = await postJson(`${API_URL}/spending_by_transaction/`, payload);
  return (response.results || []).map(normalizeTransaction);
}

function buildFilters(company, startDate, endDate) {
  return {
    time_period: [{ start_date: startDate, end_date: endDate }],
    award_type_codes: CONTRACT_AWARD_TYPES,
    recipient_search_text: normalizeQueries(company.queries)
  };
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the HTTP status if the body is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

function normalizeTransaction(tx) {
  return {
    awardId: tx["Award ID"] || "",
    recipientName: tx["Recipient Name"] || "",
    actionDate: tx["Action Date"] || "",
    amount: Number(tx["Transaction Amount"] || 0),
    awardingAgency: tx["Awarding Agency"] || "",
    fundingAgency: tx["Funding Agency"] || "",
    psc: tx.PSC || null,
    naics: tx.NAICS || null,
    description: tx["Transaction Description"] || "",
    generatedInternalId: tx.generated_internal_id || ""
  };
}

function renderResults() {
  const query = el.resultSearch.value.trim().toLowerCase();
  const filtered = appState.results.filter((result) => {
    const haystack = `${result.symbol} ${result.name} ${result.sector} ${result.idea}`.toLowerCase();
    return haystack.includes(query);
  });

  el.emptyState.hidden = filtered.length > 0;
  el.resultsGrid.hidden = filtered.length === 0;
  el.resultsGrid.innerHTML = "";

  filtered.forEach((result) => {
    const card = document.createElement("article");
    card.className = `signal-card ${appState.selectedSymbol === result.symbol ? "is-active" : ""}`;
    card.innerHTML = `
      <div class="signal-card-header">
        <div>
          <span class="ticker">${escapeHtml(result.symbol)}</span>
          <p class="company-name">${escapeHtml(result.name)}</p>
          <span class="sector">${escapeHtml(result.exchange)} - ${escapeHtml(result.sector)}</span>
        </div>
        <span class="signal-pill ${ideaClass(result.idea)}">${escapeHtml(result.idea)}</span>
      </div>

      <div class="score-row">
        <div class="score-track" aria-label="Signal score">
          <div class="score-fill" style="width: ${Math.max(2, result.score)}%"></div>
        </div>
        <span class="score-value">${Math.round(result.score)}</span>
      </div>

      <div class="metric-grid">
        <div class="metric">
          <strong>${formatMoney(result.recentTotal)}</strong>
          <small>recent net obligations</small>
        </div>
        <div class="metric">
          <strong>${formatRatio(result.acceleration)}</strong>
          <small>vs baseline pace</small>
        </div>
      </div>

      <ul class="reason-list">
        ${result.reasons.slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>

      <button class="select-detail" type="button">View proof trail</button>
    `;

    card.querySelector(".select-detail").addEventListener("click", () => selectResult(result.symbol));
    el.resultsGrid.append(card);
  });

  if (!filtered.length && appState.results.length) {
    el.emptyState.innerHTML = `
      <i data-lucide="filter-x"></i>
      <h3>No matching results</h3>
      <p>Clear the filter or run another scan with a different sector or threshold.</p>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

function selectResult(symbol) {
  const result = appState.results.find((item) => item.symbol === symbol);
  if (!result) return;

  appState.selectedSymbol = symbol;
  renderResults();
  renderDetail(result);
  el.detailPanel.hidden = false;
  el.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDetail(result) {
  el.detailTitle.textContent = `${result.symbol} - ${result.name}`;
  el.financeLink.href = `https://finance.yahoo.com/quote/${encodeURIComponent(result.symbol)}`;

  el.detailBody.innerHTML = `
    <div class="detail-metrics">
      <div class="metric">
        <strong>${Math.round(result.score)}</strong>
        <small>signal score</small>
      </div>
      <div class="metric">
        <strong>${formatMoney(result.recentTotal)}</strong>
        <small>recent net obligations</small>
      </div>
      <div class="metric">
        <strong>${formatMoney(result.baselineTotal)}</strong>
        <small>baseline obligations</small>
      </div>
      <div class="metric">
        <strong>${formatRatio(result.acceleration)}</strong>
        <small>pace change</small>
      </div>
    </div>

    <ul class="reason-list">
      ${result.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
    </ul>

    <h3>Largest recent transactions</h3>
    <div class="transactions">
      ${
        result.transactions.length
          ? result.transactions.map(renderTransaction).join("")
          : '<p class="error-text">No transaction rows returned for this recent window.</p>'
      }
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function renderTransaction(tx) {
  const awardUrl = tx.generatedInternalId
    ? `https://www.usaspending.gov/award/${encodeURIComponent(tx.generatedInternalId)}`
    : "";
  const psc = tx.psc ? `${tx.psc.code || ""} ${tx.psc.description || ""}`.trim() : "PSC unavailable";
  const naics = tx.naics ? `${tx.naics.code || ""} ${tx.naics.description || ""}`.trim() : "NAICS unavailable";

  return `
    <article class="transaction-row">
      <div class="tx-header">
        <strong>${formatMoney(tx.amount)}</strong>
        ${awardUrl ? `<a href="${awardUrl}" target="_blank" rel="noreferrer">USAspending</a>` : ""}
      </div>
      <div class="tx-meta">
        <span>${escapeHtml(tx.actionDate || "No action date")}</span>
        <span>${escapeHtml(tx.awardingAgency || "No awarding agency")}</span>
        <span>${escapeHtml(tx.awardId || "No award ID")}</span>
      </div>
      <p class="tx-description">${escapeHtml(tx.description || "No transaction description provided.")}</p>
      <div class="tx-meta">
        <span>${escapeHtml(psc)}</span>
        <span>${escapeHtml(naics)}</span>
      </div>
    </article>
  `;
}

function scoreSignal(input) {
  const {
    recentTotal,
    baselineTotal,
    recentDays,
    baselineDays,
    transactionCount,
    newestDate,
    minimumAmount
  } = input;

  if (recentTotal < minimumAmount) {
    return Math.min(38, moneyScore(recentTotal) * 0.55);
  }

  const acceleration = calculateAcceleration(recentTotal, baselineTotal, recentDays, baselineDays);
  const amountComponent = moneyScore(recentTotal);
  const accelerationComponent = clamp((acceleration - 0.8) / 4, 0, 1) * 30;
  const activityComponent = clamp(transactionCount / 8, 0, 1) * 12;
  const freshnessComponent = freshnessScore(newestDate);

  return clamp(amountComponent + accelerationComponent + activityComponent + freshnessComponent, 0, 100);
}

function moneyScore(amount) {
  if (amount <= 0) return 0;
  const logAmount = Math.log10(amount);
  return clamp((logAmount - 6) / 4, 0, 1) * 46;
}

function freshnessScore(dateString) {
  if (!dateString) return 0;
  const days = daysBetween(new Date(dateString), new Date());
  if (days <= 3) return 12;
  if (days <= 10) return 9;
  if (days <= 30) return 6;
  if (days <= 90) return 3;
  return 0;
}

function classifyIdea(score, recentTotal, minimumAmount) {
  if (recentTotal < minimumAmount) return "Below filter";
  if (score >= 74) return "Research now";
  if (score >= 56) return "Watch closely";
  if (score >= 38) return "Monitor";
  return "Quiet";
}

function buildReasons(score, recentTotal, baselineTotal, recentDays, baselineDays, transactions, minimumAmount) {
  const acceleration = calculateAcceleration(recentTotal, baselineTotal, recentDays, baselineDays);
  const top = transactions[0];
  const reasons = [];

  if (recentTotal < minimumAmount) {
    reasons.push(`Recent obligations are below the selected ${formatMoney(minimumAmount)} filter.`);
  } else {
    reasons.push(`${formatMoney(recentTotal)} in recent scanned net obligations.`);
  }

  if (baselineTotal > 0) {
    reasons.push(`Recent daily pace is ${formatRatio(acceleration)} the prior baseline.`);
  } else if (recentTotal > 0) {
    reasons.push("Recent activity appeared after a quiet baseline window.");
  } else {
    reasons.push("No recent obligations found in the selected window.");
  }

  if (top) {
    reasons.push(`Largest transaction: ${formatMoney(top.amount)} from ${top.awardingAgency || "unknown agency"}.`);
    if (top.actionDate) reasons.push(`Newest visible action date: ${top.actionDate}.`);
  }

  if (score >= 74) {
    reasons.push("Treat this as a fast due-diligence queue item, then check valuation and filings.");
  } else if (score >= 56) {
    reasons.push("Worth watching for follow-on awards, press releases, or guidance changes.");
  } else {
    reasons.push("Signal may be too small, too old, or too normal versus baseline.");
  }

  reasons.push("Recipient-name matching can miss subsidiaries or include unrelated similarly named entities.");
  return reasons;
}

function calculateAcceleration(recentTotal, baselineTotal, recentDays, baselineDays) {
  const recentDaily = recentTotal / Math.max(1, recentDays);
  const baselineDaily = baselineTotal / Math.max(1, baselineDays);
  if (baselineDaily <= 0) return recentDaily > 0 ? 6 : 0;
  return recentDaily / baselineDaily;
}

function sumSeries(series) {
  return series.reduce((total, item) => total + Number(item.aggregated_amount || 0), 0);
}

function getNewestTransactionDate(transactions) {
  return transactions
    .map((tx) => tx.actionDate)
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}

function getDateWindows(recentDays, baselineDays) {
  const recentEndDate = new Date();
  const recentStartDate = addDays(recentEndDate, -(recentDays - 1));
  const baselineEndDate = addDays(recentStartDate, -1);
  const baselineStartDate = addDays(baselineEndDate, -(baselineDays - 1));

  return {
    recentStart: toIsoDate(recentStartDate),
    recentEnd: toIsoDate(recentEndDate),
    baselineStart: toIsoDate(baselineStartDate),
    baselineEnd: toIsoDate(baselineEndDate)
  };
}

function addCompany(event) {
  event.preventDefault();
  const symbol = el.newSymbol.value.trim().toUpperCase();
  const query = el.newQuery.value.trim().toUpperCase();

  if (!symbol || !query) {
    setStatus("Add both a ticker and a recipient search term.");
    return;
  }

  if (appState.watchlist.some((company) => company.symbol === symbol)) {
    setStatus(`${symbol} is already in the watchlist.`);
    return;
  }

  appState.watchlist.push({
    symbol,
    name: symbol,
    exchange: "Custom",
    sector: "Custom",
    queries: normalizeQueries(query),
    selected: true
  });

  el.newSymbol.value = "";
  el.newQuery.value = "";
  populateSectorFilter();
  renderWatchlist();
  saveWatchlist();
  setStatus(`${symbol} added to the scan universe.`);
  if (window.lucide) window.lucide.createIcons();
}

function resetWatchlist() {
  appState.watchlist = DEFAULT_WATCHLIST.map((company) => ({ ...company, selected: true }));
  saveWatchlist();
  populateSectorFilter();
  renderWatchlist();
  setStatus("Watchlist reset to the default public-company contractor universe.");
}

function downloadCsv() {
  if (!appState.results.length) return;

  const rows = [
    [
      "symbol",
      "company",
      "exchange",
      "sector",
      "idea",
      "score",
      "recent_obligations",
      "baseline_obligations",
      "acceleration",
      "top_transaction_amount",
      "top_transaction_date",
      "top_transaction_agency",
      "top_transaction_description"
    ],
    ...appState.results.map((result) => [
      result.symbol,
      result.name,
      result.exchange,
      result.sector,
      result.idea,
      Math.round(result.score),
      Math.round(result.recentTotal),
      Math.round(result.baselineTotal),
      result.acceleration.toFixed(2),
      result.topTransaction ? Math.round(result.topTransaction.amount) : 0,
      result.topTransaction ? result.topTransaction.actionDate : "",
      result.topTransaction ? result.topTransaction.awardingAgency : "",
      result.topTransaction ? result.topTransaction.description : ""
    ])
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gov-contract-radar-${toIsoDate(new Date())}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function updateSummary(results, asOf) {
  const hot = results.filter((result) => result.idea === "Research now").length;
  const obligations = results.reduce((total, result) => total + result.recentTotal, 0);

  el.summaryScanned.textContent = String(results.length);
  el.summaryHot.textContent = String(hot);
  el.summaryObligations.textContent = formatMoney(obligations);
  el.summaryAsOf.textContent = asOf || "Not scanned";
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function next() {
    const current = cursor;
    cursor += 1;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    await next();
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, next);
  await Promise.all(workers);
  return results;
}

function setStatus(message) {
  el.scanStatus.textContent = message;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start, end) {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}

function normalizeQueries(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function formatMoney(amount) {
  const value = Number(amount || 0);
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function formatRatio(value) {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 10) return `${value.toFixed(0)}x`;
  return `${value.toFixed(1)}x`;
}

function ideaClass(idea) {
  if (idea === "Research now") return "signal-hot";
  if (idea === "Watch closely") return "signal-watch";
  return "signal-quiet";
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
