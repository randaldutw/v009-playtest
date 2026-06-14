const assert = require("node:assert/strict");
const { loadGameRuntime } = require("./v009_runtime_harness");

const context = loadGameRuntime(`
  globalThis.__v009SaveContractApi = {
    SAVE_KEY,
    CURRENT_SAVE_VERSION,
    MAX_LEVEL,
    BLACKWATER_MAX_LEVEL,
  };
`);
const api = context.__v009SaveContractApi;

assert.equal(api.SAVE_KEY, "liyuan_v009_playtest_save_v1", "SAVE_KEY must remain stable unless an explicit migration/reset plan is added");
assert.ok(Number.isInteger(api.CURRENT_SAVE_VERSION) && api.CURRENT_SAVE_VERSION >= 2, "CURRENT_SAVE_VERSION should be a positive integer and should not go backward");
assert.equal(api.MAX_LEVEL, 20, "v009 current character level cap should stay at Lv20 until the advancement flow is implemented");
assert.equal(api.BLACKWATER_MAX_LEVEL, 30, "Blackwater Sand Plain should stay capped at Lv30");

console.log("v009 save contract check passed");
