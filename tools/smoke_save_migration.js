const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const appPath = path.join(repoRoot, "app.js");
const indexPath = path.join(repoRoot, "index.html");
const portraitCatalogPath = path.join(repoRoot, "data", "portrait_catalog.js");
const dialoguePoolsPath = path.join(repoRoot, "data", "dialogue_pools.js");
const codexEntriesPath = path.join(repoRoot, "data", "codex_entries.js");
const tianyaNewsPath = path.join(repoRoot, "data", "tianya_news.js");
const progressionDataPath = path.join(repoRoot, "data", "progression_data.js");
const itemCoreDataPath = path.join(repoRoot, "data", "item_core_data.js");
const eventDialoguePath = path.join(repoRoot, "data", "event_dialogue.js");
const craftingDataPath = path.join(repoRoot, "data", "crafting_data.js");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIndexScriptOrder() {
  const html = readText(indexPath);
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
  vm.runInContext(readText(codexEntriesPath), context, { filename: codexEntriesPath });
  vm.runInContext(readText(tianyaNewsPath), context, { filename: tianyaNewsPath });
  vm.runInContext(readText(progressionDataPath), context, { filename: progressionDataPath });
  vm.runInContext(readText(itemCoreDataPath), context, { filename: itemCoreDataPath });
  vm.runInContext(readText(eventDialoguePath), context, { filename: eventDialoguePath });
  vm.runInContext(readText(craftingDataPath), context, { filename: craftingDataPath });
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
      CODEX_FACTION_ENTRIES,
      CODEX_GEOGRAPHY_ENTRIES,
      TIANYA_NEWS_DATA,
      COMMISSION_DATA,
      REGION_DATA,
      FORTUNE_READINGS,
      FORTUNE_RESOURCE_REWARDS,
      ITEM_DATA,
      ITEM_VALUES,
      BLUEPRINT_DATA,
      CHIP_TIER_DATA,
      CHIP_SET_DATA,
      GEAR_COMBAT_STAT_DATA,
      GEAR_SET_DATA,
      GEAR_NAME_PREFIXES,
      EVENT_SPEAKERS,
      INTRO_POST_CREATOR_CLASS_LINES,
      EVENT_DIALOGUE_SEQUENCES,
      CHIP_CRAFT_RECIPES,
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
  assertIndexScriptOrder();
  const api = loadGameRuntime();
  assert.equal(api.CURRENT_SAVE_VERSION, 2, "test harness expects save version 2");
  assert.ok(api.CODEX_FACTION_ENTRIES.length >= 2, "codex faction data should load before app.js");
  assert.ok(api.CODEX_GEOGRAPHY_ENTRIES.length >= 3, "codex geography data should load before app.js");
  assert.ok(api.TIANYA_NEWS_DATA.length >= 6, "Tianya news data should load before app.js");
  assert.ok(Object.keys(api.COMMISSION_DATA).length >= 1, "commission data should load before app.js");
  assert.ok(api.REGION_DATA.some((region) => region.id === "blackwater"), "region data should load before app.js");
  assert.ok(api.FORTUNE_READINGS.length >= 4, "fortune reading data should load before app.js");
  assert.ok(api.FORTUNE_RESOURCE_REWARDS.some((reward) => reward.resource === "material"), "fortune reward data should load before app.js");
  assert.ok(api.ITEM_DATA.body_fragment, "item data should load before app.js");
  assert.equal(api.ITEM_VALUES.body_fragment, 120, "item values should load before app.js");
  assert.ok(api.BLUEPRINT_DATA.wolf_king_gear, "blueprint data should load before app.js");
  assert.ok(api.CHIP_TIER_DATA[1], "chip tier data should load before app.js");
  assert.ok(api.CHIP_SET_DATA.wolf_pack, "chip set data should load before app.js");
  assert.ok(api.GEAR_COMBAT_STAT_DATA.critRate, "gear combat stat data should load before app.js");
  assert.ok(api.GEAR_SET_DATA.wolf_king, "gear set data should load before app.js");
  assert.ok(api.GEAR_NAME_PREFIXES.includes("霓虹"), "gear naming data should load before app.js");
  assert.equal(api.EVENT_SPEAKERS.yu_xiaosui?.name, "俞小穗", "event speaker data should load before app.js");
  assert.ok(api.INTRO_POST_CREATOR_CLASS_LINES.emei?.includes("高端義體"), "class dialogue data should load before app.js");
  assert.ok(JSON.stringify(api.EVENT_DIALOGUE_SEQUENCES.body_management_intro).includes("胡說八道"), "event dialogue sequences should load before app.js");
  assert.ok(api.CHIP_CRAFT_RECIPES.some((recipe) => recipe.id === "wolf_pack_chip_1"), "chip craft recipes should load before app.js");
  assert.ok(api.GEAR_CRAFT_RECIPES.some((recipe) => recipe.name === "狼王式演算元件"), "gear craft recipes should load before app.js");

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
