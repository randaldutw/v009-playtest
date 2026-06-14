const assert = require("node:assert/strict");
const { readText } = require("./v009_runtime_harness");

const html = readText("index.html");
const localResources = [...html.matchAll(/(?:src|href)="([^"]+)"/gu)]
  .map((match) => match[1])
  .filter((target) => target.startsWith("./"))
  .filter((target) => /\.(?:css|js)(?:\?|$)/u.test(target));

assert.ok(localResources.length >= 2, "index.html should reference local CSS/JS resources");
for (const target of localResources) {
  assert.ok(/[?&]v=[A-Za-z0-9_.-]+/u.test(target), `index resource should include a cache key: ${target}`);
}

const scriptResources = localResources.filter((target) => target.endsWith(".js") || target.includes(".js?"));
assert.ok(scriptResources.some((target) => target.includes("app.js")), "index.html should load app.js");

console.log("v009 index cache key check passed");
