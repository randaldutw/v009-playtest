const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "index.html",
  "README.md",
  "data/codex_entries.js",
  "data/tianya_news.js",
  "data/progression_data.js",
  "data/item_core_data.js",
  "data/event_dialogue.js",
  "data/crafting_data.js",
];

function scanFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  const text = fs.readFileSync(fullPath, "utf8");
  const failures = [];
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xe000 && code <= 0xf8ff) failures.push(`private-use char U+${code.toString(16).toUpperCase()} at ${index}`);
    if (code >= 0x80 && code <= 0x9f) failures.push(`C1 control char U+${code.toString(16).toUpperCase()} at ${index}`);
  }
  if (/\?{4,}/u.test(text)) failures.push("contains ASCII ???? run");
  if (failures.length) {
    throw new Error(`${relativePath}: ${failures.slice(0, 5).join("; ")}`);
  }
}

files.forEach(scanFile);
assert.ok(true);
console.log("v009 text integrity check passed");
