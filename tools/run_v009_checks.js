const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const checks = [
  ["tools/check_text_integrity.js"],
  ["tools/check_index_cache_keys.js"],
  ["tools/smoke_save_migration.js"],
  ["tools/smoke_save_roundtrip.js"],
  ["tools/check_data_references.js"],
  ["tools/check_asset_paths.js"],
  ["tools/check_class_skill_integrity.js"],
  ["tools/check_battle_start_integrity.js"],
];

for (const args of checks) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("v009 checks passed");
