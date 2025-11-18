// dataroma_portfolio.js
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 테스트용

// Parse CLI arguments: first non --flag argument is treated as lookup key
const rawArgs = process.argv.slice(2);
let LOOKUP = null;
for (const a of rawArgs) {
  if (!a.startsWith("--")) {
    LOOKUP = a.trim().toLowerCase();
    break;
  }
}

const BASE = "https://www.dataroma.com/m/";

async function fetchInvestors() {
  const url = BASE + "home.php";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const investors = [];
  $("a[href*='holdings.php']").each((i, el) => {
    let name = $(el).text().trim();
    // Remove trailing "Updated <day> <Mon> <Year>" pattern if present
    name = name.replace(/\s+Updated\s+\d{1,2}\s+\w+\s+20\d{2}$/i, "").trim();
    const href = $(el).attr("href") || "";
    // resolve relative/absolute hrefs against BASE to produce a correct absolute URL
    const link = new URL(href, BASE).href;
    if (name) {
      investors.push({ no: i + 1, name, link });
    }
  });

  console.log("✅ 투자자 수:", investors.length);
  return investors;
}

async function fetchPortfolio(investor) {
  const { data } = await axios.get(investor.link);
  // DEBUG: if a lookup is active, print the fetched page for that investor so we can inspect markup
  if (LOOKUP) {
    const linkMatches = investor.link.toLowerCase().includes(`m=${LOOKUP}`);
    const nameMatches = investor.name.toLowerCase().includes(LOOKUP);
    if (linkMatches || nameMatches) {
      data.slice(0, 10000);
      // save full HTML for inspection
      try {
        fs.writeFileSync(`brk_full_${investor.no}.html`, data);
      } catch (e) {
        // ignore write errors
      }
    }
  } else if (investor.no === 1) {
    data.slice(0, 8000);
  }

  const $ = cheerio.load(data);

  // Extract portfolio total value (e.g., Portfolio value: $257,521,771,000)
  let totalValueStr = null;
  let totalValueNum = 0;
  try {
    // Strategy: look for '#p2' block text first, fallback to last span inside #p2
    const p2Text = $("#p2").text() || "";
    let m = p2Text.match(/Portfolio value:\s*\$([\d,]+)/i);
    if (!m) {
      const lastSpan = $("#p2 span").last().text().trim();
      if (/^\$[\d,]+$/.test(lastSpan))
        m = [null, lastSpan.replace(/^[^\d]*/, "")];
    }
    if (m) {
      totalValueStr = "$" + m[1];
      totalValueNum = parseInt(m[1].replace(/,/g, ""), 10) || 0;
    }
  } catch (e) {
    // ignore extraction errors
  }

  // Prefer the holdings table if present (#grid). That table's 3rd <td> is the
  // '% of Portfolio' value (plain number like '22.31' without a '%' sign).
  let $rows = [];
  let $scope = null;
  const $grid = $("#grid");
  if ($grid && $grid.length) {
    $rows = $grid.find("tbody tr").toArray();
  } else {
    // fallback: try common container scopes
    $scope = $("#port_body");
    if (!$scope || $scope.length === 0) $scope = $("#port");
    if (!$scope || $scope.length === 0) $scope = $("#col1");
    if (!$scope || $scope.length === 0) $scope = $("body");
    $rows = $scope.find("tr").toArray();
  }

  const portfolio = [];

  $rows.forEach((tr) => {
    const $tr = $(tr);
    // Prefer the stock link inside the 'stock' cell if present
    const $a = $tr
      .find('td.stock a, a[href*="/stock.php"], a[href*="/stock/"]')
      .first();
    if (!$a || !$a.length) return;

    let code = $a.text().trim();
    if (!code) return;

    // Try table-specific extraction: 3rd cell (index 2) is usually the percent value
    let ratio = null;
    const $tds = $tr.find("td");
    if ($tds && $tds.length >= 3) {
      const txt = $tds.eq(2).text().trim();
      const mPct = txt.match(/^(\d+(?:\.\d+)?)/);
      if (mPct) ratio = mPct[1] + "%";
    }

    // If not found, fallback to searching any cell for a '%'-suffixed number
    if (!ratio) {
      $tr.find("td").each((i, td) => {
        const t = $(td).text().trim();
        const m = t.match(/(\d+(?:\.\d+)?)\s*%/); // capture numeric percent
        if (m) {
          ratio = m[1] + "%";
          return false;
        }
      });
    }

    portfolio.push({ code, ratio });
  });

  // fallback: if nothing found, try older selector patterns (just capture codes)
  if (portfolio.length === 0) {
    // fallback limited to scope (or body if scope missing)
    const $fallbackScope = $scope || $("body");
    $fallbackScope
      .find('td.sym a, a[href*="/stock.php"], a[href*="/stock/"]')
      .each((_, el) => {
        const code = $(el).text().trim();
        if (code && /^[A-Z.]{1,6}$/.test(code))
          portfolio.push({ code, ratio: null });
      });
  }

  // Normalize code (strip trailing " - Company Name" if present), parse numeric ratio
  const normalized = portfolio.map((p) => {
    let rawCode = (p.code || "").trim();
    // split on ' - ' which many pages use: "AAPL - Apple Inc." -> 'AAPL'
    if (rawCode.includes(" - ")) rawCode = rawCode.split(" - ")[0].trim();
    // ensure uppercase ticker
    const code = rawCode.toUpperCase();
    const ratioNum = p.ratio ? parseFloat(p.ratio.replace("%", "")) : 0;
    return { code, ratioNum };
  });

  // dedupe by code, keep the largest ratioNum seen
  const map = new Map();
  for (const item of normalized) {
    if (!map.has(item.code) || map.get(item.code) < item.ratioNum)
      map.set(item.code, item.ratioNum);
  }

  const dedupedArr = Array.from(map.entries()).map(([code, ratioNum]) => ({
    code,
    ratioNum,
  }));
  dedupedArr.sort((a, b) => b.ratioNum - a.ratioNum);

  // 이전에는 상위 10개만 slice 했으나, 요청에 따라 전체 보유종목을 반환
  const fullHoldings = dedupedArr.map((p) => ({
    code: p.code,
    ratio: `${Number(p.ratioNum.toFixed(2))}%`,
  }));

  return {
    no: investor.no,
    name: investor.name,
    totalValue: totalValueStr,
    totalValueNum,
    portfolio: fullHoldings,
  };
}

