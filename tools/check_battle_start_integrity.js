const assert = require("node:assert/strict");
const { loadGameRuntime } = require("./v009_runtime_harness");

const classIds = ["tianshu", "tang", "chanlin", "leishi", "xinhuo", "wangchuan", "emei", "furnace"];
const levels = [5, 20];
const kinds = ["mob", "boss"];

const context = loadGameRuntime(`
  render = function() {};
  updateTopbar = function() {};
  queueBattleInfoRender = function() {};
  globalThis.__v009BattleStartApi = {
    state,
    CLASS_DATA,
    createCharacter,
    fixedStatsForClassLevel,
    autoEquip,
    startBattle,
    tickBattle,
    clearInterval,
  };
`);
const api = context.__v009BattleStartApi;

function resetBattleState(member) {
  api.state.recruits = [member];
  api.state.party = [member.id, null, null, null];
  api.state.selectedMemberId = member.id;
  api.state.maxClearedLevel = 30;
  api.state.idleProgress = 5;
  api.state.pendingBossLevel = null;
  api.state.battle = null;
  api.state.battleTimer = null;
  api.state.autoRepeat = false;
  api.state.autoRepeatTimer = null;
  api.state.autoRepeatStats = null;
}

for (const classId of classIds) {
  for (const level of levels) {
    const member = api.createCharacter(classId, null, null, {
      name: `Test${classId}${level}`,
      gender: "female",
    });
    member.level = level;
    member.stats = api.fixedStatsForClassLevel(classId, level);
    api.autoEquip(member);
    assert.ok(member.equippedActive.length > 0, `${classId} Lv${level}: should auto-equip active skills`);

    for (const kind of kinds) {
      resetBattleState(member);
      api.startBattle(level, false, kind);
      const battle = api.state.battle;
      assert.ok(battle, `${classId} Lv${level} ${kind}: battle should start`);
      assert.equal(battle.kind, kind, `${classId} Lv${level} ${kind}: kind should match`);
      assert.equal(battle.allies.length, 1, `${classId} Lv${level} ${kind}: should have one ally`);
      assert.ok(battle.enemies.length >= 1, `${classId} Lv${level} ${kind}: should have enemies`);
      assert.ok(battle.allies[0].maxHp > 0 && battle.allies[0].hp === battle.allies[0].maxHp, `${classId} Lv${level} ${kind}: ally hp should be valid`);
      assert.ok(battle.enemies.every((enemy) => enemy.maxHp > 0 && enemy.hp === enemy.maxHp), `${classId} Lv${level} ${kind}: enemy hp should be valid`);
      assert.ok(battle.allies[0].activeSkillIds.length > 0, `${classId} Lv${level} ${kind}: combatant should carry skills`);
      assert.ok(Array.isArray(battle.feed) && battle.feed.length >= 1, `${classId} Lv${level} ${kind}: battle feed should initialize`);
      for (let i = 0; i < 3; i += 1) api.tickBattle();
      assert.ok(api.state.battle && !Number.isNaN(api.state.battle.allies[0].hp), `${classId} Lv${level} ${kind}: ticking should keep hp numeric`);
      if (api.state.battleTimer) api.clearInterval(api.state.battleTimer);
      api.state.battleTimer = null;
    }
  }
}

console.log("v009 battle start integrity check passed");
