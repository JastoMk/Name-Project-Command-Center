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
    update({ selectedAsset: asset.trim().toUpperCase(), dataSource: source || state.dataSource }, 'asset');
    return true;
  }
  function setTimeframe(timeframe) {
    if (typeof timeframe !== 'string' || !timeframe.trim()) return false;
    update({ timeframe: timeframe.trim() }, 'timeframe');
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
  global.CommandCenterState = Object.freeze({
    workspaces: WORKSPACES.slice(), getState, subscribe, setWorkspace, setAsset,
    setTimeframe, setSignal, setDataStatus, setLastSnapshot
  });
  persist();
})(window);