// Helper: fetch investor targets based on lookup key
async function resolveTargets(investors, lookup) {
  if (!lookup) return investors;
  const key = lookup.trim().toLowerCase();
  const byCode = investors.find((inv) => {
    try {
      const u = new URL(inv.link);
      const m = u.searchParams.get("m");
      return m && m.toLowerCase() === key;
    } catch (e) {
      return false;
    }
  });
  if (byCode) return [byCode];
  const byName = investors.filter((inv) =>
    inv.name.toLowerCase().includes(key)
  );
  return byName.length ? byName : investors;
}

async function fetchInBatches(items, batchSize = 5, delayMs = 250) {
  const out = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((inv) =>
        fetchPortfolio(inv).catch((err) => ({
          no: inv.no,
          name: inv.name,
          portfolio: [],
          error: err.message,
        }))
      )
    );
    out.push(...batchResults);
    if (i + batchSize < items.length)
      await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}

function buildStockAggregation(results) {
  const stockMap = new Map();
  for (const person of results) {
    if (!person || !Array.isArray(person.portfolio)) continue;
    for (const holding of person.portfolio) {
      if (!holding || !holding.code) continue;
      const code = holding.code.toUpperCase();
      const ratio = holding.ratio || null;
      if (!stockMap.has(code)) stockMap.set(code, []);
      stockMap.get(code).push({ no: person.no, name: person.name, ratio });
    }
  }
  const stockArr = Array.from(stockMap.entries()).map(([stock, persons]) => {
    persons.sort((a, b) => {
      const av = parseFloat((a.ratio || "").replace("%", "")) || 0;
      const bv = parseFloat((b.ratio || "").replace("%", "")) || 0;
      return bv - av;
    });
    const numericRatios = persons
      .map((p) => parseFloat((p.ratio || "").replace("%", "")))
      .filter((v) => !isNaN(v));
    const sum = numericRatios.reduce((s, v) => s + v, 0);
    const avg = numericRatios.length ? sum / numericRatios.length : 0;
    return {
      stock,
      person: persons,
      person_count: persons.length,
      avg_ratio: `${avg.toFixed(2)}%`,
      sum_ratio: `${sum.toFixed(2)}%`,
    };
  });
  stockArr.sort((a, b) => {
    // 1) 사람 수(person_count) 내림차순
    const pcDiff = b.person_count - a.person_count;
    if (pcDiff !== 0) return pcDiff;
    // 2) sum_ratio(내림) 보조
    const as = parseFloat((a.sum_ratio || "").replace("%", "")) || 0;
    const bs = parseFloat((b.sum_ratio || "").replace("%", "")) || 0;
    if (bs !== as) return bs - as;
    // 3) 종목명 오름차순
    return a.stock.localeCompare(b.stock);
  });
  return stockArr;
}

