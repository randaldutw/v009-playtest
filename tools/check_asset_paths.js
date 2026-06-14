const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadGameRuntime, readText, repoRoot } = require("./v009_runtime_harness");

function cleanAssetPath(source) {
  return String(source)
    .replace(/^url\((['"]?)/u, "")
    .replace(/(['"]?)\)$/u, "")
    .replace(/^['"]|['"]$/gu, "")
    .replace(/^\.\//u, "")
    .split("?")[0]
    .trim();
}

function assertRepoFile(relativePath, label) {
  const cleanPath = cleanAssetPath(relativePath);
  assert.ok(cleanPath && !cleanPath.includes("${"), `${label}: invalid unresolved path ${relativePath}`);
  assert.ok(fs.existsSync(path.join(repoRoot, cleanPath)), `${label}: missing file ${cleanPath}`);
}

const html = readText("index.html");
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/gu)) {
  const target = cleanAssetPath(match[1]);
  if (/^(?:https?:|data:|#)/u.test(target)) continue;
  assertRepoFile(target, "index.html");
}

const css = readText("styles.css");
for (const match of css.matchAll(/url\(([^)]+)\)/gu)) {
  assertRepoFile(match[1], "styles.css");
}

const context = loadGameRuntime(`
  globalThis.__v009AssetPathApi = {
    portraitCatalog: window.LIYUAN_PORTRAIT_CATALOG,
    eventSpeakers: EVENT_SPEAKERS,
  };
`);
const api = context.__v009AssetPathApi;

const portraitEntries = Object.entries(api.portraitCatalog?.portraitsByClass || {});
assert.ok(portraitEntries.length >= 8, "portrait catalog should include all playable classes");
for (const [classId, genders] of portraitEntries) {
  for (const [gender, paths] of Object.entries(genders || {})) {
    assert.ok(Array.isArray(paths) && paths.length > 0, `portrait catalog ${classId}.${gender}: missing paths`);
    paths.forEach((assetPath, index) => assertRepoFile(assetPath, `portrait catalog ${classId}.${gender}[${index}]`));
  }
}

for (const [speakerId, speaker] of Object.entries(api.eventSpeakers || {})) {
  if (speaker?.image) assertRepoFile(speaker.image, `event speaker ${speakerId}`);
}

console.log("v009 asset path check passed");
