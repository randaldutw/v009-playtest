const assert = require("node:assert/strict");
const { loadGameRuntime } = require("./v009_runtime_harness");

const context = loadGameRuntime(`
  globalThis.__v009DataReferenceApi = {
    RESOURCE_DATA,
    ITEM_DATA,
    ITEM_VALUES,
    BLUEPRINT_DATA,
    CHIP_CRAFT_RECIPES,
    GEAR_CRAFT_RECIPES,
    GEAR_SET_DATA,
    GEAR_SLOT_DATA,
    COMMISSION_DATA,
  };
`);
const api = context.__v009DataReferenceApi;

function assertUniqueIds(label, entries) {
  const seen = new Set();
  for (const entry of entries) {
    assert.ok(entry?.id, `${label}: every entry should have an id`);
    assert.ok(!seen.has(entry.id), `${label}: duplicate id ${entry.id}`);
    seen.add(entry.id);
  }
}

function assertCostList(label, costs) {
  assert.ok(Array.isArray(costs), `${label}: costs should be an array`);
  costs.forEach((cost, index) => {
    assert.ok(cost && typeof cost === "object", `${label}: cost ${index} should be an object`);
    assert.ok(Number(cost.count) > 0, `${label}: cost ${index} should have a positive count`);
    if (cost.resource) {
      assert.ok(api.RESOURCE_DATA[cost.resource], `${label}: unknown resource ${cost.resource}`);
    } else {
      assert.ok(api.ITEM_DATA[cost.id], `${label}: unknown item ${cost.id}`);
    }
  });
}

for (const id of Object.keys(api.ITEM_VALUES)) {
  assert.ok(api.ITEM_DATA[id], `ITEM_VALUES references unknown item ${id}`);
}

for (const [id, blueprint] of Object.entries(api.BLUEPRINT_DATA)) {
  assert.ok(blueprint?.name, `BLUEPRINT_DATA.${id} should have a name`);
}

assertUniqueIds("CHIP_CRAFT_RECIPES", api.CHIP_CRAFT_RECIPES);
for (const recipe of api.CHIP_CRAFT_RECIPES) {
  assert.ok(api.BLUEPRINT_DATA[recipe.blueprintKey], `chip recipe ${recipe.id}: unknown blueprint ${recipe.blueprintKey}`);
  assertCostList(`chip recipe ${recipe.id}`, recipe.costs);
  if (recipe.output?.id) assert.ok(api.ITEM_DATA[recipe.output.id], `chip recipe ${recipe.id}: unknown output item ${recipe.output.id}`);
}

assertUniqueIds("GEAR_CRAFT_RECIPES", api.GEAR_CRAFT_RECIPES);
for (const recipe of api.GEAR_CRAFT_RECIPES) {
  if (recipe.blueprintKey) {
    assert.ok(api.BLUEPRINT_DATA[recipe.blueprintKey], `gear recipe ${recipe.id}: unknown blueprint ${recipe.blueprintKey}`);
  }
  assert.ok(api.GEAR_SLOT_DATA[recipe.slot], `gear recipe ${recipe.id}: unknown slot ${recipe.slot}`);
  if (recipe.setId) {
    assert.ok(api.GEAR_SET_DATA[recipe.setId], `gear recipe ${recipe.id}: unknown set ${recipe.setId}`);
  }
  assert.ok(recipe.name, `gear recipe ${recipe.id}: missing name`);
  assertCostList(`gear recipe ${recipe.id}`, recipe.costs);
}

for (const [id, commission] of Object.entries(api.COMMISSION_DATA)) {
  assert.ok(commission?.name, `commission ${id}: missing name`);
  assert.ok(Number(commission.target) > 0, `commission ${id}: target should be positive`);
  assert.ok(commission.reward && typeof commission.reward === "object", `commission ${id}: missing reward`);
  for (const [resource, count] of Object.entries(commission.reward)) {
    assert.ok(api.RESOURCE_DATA[resource], `commission ${id}: unknown reward resource ${resource}`);
    assert.ok(Number(count) > 0, `commission ${id}: reward ${resource} should be positive`);
  }
}

console.log("v009 data reference check passed");
