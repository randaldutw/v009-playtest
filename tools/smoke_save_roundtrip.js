const assert = require("node:assert/strict");
const { loadGameRuntime } = require("./v009_runtime_harness");

function loadApi(storage) {
  const context = loadGameRuntime(`
    globalThis.__v009RoundtripApi = {
      state,
      SAVE_KEY,
      CURRENT_SAVE_VERSION,
      CLASS_DATA,
      GEAR_CRAFT_RECIPES,
      createCharacter,
      fixedStatsForClassLevel,
      normalizeGearInstance,
      normalizeChipInstance,
      saveGame,
      loadGame,
    };
  `, { storage });
  return context.__v009RoundtripApi;
}

function makeGear(api, overrides = {}) {
  const recipe = api.GEAR_CRAFT_RECIPES.find((entry) => entry.id === (overrides.recipeId || "wolf_king_arms"))
    || api.GEAR_CRAFT_RECIPES[0];
  return api.normalizeGearInstance({
    id: overrides.id || "roundtrip_weapon",
    name: recipe.name,
    source: "crafted",
    recipeId: recipe.id,
    setId: recipe.setId || "",
    slot: recipe.slot,
    level: recipe.level || 5,
    classId: overrides.classId || "tianshu",
    stats: [
      { key: "output", value: 6 },
      { key: "precision", value: 5 },
    ],
    combat: [
      { key: "powerAmp", value: 5 },
      { key: "critRate", value: 4 },
    ],
  });
}

function makeChip(api) {
  return api.normalizeChipInstance({
    id: "roundtrip_chip",
    name: "測試經脈晶片",
    tier: 1,
    setId: "wolf_pack",
    level: 6,
    abilityStats: [
      { key: "output", value: 3 },
      { key: "armor", value: 2 },
    ],
    combat: { key: "critRate", value: 2 },
  });
}

function prepareMember(api, classId, id, level) {
  const member = api.createCharacter(classId, null, null, {
    name: `${classId}_roundtrip`,
    gender: "female",
  });
  member.id = id;
  member.level = level;
  member.exp = 1234;
  member.stats = api.fixedStatsForClassLevel(classId, level);
  return member;
}

const storage = {};
const first = loadApi(storage);
const player = prepareMember(first, "tianshu", "roundtrip_player", 12);
const body = prepareMember(first, "emei", "roundtrip_body", 4);
body.bodySlotIndex = 1;
body.bodyKind = "blank";
body.bodyOriginal = false;

const equippedGear = makeGear(first, { id: "roundtrip_equipped_weapon", classId: "tianshu" });
const storedGear = makeGear(first, { id: "roundtrip_stored_weapon", classId: "emei" });
const equippedChip = makeChip(first);
assert.ok(equippedGear, "test gear should normalize");
assert.ok(storedGear, "stored gear should normalize");
assert.ok(equippedChip, "test chip should normalize");

player.equipment.weapon = equippedGear;
player.meridians.ren_danzhong = equippedChip;
first.state.showTitle = false;
first.state.view = "workshop";
first.state.creatorCompleted = true;
first.state.introStage = "done";
first.state.money = 54321;
first.state.material = 9876;
first.state.energy = 654;
first.state.maxClearedLevel = 18;
first.state.recruits = [player, body];
first.state.party = [player.id, body.id, null, null];
first.state.selectedMemberId = body.id;
first.state.inventory = { wolf_hide: 17, body_fragment: 55 };
first.state.inventoryOrder = ["body_fragment", "wolf_hide"];
first.state.gear = [storedGear];
first.state.chips = [];
first.state.gearWishlist = ["wolf_king_arms"];
first.state.gearCraftRecipeOpen = { wolf_king_arms: true };
first.state.focusedGearRecipeId = "wolf_king_arms";
first.state.bodySystemUnlocked = true;
first.state.bodySlotUnlocks = { 1: true, 2: true };
first.state.bodyUpgradeMode = "switch";
first.state.blueprints = { wolf_king_gear: true, steel_scorpion_gear: true };
first.state.itemSort = "type";
first.state.itemFilter = "gear";
first.state.inventoryExpanded = true;
first.state.expandedItemFilter = "gear";
first.state.expandedGearSlotFilter = "weapon";
first.state.expandedBisOnly = true;
first.state.expandedItemSearch = "狼王";
first.state.tutorials = { wolfWorkshopIntro: true, bodyManagementIntro: true, autoRepeatIntro: true };
first.state.codexFactionOpen = true;
first.state.codexGeographyOpen = false;
first.state.commissions = {
  sand_patrol: { accepted: true, progress: 2, completed: false, claimed: false },
};
first.state.lastBattleLevel = 12;
first.state.idleProgress = 9;
first.saveGame();

