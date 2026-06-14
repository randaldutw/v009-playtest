const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertIndexScriptOrder() {
  const html = readText("index.html");
  const required = [
    "data/dialogue_pools.js",
    "data/portrait_catalog.js",
    "data/codex_entries.js",
    "data/tianya_news.js",
    "data/progression_data.js",
    "data/item_core_data.js",
    "data/event_dialogue.js",
    "data/crafting_data.js",
    "app.js",
  ];
  let cursor = -1;
  for (const script of required) {
    const next = html.indexOf(script);
    assert.ok(next >= 0, `index.html should load ${script}`);
    assert.ok(next > cursor, `index.html should load ${script} in dependency order`);
    cursor = next;
  }
}

function createRuntimeContext() {
  const sandbox = {
    console,
    Date,
    Math,
    setTimeout() {},
    clearTimeout() {},
    setInterval() { return 0; },
    clearInterval() {},
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    confirm() { return true; },
    alert() {},
    performance: {
      now() { return Date.now(); },
    },
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {},
    },
  };
  sandbox.window = {
    innerWidth: 1600,
    innerHeight: 900,
    location: { href: "https://example.test/v009-playtest/index.html" },
    addEventListener() {},
  };
  sandbox.document = {
    addEventListener() {},
    documentElement: { style: { setProperty() {} } },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}

function loadGameRuntime(bridgeSource) {
  assertIndexScriptOrder();
  const context = createRuntimeContext();
  [
    "data/dialogue_pools.js",
    "data/portrait_catalog.js",
    "data/codex_entries.js",
    "data/tianya_news.js",
    "data/progression_data.js",
    "data/item_core_data.js",
    "data/event_dialogue.js",
    "data/crafting_data.js",
  ].forEach((relativePath) => {
    vm.runInContext(readText(relativePath), context, { filename: path.join(repoRoot, relativePath) });
  });
  const appSource = readText("app.js").replace(/\ninit\(\);\s*$/u, "\n");
  vm.runInContext(`${appSource}\n${bridgeSource || ""}`, context, { filename: path.join(repoRoot, "app.js") });
  return context;
}

module.exports = {
  assertIndexScriptOrder,
  loadGameRuntime,
  readText,
  repoRoot,
};