function formatPercent(num) {
  if (num == null || isNaN(num)) return "0%";
  const s = num.toFixed(2);
  return s.replace(/\.00$/, "") + "%";
}

function buildRecommended(stockArr, { top, cashPercent }) {
  let cashPct = cashPercent || 0;
  if (isNaN(cashPct) || cashPct < 0) cashPct = 0;
  if (cashPct > 95) cashPct = 95;
  const topN = top && top > 0 ? top : null;
  let recommendedPortfolio = [];
  // selection: topN slice or use entire list (since now allocation handled by sum_ratio weights)
  let investUniverse = topN ? stockArr.slice(0, topN) : stockArr.slice();
  // compute allocation based on sum_ratio
  const investAlloc = 100 - cashPct;
  const sumRatios = investUniverse.map((s) => {
    const v = parseFloat((s.sum_ratio || "").replace("%", ""));
    return isNaN(v) ? 0 : v;
  });
  let weightSum = sumRatios.reduce((a, b) => a + b, 0);
  if (weightSum === 0) weightSum = investUniverse.length;
  const provisional = investUniverse.map((s, idx) => {
    const base = weightSum === 0 ? 1 : sumRatios[idx] || 0;
    const alloc =
      weightSum === 0
        ? investAlloc / investUniverse.length
        : (base / weightSum) * investAlloc;
    return {
      stock: s.stock,
      rawAlloc: alloc,
      person_count: s.person_count,
      avg_ratio: s.avg_ratio,
      sum_ratio: s.sum_ratio,
      sum_ratio_num: sumRatios[idx],
    };
  });
  const rounded = provisional.map((p) => ({
    ...p,
    ratioNum: parseFloat(p.rawAlloc.toFixed(2)),
  }));
  let sumRounded = rounded.reduce((a, b) => a + b.ratioNum, 0);
  const diff = parseFloat((investAlloc - sumRounded).toFixed(2));
  if (Math.abs(diff) >= 0.01 && rounded.length) {
    // adjust the one with largest allocation
    let targetIndex = 0;
    let maxVal = -Infinity;
    rounded.forEach((r, i) => {
      if (r.ratioNum > maxVal) {
        maxVal = r.ratioNum;
        targetIndex = i;
      }
    });
    rounded[targetIndex].ratioNum = parseFloat(
      (rounded[targetIndex].ratioNum + diff).toFixed(2)
    );
  }
  // sort by person_count desc (집단지성 기준), then sum_ratio
  rounded.sort((a, b) => {
    const pcDiff = (b.person_count || 0) - (a.person_count || 0);
    if (pcDiff !== 0) return pcDiff;
    return (b.sum_ratio_num || 0) - (a.sum_ratio_num || 0);
  });
  recommendedPortfolio = rounded.map((r) => ({
    stock: r.stock,
    ratioNum: r.ratioNum,
    person_count: r.person_count,
    avg_ratio: r.avg_ratio,
    sum_ratio: r.sum_ratio,
  }));
  if (cashPct > 0)
    recommendedPortfolio.push({
      stock: "CASH",
      ratioNum: cashPct,
      person_count: 0,
      avg_ratio: null,
      sum_ratio: null,
    });
  return {
    recommendedPortfolio,
    method: "sum_ratio_weighted",
    cashPct,
  };
}

// NEW: generate base (static-ish) data: based_on_person & based_on_stock
export async function generateDataromaBase({
  lookup = LOOKUP,
  batchSize = 5,
  delayMs = 250,
} = {}) {
  const investors = await fetchInvestors();
  const targets = await resolveTargets(investors, lookup);
  const results = await fetchInBatches(targets, batchSize, delayMs);
  results.sort((a, b) => (b.totalValueNum || 0) - (a.totalValueNum || 0));
  results.forEach((inv, idx) => {
    inv.no = idx + 1;
  });
  const stockArr = buildStockAggregation(results);
  return {
    based_on_person: results,
    based_on_stock: stockArr,
    meta: {
      investors_count: results.length,
      generated_at: new Date().toISOString(),
      filtered: !!lookup,
    },
  };
}

