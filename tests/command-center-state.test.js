const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadController(saved) {
  const store = new Map(saved ? [['command-center-state-v1', JSON.stringify(saved)]] : []);
  const listeners = {};
  const makeSelect = values => ({
    options: values.map(value => ({ value })),
    value: values[0] || '',
    add(option) { this.options.push(option); },
    addEventListener() {}
  });
  const elements = {
    symbol: makeSelect(['BTCUSDT','ETHUSDT','BNBUSDT']),
    liveAsset: makeSelect(['BINANCE:BTCUSDT','BINANCE:ETHUSDT','OANDA:XAUUSD']),
    interval: makeSelect(['15m','1h','4h']),
    liveTf: makeSelect(['1','5','15','60','240','D']),
    coinRows: { addEventListener() {} }
  };
  const window = {
    document: { getElementById: id => elements[id] || null },
    localStorage: {
      getItem: key => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, value)
    },
    location: { hash: '' },
    history: { pushState(_state, _title, hash) { window.location.hash = hash; } },
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    dispatchEvent() {}
  };
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  class Option { constructor(text, value) { this.text = text; this.value = value; } }
  const source = fs.readFileSync('assets/js/command-center-state.js', 'utf8');
  vm.runInNewContext(source, { window, CustomEvent, Option, console, Date, JSON, Set, Object, Array });
  return { api: window.CommandCenterState, window, elements, store, listeners };
}

test('shared state initializes with safe defaults and exposes the approved workspaces', () => {
  const { api } = loadController();
  const state = api.getState();
  assert.equal(state.activeWorkspace, 'overview');
  assert.equal(state.selectedAsset, 'BTCUSDT');
  assert.equal(state.timeframe, '15m');
  assert.deepEqual(Array.from(api.workspaces), ['overview','markets','signals','shield','gold','backtesting','portfolio','calendar','health']);
  assert.deepEqual(Array.from(state.reviewQueue), []);
});

test('asset and timeframe changes synchronize the existing dashboard selectors', () => {
  const { api, elements } = loadController();
  api.setAsset('ETHUSDT', 'binance');
  assert.equal(api.getState().selectedAsset, 'ETHUSDT');
  assert.equal(elements.symbol.value, 'ETHUSDT');
  assert.equal(elements.liveAsset.value, 'BINANCE:ETHUSDT');
  api.setTimeframe('1h');
  assert.equal(api.getState().timeframe, '1h');
  assert.equal(elements.interval.value, '1h');
  assert.equal(elements.liveTf.value, '60');
});

test('workspace navigation records history and supports browser back/forward state restoration', () => {
  const { api, window, listeners } = loadController();
  assert.equal(api.setWorkspace('markets'), true);
  assert.equal(window.location.hash, '#markets');
  assert.equal(api.getState().activeWorkspace, 'markets');
  window.location.hash = '#overview';
  for (const listener of listeners.popstate || []) listener();
  assert.equal(api.getState().activeWorkspace, 'overview');
  assert.equal(api.getState().navigationHistory.length, 2);
  assert.equal(api.setWorkspace('not-a-workspace'), false);
});

test('data health and snapshot metadata are persisted without credentials', () => {
  const { api, store } = loadController();
  api.setDataStatus({ overall: 'degraded', feeds: { binance: 'stale' } });
  api.setLastSnapshot({ generated_at: '2026-11-06T01:00:00Z', source: 'golden-shield', scope: 'research' });
  const saved = JSON.parse(store.get('command-center-state-v1'));
  assert.equal(saved.dataStatus.overall, 'degraded');
  assert.equal(saved.dataStatus.feeds.binance, 'stale');
  assert.equal(saved.lastSnapshot.source, 'golden-shield');
  assert.equal(saved.lastSnapshot.stale, false);
  assert.equal(Object.keys(saved).some(key => /token|secret|password|apiKey/i.test(key)), false);
});

test('saved asset and timeframe are restored on initialization', () => {
  const saved = { version: 1, activeWorkspace: 'markets', selectedAsset: 'ETHUSDT', timeframe: '4h',
    dataSource: 'binance', selectedSignalId: null, reviewQueue: [], dataStatus: { overall: 'ok', feeds: {} },
    lastSnapshot: null, navigationHistory: [] };
  const { api, elements } = loadController(saved);
  assert.equal(api.getState().selectedAsset, 'ETHUSDT');
  assert.equal(elements.symbol.value, 'ETHUSDT');
  assert.equal(elements.liveAsset.value, 'BINANCE:ETHUSDT');
  assert.equal(elements.interval.value, '4h');
  assert.equal(elements.liveTf.value, '240');
});