assert.ok(storage[first.SAVE_KEY], "saveGame should write the configured save key");

const second = loadApi(storage);
assert.equal(second.loadGame(), true, "loadGame should restore the saved state");
assert.equal(second.state.view, "workshop");
assert.equal(second.state.creatorCompleted, true);
assert.equal(second.state.money, 54321);
assert.equal(second.state.material, 9876);
assert.equal(second.state.energy, 654);
assert.equal(second.state.maxClearedLevel, 18);
assert.equal(second.state.recruits.length, 2);
assert.equal(second.state.selectedMemberId, body.id);
assert.equal(JSON.stringify(second.state.party), JSON.stringify([player.id, body.id, null, null]));
assert.equal(second.state.inventory.wolf_hide, 17);
assert.equal(second.state.inventory.body_fragment, 55);
assert.equal(JSON.stringify(second.state.inventoryOrder), JSON.stringify(["body_fragment", "wolf_hide"]));
assert.equal(second.state.recruits[0].equipment.weapon.id, equippedGear.id);
assert.equal(second.state.recruits[0].meridians.ren_danzhong.id, equippedChip.id);
assert.equal(second.state.gear[0].id, storedGear.id);
assert.equal(JSON.stringify(second.state.gearWishlist), JSON.stringify(["wolf_king_arms"]));
assert.equal(second.state.gearCraftRecipeOpen.wolf_king_arms, true);
assert.equal(second.state.focusedGearRecipeId, "wolf_king_arms");
assert.equal(second.state.bodySystemUnlocked, true);
assert.equal(second.state.bodySlotUnlocks[1], true);
assert.equal(second.state.bodySlotUnlocks[2], true);
assert.equal(second.state.bodyUpgradeMode, "switch");
assert.equal(second.state.blueprints.wolf_king_gear, true);
assert.equal(second.state.blueprints.steel_scorpion_gear, true);
assert.equal(second.state.inventoryExpanded, true);
assert.equal(second.state.expandedItemFilter, "gear");
assert.equal(second.state.expandedGearSlotFilter, "weapon");
assert.equal(second.state.expandedBisOnly, true);
assert.equal(second.state.expandedItemSearch, "狼王");
assert.equal(second.state.tutorials.wolfWorkshopIntro, true);
assert.equal(second.state.tutorials.bodyManagementIntro, true);
assert.equal(second.state.tutorials.autoRepeatIntro, true);
assert.equal(second.state.codexFactionOpen, true);
assert.equal(second.state.codexGeographyOpen, false);
assert.equal(second.state.commissions.sand_patrol.accepted, true);
assert.equal(second.state.commissions.sand_patrol.progress, 2);
assert.equal(second.state.lastBattleLevel, 12);
assert.equal(second.state.idleProgress, 5);

const savedAgain = JSON.parse(storage[second.SAVE_KEY]);
assert.equal(savedAgain.version, second.CURRENT_SAVE_VERSION, "loadGame should rewrite the current save version");

console.log("v009 save roundtrip smoke test passed");
