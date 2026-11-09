/* Golden Shield reference HUD: public snapshot + read-only Binance quotes. Legacy API adapter contract remains documented for self-hosted deployments: /api/markets?limit=100, /api/signal?symbol=, STALE / OFFLINE. */
(() => {
  "use strict";
  const SNAPSHOT = "https://raw.githubusercontent.com/JastoMk/Name-Project-Command-Center/main/data/shield-latest.json";
  const BINANCE = "https://api.binance.com/api/v3";
  const ids = id => document.getElementById(id);
  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
  let snapshot = null;
  let quotes = {};
  let selectedSymbol = "BTCUSDT";
  let busy = false;

  const text = (id, value) => { const el = ids(id); if (el) el.textContent = value == null ? "—" : String(value); };
  const price = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString(undefined, {minimumFractionDigits:n < 1 ? 3 : 2, maximumFractionDigits:n < 1 ? 5 : 2});
  };
  const pct = value => {
    const n = Number(value);
    return Number.isFinite(n) ? (n > 0 ? "+" : "") + n.toFixed(2) + "%" : "—";
  };
  const safe = value => String(value == null ? "—" : value).replaceAll("_"," ").toUpperCase();
  const esc = value => String(value == null ? "—" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  const list = value => Array.isArray(value) ? value : [];
  const signalFor = symbol => list(snapshot && snapshot.signals).find(s => s.symbol === symbol);

  function setPill(id, label, kind="warn") {
    const el = ids(id); if (!el) return;
    el.textContent = label; el.className = "pill " + kind;
  }
  function card(signal) {
    const decision = safe(signal.decision);
    const klass = decision === "BUY" ? "buy" : decision === "SELL" ? "sell" : "wait";
    return '<article class="signalcard '+klass+'"><span class="sym">'+esc(signal.symbol)+'</span><strong>'+esc(decision)+'</strong><div class="detail">'+esc(safe(signal.confidence))+' CONFIDENCE · '+esc(safe(signal.regime))+'<br>GRADE '+esc(safe(signal.signal_grade))+' · SCORE '+Number(signal.weighted_score || 0)+'</div></article>';
  }
  function renderSignals() {
    if (!snapshot) return;
    const signals = list(snapshot.signals);
    const all = ids("allSignals");
    const mini = ids("miniSignals");
    if (all) all.innerHTML = signals.map(card).join("");
    if (mini) mini.innerHTML = signals.map(card).join("");
    const rows = signals.map(s => {
      const q = quotes[s.symbol] || {};
      return '<tr><td>'+esc(s.symbol)+'</td><td>'+esc(safe(s.decision))+'</td><td>'+esc(safe(s.confidence))+'</td><td>'+esc(safe(s.regime))+'</td><td>'+Number(s.weighted_score || 0)+'</td><td>'+price(q.lastPrice || s.price)+'</td><td>'+pct(q.priceChangePercent)+'</td></tr>';
    }).join("");
    if (ids("signalRows")) ids("signalRows").innerHTML = rows;
    if (ids("market-watchlist")) ids("market-watchlist").innerHTML = signals.map(s => {
      const q = quotes[s.symbol] || {};
      return '<tr><td>'+esc(s.symbol)+'</td><td>'+price(q.lastPrice || s.price)+'</td><td>'+pct(q.priceChangePercent)+'</td><td>'+esc(safe(s.decision))+'</td><td>'+esc(safe(s.regime))+'</td></tr>';
    }).join("");
    text("signal-count", signals.length + " ASSETS");
    text("coverageText", snapshot.data_quality && snapshot.data_quality.usable_assets || signals.length);
    text("coverageTitle", snapshot.data_quality ? safe(snapshot.data_quality.status) : "SNAPSHOT READY");
    text("coverageDetail", "Usable completed-candle assessments");
    text("quality", snapshot.data_quality ? safe(snapshot.data_quality.status) : "UNKNOWN");
    text("snapshotStatus", safe(snapshot.snapshot_status));
    text("usableAssets", (snapshot.data_quality && snapshot.data_quality.usable_assets || signals.length) + " / " + (snapshot.data_quality && snapshot.data_quality.expected_assets || 3));
    text("systemScore", Math.round(100 * signals.filter(s => s.data_status === "available").length / Math.max(1,signals.length)));
    text("system-grade", "RESEARCH");
    text("alignment", signals.length ? signals.filter(s => list(s.timeframes).filter(t => t.direction === s.decision.toLowerCase()).length >= 3).length + " / " + signals.length + " ALIGNED" : "—");
    text("aiState", snapshot.ai_intelligence && snapshot.ai_intelligence.enabled ? "SHADOW ENABLED" : "DISABLED");
    text("aiCalls", (snapshot.ai_intelligence && snapshot.ai_intelligence.outbound_requests_attempted || 0) + " · SHADOW " + (snapshot.ai_intelligence && snapshot.ai_intelligence.enabled ? "ON" : "OFF"));
    text("reviewQueue", snapshot.review_queue ? snapshot.review_queue.pending_count + " PENDING" : "NOT REPORTED");
    text("reviewQueueDetail", snapshot.review_queue ? snapshot.review_queue.pending_count + " pending review items" : "Not reported");
    const stamp = snapshot.generated_at ? new Date(snapshot.generated_at) : null;
    text("updated", stamp ? "SNAPSHOT " + stamp.toISOString().replace("T"," ").slice(0,19) + " UTC" : "SNAPSHOT TIME UNKNOWN");
    const snapshotAge = Date.now() - new Date(snapshot.generated_at).getTime();
    const snapshotFresh = Number.isFinite(snapshotAge) && snapshotAge >= 0 && snapshotAge <= 2 * 60 * 60 * 1000;
    text("feedstate", "SNAPSHOT " + safe(snapshot.snapshot_status) + (snapshotFresh ? " · FRESH" : " · STALE") + " · " + (snapshot.source || "SOURCE UNKNOWN"));
    text("corestate", snapshot.snapshot_status === "complete" && snapshotFresh ? "THREE ASSET ASSESSMENTS VERIFIED" : "SNAPSHOT STALE OR PARTIAL · REVIEW REQUIRED");
    text("waveState", signals.length + " ASSET ASSESSMENTS");
    const current = signalFor(selectedSymbol) || signals[0];
    if (current) renderDetail(current);
    renderNoise(signals);
    renderVector(signals);
  }
  function renderDetail(s) {
    selectedSymbol = s.symbol;
    text("detailSymbol", s.symbol);
    const rows = [
      ["Decision",safe(s.decision)],["Confidence",safe(s.confidence)],["Grade",safe(s.signal_grade)],
      ["Weighted score",s.weighted_score],["Market regime",safe(s.regime)],["Reference price",price(s.price)],
      ["24h change",pct(s.price_change_pct_24h)],["Candle coverage",list(s.timeframes).length + " / 4"],
      ["Reason",list(s.reasons).join(" · ") || "No reason supplied"],
      ["Warnings",list(s.warnings).join(" · ") || "None reported"]
    ];
    if (ids("signalDetail")) ids("signalDetail").innerHTML = rows.map(r => '<div class="data-row"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join("");
    const byTf = list(s.timeframes);
    const direction = safe(s.decision);
    if (ids("vectorBars")) ids("vectorBars").innerHTML = ["H4","H1","M15","M5"].map(tf => {
      const item = byTf.find(t => t.timeframe === tf);
      const match = item && safe(item.direction) === direction;
      const h = item ? Math.max(12,Math.min(100,Number(item.adx || 0))) : 12;
      return '<i title="'+esc(tf+' · '+(item ? safe(item.direction) : "NO DATA"))+'" style="height:'+h+'%;opacity:'+(match ? 1 : .45)+'"></i>'; 
    }).join("");
  }
  function renderNoise(signals) {
    const current = signalFor(selectedSymbol) || signals[0];
    if (!current) return;
    const tf = list(current.timeframes);
    const matching = tf.filter(t => safe(t.direction) === safe(current.decision)).length;
    const rows = [
      ["Signal coherence",current.signal_grade || "—"],
      ["Timeframe alignment",matching + " / " + tf.length],
      ["Regime consistency",safe(current.regime)],
      ["Warnings",list(current.warnings).length]
    ];
    if (ids("noise")) ids("noise").innerHTML = rows.map(r=>'<div class="data-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join("");
  }
  function draw(canvasId, values, color="#36dfff", mode="line") {
    const canvas = ids(canvasId); if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(160,Math.floor(rect.width)), h = Math.max(65,Math.floor(rect.height));
    const dpr = Math.min(2,window.devicePixelRatio || 1);
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    for (let i=1;i<=4;i++) { ctx.beginPath();ctx.strokeStyle="#0b5268";ctx.lineWidth=.6;ctx.moveTo(0,i*h/5);ctx.lineTo(w,i*h/5);ctx.stroke(); }
    const vals = values.length ? values : [0,1,0,-1,0];
    const min = Math.min(...vals, -1), max = Math.max(...vals, 1), span = max-min || 1;
    ctx.beginPath();
    vals.forEach((v,i)=>{const x=8+i*(w-16)/Math.max(1,vals.length-1);const y=h-8-(v-min)*(h-16)/span;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
    ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.shadowColor=color;ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;
    if (mode==="area") {ctx.lineTo(w-8,h-8);ctx.lineTo(8,h-8);ctx.closePath();ctx.fillStyle="#16dfff14";ctx.fill();}
  }
  function renderVector(signals) {
    const current = signalFor(selectedSymbol) || signals[0];
    if (!current) return;
    const values = list(current.timeframes).map(t => t.direction === "bullish" ? 1 : t.direction === "bearish" ? -1 : 0);
    draw("network",[0,1,0,-1,1,0,-1,0,1,0,-1,1,0],"#1ee5ff");
    draw("noiseWave",Array.from({length:42},(_,i)=>Math.sin(i*.55)*.45+Math.cos(i*.22)*.22),"#29baff");
    draw("directionWave",values.length ? values : [0],current.decision==="BUY"?"#50f4c4":current.decision==="SELL"?"#ff6283":"#ffd16e","area");
  }
  function renderQuotes() {
    const btc=quotes.BTCUSDT||{},eth=quotes.ETHUSDT||{},sol=quotes.SOLUSDT||{};
    [["left-btc",btc],["left-eth",eth],["left-sol",sol],["price-btc",btc],["price-eth",eth],["price-sol",sol]].forEach(([id,q])=>text(id,q.lastPrice ? price(q.lastPrice) : "—"));
    text("quote-time",Object.keys(quotes).length ? new Date().toLocaleTimeString() : "—");
    if (snapshot) renderSignals();
  }
  async function loadSnapshot() {
    const response = await fetch(SNAPSHOT + "?v=" + Date.now(), {cache:"no-store"});
    if (!response.ok) throw new Error("Snapshot HTTP " + response.status);
    const data = await response.json();
    if (!data || data.ok !== true || !Array.isArray(data.signals)) throw new Error("Snapshot schema is not valid");
    snapshot = data;
    renderSignals();
    const ageMs = Date.now() - new Date(data.generated_at).getTime();
    const fresh = Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= 2 * 60 * 60 * 1000;
    setPill("arrayStatus", fresh ? "LIVE SNAPSHOT" : "STALE SNAPSHOT", fresh ? "ok" : "off");
    if (!fresh) { text("corestate", "STALE SNAPSHOT · VERIFY BEFORE REVIEW"); text("feedstate", "SNAPSHOT STALE · LAST GENERATED " + (data.generated_at || "UNKNOWN")); }
  }
  async function loadQuotes() {
    const response = await fetch(BINANCE + "/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(symbols)), {cache:"no-store"});
    if (!response.ok) throw new Error("Binance quote HTTP " + response.status);
    const data = await response.json();
    quotes = {};
    data.forEach(q=>{quotes[q.symbol]=q;});
    renderQuotes();
    setPill("marketStatus","BINANCE LIVE","ok");
  }
  async function loadCandles() {
    const response = await fetch(BINANCE + "/klines?symbol=" + selectedSymbol + "&interval=1h&limit=90",{cache:"no-store"});
    if (!response.ok) throw new Error("Candle HTTP " + response.status);
    const rows = await response.json();
    const closes = rows.slice(0,-1).map(r=>Number(r[4])).filter(Number.isFinite);
    draw("market-chart",closes,"#27e7ff","area");
    text("marketChartNote",selectedSymbol+" · "+closes.length+" completed 1H candles · Binance public REST");
  }
  async function refresh() {
    if (busy) return; busy=true;
    try {
      await loadSnapshot();
      try { await loadQuotes(); } catch (e) { setPill("marketStatus","QUOTE FEED UNAVAILABLE","off"); text("feedstate","SNAPSHOT LIVE · QUOTES UNAVAILABLE"); }
      try { await loadCandles(); } catch (e) { text("marketChartNote","Candles unavailable: "+e.message); }
    } catch (e) {
      setPill("arrayStatus","SNAPSHOT UNAVAILABLE","off");
      text("feedstate","SNAPSHOT ERROR · "+e.message);
      text("corestate","NO VERIFIED SNAPSHOT · SIGNALS WITHHELD");
    } finally { busy=false; }
  }
  document.querySelectorAll("#nav button").forEach(button=>button.addEventListener("click",()=>{
    document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b===button));
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===button.dataset.view));
    if (button.dataset.view==="markets") loadCandles().catch(()=>{});
  }));
  document.addEventListener("click",event=>{
    const cardEl=event.target.closest(".signalcard");
    if (!cardEl) return;
    const sym=cardEl.querySelector(".sym");
    if (!sym) return;
    const found=signalFor(sym.textContent.trim());
    if (found) { renderDetail(found); renderNoise(list(snapshot.signals)); renderVector(list(snapshot.signals)); }
  });
  refresh();
  window.setInterval(refresh,60000);
  window.addEventListener("resize",()=>{if(snapshot){renderVector(list(snapshot.signals));}});
})();