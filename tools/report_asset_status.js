const fs = require("node:fs");
const path = require("node:path");
const { repoRoot } = require("./v009_runtime_harness");

const assetRoot = path.join(repoRoot, "assets");

function walkFiles(root) {
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(fullPath));
    else output.push(fullPath);
  }
  return output;
}

function normalizeSlash(value) {
  return value.replaceAll(path.sep, "/");
}

function categoryFor(relativePath) {
  if (relativePath.includes("/fonts/")) return "font";
  if (relativePath.includes("/icons/")) return "icon";
  if (relativePath.includes("/generated/v008/portraits/")) return "player_portrait";
  if (relativePath.includes("/v009_runtime_preview/dialogue/")) return "dialogue_portrait";
  if (relativePath.includes("/v009_runtime_preview/monsters/")) return "enemy_sprite";
  if (relativePath.includes("/v009_runtime_preview/backgrounds/")) return "battle_background";
  if (relativePath.includes("ui_facility_button_")) return "facility_ui";
  if (relativePath.includes("ui_")) return "ui_material";
  if (relativePath.includes("settlement")) return "settlement_background";
  return "other";
}

function statusFor(relativePath, category) {
  if (category === "font") return "runtime_dependency";
  if (relativePath.includes("_clean")) return "cleaned_preview";
  if (relativePath.includes("_preview") || relativePath.includes("/v009_runtime_preview/")) return "placeholder_preview";
  if (relativePath.includes("/generated/v008/portraits/")) return "placeholder_preview";
  if (relativePath.includes("_concept_")) return "concept_reference";
  return "unclassified";
}

const rows = walkFiles(assetRoot)
  .map((filePath) => {
    const relativePath = normalizeSlash(path.relative(repoRoot, filePath));
    const category = categoryFor(relativePath);
    return {
      category,
      status: statusFor(relativePath, category),
      sizeKb: Math.round(fs.statSync(filePath).size / 1024),
      path: relativePath,
    };
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path));

const summary = new Map();
for (const row of rows) {
  const key = `${row.category} | ${row.status}`;
  const current = summary.get(key) || { category: row.category, status: row.status, files: 0, sizeKb: 0 };
  current.files += 1;
  current.sizeKb += row.sizeKb;
  summary.set(key, current);
}

console.log("v009 asset status summary");
console.table([...summary.values()].sort((a, b) => a.category.localeCompare(b.category) || a.status.localeCompare(b.status)));
console.log("v009 asset status detail");
console.table(rows);
