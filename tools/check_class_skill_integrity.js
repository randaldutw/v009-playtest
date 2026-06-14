const assert = require("node:assert/strict");
const { loadGameRuntime } = require("./v009_runtime_harness");

const expectedClasses = ["tianshu", "tang", "chanlin", "leishi", "xinhuo", "wangchuan", "emei", "furnace"];
const requiredSkills = {
  tianshu: ["三點參直", "九九歸一"],
  tang: ["毒蜂針", "蜂王針"],
  chanlin: ["羅漢拳", "金剛反", "明王拳"],
  leishi: ["連珠銃", "掩護裝填", "快速裝填"],
  xinhuo: ["總之先揍", "小命優先"],
  wangchuan: ["生死印", "彼岸步伐", "黃泉引渡"],
  emei: ["流星踏", "落星步", "崩星踏"],
  furnace: ["氣貫長虹", "朝陽破曉", "氣貫長空"],
};

function includesBadText(text) {
  return /undefined|\[object Object\]|\?{4,}/u.test(String(text || ""));
}

const context = loadGameRuntime(`
  globalThis.__v009ClassSkillApi = {
    CLASS_DATA,
    CLASS_RESOURCE_DATA,
    SKILL_UPGRADES,
    SKILL_COMBO_DEFINITIONS,
    SKILL_PRESENTATION_TEXT,
    findSkill,
    skillDetail,
    skillTimingTagLabel,
    skillComboText,
    classIdForSkill,
  };
`);
const api = context.__v009ClassSkillApi;
const classes = api.CLASS_DATA;
const skillIds = new Set();

assert.deepEqual(Object.keys(classes).sort(), expectedClasses.slice().sort(), "v009 should keep exactly eight playable classes");

for (const classId of expectedClasses) {
  const classData = classes[classId];
  assert.ok(classData, `${classId}: class data exists`);
  assert.ok(typeof classData.name === "string" && classData.name, `${classId}: class name exists`);
  assert.ok(Array.isArray(classData.main) && classData.main.length >= 1, `${classId}: main stats exist`);
  assert.ok(Array.isArray(classData.secondary), `${classId}: secondary stats exist`);
  assert.ok(Array.isArray(classData.skills), `${classId}: skills should be an array`);
  assert.ok(classData.skills.length >= 6, `${classId}: should have at least six skills`);
  assert.ok(api.CLASS_RESOURCE_DATA[classId], `${classId}: resource data exists`);

  for (const requiredName of requiredSkills[classId] || []) {
    assert.ok(classData.skills.some((skill) => skill.name === requiredName), `${classId}: missing required skill ${requiredName}`);
  }

  for (const skill of classData.skills) {
    assert.ok(skill.id && typeof skill.id === "string", `${classId}: every skill has an id`);
    assert.ok(!skillIds.has(skill.id), `duplicate skill id: ${skill.id}`);
    skillIds.add(skill.id);
    assert.ok(skill.name && typeof skill.name === "string", `${skill.id}: skill name exists`);
    assert.ok(Number.isFinite(Number(skill.level)) && Number(skill.level) >= 1, `${skill.id}: level is valid`);
    assert.ok(["active", "passive"].includes(skill.type), `${skill.id}: type is valid`);
    assert.equal(api.classIdForSkill(skill.id), classId, `${skill.id}: owner lookup should match`);
    const detail = api.skillDetail(skill, { classId, level: 20, equippedActive: classData.skills.map((entry) => entry.id) });
    for (const [key, value] of Object.entries(detail)) {
      assert.ok(!includesBadText(value), `${skill.id}: generated detail ${key} contains bad text`);
    }
    if (skill.type === "active") {
      assert.ok(["回合", "觸發"].includes(api.skillTimingTagLabel(skill)), `${skill.id}: timing tag should be visible`);
    }
  }
}

for (const [upperId, lowerIds] of Object.entries(api.SKILL_UPGRADES)) {
  assert.ok(skillIds.has(upperId), `upgrade upper skill missing: ${upperId}`);
  for (const lowerId of lowerIds) {
    assert.ok(skillIds.has(lowerId), `upgrade lower skill missing: ${lowerId}`);
  }
}

for (const [skillId, combo] of Object.entries(api.SKILL_COMBO_DEFINITIONS)) {
  assert.ok(skillIds.has(skillId), `combo target skill missing: ${skillId}`);
  assert.ok(skillIds.has(combo.previousSkillId), `combo previous skill missing: ${combo.previousSkillId}`);
  if (combo.upgradedPreviousSkillId) assert.ok(skillIds.has(combo.upgradedPreviousSkillId), `combo upgraded previous skill missing: ${combo.upgradedPreviousSkillId}`);
  assert.ok(Number(combo.bonusCoefficient || 0) > 0, `${skillId}: combo bonus should be positive`);
}

console.log("v009 class skill integrity check passed");
