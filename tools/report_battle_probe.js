const { loadGameRuntime } = require("./v009_runtime_harness");

// Non-gating deterministic probe for quick balance smoke reads.
// It uses default skill auto-equip without crafted gear, so boss losses are signals rather than release failures.
const classIds = ["tianshu", "tang", "chanlin", "leishi", "xinhuo", "wangchuan", "emei", "furnace"];
const cases = [
  { level: 5, kind: "mob" },
  { level: 5, kind: "boss" },
  { level: 20, kind: "mob" },
  { level: 20, kind: "boss" },
];

const context = loadGameRuntime(`
  const __ProbeRealDate = Date;
  let __probeNow = 0;
  function __ProbeDate(...args) {
    return args.length ? new __ProbeRealDate(...args) : new __ProbeRealDate(__probeNow);
  }
  __ProbeDate.UTC = __ProbeRealDate.UTC;
  __ProbeDate.parse = __ProbeRealDate.parse;
  __ProbeDate.now = function() { return __probeNow; };
  __ProbeDate.prototype = __ProbeRealDate.prototype;
  Date = __ProbeDate;
  Math.random = (() => {
    let seed = 246813579;
    return function seededRandom() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  })();
  render = function() {};
  updateTopbar = function() {};
  queueBattleInfoRender = function() {};
  showResult = function() {};
  saveGame = function() {};
  showRandomEventDialogue = function() {};
  showRandomEventPrompt = function() {};
  setTimeout = function(fn) {
    if (typeof fn === "function") fn();
    return 0;
  };
  globalThis.__v009BattleProbeApi = {
    state,
    createCharacter,
    fixedStatsForClassLevel,
    autoEquip,
    startBattle,
    tickBattle,
    clearInterval,
    advanceProbeClock(ms) {
      __probeNow += ms;
    },
  };
`);
const api = context.__v009BattleProbeApi;

function resetFor(member) {
  api.state.recruits = [member];
  api.state.party = [member.id, null, null, null];
  api.state.selectedMemberId = member.id;
  api.state.maxClearedLevel = 30;
  api.state.idleProgress = 5;
  api.state.money = 0;
  api.state.material = 0;
  api.state.energy = 0;
  api.state.inventory = {};
  api.state.inventoryOrder = [];
  api.state.gear = [];
  api.state.chips = [];
  api.state.battle = null;
  api.state.battleTimer = null;
  api.state.autoRepeat = false;
  api.state.autoRepeatTimer = null;
  api.state.autoRepeatStats = null;
}

function runCase(classId, level, kind) {
  const member = api.createCharacter(classId, null, null, {
    name: `Probe${classId}${level}`,
    gender: "female",
  });
  member.level = level;
  member.stats = api.fixedStatsForClassLevel(classId, level);
  api.autoEquip(member);
  resetFor(member);
  api.startBattle(level, false, kind, { standardRewards: false });
  let ticks = 0;
  const maxTicks = kind === "boss" ? 6000 : 3000;
  while (api.state.battle && !api.state.battle.over && ticks < maxTicks) {
    api.advanceProbeClock(250);
    api.tickBattle();
    ticks += 1;
  }
  const battle = api.state.battle;
  const ally = battle?.allies?.[0] || null;
  const victory = !!battle?.over && (battle.enemies || []).every((enemy) => enemy.hp <= 0);
  if (api.state.battleTimer) api.clearInterval(api.state.battleTimer);
  api.state.battleTimer = null;
  return {
    classId,
    level,
    kind,
    result: battle?.over ? (victory ? "win" : "lose") : "timeout",
    ticks,
    turns: battle?.stats?.playerTurns || 0,
    hpPct: ally?.maxHp ? Math.max(0, Math.round((ally.hp / ally.maxHp) * 100)) : 0,
    enemyHpPct: Math.max(0, Math.round(((battle?.enemies || []).reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0) / Math.max(1, (battle?.enemies || []).reduce((sum, enemy) => sum + Math.max(1, enemy.maxHp), 0))) * 100)),
  };
}

const rows = [];
for (const classId of classIds) {
  for (const item of cases) {
    rows.push(runCase(classId, item.level, item.kind));
  }
}

console.table(rows);