// NEW: build only recommended portfolio from precomputed base datasets
export function generateRecommendedPortfolio({
  based_on_stock,
  top,
  cashPercent = 0,
  amount = null,
}) {
  const stockArr = based_on_stock || [];
  const { recommendedPortfolio, method, cashPct } = buildRecommended(stockArr, {
    top,
    cashPercent,
  });
  let totalAmount = amount && !isNaN(amount) && amount > 0 ? amount : null;
  let amountSumCheck = 0;
  const recWithDetails = recommendedPortfolio.map((item) => {
    const ratio = formatPercent(item.ratioNum);
    let cashAlloc = null;
    if (totalAmount) {
      cashAlloc = Math.round((item.ratioNum / 100) * totalAmount);
      amountSumCheck += cashAlloc;
    }
    return {
      stock: item.stock,
      ratio,
      person_count: item.person_count,
      avg_ratio: item.avg_ratio || null,
      sum_ratio: item.sum_ratio || null,
      cash: cashAlloc,
    };
  });
  if (totalAmount) {
    const diff = totalAmount - amountSumCheck;
    if (Math.abs(diff) > 0 && recWithDetails.length) {
      let targetIndex = recWithDetails.findIndex((r) => r.stock === "CASH");
      if (targetIndex === -1) {
        let maxR = -1;
        recWithDetails.forEach((r, i) => {
          const v = parseFloat(r.ratio);
          if (!isNaN(v) && v > maxR) {
            maxR = v;
            targetIndex = i;
          }
        });
      }
      if (targetIndex >= 0) recWithDetails[targetIndex].cash += diff;
    }
  }
  return {
    recommended_portfolio: recWithDetails,
    recommended_settings: {
      top: top || null,
      cash_percent: cashPct,
      method,
      amount: totalAmount,
    },
  };
}

// Backwards compatible full generation (old API)
export async function generateDataromaData(options = {}) {
  const { top, cashPercent, amount, lookup, batchSize, delayMs } = options;
  const base = await generateDataromaBase({ lookup, batchSize, delayMs });
  const rec = generateRecommendedPortfolio({
    based_on_stock: base.based_on_stock,
    top,
    cashPercent,
    amount,
  });
  return {
    based_on_person: base.based_on_person,
    based_on_stock: base.based_on_stock,
    recommended_portfolio: rec.recommended_portfolio,
    meta: {
      ...base.meta,
      recommended_settings: rec.recommended_settings,
    },
  };
}

// CLI execution path
async function runCli() {
  console.log("🚀 시작합니다...");
  const topFlag = rawArgs.find((a) => a.startsWith("--top="));
  const cashFlag = rawArgs.find((a) => a.startsWith("--cash="));
  const amountFlag = rawArgs.find((a) => a.startsWith("--amount="));
  const outFlag = rawArgs.find((a) => a.startsWith("--out="));
  const top = topFlag ? parseInt(topFlag.split("=")[1], 10) : undefined;
  const cashPercent = cashFlag ? parseFloat(cashFlag.split("=")[1]) : 0;
  const amount = amountFlag ? parseFloat(amountFlag.split("=")[1]) : undefined;
  const outPath = outFlag ? outFlag.split("=")[1] : "dataroma_output.json";
  // Step 1: base (static) datasets
  const base = await generateDataromaBase({ lookup: LOOKUP });
  // Step 2: dynamic recommended portfolio
  const rec = generateRecommendedPortfolio({
    based_on_stock: base.based_on_stock,
    top,
    cashPercent,
    amount,
  });
  const data = {
    based_on_person: base.based_on_person,
    based_on_stock: base.based_on_stock,
    recommended_portfolio: rec.recommended_portfolio,
    meta: { ...base.meta, recommended_settings: rec.recommended_settings },
  };
  try {
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("❌ Failed to write output file:", e.message);
  }
}

if (
  import.meta.url ===
    new URL(
      import.meta.resolve
        ? import.meta.resolve("./dataroma_portfolio.js")
        : "file://" + process.argv[1],
      import.meta.url
    ).href ||
  process.argv[1].endsWith("dataroma_portfolio.js")
) {
  runCli().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
