const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const appPath = path.join(repoRoot, "app.js");
const portraitCatalogPath = path.join(repoRoot, "data", "portrait_catalog.js");
const dialoguePoolsPath = path.join(repoRoot, "data", "dialogue_pools.js");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadGameRuntime() {
  const sandbox = {
    console,
    Date,
    Math,
    setTimeout() {},
    clearTimeout() {},
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    confirm() { return true; },
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
  const context = vm.createContext(sandbox);
  vm.runInContext(readText(dialoguePoolsPath), context, { filename: dialoguePoolsPath });
  vm.runInContext(readText(portraitCatalogPath), context, { filename: portraitCatalogPath });
  const appSource = readText(appPath).replace(/\ninit\(\);\s*$/u, "\n");
  const testBridge = `
    globalThis.__v009TestApi = {
      migrateSave,
      normalizeSave,
      CURRENT_SAVE_VERSION,
      MAX_LEVEL,
      BLACKWATER_MAX_LEVEL,
      BODY_SLOT_COUNT,
      BODY_FRAGMENT_ITEM_ID,
      EQUIPMENT_SLOTS,
      MERIDIAN_CHIP_SLOTS,
      CLASS_DATA,
      GEAR_CRAFT_RECIPES,
      normalizeGearInstance,
      normalizeChipInstance,
    };
  `;
  vm.runInContext(`${appSource}\n${testBridge}`, context, { filename: appPath });
  return context.__v009TestApi;
}

function testGear(api, overrides = {}) {
  const recipe = api.GEAR_CRAFT_RECIPES.find((entry) => entry.slot === (overrides.slot || "weapon")) || api.GEAR_CRAFT_RECIPES[0];
  return {
    id: overrides.id || `gear_${recipe.slot}`,
    name: overrides.name || recipe.name,
    source: "crafted",
    recipeId: recipe.id,
    setId: recipe.setId || "",
    slot: recipe.slot,
    level: overrides.level || recipe.level || 5,
    classId: overrides.classId || recipe.classId || "",
    stats: overrides.stats || [
      { key: "output", value: 7 },
      { key: "precision", value: 5 },
    ],
    combat: overrides.combat || [
      { key: "powerAmp", value: 5 },
      { key: "critRate", value: 4 },
    ],
  };
}

function testChip(overrides = {}) {
  return {
    id: overrides.id || "chip_test",
    name: overrides.name || "狼群測試晶片",
    tier: overrides.tier || 1,
    setId: "wolf_pack",
    level: overrides.level || 6,
    abilityStats: overrides.abilityStats || [
      { key: "output", value: 3 },
      { key: "armor", value: 2 },
    ],
    combat: overrides.combat || { key: "critRate", value: 2 },
  };
}

function testMember(api, overrides = {}) {
  const classId = overrides.classId || "tianshu";
  const weapon = testGear(api, { id: `${classId}_weapon`, slot: "weapon", classId });
  const chip = testChip({ id: `${classId}_chip` });
  return {
    id: overrides.id || `${classId}_member`,
    name: overrides.name || "測試角色",
    gender: overrides.gender || "female",
    classId,
    level: overrides.level || 12,
    exp: overrides.exp || 1200,
    equippedActive: overrides.equippedActive || ["tianshu_probe", "tianshu_ruler", "tianshu_form"],
    equippedPassive: overrides.equippedPassive || null,
    equipment: { weapon },
    meridians: { ren_danzhong: chip },
    bodySlotIndex: overrides.bodySlotIndex ?? 0,
    bodyKind: overrides.bodyKind || "original",
    bodyOriginal: overrides.bodyOriginal ?? true,
  };
}

function migrateCase(api, name, save) {
  const migrated = api.migrateSave(save);
  assert.ok(migrated, `${name}: migration should return a save`);
  assert.equal(migrated.version, api.CURRENT_SAVE_VERSION, `${name}: should move to current save version`);
  assert.notEqual(migrated.view, "battle", `${name}: should not resume directly into battle view`);
  assert.ok(Array.isArray(migrated.party), `${name}: party should be an array`);
  assert.equal(migrated.party.length, 4, `${name}: party should always have four slots`);
  assert.ok(migrated.tutorials && typeof migrated.tutorials === "object", `${name}: tutorials should be normalized`);
  assert.equal(typeof migrated.tutorials.autoRepeatIntro, "boolean", `${name}: auto repeat tutorial flag should exist`);
  assert.ok(migrated.inventory && typeof migrated.inventory === "object", `${name}: inventory should be normalized`);
  assert.ok(Array.isArray(migrated.inventoryOrder), `${name}: inventory order should be normalized`);
  assert.ok(Array.isArray(migrated.gear), `${name}: gear inventory should be normalized`);
  assert.ok(Array.isArray(migrated.chips), `${name}: chip inventory should be normalized`);
  assert.ok(migrated.blueprints && typeof migrated.blueprints === "object", `${name}: blueprints should be normalized`);
  assert.ok(migrated.commissions && typeof migrated.commissions === "object", `${name}: commissions should be normalized`);
  return migrated;
}

function run() {
  const api = loadGameRuntime();
  assert.equal(api.CURRENT_SAVE_VERSION, 2, "test harness expects save version 2");

  const preCreator = migrateCase(api, "pre creator", {
    version: 1,
    view: "town",
    creatorCompleted: false,
    money: -100,
    material: "bad",
    energy: null,
    recruits: [],
    party: ["missing"],
    inventory: ["wolf_hide", { id: "black_sand", count: 3 }, { id: "invalid_item", count: 9 }],
    tutorials: {},
  });
  assert.equal(preCreator.creatorCompleted, false);
  assert.equal(preCreator.money, 0);
  assert.equal(preCreator.material, 120);
  assert.equal(preCreator.inventory.wolf_hide, 1);
  assert.equal(preCreator.inventory.black_sand, 3);
  assert.equal(preCreator.inventory.invalid_item, undefined);

  const player = testMember(api, { id: "player_a", classId: "tianshu", level: 20 });
  const body = testMember(api, { id: "body_emei", classId: "emei", level: 7, bodySlotIndex: 1, bodyKind: "blank", bodyOriginal: false });
  const active = migrateCase(api, "active midgame", {
    version: 1,
    view: "battle",
    creatorCompleted: true,
    maxClearedLevel: 12,
    selectedMemberId: player.id,
    recruits: [player, body],
    party: [player.id, body.id, "missing", null, "extra"],
    inventory: { wolf_hide: 8, wolf_core: 2, body_fragment: 50, invalid_item: 3 },
    inventoryOrder: ["body_fragment", "wolf_hide", "invalid_item"],
    gear: [testGear(api, { id: "stored_head", slot: "head" }), { id: "bad_gear", slot: "weapon", stats: [] }],
    chips: [testChip({ id: "stored_chip" }), { id: "bad_chip", abilityStats: [] }],
    blueprints: { wolf_king_gear: true },
    gearWishlist: ["wolf_king_weapon", "wolf_king_weapon", "bad_recipe"],
    bodySystemUnlocked: true,
    bodySlotUnlocks: { 1: true, 2: true },
    bodyUpgradeMode: "switch",
    tutorials: { wolfWorkshopIntro: true },
    commissions: {
      blackwater_patrol: { accepted: true, progress: 999, completed: false, claimed: false },
    },
    autoRepeatSession: {
      active: true,
      level: 999,
      kind: "mob",
      lastAt: 1,
      stats: { battles: 3, exp: 120, money: 90, material: 40, energy: 10, items: { wolf_hide: 2, invalid_item: 7 } },
    },
  });
  assert.equal(active.view, "town");
  assert.equal(active.maxClearedLevel, 12);
  assert.equal(active.recruits.length, 2);
  assert.equal(active.selectedMemberId, player.id);
  assert.deepEqual(active.party, [player.id, body.id, null, null]);
  assert.equal(active.inventory.body_fragment, 50);
  assert.equal(active.inventory.invalid_item, undefined);
  assert.equal(active.bodySystemUnlocked, true);
  assert.equal(active.bodySlotUnlocks[1], true);
  assert.equal(active.bodySlotUnlocks[2], true);
  assert.equal(active.bodyUpgradeMode, "switch");
  assert.equal(active.gear.length, 1);
  assert.equal(active.chips.length, 1);
  assert.equal(active.autoRepeatSession.active, true);
  assert.equal(active.autoRepeatSession.level, api.BLACKWATER_MAX_LEVEL);
  assert.equal(active.autoRepeatSession.stats.items.invalid_item, undefined);

  const eventRepeat = migrateCase(api, "event auto repeat stripped", {
    version: 1,
    creatorCompleted: true,
    recruits: [testMember(api, { id: "player_b", classId: "leishi", level: 11 })],
    party: ["player_b"],
    autoRepeatSession: { active: true, level: 11, kind: "event_duel", stats: { battles: 1 } },
  });
  assert.equal(eventRepeat.autoRepeatSession, null);

  assert.equal(api.migrateSave(null), null, "null save should fail closed");
  assert.equal(api.migrateSave({ version: 1, creatorCompleted: true, recruits: [] }), null, "completed save with no recruits should fail closed");

  console.log("v009 save migration smoke test passed");
}

run();
