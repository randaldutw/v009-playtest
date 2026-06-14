const fs = require("node:fs");
const path = require("node:path");
const { repoRoot } = require("./v009_runtime_harness");

const assetRoot = path.join(repoRoot, "assets");
const sourceExtensions = new Set([".html", ".js", ".css", ".md", ".json"]);
const ignoredDirs = new Set([".git", "node_modules"]);

function walkFiles(root) {
  const output = [];
  if (!fs.existsSync(root)) return output;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(fullPath));
    else output.push(fullPath);
  }
  return output;
}

function normalizeSlash(value) {
  return value.replaceAll(path.sep, "/");
}

const sourceText = walkFiles(repoRoot)
  .filter((filePath) => !filePath.startsWith(assetRoot))
  .filter((filePath) => sourceExtensions.has(path.extname(filePath).toLowerCase()))
  .map((filePath) => fs.readFileSync(filePath, "utf8"))
  .join("\n");

const rows = walkFiles(assetRoot)
  .map((filePath) => {
    const relativePath = normalizeSlash(path.relative(repoRoot, filePath));
    const basename = path.basename(filePath);
    const referenced = sourceText.includes(relativePath) || sourceText.includes(relativePath.replace(/^assets\//u, "")) || sourceText.includes(basename);
    return {
      path: relativePath,
      sizeKb: Math.round(fs.statSync(filePath).size / 1024),
      referenced,
    };
  })
  .sort((a, b) => {
    if (a.referenced !== b.referenced) return Number(a.referenced) - Number(b.referenced);
    return b.sizeKb - a.sizeKb;
  });

const totalKb = rows.reduce((sum, row) => sum + row.sizeKb, 0);
const unreferenced = rows.filter((row) => !row.referenced);
const unreferencedKb = unreferenced.reduce((sum, row) => sum + row.sizeKb, 0);

console.log(`asset files: ${rows.length}`);
console.log(`asset size: ${totalKb} KB`);
console.log(`possibly unreferenced: ${unreferenced.length} files, ${unreferencedKb} KB`);
console.table(unreferenced.slice(0, 40));
