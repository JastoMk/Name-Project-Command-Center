/* Command Center 2.0 — shared application state foundation.
 * Device-local persistence only. No API credentials or execution capability.
 */
(function (global) {
  'use strict';
  const WORKSPACES = ['overview','markets','signals','shield','gold','backtesting','portfolio','calendar','health'];
  const STORAGE_KEY = 'command-center-state-v1';
  const DEFAULTS = {
    version: 1,
    activeWorkspace: 'overview',
    selectedAsset: 'BTCUSDT',
    timeframe: '15m',
    dataSource: 'binance',
    selectedSignalId: null,
    reviewQueue: [],
    dataStatus: { overall: 'unknown', feeds: {} },
    lastSnapshot: null,
    navigationHistory: []
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function readStored() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && parsed.version === 1 ? parsed : {};
    } catch (_) { return {}; }
  }
  let state = Object.assign({}, clone(DEFAULTS), readStored());
  state.dataStatus = Object.assign({}, DEFAULTS.dataStatus, state.dataStatus || {});
  state.dataStatus.feeds = Object.assign({}, state.dataStatus.feeds || {});
  state.reviewQueue = Array.isArray(state.reviewQueue) ? state.reviewQueue : [];
  state.navigationHistory = Array.isArray(state.navigationHistory) ? state.navigationHistory.slice(-30) : [];
  const listeners = new Set();
  function persist() {
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* Private browsing/quota failures must not break the workspace. */ }
  }
  function emit(reason) {
    const snapshot = getState();
    listeners.forEach(fn => { try { fn(snapshot, reason); } catch (error) { console.error('Command Center subscriber failed', error); } });
    global.dispatchEvent(new CustomEvent('cc:state-change', { detail: { state: snapshot, reason } }));
  }
  function getState() { return clone(state); }
  function update(patch, reason) {
    state = Object.assign({}, state, patch, { version: 1 });
    persist();
    emit(reason || 'update');
    return getState();
  }
  function setWorkspace(workspace, options) {
    if (!WORKSPACES.includes(workspace)) return false;
    const opts = options || {};
    if (state.activeWorkspace !== workspace) {
      state.navigationHistory = state.navigationHistory.concat([{
        from: state.activeWorkspace, to: workspace, at: new Date().toISOString()
      }]).slice(-30);
    }
    update({ activeWorkspace: workspace }, 'workspace');
    if (opts.updateUrl !== false && global.history && global.location) {
      const next = '#' + workspace;
      if (global.location.hash !== next) global.history.pushState({ workspace }, '', next);
    }
    return true;
  }
  function setAsset(asset, source) {
    if (typeof asset !== 'string' || !asset.trim()) return false;
    const normalized = asset.trim().toUpperCase();
    update({ selectedAsset: normalized, dataSource: source || state.dataSource }, 'asset');
    syncControls();
    if (source === 'engine-selector' && normalized !== 'OANDA:XAUUSD' && typeof global.setLiveChart === 'function') {
      global.setLiveChart('BINANCE:' + normalized, normalized.replace('USDT', ' / USDT'), 'Binance · TradingView');
    }
    return true;
  }
  function setTimeframe(timeframe, source) {
    if (typeof timeframe !== 'string' || !timeframe.trim()) return false;
    update({ timeframe: timeframe.trim() }, 'timeframe');
    syncControls();
    if (source === 'engine-selector' && typeof global.setLiveChart === 'function') {
      const current = global.document.getElementById('liveAsset');
      const instrument = current ? current.value : 'BINANCE:' + state.selectedAsset;
      global.setLiveChart(instrument, instrument === 'OANDA:XAUUSD' ? 'XAU/USD' : instrument.replace('BINANCE:', '').replace('USDT', ' / USDT'), instrument === 'OANDA:XAUUSD' ? 'OANDA · TradingView' : 'Binance · TradingView');
    }
    return true;
  }
  function setSignal(signalId) { update({ selectedSignalId: signalId || null }, 'signal'); }
  function setDataStatus(status) {
    if (!status || typeof status !== 'object') return false;
    update({ dataStatus: Object.assign({}, state.dataStatus, status, {
      feeds: Object.assign({}, state.dataStatus.feeds, status.feeds || {})
    }) }, 'data-status');
    return true;
  }
  function setLastSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    update({ lastSnapshot: { generatedAt: snapshot.generated_at || snapshot.generatedAt || null,
      source: snapshot.source || null, scope: snapshot.scope || null,
      stale: Boolean(snapshot.stale), cachedAt: new Date().toISOString() } }, 'snapshot');
    return true;
  }
  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function syncFromLocation() {
    const workspace = (global.location.hash || '').slice(1);
    if (WORKSPACES.includes(workspace)) setWorkspace(workspace, { updateUrl: false });
  }
  global.addEventListener('popstate', syncFromLocation);
  global.addEventListener('hashchange', syncFromLocation);
  function syncControls() {
    const symbol = global.document.getElementById('symbol');
    const liveAsset = global.document.getElementById('liveAsset');
    const interval = global.document.getElementById('interval');
    const liveTf = global.document.getElementById('liveTf');
    if (state.selectedAsset === 'OANDA:XAUUSD' && liveAsset) liveAsset.value = 'OANDA:XAUUSD';
    else if (state.selectedAsset && symbol) {
      if (![...symbol.options].some(option => option.value === state.selectedAsset)) {
        symbol.add(new Option(state.selectedAsset, state.selectedAsset));
      }
      symbol.value = state.selectedAsset;
      if (liveAsset) {
        const chartValue = 'BINANCE:' + state.selectedAsset;
        if (![...liveAsset.options].some(option => option.value === chartValue)) {
          liveAsset.add(new Option(state.selectedAsset, chartValue));
        }
        liveAsset.value = chartValue;
      }
    }
    if (interval && [...interval.options].some(option => option.value === state.timeframe)) interval.value = state.timeframe;
    const chartTimeframes = { '1m':'1', '5m':'5', '15m':'15', '1h':'60', '4h':'240', '1d':'D' };
    if (liveTf && chartTimeframes[state.timeframe] && [...liveTf.options].some(option => option.value === chartTimeframes[state.timeframe])) {
      liveTf.value = chartTimeframes[state.timeframe];
    }
  }
  function wireControls() {
    const byId = id => global.document.getElementById(id);
    const symbol = byId('symbol'), liveAsset = byId('liveAsset'), interval = byId('interval'), liveTf = byId('liveTf');
    if (symbol) symbol.addEventListener('change', () => setAsset(symbol.value, 'engine-selector'));
    if (liveAsset) liveAsset.addEventListener('change', () => setAsset(liveAsset.value === 'OANDA:XAUUSD' ? 'OANDA:XAUUSD' : liveAsset.value.replace(/^BINANCE:/, ''), liveAsset.value === 'OANDA:XAUUSD' ? 'oanda' : 'binance'));
    if (interval) interval.addEventListener('change', () => setTimeframe(interval.value, 'engine-selector'));
    if (liveTf) liveTf.addEventListener('change', () => {
      const map = { '1':'1m', '5':'5m', '15':'15m', '60':'1h', '240':'4h', 'D':'1d' };
      if (map[liveTf.value]) setTimeframe(map[liveTf.value]);
    });
    const rows = byId('coinRows');
    if (rows) rows.addEventListener('click', event => {
      const row = event.target.closest('tr[data-symbol]');
      if (row) setAsset(row.dataset.symbol, 'binance');
    });
    syncControls();
  }
  wireControls();
  global.CommandCenterState = Object.freeze({
    workspaces: WORKSPACES.slice(), getState, subscribe, setWorkspace, setAsset,
    setTimeframe, setSignal, setDataStatus, setLastSnapshot
  });
  persist();
})(window);
