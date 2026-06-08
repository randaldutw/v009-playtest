"use strict";

const STAT_KEYS = ["output", "reaction", "supply", "armor", "precision"];
const STAT_LABELS = {
  output: "出力",
  reaction: "反應",
  supply: "供能",
  armor: "耐久",
  precision: "精準",
};

const STAT_DESCRIPTIONS = {
  output: "影響造成傷害的基礎強度。",
  reaction: "影響行動條累積速度與出手頻率。",
  supply: "影響治療、護盾效率與門派特殊資源效率。",
  armor: "影響生命與承受傷害的能力。",
  precision: "影響穩定輸出、標定與火器類招式效率。",
};

const CLASS_ROLE_TONES = {
  tianshu: "tank",
  tang: "heal",
  chanlin: "tank",
  leishi: "damage",
  xinhuo: "tank",
  wangchuan: "damage",
  emei: "heal",
  furnace: "damage",
};

const CLASS_BATTLE_DAMAGE_MULTIPLIER = {
  tianshu: 1.68,
  tang: 1.02,
  chanlin: 1.34,
  leishi: 2.18,
  xinhuo: 1.24,
  wangchuan: 1.46,
  emei: 1.38,
  furnace: 1.4,
};

const V009_PLAYER_ATTACK_FX_BY_CLASS = {
  tianshu: "direct-sword-aqua",
  chanlin: "punch-gold",
  xinhuo: "punch-red",
  tang: "needle-green",
  wangchuan: "needle-darkgreen",
  leishi: "gun-orange",
  emei: "crescent-whitegold",
  furnace: "beam-purple",
};

const V009_ENEMY_ATTACK_FX_BY_TYPE = {
  wolf: "bite-darkred",
  scorpion: "needle-darkred",
  slime: "energy-darkred",
  raider: "slash-darkred",
  machine: "gun-darkred",
};

const V009_ATTACK_FX_CONFIG = {
  "direct-sword-aqua": { family: "directSword", tone: "aqua", hit: "crit" },
  "slash-aqua": { family: "slash", tone: "aqua" },
  "slash-darkred": { family: "slash", tone: "darkred" },
  "punch-gold": { family: "punch", tone: "gold", hit: "crit" },
  "vajra-reflect-gold": { family: "vajraReflect", tone: "gold", hit: "crit" },
  "punch-red": { family: "punch", tone: "red", hit: "crit" },
  "self-crit-red": { family: "selfCrit", tone: "red", scale: 2 },
  "needle-green": { family: "needle", tone: "green" },
  "needle-darkgreen": { family: "needle", tone: "darkgreen" },
  "needle-darkgreen-triple": { family: "needleTriple", tone: "darkgreen" },
  "needle-darkred": { family: "needle", tone: "darkred" },
  "gun-orange": { family: "gun", tone: "orange" },
  "gun-darkred": { family: "gun", tone: "darkred" },
  "beam-purple": { family: "beam", tone: "purple" },
  "life-death-seal-impact": { family: "lifeDeathSeal", tone: "purple", hit: "lifeDeathSeals" },
  "energy-darkred": { family: "energy", tone: "darkred" },
  "bite-darkred": { family: "bite", tone: "darkred" },
  "crescent-whitegold": { family: "crescent", tone: "whitegold" },
};

const AUTO_REPEAT_REWARD_RATE = 0.6;
const AUTO_REPEAT_INTERVAL_MS = 10000;

const ROLE_LABELS = {
  tank: "防護",
  damage: "輸出",
  heal: "治療",
};

const RARITIES = [
  { id: "white", name: "凡才", total: 20, growth: 2, cost: 1, rate: 44 },
  { id: "green", name: "良才", total: 25, growth: 3, cost: 3, rate: 30 },
  { id: "blue", name: "俊才", total: 30, growth: 5, cost: 8, rate: 20 },
  { id: "orange", name: "奇才", total: 35, growth: 7, cost: 20, rate: 5 },
  { id: "red", name: "天才", total: 40, growth: 8, cost: 30, rate: 1 },
];

const GENDERS = {
  male: "男",
  female: "女",
};

const HIRE_BASE_COST = 80;
const RECRUIT_LOCK_COST = 300;
const BATTLE_TICK_MS = 60;
const BATTLE_TICK_SCALE = BATTLE_TICK_MS / 140;
const BATTLE_RENDER_MIN_MS = 33;
const BATTLE_OPENING_PLAYER_ACTION = 84;
const BATTLE_OPENING_ENEMY_ACTION = 58;
const BATTLE_ACTION_GAIN_MULT = 1.38;
const BATTLE_EVENT_READ_MS = 640;
const BATTLE_EVENT_FEED_READ_MS = 150;
const BATTLE_EVENT_FLOAT_READ_MS = 90;
const BATTLE_EVENT_READ_MAX_MS = 1600;
const SAVE_KEY = "liyuan_v009_playtest_save_v1";
const CURRENT_SAVE_VERSION = 1;
const APP_VERSION = "v009.0.0";
const ACTIVE_SKILL_SLOT_COUNT = 8;
const BODY_SLOT_COUNT = 8;
const BODY_FRAGMENT_ITEM_ID = "body_fragment";
const BODY_SLOT_UNLOCK_FRAGMENT_COST = 50;
const BODY_FRAGMENT_EXPECTED_BATTLES_PER_UNLOCK = 150;
const BODY_FRAGMENT_DROP_CHANCE = BODY_SLOT_UNLOCK_FRAGMENT_COST / BODY_FRAGMENT_EXPECTED_BATTLES_PER_UNLOCK;
const RECRUIT_CANDIDATE_COUNT = 6;
const RECRUIT_REFRESH_COST = 120;
const MARKET_STOCK_SLOT_COUNT = 6;
const RESOURCE_EXCHANGE_VALUES = { money: 1, material: 6, energy: 10 };
const RESOURCE_EXCHANGE_RATE = 0.8;
const UI_DESIGN_WIDTH = 1600;
const UI_DESIGN_HEIGHT = 900;
const EQUIPMENT_SLOTS = [
  { key: "weapon", label: "武器", empty: "未裝備", focus: "門派強化" },
  { key: "head", label: "頭部", empty: "未裝備", focus: "演算" },
  { key: "torso", label: "身體", empty: "未裝備", focus: "生命" },
  { key: "hands", label: "手部", empty: "未裝備", focus: "威力" },
  { key: "legs", label: "腿腳", empty: "未裝備", focus: "速度" },
  { key: "dantian", label: "丹田", empty: "未裝備", focus: "資源" },
];
const MERIDIAN_CHIP_SLOTS = [
  { key: "ren_danzhong", channel: "任脈", label: "膻中", empty: "空槽" },
  { key: "ren_zhongwan", channel: "任脈", label: "中脘", empty: "空槽" },
  { key: "ren_shenque", channel: "任脈", label: "神闕", empty: "空槽" },
  { key: "ren_qihai", channel: "任脈", label: "氣海", empty: "空槽" },
  { key: "ren_guanyuan", channel: "任脈", label: "關元", empty: "空槽" },
  { key: "du_baihui", channel: "督脈", label: "百會", empty: "空槽" },
  { key: "du_shenting", channel: "督脈", label: "神庭", empty: "空槽" },
  { key: "du_dazhui", channel: "督脈", label: "大椎", empty: "空槽" },
  { key: "du_mingmen", channel: "督脈", label: "命門", empty: "空槽" },
  { key: "du_changqiang", channel: "督脈", label: "長強", empty: "空槽" },
];
const EQUIPMENT_CHIP_SLOTS = MERIDIAN_CHIP_SLOTS;
const MAX_LEVEL = 20;
const BLACKWATER_MAX_LEVEL = 30;
const XP_CURVE_TARGET_DAYS = 3;
const V009_BASE_STAT_TOTAL = 30;
const V009_RECRUIT_COST = 120;

const RESOURCE_DATA = {
  money: { name: "荒幣", tone: "money" },
  material: { name: "資材", tone: "material" },
  energy: { name: "能源", tone: "energy" },
};

const ITEM_DATA = {
  worn_chip: { name: "殘舊晶片", type: "chip-core", note: "可在工房改造為各等級原形晶片，是後續打造晶片的核心材料。" },
  prototype_chip_1: { name: "一階原形晶片", type: "chip-core", note: "用於打造基礎的經脈晶片。" },
  prototype_chip_2: { name: "二階原形晶片", type: "chip-core", note: "用於打造優良的經脈晶片。" },
  prototype_chip_3: { name: "三階原形晶片", type: "chip-core", note: "用於打造高階的經脈晶片。" },
  black_sand: { name: "黑水砂", type: "region" },
  xuan_sand_core: { name: "玄砂凝核", type: "region" },
  wolf_hide: { name: "砂狼粗皮", type: "monster" },
  wolf_core: { name: "砂狼脈核", type: "monster" },
  wolf_king_core: { name: "狼王脈核", type: "monster", note: "擊敗 Lv5 狼王後取得的頭目專屬材料，用於鍛造狼王式外骨骼裝備。" },
  scorpion_shell: { name: "毒蠍殼片", type: "monster" },
  scorpion_venom: { name: "毒蠍腺晶", type: "monster" },
  steel_scorpion_core: { name: "鋼尾蠍王核心", type: "monster", note: "擊敗 Lv10 鋼尾蠍王後取得的頭目專屬材料，用於鍛造鋼蠍式輔助武裝。" },
  slime_gel: { name: "腐光凝膠", type: "monster" },
  slime_seed: { name: "腐光孢核", type: "monster" },
  raider_scrap: { name: "殘兵械片", type: "monster" },
  raider_token: { name: "荒路銘牌", type: "monster" },
  machine_plate: { name: "機兵耐久片", type: "monster" },
  machine_core: { name: "機兵殘核", type: "monster" },
  body_fragment: { name: "義體殘片", type: "quest", note: "交給姚衡舟後，可用於開放更多空白義體槽。" },
};

const ENEMY_DROP_PROFILE = {
  wolf: { money: 13, material: 6, energy: 2, common: "wolf_hide", rare: "wolf_core" },
  scorpion: { money: 10, material: 10, energy: 3, common: "scorpion_shell", rare: "scorpion_venom" },
  slime: { money: 8, material: 12, energy: 5, common: "slime_gel", rare: "slime_seed" },
  raider: { money: 16, material: 5, energy: 2, common: "raider_scrap", rare: "raider_token" },
  machine: { money: 18, material: 12, energy: 8, common: "machine_plate", rare: "machine_core" },
};

const BLACKWATER_REGION_DROPS = [
  { id: "black_sand", chance: 0.62, amount: [1, 2] },
  { id: "xuan_sand_core", chance: 0.18, amount: [1, 1] },
];

const GLOBAL_DROPS = [
  { id: "worn_chip", chance: 0.12, amount: [1, 1] },
];

const ITEM_VALUES = {
  worn_chip: 80,
  prototype_chip_1: 180,
  prototype_chip_2: 520,
  prototype_chip_3: 1400,
  black_sand: 18,
  xuan_sand_core: 95,
  wolf_hide: 22,
  wolf_core: 150,
  wolf_king_core: 300,
  scorpion_shell: 28,
  scorpion_venom: 180,
  steel_scorpion_core: 420,
  slime_gel: 34,
  slime_seed: 220,
  raider_scrap: 42,
  raider_token: 260,
  machine_plate: 56,
  machine_core: 360,
  body_fragment: 120,
};

const ITEM_UNLOCK_LEVEL = {
  worn_chip: 1,
  black_sand: 1,
  xuan_sand_core: 1,
  wolf_hide: 1,
  wolf_core: 5,
  wolf_king_core: 5,
  scorpion_shell: 1,
  scorpion_venom: 10,
  steel_scorpion_core: 10,
  slime_gel: 2,
  slime_seed: 15,
  raider_scrap: 4,
  raider_token: 8,
  machine_plate: 4,
  machine_core: 20,
  body_fragment: 10,
};

const IDLE_BOSS_PROGRESS_REQUIRED = 5;

const BLUEPRINT_DATA = {
  prototype_chip_1: { name: "一階原形晶片藍圖" },
  prototype_chip_2: { name: "二階原形晶片藍圖" },
  prototype_chip_3: { name: "三階原形晶片藍圖" },
  wolf_pack_chip: { name: "狼群晶片藍圖" },
  wolf_king_gear: { name: "狼王式外骨骼" },
  steel_scorpion_gear: { name: "鋼蠍式輔助武裝" },
};

const CHIP_TIER_DATA = {
  1: { name: "一階", maxLevel: 20, quality: "基礎", abilityBase: 2, abilityPerLevel: 0.32, combatBase: 1, combatPerLevel: 0.12 },
  2: { name: "二階", maxLevel: 40, quality: "優良", abilityBase: 4, abilityPerLevel: 0.38, combatBase: 2, combatPerLevel: 0.13 },
  3: { name: "三階", maxLevel: 60, quality: "高階", abilityBase: 7, abilityPerLevel: 0.44, combatBase: 3, combatPerLevel: 0.14 },
};

const CHIP_STAT_STYLE_LABELS = {
  output: "力量型",
  reaction: "身法型",
  supply: "供能型",
  armor: "防護型",
  precision: "精準型",
};

const CHIP_COMBAT_STAT_DATA = {
  critRate: { name: "爆擊機率", unit: "%" },
  critDamage: { name: "爆擊傷害", unit: "%" },
};

const CHIP_SET_DATA = {
  wolf_pack: {
    name: "狼群",
    combatStats: ["critRate", "critDamage"],
    effects: [
      { pieces: 2, stat: "critRate", value: 5, text: "爆擊機率+5%" },
      { pieces: 4, stat: "critDamage", value: 10, text: "爆擊傷害+10%" },
    ],
  },
};

const GEAR_SLOT_DATA = {
  head: {
    statPool: STAT_KEYS,
    mainStat: "precision",
    nouns: ["演算元件", "狼王額甲", "戰術眼匣", "追跡處理器"],
  },
  weapon: {
    statPool: STAT_KEYS,
    mainStat: "precision",
    nouns: ["脈衝劍匣", "霓虹拳套", "義脈針匣", "電磁銃機", "星圖劍柄", "流光踝刃", "梅芯劍核", "渡魂袖刃"],
  },
  hands: {
    statPool: STAT_KEYS,
    mainStat: "output",
    nouns: ["超載腕甲", "裂光指套", "神經拳骨", "量子扳機", "赤霄手環"],
  },
  torso: {
    statPool: STAT_KEYS,
    mainStat: "armor",
    nouns: ["義骨胸甲", "龍脈護軀", "黑匣袈裟", "霓虹戰袍", "玄甲脊柱"],
  },
  legs: {
    statPool: STAT_KEYS,
    mainStat: "reaction",
    nouns: ["疾電腿架", "凌波義足", "影步膝輪", "雲梯踝環", "流火脛甲"],
  },
  dantian: {
    statPool: STAT_KEYS,
    mainStat: "supply",
    nouns: ["丹田爐心", "資源電池", "玄關反應堆", "任督伺服核", "靈樞電容"],
  },
};

const GEAR_COMBAT_STAT_DATA = {
  classBoost: { name: "技能傷害", unit: "%", slot: "weapon" },
  powerAmp: { name: "威力", unit: "%" },
  maxHpPct: { name: "生命", unit: "%" },
  speedPct: { name: "速度", unit: "%" },
  resourceMax: { name: "資源上限", unit: "" },
  resourceGain: { name: "資源取得", unit: "%" },
  guardBoost: { name: "護身", unit: "%" },
  damageReduce: { name: "減傷", unit: "%" },
  evadeRate: { name: "閃避", unit: "%" },
  critRate: { name: "爆擊機率", unit: "%" },
  critDamage: { name: "爆擊傷害", unit: "%" },
};

const GEAR_RANDOM_COMBAT_STAT_KEYS = Object.keys(GEAR_COMBAT_STAT_DATA)
  .filter((key) => !["resourceMax", "resourceGain"].includes(key));

const GEAR_SET_DATA = {
  wolf_king: {
    name: "狼王套裝",
    effects: [
      { pieces: 2, stat: "speedPct", value: 5, text: "行動速度+5%" },
      { pieces: 4, stat: "critRate", value: 5, text: "爆擊機率+5%" },
    ],
  },
  steel_scorpion: {
    name: "鋼蠍武裝",
    effects: [],
  },
};

const CODEX_FACTION_ENTRIES = [
  {
    title: "森羅學會",
    body: [
      "影響力遍布整個大荒的森羅學會，或許是全界域最具實力的學術組織。最初只是一群執著於解構荒野生態與魔物基因的狂熱學者，為了生存與實驗建立起觀測站，不知不覺間翠穹聚落就成了大荒中唯一的大規模安全地帶，與行動樞紐。而在【武林盟】順水推舟的操控下，森羅學會如今是全大荒最名正言順的監管者。",
    ],
  },
  {
    title: "武林盟",
    body: [
      "如今在離淵界域，武林盟是擁有最高話事權的組織。它依靠盟約、協議、威望與武力威懾，制衡九派五家。武林盟最初由推翻機皇獨裁統治的功臣發起，初衷是平息政權更替後的混亂；然而權力一旦集中，也讓盟內逐漸滋生真正統治天下的野心。現任盟主獨孤鎮天掌權後，持續壓制這些內部雜音，使武林盟維持在秩序防線的位置，而不是走向新的霸權。",
    ],
  },
];

const CODEX_GEOGRAPHY_ENTRIES = [
  {
    title: "離淵",
    body: [
      "兩千多年前，如今被稱為「大崩潰」的災厄降臨。天地崩裂，舊文明斷代，原先的世界十不存一，只剩幾塊大陸漂浮於虛空之中。倖存者在之後數百年間掙扎求生，沿著殘存的城寨、商路與遺跡一點一點重建秩序，最終形成了後世所稱的「武林」。",
      "一千多年前，後世稱為「機皇」的獨裁者復甦上古科技，憑藉壓倒性的力量統治全界域。殘暴無道的機皇時代維持了兩百年便被推翻，卻也將大量科技、工法與知識遺留人間。這些遺產在戰後被門派、世家、工坊與城邦吸收，與武道體系交融，逐漸重塑出如今的離淵社會。",
      "如今的離淵界域，由武林盟、九派五家與各地城邦共同維持著脆弱秩序。義體、機關、遺物解析與武學並行，古老門派掌握著技術與傳承，商隊穿行於城鎮與荒野，魔物、禁區與舊世代殘骸仍散落各處。這是一個從破碎中復甦的世界，也是一個秩序、野心與舊日陰影仍在彼此爭衡的江湖。",
    ],
  },
  {
    title: "大荒",
    body: [
      "大荒位於離淵界域西部，是占地極廣的邊陲地帶。雖稱邊陲，其範圍卻不亞於任何一洲。昔日「大崩潰」使此地地貌失衡，生態與氣候徹底紊亂；風沙、濕林、漫天飛雪與熔岩灼域交錯並存，甚至還有終年落雷不止的死地。",
      "在大荒之中，險惡地形、叢生魔物與舊世代廢墟彼此糾纏。這裡是尚未被人類真正統治的最後蠻荒。除了執著於研究的森羅學者、追逐利益的獵生員，以及走投無路的亡命之徒，對多數人而言，大荒都是避之唯恐不及的魔境。",
    ],
  },
  {
    title: "翠穹聚落",
    body: [
      "在大荒正中央，參天的太初靈木底下，森羅學會為首的人們建立了翠穹聚落。稍微遠離一點，就是各式各樣的極端地形與氣候，一層看不見的力場包裹出了讓人得以喘息的安全地帶。在巨木的穹頂之下，學者、調查員、商隊以及為了各種理由深入大荒的人們，得以在難得的安穩中休整。",
    ],
  },
];

const GEAR_NAME_PREFIXES = ["霓虹", "義脈", "黑匣", "量子", "電馭", "玄砂", "賽博", "龍骨", "星樞", "流火"];
const GEAR_NAME_SUFFIXES = ["腕甲", "機匣", "胸甲", "腿架", "爐心", "義骨", "伺服", "護軀", "劍匣", "電池"];
const NON_GEAR_NAME_PARTS = ["秘笈", "秘籍", "殘卷", "殘捲", "真訣", "心法", "秘鑰", "毒經"];
const CLASS_GEAR_TERMS = {
  tianshu: "天樞",
  tang: "唐門",
  chanlin: "金剛",
  leishi: "雷銃",
  xinhuo: "薪火",
  wangchuan: "忘川",
  emei: "峨眉",
  furnace: "梅光",
};

const TIANYA_NEWS_DATA = [
  {
    id: "academy_index_errata",
    type: "快訊",
    title: "鳴鐘書院更正門派索引第七版",
    deck: "本次更正包含三處字誤、一處輩分誤植，以及一名堅持自己還活著的編者署名。",
    body: "鳴鐘書院今日釋出門派索引第七版勘誤。書院表示，前版將某位長老列入故人名錄，引發本人攜拐杖到館抗議。新版本已修正條目，並追加『本人抗議有效』的旁註。",
  },
  {
    id: "tang_pouch_fashion",
    type: "快訊",
    title: "唐家生化開放藥囊外觀登記",
    deck: "登記表新增『低調』『很低調』『師父看了會皺眉』三種樣式。",
    body: "唐家生化近日開放藥囊外觀登記。部分弟子希望藥囊能配合衣色，長房管事回應，藥效優先於好看，但好看的藥囊確實比較不容易被同門順手拿走。",
  },
  {
    id: "leishi_noise_rule",
    type: "快訊",
    title: "雷氏火器試行夜間降噪規範",
    deck: "第一條規範要求弟子分清試射、校準與單純手癢。",
    body: "雷氏火器公布夜間降噪規範，要求各房弟子在入夜後降低試射頻率。幾名年輕弟子建議改用更小聲的彈藥，管事回覆，小聲的火器通常也比較難讓師父相信已經校準完成。",
  },
  {
    id: "history_rank_table",
    type: "舊聞翻案",
    title: "舊門派排行表可能源自酒席座次",
    deck: "表格邊角留有菜湯痕跡，考據者稱這點相當關鍵。",
    body: "一份流傳甚廣的舊門派排行表近日再度引發討論。本文作者認為，該表原本可能只是宴席座次，後人抄錄時誤當成門派高低。菜湯痕跡的位置，恰好落在排名最激烈的三欄旁。僅為作者個人觀點，不代表本報立場。",
  },
  {
    id: "history_tianshu_star",
    type: "野史",
    title: "天樞派祖訓中的星象可能抄錯一筆",
    deck: "若此說成立，三代弟子背錯口訣的責任將落到同一位抄書人身上。",
    body: "有民間考據者指出，天樞派早年祖訓中的一處星位記錄疑似多了一筆。本文作者推測，該筆誤差原先只影響抄本美觀，後來被講師拿來解釋站位，才逐漸成為正式說法。僅為作者個人觀點，不代表本報立場。",
  },
  {
    id: "faction_rank_joke",
    type: "評論",
    title: "門派評比能否加入飯堂速度",
    deck: "匿名投稿者指出，這項指標比輩分爭論更容易現場驗證。",
    body: "多數門派都有一套自認嚴謹的評比方法。本文作者建議增設『到飯堂速度』一欄，綜合觀察身法、反應、臉皮與飢餓程度。若能連續三日奪得第一，至少足以證明該門派弟子很懂得保存體力。僅為作者個人觀點，不代表本報立場。",
  },
  {
    id: "special_wolf_blueprint",
    type: "特報",
    title: "晶片藍圖登記規範更新",
    deck: "多地工房同業要求藍圖附註套裝來源，避免學徒把名字取得過於威風。",
    body: "工房同業會近日更新晶片藍圖登記規範。新規要求藍圖名稱需標示套裝傾向、階級與主要能力，並保留材料來源註記。幾名工匠反映，規範有助於減少『聽起來很強但完全看不懂用途』的成品名稱。",
  },
];

const FORTUNE_READINGS = [
  { id: "clear", title: "小吉", text: "今日宜整備。先補缺口，再談遠征。" },
  { id: "sharp", title: "中吉", text: "利在前鋒。先手能成事，貪快會露破綻。" },
  { id: "still", title: "平", text: "風不動，旗也不動。動的是你的資源表。" },
  { id: "hidden", title: "末吉", text: "有財藏於暗格。別問哪格，先刮完。" },
  { id: "dust", title: "小凶", text: "路上有砂。少帶一句嘴，多帶一份資材。" },
  { id: "return", title: "吉", text: "回頭路未必壞。只是別在戰場上回頭。" },
  { id: "spark", title: "大吉", text: "火候正好。適合升級，也適合收手。" },
  { id: "quiet", title: "平吉", text: "無事是福。布告亭今日沒有新的壞消息。" },
];

const FORTUNE_RESOURCE_REWARDS = [
  { resource: "money", min: 40, max: 90 },
  { resource: "material", min: 10, max: 24 },
  { resource: "energy", min: 8, max: 18 },
];

const CHIP_CRAFT_RECIPES = [
  {
    id: "prototype_chip_1",
    kind: "prototype",
    blueprintKey: "prototype_chip_1",
    output: { id: "prototype_chip_1", count: 1 },
    costs: [
      { resource: "money", count: 120 },
      { resource: "energy", count: 80 },
      { id: "worn_chip", count: 1 },
      { id: "black_sand", count: 10 },
    ],
  },
  {
    id: "prototype_chip_2",
    kind: "prototype",
    blueprintKey: "prototype_chip_2",
    output: { id: "prototype_chip_2", count: 1 },
    costs: [],
  },
  {
    id: "prototype_chip_3",
    kind: "prototype",
    blueprintKey: "prototype_chip_3",
    output: { id: "prototype_chip_3", count: 1 },
    costs: [],
  },
  {
    id: "wolf_pack_chip_1",
    kind: "equipment-chip",
    blueprintKey: "wolf_pack_chip",
    tier: 1,
    setId: "wolf_pack",
    costs: [
      { resource: "money", count: 180 },
      { resource: "energy", count: 120 },
      { id: "prototype_chip_1", count: 1 },
      { id: "wolf_hide", count: 4 },
      { id: "wolf_core", count: 1 },
    ],
  },
];

const GEAR_CRAFT_RECIPES = [
  {
    id: "wolf_king_head_unit",
    blueprintKey: "wolf_king_gear",
    name: "狼王式演算元件",
    setId: "wolf_king",
    slot: "head",
    level: 5,
    costs: [
      { resource: "money", count: 180 },
      { resource: "material", count: 36 },
      { id: "black_sand", count: 6 },
      { id: "wolf_king_core", count: 1 },
    ],
  },
  {
    id: "wolf_king_torso",
    blueprintKey: "wolf_king_gear",
    name: "狼王式戰鬥軀幹",
    setId: "wolf_king",
    slot: "torso",
    level: 5,
    costs: [
      { resource: "money", count: 210 },
      { resource: "material", count: 48 },
      { id: "black_sand", count: 7 },
      { id: "wolf_king_core", count: 1 },
    ],
  },
  {
    id: "wolf_king_arms",
    blueprintKey: "wolf_king_gear",
    name: "狼王式戰鬥腕",
    setId: "wolf_king",
    slot: "hands",
    level: 5,
    costs: [
      { resource: "money", count: 190 },
      { resource: "material", count: 42 },
      { id: "black_sand", count: 6 },
      { id: "wolf_king_core", count: 1 },
    ],
  },
  {
    id: "wolf_king_legs",
    blueprintKey: "wolf_king_gear",
    name: "狼王式戰鬥腿",
    setId: "wolf_king",
    slot: "legs",
    level: 5,
    costs: [
      { resource: "money", count: 170 },
      { resource: "material", count: 38 },
      { id: "black_sand", count: 6 },
      { id: "wolf_king_core", count: 1 },
    ],
  },
  {
    id: "steel_scorpion_aux_weapon",
    blueprintKey: "steel_scorpion_gear",
    name: "鋼蠍式輔助武裝",
    setId: "steel_scorpion",
    slot: "weapon",
    level: 10,
    combatCount: 3,
    combatValue: 5,
    costs: [
      { resource: "money", count: 260 },
      { resource: "material", count: 58 },
      { id: "scorpion_shell", count: 8 },
      { id: "scorpion_venom", count: 2 },
      { id: "steel_scorpion_core", count: 1 },
    ],
  },
  {
    id: "neon_pulse_blade",
    name: "霓虹脈衝劍匣",
    slot: "weapon",
    level: 5,
    classId: "tianshu",
    costs: [
      { resource: "money", count: 180 },
      { resource: "material", count: 36 },
      { id: "black_sand", count: 6 },
      { id: "wolf_hide", count: 3 },
    ],
  },
  {
    id: "xuan_sand_fist_core",
    name: "玄砂神經拳骨",
    slot: "hands",
    level: 5,
    costs: [
      { resource: "money", count: 160 },
      { resource: "material", count: 42 },
      { id: "raider_scrap", count: 3 },
      { id: "black_sand", count: 5 },
    ],
  },
  {
    id: "blackbox_spine_armor",
    name: "黑匣龍脈護軀",
    slot: "torso",
    level: 5,
    costs: [
      { resource: "money", count: 170 },
      { resource: "material", count: 48 },
      { id: "slime_gel", count: 3 },
      { id: "raider_scrap", count: 2 },
    ],
  },
  {
    id: "flowfire_leg_frame",
    name: "流火凌波義足",
    slot: "legs",
    level: 5,
    costs: [
      { resource: "money", count: 150 },
      { resource: "material", count: 34 },
      { id: "wolf_hide", count: 4 },
      { id: "slime_gel", count: 2 },
    ],
  },
  {
    id: "ren_du_servo_core",
    name: "任督資源電池",
    slot: "dantian",
    level: 5,
    costs: [
      { resource: "money", count: 190 },
      { resource: "energy", count: 90 },
      { id: "worn_chip", count: 1 },
      { id: "xuan_sand_core", count: 1 },
    ],
  },
];

const GATHER_DURATIONS = [10, 30, 60, 120];
const GATHER_BASE_ENERGY_PER_MINUTE = 2;
const GATHER_MEMBER_LEVEL_BONUS = 0.06;
const GATHER_BOSS_BONUS = 0.18;
const GATHER_LOCATIONS = [
  { id: "blackwater", name: "黑水砂原", unlockLevel: 5, regionDrops: BLACKWATER_REGION_DROPS },
];

const TEST_EQUIPMENT_CHIPS = [
  "黑砂套?出力",
  "黑砂套?反應",
  "黑砂套?供能",
  "黑砂套?耐久",
  "狼牙套?出力",
  "狼牙套?精準",
  "狼牙套?反應",
  "狼牙套?耐久",
  "毒蠍套?精準",
  "毒蠍套?供能",
  "毒蠍套?出力",
  "毒蠍套?反應",
  "機兵套?耐久",
  "機兵套?供能",
  "機兵套?精準",
  "機兵套?出力",
];

const COMMISSION_DATA = {
  sand_patrol: {
    name: "黑水砂原巡察",
    summary: "完成任意 3 場黑水砂原戰鬥。",
    target: 3,
    reward: { money: 120, material: 30, energy: 18 },
  },
  caravan_guard: {
    name: "商隊護行",
    summary: "完成任意 2 場黑水砂原戰鬥。",
    target: 2,
    reward: { money: 90, material: 18, energy: 10 },
  },
  relic_survey: {
    name: "遺構踏查",
    summary: "完成任意 4 場黑水砂原戰鬥。",
    target: 4,
    reward: { money: 140, material: 42, energy: 16 },
  },
  camp_supply: {
    name: "營地補給線",
    summary: "完成任意 3 場黑水砂原戰鬥。",
    target: 3,
    reward: { money: 80, material: 24, energy: 30 },
  },
};
const COMMISSION_BOARD_SIZE = 4;
const COMMISSION_REFRESH_BATTLES = 3;

const REGION_DATA = [
  { id: "blackwater", name: "黑水砂原", status: "現在位置", open: true, tone: "gold" },
  { id: "hanging-sky-rainforest", name: "垂天雨林", status: "未開放", open: false, tone: "jade" },
  { id: "bone-wild-road", name: "裂骨荒路", status: "未開放", open: false, tone: "muted" },
  { id: "broken-tide-rockshore", name: "碎潮岩岸", status: "未開放", open: false, tone: "cyan" },
  { id: "red-rock-lava-valley", name: "赤岩熔谷", status: "未開放", open: false, tone: "hot" },
  { id: "mirror-lake-swamp", name: "鏡湖沼澤", status: "未開放", open: false, tone: "cyan" },
  { id: "frost-mist-plateau", name: "霜霧高原", status: "未開放", open: false, tone: "muted" },
  { id: "thunder-magnetic-wasteland", name: "雷磁荒原", status: "未開放", open: false, tone: "gold" },
];

const DIALOGUE_POOLS = window.LIYUAN_DIALOGUE_POOLS || {};
const PORTRAIT_CATALOG = window.LIYUAN_PORTRAIT_CATALOG || {};
const INTRO_STAGE_OPENING = "opening";
const INTRO_STAGE_CREATOR = "creator";
const INTRO_STAGE_AFTER_CREATOR = "afterCreator";
const INTRO_STAGE_MAIN = "mainIntro";
const INTRO_STAGE_DONE = "done";
const EVENT_DIALOGUE_CHAR_MS = 18;
const EVENT_DIALOGUE_CHAR_STEP = 2;
const EVENT_SPEAKERS = {
  yu_xiaosui: { name: "俞小穗", avatar: "穗", role: "森羅學會接引員", image: "./assets/v009_runtime_preview/dialogue/yu_xiaosui_dialogue_cute_128_preview_v004_clean.png" },
  yao_hengzhou: { name: "姚衡舟", avatar: "姚", role: "華山軍工劍宗鍛造宗師", image: "./assets/v009_runtime_preview/dialogue/yao_hengzhou_dialogue_cute_128_preview_v004_clean.png" },
};
const INTRO_POST_CREATOR_CLASS_LINES = {
  xinhuo: "薪火幫……嗯，這裡勾選後勤支援，應該就可以了。",
  chanlin: "禪林寺……這邊有一欄備註說，如果不使用義體設備，要另外登記替代流程。",
  leishi: "雷氏火器……啊，這裡跳出火器管制提醒。我、我等一下照流程傳給你。",
  tianshu: "天樞派……身份驗證通過了。系統顯示可以放行。",
  emei: "峨眉派……這邊顯示已經完成高端義體登錄，可以直接通行。",
  furnace: "華山軍工……這裡備註說，工坊那邊有人可以接應你。",
  wangchuan: "忘川渡……啊，這一欄我沒有權限查看。總、總之登記已經完成了。",
  tang: "唐家生化……隔離容器和樣本封存權限……我看看，嗯，系統說已經開通了。",
};
const EVENT_DIALOGUE_SEQUENCES = {
  intro_pre_creator: {
    lines: [
      { speaker: "yu_xiaosui", text: "那、那個……不好意思，請問你是第一次來到嗎？" },
      { speaker: "yu_xiaosui", text: "你、你看起來不像一般調查員……啊，難道是會長提過的那位武林盟的派遣員？" },
      { speaker: "yu_xiaosui", text: "歡迎來到森羅學會的大荒據點。雖然……雖然這裡其實也只有這麼一個據點。" },
      { speaker: "yu_xiaosui", text: "我叫俞小穗，是魔物學者……實習生。因為人手不夠，所以今天也被叫來負責進出登記。" },
      { speaker: "yu_xiaosui", text: "請、請把身分代碼給我。我登記完就不打擾你了。" },
    ],
    onComplete: "openCreator",
  },
  intro_post_creator: {
    lines: [
      { speaker: "yu_xiaosui", text: "（低頭在全息螢幕上確認資料）{className}的……{playerName}，對吧？{postCreatorClassLine}" },
      { speaker: "yu_xiaosui", text: "資料沒有問題。接下來……任務就麻煩你了。" },
    ],
    onComplete: "openMainIntro",
  },
  intro_main_tutorial: {
    lines: [
      { speaker: "yu_xiaosui", text: "咦？你說你不是來打怪的？可、可是會長交代說，抵達大荒後要先建立基本巡查紀錄……" },
      { speaker: "yu_xiaosui", text: "我知道你有武林盟的密令，但如果沒有據點權限、路線資料和補給紀錄，後面應該會很麻煩。" },
      { speaker: "yu_xiaosui", text: "所以……那個，我們可以先互相配合一下嗎？你幫學會處理周邊魔物，我們提供住所和後勤支援。" },
      { speaker: "yu_xiaosui", text: "我、我不是要使喚你。只是這裡離安全區太遠了，沒有穩定據點真的很危險。" },
      { speaker: "yu_xiaosui", text: "之後如果需要維修或整備，我會介紹姚大叔給你。他說話有點大聲，但技術很可靠。" },
      { speaker: "yu_xiaosui", text: "第一次巡查不用走太遠。從黑水砂原外圍開始，採集一些樣本、確認魔物活動就可以了。" },
      { speaker: "yu_xiaosui", text: "（把座標小心傳送過去）路線傳好了。請、請小心一點，真的遇到危險就先撤回來。" },
    ],
    onComplete: "startFirstMapTutorial",
  },
  wolf_king_workshop_intro: {
    lines: [
      { speaker: "yu_xiaosui", text: "你、你回來了……咦？這是王級魔物的核心素材嗎？" },
      { speaker: "yu_xiaosui", text: "那個……如果方便的話，我們最好帶去給姚大叔看看。" },
    ],
    onComplete: "startWolfWorkshopIntroTutorial",
  },
  wolf_king_workshop_yao: {
    lines: [
      { speaker: "yu_xiaosui", text: "姚大叔……你現在方便嗎？我、我帶了素材過來。" },
      { speaker: "yao_hengzhou", text: "不如何！老子千里迢迢到大荒這鬼地方，又不是為了給人打鐵當客服的！怎麼，妳這丫頭又拐了哪個冤大頭來？" },
      { speaker: "yao_hengzhou", condition: "playerClass:furnace", text: "嘖，居然還是我們華山的小輩？氣宗那幾個把腦袋都裝滿紫氣的老骨頭，還沒死透吧。" },
      { speaker: "yu_xiaosui", text: "不是冤大頭啦……至少不要當著本人這樣說。這、這應該算互惠吧？你也需要測試飛劍模組和採集數據……對吧？" },
      { speaker: "yao_hengzhou", text: "哼，姓紀的那小子不知道又去哪裡野了，沒人試，老子的飛劍參數根本動不了。閒著也是閒著，有什麼需要自己把材料備齊，稍微搭把手還是可以的。" },
      { speaker: "yao_hengzhou", text: "給老子聽好了。我不管那些大廠門派幫你們裝了什麼高端晶片，又在道場教過什麼花拳繡腿，這裡可是大荒，離淵最後的蠻荒之地。" },
      { speaker: "yao_hengzhou", text: "在這個魔物滿地走、地形氣候又極端的魔境，你們那套混跡江湖、只考慮『對人戰』的武裝，在這全都是廢鐵！" },
      { speaker: "yao_hengzhou", text: "想在這活命，就別跟老子講究什麼江湖體面和名門原則。野蠻也好粗暴也好，拿到什麼素材就帶過來，老子幫你改造成最道地的大荒口味！" },
    ],
    onComplete: "startWolfWorkshopCraftTutorial",
  },
  body_management_intro: {
    lines: [
      { speaker: "yao_hengzhou", text: "小子，來來來瞧瞧我幫你搞到什麼新玩具。" },
      { speaker: "yu_xiaosui", text: "呀！那、那是人嗎？大叔，你不會真的做了什麼奇怪的事吧？" },
      { speaker: "yao_hengzhou", text: "呸呸呸，胡說八道！這是我整天在這幫你們搞維修，用湊下來的邊角料組裝出來的空白義體！" },
      { speaker: "yu_xiaosui", text: "邊角料……組出來的？這樣真的可以用嗎？" },
      { speaker: "yao_hengzhou", text: "不靠譜又怎了，人大荒漂，能用就是福！還嫌呢。最重要的是，靠這空白義體，你能體驗一把其他門派的打法，怎樣，有意思吧？" },
      { speaker: "yao_hengzhou", condition: "playerClass:chanlin", text: "你們禪林寺這些不用義體的死腦筋，我這正好有上次喝酒時，從全真老鬼那打賭贏來的虛擬實境操控終端，遙控一下湊和著也能用。" },
      { speaker: "yao_hengzhou", text: "當然和正式的身體多少有點差距，而且連接新的身體，你的丹田傳輸效率和行動演算都得重新調教過，白話點說就是得從頭練起。" },
      { speaker: "yao_hengzhou", text: "想玩哪個門派說一聲，我幫你安裝戰鬥紀錄。" },
      { speaker: "yao_hengzhou", condition: "notPlayerClass:chanlin", text: "禪林寺那套也行，雖然和真貨不一樣，但反正強度搞起來也能模擬個七七八八。" },
      { speaker: "yao_hengzhou", text: "有什麼，隨時換回原本的身體，紀錄都在。" },
      { speaker: "yao_hengzhou", text: "不過我目前就搞出這麼一套空白義體，還想玩更多自己想辦法去吧。" },
    ],
    onComplete: "startBodyManagementTutorial",
  },
  body_management_after_select: {
    lines: [
      { speaker: "yao_hengzhou", text: "搞定，試著出去活動活動吧，別忘了你現在可是弱雞身體，小心點別亂來啊。" },
    ],
    onComplete: "resumeBodyManagementTutorialAfterSelect",
  },
};
const REJECTED_PORTRAIT_PACKAGE_PATH = "assets/preview/v008/portraits/v008_portrait_direct_alpha_96_accepted_2026_06_04/";
const REJECTED_PORTRAIT_PACKAGE_PATHS = [
  REJECTED_PORTRAIT_PACKAGE_PATH,
  "assets/preview/v008/portraits/eight_faction_bottom_right_96_chromakey_2026_06_03/",
  "assets/preview/v008/portraits/eight_faction_bottom_right_96_preserve_size_external_alpha_2026_06_03/",
];
const CURRENT_PORTRAIT_PACKAGE_PATH = "assets/generated/v008/portraits/v008_cute_portrait_96_right_facing_normalized_2026_06_04/";
const LEGACY_CUTE_PORTRAIT_PACKAGE_PATHS = [
  "assets/preview/v008/portraits/v008_cute_portrait_16_approved_2026_06_04/",
  "assets/preview/v008/portraits/v008_cute_portrait_80_append_2026_06_04/",
  "assets/generated/v008/portraits/v008_cute_portrait_96_right_facing_2026_06_04/",
];
const V008_CUTE_PORTRAIT_PACKAGE_PATH = "assets/preview/v008/portraits/v008_cute_portrait_16_approved_2026_06_04";
const V008_CUTE_PORTRAIT_BY_CLASS_AND_GENDER = {
  tianshu: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/tianshu_pai/tianshu_pai_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/tianshu_pai/tianshu_pai_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  tang: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/tang_jia/tang_jia_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/tang_jia/tang_jia_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  chanlin: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/chanlin_si/chanlin_si_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/chanlin_si/chanlin_si_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  leishi: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/leishi/leishi_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/leishi/leishi_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  xinhuo: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/xinhuo_bang/xinhuo_bang_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/xinhuo_bang/xinhuo_bang_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  wangchuan: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/wangchuan_du/wangchuan_du_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/wangchuan_du/wangchuan_du_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  emei: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/emei/emei_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/emei/emei_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
  furnace: {
    male: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/huashan_jungong/huashan_jungong_male_v008_cute_runtime_sprite_preview_96_v004.png`,
    female: `${V008_CUTE_PORTRAIT_PACKAGE_PATH}/sprites_96/huashan_jungong/huashan_jungong_female_v008_cute_runtime_sprite_preview_96_v004.png`,
  },
};

const YAO_HENGZHOU_LINES = [
  "義體不是替人多裝幾根骨頭。真正難的是讓出力、反應、供能、耐久、精準都跟原本的內息合拍。",
  "離淵的武學早就不是純肉身功夫。丹田迴路只是爐心，義體是外骨，招式才是把兩者接成一口氣的法門。",
  "有些人嫌義體粗。那是他們只看見鋼，沒看見鋼裡面流的氣。",
  "一名好武者升級義體，不是為了變成機器，是為了讓每一式都少一分遲滯。",
  "供能太弱的人，招式還沒走完就斷氣；耐久太薄的人，招式再妙也撐不到第二輪。",
  "反應不是單純跑得快。它決定你的身體能不能追上你腦子裡那一招。",
  "精準是火器的眼，也是手術刀的刃。沒有精準，再大的出力也只是把戰場弄得更亂。",
  "出力過盛而迴路不穩，最容易把自己震傷。黑水砂原上多的是這種半桶水的殘骸。",
  "翠穹工房小歸小，爐子還算聽話。只要有資材，我能把你的人調到能活著回來。",
  "義體強化別只盯著傷害。站得住、回得來、下一場還能出戰，這才叫戰力。",
  "丹田迴路像水脈，義體像堤岸。水脈亂了，堤岸再厚也只是等著崩。",
  "武俠講一口氣。賽博講一組參數。離淵的麻煩就在於，兩邊都對。",
  "老派高手說力從地起，新派工程師說力從爐起。我看都沒錯，差別只在你把地和爐接在哪裡。",
  "別把強化當買賣看。每一次調校都會改變一個人出招的習慣。",
  "有些門派怕我們工房把武學做俗了。可真正俗的不是義體，是只會守著祖訓卻救不了人的手。",
  "資材別亂花。先補隊伍短板，再追求漂亮數字，這是工房能給你的最便宜忠告。",
];

const YAO_FEIJIAN_LINES = [
  "華山軍工的氣宗走能量攻擊，不等於只能遠射；近身放出、護體爆發、光束壓制，全都看輸出與控能。",
  "劍宗以前鑄劍，後來戰場變了，就開始做更精密、更能穿透、更吃高級礦材的彈體。",
  "離淵的礦物不是想挖就有。高級彈體打出去就沒了，損失的不是錢，是本來就稀缺的材料。",
  "所以有人問：如果好礦太少，那能不能別把它做成一次性彈藥？讓一把劍飛出去，殺完，再回來。",
  "飛劍不是古典御劍。它是劍形高機動飛行器，是劍宗想替物理兵器找出的另一條路。",
  "它不是飛起來就叫飛劍。飛彈也會飛，沒人會叫它劍。",
  "一塊鐵飛過去也能殺人。那不叫劍，那叫彈體。",
  "浮舟已經能飛、能突刺、能劈斬、能迴旋，也能收回。機體能做到的，我都逼它做到了。",
  "飛劍最後卡住的不是推進，也不是劍身。是演算力。沒有人能在戰場上即時算完那麼密的劍路。",
  "當代電子腦算不完連續變招，我只能先把預設劍路寫進控制模組。",
  "預設劍路能讓浮舟動，但那還不是活的劍。它會執行，不會臨場判斷。",
  "紀弦第一次讓浮舟不是照著預設軌道動，而是重新被使用。那一下我看了三十年。",
  "你問有槍不用，為什麼要飛劍？槍很好，氣宗那些傢伙也很強。可我想做的是劍，不是更便宜的槍。",
  "理由？哪有那麼多理由。我就是想把它做出來。",
  "別跟我談收益。談收益我三十年前就該把這堆稀缺礦材交回庫房。",
  "劍宗也好，氣宗也好，誰聲勢大不重要。重要的是浮舟現在真的動過。",
  "我不是想證明自己比誰高明。我只是想知道，飛劍到底能不能成。",
  "如果哪天你撿到異常穩定的劍核，先拿來給我看。不要問原因，我會睡不著。",
];

const YAO_FACTION_LINES = [
  "天樞派的人說話像在排陣，連喝茶都要先標定杯緣。好處是他們的迴路圖紙通常乾淨得像官文。",
  "唐家生化最麻煩。別人送來義體是修磨損，他們送來的東西我還得先問一句：這玩意兒有沒有毒。",
  "禪林寺的師父們嘴上說四大皆空，實際上對耐久厚度很有意見。每次都說隨緣，最後都要加厚。",
  "雷氏火器很好合作，圖紙清楚，需求直接。唯一的問題是他們總覺得能用爆炸解決的事，就不該浪費腦子。",
  "薪火幫的人常把義體用到我看不出原廠結構。窮是窮了點，但他們最知道一塊廢料能救幾條命。",
  "忘川渡的裝備最討厭，要求輕、靜、狠，還不能留下維修紀錄。好像工房的人不用睡覺。",
  "峨眉派挑剔得很，連縫線角度都要問會不會影響經絡流向。可她們挑得對，所以我通常只在心裡罵。",
  "華山軍工自己的毛病我也清楚：太相信規格，太喜歡把人當成承載平台。人在戰場上不是平台，是會怕、會痛、會硬撐的東西。",
  "森羅學會的人問問題問到爐火都快熄了。不過他們有時候真能從一句廢話裡翻出關鍵資料。",
  "百川商會最懂成本，也最不懂什麼叫別在關鍵零件上省錢。每次報價談完，我都想把算盤熔掉。",
];

const SKILL_TIMINGS = {
  turn: { label: "回合技", description: "只有在行動序輪到自己時才能使用。" },
  trigger: { label: "觸發技", description: "不消耗行動序；只要條件符合就會立即嘗試使用。" },
};

const CLASS_DATA = {
  tianshu: {
    name: "天樞派",
    officialName: "天樞派",
    role: "解析劍陣 | 後期爆發",
    main: ["precision", "output"],
    secondary: ["supply", "reaction"],
    surnames: ["沈", "陸", "溫", "周", "羅", "葉", "何"],
    skills: [
      skill("tianshu_three", "三點參直", 1, "連續向敵人刺出三劍，造成係數 3 的總傷害並加深解析。", { coefficient: 3 }),
      skill("tianshu_region", "尺前化區", 3, "解析 10 可使用；攻擊造成係數 4 傷害並加深解析。", { coefficient: 4, condition: "resource_at_10" }),
      skill("tianshu_body", "規矩成體", 6, "解析 25 可使用；攻擊造成係數 5 傷害並加深解析。", { coefficient: 5, condition: "resource_at_25" }),
      skill("tianshu_one", "奇零歸一", 10, "觸發技；解析達 50 時觸發，攻擊敵人造成係數 7 傷害，單場戰鬥一次。", { timing: "trigger", coefficient: 7, triggerCondition: "resource_at_50", oncePerBattle: true }),
      skill("tianshu_array", "勾股交陣", 15, "觸發技；開戰施展，開啟劍陣並根據解析提升攻擊威力。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("tianshu_nine", "九九歸一", 20, "三點參直上位技能；連續向敵人刺出九劍，造成係數 5 的總傷害並加深解析。", { coefficient: 5 }),
    ],
  },
  tang: {
    name: "唐家生化",
    officialName: "唐氏醫療與毒物生物化學研究聯合",
    role: "醫毒暗器 | 持續爆發",
    main: ["precision", "supply"],
    secondary: ["reaction", "output"],
    surnames: ["唐"],
    skills: [
      skill("tang_bee", "毒蜂針", 1, "攻擊敵人造成係數 3 傷害，之後每回合跳係數 2 傷害，持續 5 回合。生物毒。", { coefficient: 3, poisonKey: "生物毒", poisonCoefficient: 2, poisonDuration: 5 }),
      skill("tang_soul", "斷魂針", 3, "攻擊敵人造成係數 2 傷害，之後每回合跳係數 3 傷害，持續 5 回合。化學毒。", { coefficient: 2, poisonKey: "化學毒", poisonCoefficient: 3, poisonDuration: 5 }),
      skill("tang_bone", "腐骨錐", 6, "攻擊敵人造成係數 3 傷害，並引爆剩餘所有未跳的毒傷害。", { coefficient: 3 }),
      skill("tang_rain", "暴雨針", 10, "觸發技；開局施展，攻擊全體敵人，主目標係數 3，其餘目標係數 2。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true, coefficient: 3 }),
      skill("tang_heart", "萬毒焚心", 15, "觸發技；每次敵人身上追加新種類的毒時發動，造成係數 3 傷害。", { timing: "trigger", triggerCondition: "new_poison_type", coefficient: 3 }),
      skill("tang_king", "蜂王針", 20, "毒蜂針上位技能；攻擊敵人造成係數 4 傷害，之後每回合跳係數 3 傷害，持續 6 回合。生物毒。", { coefficient: 4, poisonKey: "生物毒", poisonCoefficient: 3, poisonDuration: 6 }),
    ],
  },
  chanlin: {
    name: "禪林寺",
    officialName: "禪林寺",
    role: "反坦拳法 | 穩定續戰",
    main: ["armor", "supply"],
    secondary: ["output", "reaction"],
    surnames: ["慧", "法", "明", "淨", "覺", "常", "定"],
    skills: [
      skill("chanlin_luohan", "羅漢拳", 1, "攻擊造成係數 3 傷害，獲得少量不動心。", { coefficient: 3 }),
      skill("chanlin_tiger", "伏虎掌", 3, "攻擊造成係數 4 傷害，獲得少量不動心。", { coefficient: 4 }),
      skill("chanlin_vajra_reflect", "金剛反", 6, "不動心達到 100 後進入金剛反勢，消耗 100 不動心，下一次受擊會把力道反震回去。", { timing: "trigger", triggerCondition: "resource_at_100", resourceCost: 100 }),
      skill("chanlin_immovable", "不動禪", 10, "進入反擊架式，無效下一次受到的攻擊並造成係數 4 傷害，獲得中量不動心。", { coefficient: 4 }),
      skill("chanlin_stone_heart", "石心立", 15, "觸發技；開局施展，為自己加上等同生命上限 30% 的護盾，優先吸收傷害。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("chanlin_mingwang", "明王拳", 20, "羅漢拳上位技能；攻擊造成係數 5 傷害，獲得少量不動心。", { coefficient: 5 }),
    ],
  },
  leishi: {
    name: "雷氏火器",
    officialName: "雷氏火器",
    role: "彈藥火器 | 全彈爆發",
    main: ["output", "precision"],
    secondary: ["armor", "reaction"],
    surnames: ["雷"],
    skills: [
      skill("lei_lianzhu", "連珠銃", 1, "造成總傷害係數 3 的 5 連射攻擊，消耗彈藥 1。", { coefficient: 3, ammoCost: 1 }),
      skill("lei_crack", "裂甲彈", 3, "射擊造成係數 3 傷害，使敵人進入裂甲狀態，受傷提高 15%，持續 3 回合，消耗彈藥 1。", { coefficient: 3, ammoCost: 1 }),
      skill("lei_fullshot", "全彈射擊", 6, "射擊造成剩餘彈藥數乘以係數 2 的攻擊，消耗剩餘彈藥。", { coefficient: 2, ammoCost: "all" }),
      skill("lei_aim", "準星校正", 10, "觸發技；開場施展，提高 5% 命中率與 10% 爆擊率。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("lei_quick_reload", "快速裝填", 15, "觸發技；彈藥耗盡時瞬間填滿所有彈藥，一場戰鬥發動一次。", { timing: "trigger", triggerCondition: "ammo_empty", oncePerBattle: true }),
      skill("lei_lianzhu_plus", "強化連珠銃", 20, "連珠銃上位技能；造成總傷害係數 5 的 5 連射攻擊，消耗彈藥 1。", { coefficient: 5, ammoCost: 1 }),
    ],
  },
  xinhuo: {
    name: "薪火幫",
    officialName: "薪火幫",
    role: "怒氣拳法 | 近戰爆發",
    main: ["armor", "output"],
    secondary: ["supply", "reaction"],
    surnames: ["馬", "梁", "鄭", "熊", "宋", "關", "石"],
    skills: [
      skill("xinhuo_first", "總之先揍", 1, "攻擊造成係數 3 傷害，獲得怒氣。", { coefficient: 3 }),
      skill("xinhuo_heavy", "使勁猛揍", 3, "攻擊造成係數 5 傷害，消耗怒氣。", { coefficient: 5, condition: "resource_at_20", resourceCost: 20 }),
      skill("xinhuo_voice", "先聲奪人", 6, "觸發技；開場施放，獲得 20 怒氣。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("xinhuo_death", "往死裡揍", 10, "攻擊造成係數 4 傷害，獲得怒氣。", { coefficient: 4 }),
      skill("xinhuo_life_first", "小命優先", 15, "觸發技；生命低於 30% 時恢復 20% 生命，獲得 10 怒氣。", { timing: "trigger", triggerCondition: "ally_hp_below_30", oncePerBattle: true }),
      skill("xinhuo_star_combo", "星火連拳", 20, "總之先揍上位技能；攻擊造成總傷害係數 5 的連續三拳，獲得怒氣。", { coefficient: 5 }),
    ],
  },
  wangchuan: {
    name: "忘川渡",
    officialName: "忘川渡",
    role: "生死印暗殺 | 低血高閃",
    main: ["reaction", "precision"],
    secondary: ["output", "supply"],
    surnames: ["白", "林", "方", "夜", "段", "顧", "岑"],
    skills: [
      skill("wang_body", "破體錐", 1, "攻擊造成係數 3 傷害，獲得破體印；破體印增加 5% 傷害。", { coefficient: 3, sealKey: "body" }),
      skill("wang_soul", "斷魂釘", 3, "攻擊造成係數 4 傷害，獲得斷魂印；斷魂印增加 5% 爆擊率。", { coefficient: 4, sealKey: "soul" }),
      skill("wang_life_death", "生死印", 6, "消耗當下所有印：一印追命造成傷害並追加持續傷害，二印銷魂造成傷害並提高閃避，三印渡川造成高額傷害。", { coefficient: 3 }),
      skill("wang_spirit", "裂魄刺", 10, "觸發技；成功閃避後施展，攻擊造成係數 2 傷害並獲得裂魄印。", { timing: "trigger", triggerCondition: "after_evade", coefficient: 2, sealKey: "spirit" }),
      skill("wang_step", "彼岸步伐", 10, "觸發技；開戰施展，持續提高 30% 閃避率，閃避成功後施展裂魄刺。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("wang_yellow_spring", "黃泉引渡", 15, "觸發技；敵人生命低於 15% 時施展，攻擊造成係數 6 傷害。", { timing: "trigger", triggerCondition: "enemy_hp_below_15", coefficient: 6 }),
      skill("wang_body_plus", "破體無形", 20, "破體錐上位技能；攻擊造成係數 5 傷害，獲得破體印。", { coefficient: 5, sealKey: "body" }),
    ],
  },
  emei: {
    name: "峨眉派",
    officialName: "峨眉派",
    role: "流光足劍 | 閃避追擊",
    main: ["reaction", "precision"],
    secondary: ["output", "supply"],
    surnames: ["沈", "蘇", "柳", "阮", "程", "許", "辛"],
    skills: [
      skill("emei_meteor", "流星踏", 1, "攻擊三次造成係數 3 的總傷害，消耗 40 流光。", { coefficient: 3, resourceCost: 40 }),
      skill("emei_shadow", "碎影腳", 3, "攻擊一次造成係數 4 傷害，消耗 40 流光。", { coefficient: 4, resourceCost: 40 }),
      skill("emei_fall_star", "落星步", 6, "攻擊一次造成係數 3 傷害，消耗 40 流光。", { coefficient: 3, resourceCost: 40 }),
      skill("emei_turning", "斗轉", 10, "觸發技；開局施展，提高每回合流光恢復 5 點。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("emei_chase_shadow", "追影", 15, "觸發技；開局施展。攻擊命中有 30% 機率追加係數 2 傷害並獲得 5 流光，追擊可再次觸發追擊。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true, coefficient: 2 }),
      skill("emei_crash_star", "崩星踏", 20, "流星踏上位技能；攻擊三次造成係數 5 的總傷害，消耗 40 流光。", { coefficient: 5, resourceCost: 40 }),
    ],
  },
  furnace: {
    name: "華山軍工",
    officialName: "華山軍工",
    role: "紫氣劍放 | 連擊點爆發",
    main: ["output", "armor"],
    secondary: ["supply", "precision"],
    surnames: ["姚", "任", "韓", "祝", "段", "高", "鐵"],
    skills: [
      skill("furnace_long", "氣貫長虹", 1, "造成係數 3 傷害，獲得紫氣。", { coefficient: 3 }),
      skill("furnace_dawn", "朝陽破曉", 3, "造成 150% 傷害，獲得紫氣；下一回合追加 300% 引爆。", { coefficient: 1.5 }),
      skill("furnace_ziqi_end", "紫氣寂滅", 6, "攻擊造成紫氣數量乘以係數 3 傷害，消耗所有紫氣。", { coefficient: 3, condition: "resource_at_1" }),
      skill("furnace_east", "紫氣東來", 10, "觸發技；開場施展，消耗紫氣的技能追加引爆係數 2 乘以紫氣數量的傷害。", { timing: "trigger", triggerCondition: "battle_start", oncePerBattle: true }),
      skill("furnace_zidian", "紫電穿雲", 15, "觸發技；獲得紫氣時 20% 機率施展，攻擊造成係數 2 傷害。", { timing: "trigger", triggerCondition: "resource_gain_chance_20", coefficient: 2 }),
      skill("furnace_sky", "氣貫長空", 20, "氣貫長虹上位技能；造成係數 5 傷害，獲得紫氣。", { coefficient: 5 }),
    ],
  },
};

const CLASS_RESOURCE_DATA = {
  tianshu: { label: "解析", max: 100, start: 0, combat: true },
  tang: { label: "冷卻", max: 60, start: 18, combat: false },
  chanlin: { label: "不動心", max: 100, start: 0, combat: true },
  leishi: { label: "彈藥", max: 4, start: 4, combat: true },
  xinhuo: { label: "怒氣", max: 100, start: 0, combat: true },
  wangchuan: { label: "生死印", max: 3, start: 0, combat: true },
  emei: { label: "流光", max: 100, start: 100, combat: true },
  furnace: { label: "紫氣", max: 5, start: 0, combat: true },
};

const WANG_SEAL_STATUS_LABELS = { body: "破體印", soul: "斷魂印", spirit: "裂魄印" };

const SKILL_UPGRADES = {
  tianshu_nine: ["tianshu_three"],
  tang_king: ["tang_bee"],
  chanlin_mingwang: ["chanlin_luohan"],
  lei_lianzhu_plus: ["lei_lianzhu"],
  xinhuo_star_combo: ["xinhuo_first"],
  wang_body_plus: ["wang_body"],
  emei_crash_star: ["emei_meteor"],
  furnace_sky: ["furnace_long"],
};

const SKILL_COMBO_DEFINITIONS = {
  tianshu_region: {
    previousSkillId: "tianshu_three",
    upgradedPreviousSkillId: "tianshu_nine",
    bonusCoefficient: 2,
  },
  tianshu_body: {
    previousSkillId: "tianshu_region",
    bonusCoefficient: 2,
  },
  chanlin_tiger: {
    previousSkillId: "chanlin_luohan",
    upgradedPreviousSkillId: "chanlin_mingwang",
    bonusCoefficient: 2,
  },
  xinhuo_heavy: {
    previousSkillId: "xinhuo_first",
    bonusCoefficient: 2,
  },
  emei_fall_star: {
    previousSkillId: "emei_meteor",
    upgradedPreviousSkillId: "emei_crash_star",
    bonusCoefficient: 2,
  },
};

const LEGACY_SKILL_ID_MAP = {
  emei_kick: "emei_meteor",
  emei_sword: "emei_shadow",
  emei_feint: "emei_fall_star",
  emei_ripple: "emei_fall_star",
  emei_flash: "emei_turning",
  emei_guard: "emei_chase_shadow",
  emei_chain: "emei_chase_shadow",
  emei_chase: "emei_crash_star",
};

const SKILL_PRESENTATION_TEXT = {
  tianshu_three: "三劍成一線，試探出敵人的破綻，加深解析。",
  tianshu_region: "以短距劍路封住身前區域，解析足夠時能穩定刺穿敵陣。",
  tianshu_body: "把推演出的劍路收束成形，重創目標並繼續推高解析。",
  tianshu_one: "解析過半時把零散劍路歸成一式，對目標打出一次精準爆發。",
  tianshu_array: "開戰先布下劍陣，解析越深，後續攻勢越凌厲。",
  tianshu_nine: "九劍連發，劍路比三點參直更密，能在攻擊中快速推進解析。",
  tang_bee: "一針入肉後毒性緩緩擴散，讓敵人在後續回合持續受創。不同種類的毒將分開計算。",
  tang_soul: "針上藥性不同於生物毒，發作更烈。不同種類的毒將分開計算。",
  tang_bone: "先以錐針破骨，再把敵人體內尚未發作的毒傷一口氣催出。",
  tang_rain: "開戰灑出一片針雨，主目標承受最密集的暗器，其餘敵人也難以全身而退。",
  tang_heart: "敵人體內出現新的毒性時，唐門手法會立刻順勢追擊。",
  tang_king: "毒蜂針的上位針法，毒力更深，停留更久。不同種類的毒將分開計算。",
  chanlin_luohan: "沉穩出拳，邊打邊定心，逐步累積不動心。",
  chanlin_tiger: "掌勢沉重，適合正面壓制敵人並穩住心神。",
  chanlin_vajra_reflect: "不動心達到 100 後進入金剛反勢，消耗 100 不動心，下一次受擊會把力道反震回去。",
  chanlin_immovable: "入禪定身，化去下一次傷害，並以反擊逼退敵人。",
  chanlin_stone_heart: "開戰先立石心，厚實護盾會先替本體承傷。",
  chanlin_mingwang: "羅漢拳的上位拳法，拳勢更重，仍能穩定累積不動心。",
  lei_lianzhu: "五發連射壓住目標，用一發彈藥換取穩定輸出。",
  lei_crack: "特製彈頭打裂護甲，讓目標短時間更容易被擊傷。",
  lei_fullshot: "把剩餘彈藥一次傾瀉出去，彈越多，爆發越高。",
  lei_aim: "開場校正準星，讓後續射擊更準、更容易打出重擊。",
  lei_quick_reload: "彈倉見底時啟動快速裝填，一場戰鬥只能救一次節奏。",
  lei_lianzhu_plus: "連珠銃的強化射法，同樣消耗一發彈藥，但火力更密。",
  xinhuo_first: "不講章法先衝上去打，靠氣勢把怒氣打出來。",
  xinhuo_heavy: "把怒氣灌進重拳裡，短時間打出更兇的正面傷害。",
  xinhuo_voice: "開戰先吼住場面，把怒氣拉起來再說。",
  xinhuo_death: "貼近敵人猛打，邊打邊把怒火推高。",
  xinhuo_life_first: "血量危急時先保命，回一口氣再把怒氣補上。",
  xinhuo_star_combo: "總之先揍的上位連拳，三拳連成一串，氣勢更足。",
  wang_body: "刺入破體印，讓目標之後承受更多傷害。",
  wang_soul: "釘入斷魂印，讓目標更容易被打出致命破綻。",
  wang_life_death: "收回身上的印記，依印數發動一印追命、二印銷魂或三印渡川。",
  wang_spirit: "閃過攻擊後貼身反刺，順手補上裂魄印。",
  wang_step: "開戰先踏彼岸步伐，之後每次閃過攻擊都能順勢反刺。",
  wang_yellow_spring: "敵人露出死相時補上最後一擊，引渡入黃泉。",
  wang_body_plus: "破體錐的上位刺法，破體更深，傷害也更高。",
  emei_meteor: "以流光連踏三段切入，把一輪攻勢拆成三次命中。",
  emei_shadow: "收束身形後斬碎敵影，用一次乾淨命中打出重傷。",
  emei_fall_star: "順勢落身追擊，用較穩定的一擊延續攻勢。",
  emei_turning: "開戰調整身法節奏，讓後續每回合回復更多流光。",
  emei_chase_shadow: "開戰進入追影節奏，命中後有機率連續追擊並回收流光。",
  emei_crash_star: "流星踏的上位三段攻勢，三次命中傷害更高。",
  furnace_long: "以紫氣貫穿敵人，攻擊後收回一縷紫氣。",
  furnace_dawn: "留下下一回合引爆。",
  furnace_ziqi_end: "把累積的紫氣一次寂滅，紫氣越多，爆發越高。",
  furnace_east: "開戰導入紫氣東來，之後消耗紫氣時會追加引爆。",
  furnace_zidian: "獲得紫氣時有機會穿雲補擊，給敵人一次額外打擊。",
  furnace_sky: "氣貫長虹的上位劍放，紫氣更盛，傷害更高。",
};

const SKILL_DETAILS = {};

const GIVEN_MALE_A = ["承", "峻", "玄", "衡", "曜", "鋒", "鎮", "霆", "晟", "嶽", "朔", "戎", "鐵", "擎", "烈", "銘"];
const GIVEN_MALE_B = ["舟", "川", "岳", "策", "陵", "鋒", "霆", "曜", "銘", "戎", "嶽", "衡", "朔", "燼", "甲", "淵"];
const GIVEN_FEMALE_A = ["青", "素", "映", "雲", "知", "遙", "霜", "微", "瑤", "綾", "晴", "蘭", "宛", "汐", "雪", "澄"];
const GIVEN_FEMALE_B = ["溪", "枝", "燈", "珂", "弦", "安", "霜", "微", "瑤", "鈴", "蘭", "月", "薇", "晴", "汐", "音"];

function skill(id, name, level, summary, options = {}) {
  const config = typeof options === "number" ? { coefficient: options } : (options || {});
  const timing = normalizeSkillTiming(config.timing || config.castType || "turn");
  return {
    id,
    name,
    level,
    summary,
    type: "active",
    timing,
    timingLabel: SKILL_TIMINGS[timing].label,
    triggerCondition: timing === "trigger" ? (config.triggerCondition || config.insertCondition || "") : "",
    condition: config.condition || "",
    coefficient: Number.isFinite(config.coefficient) ? config.coefficient : 0,
    poisonKey: config.poisonKey || "",
    poisonCoefficient: Number.isFinite(config.poisonCoefficient) ? config.poisonCoefficient : 0,
    poisonDuration: Number.isFinite(config.poisonDuration) ? config.poisonDuration : 0,
    sealKey: config.sealKey || "",
    ammoCost: config.ammoCost ?? 0,
    resourceCost: Number.isFinite(config.resourceCost) ? config.resourceCost : 0,
    oncePerBattle: !!config.oncePerBattle,
  };
}

function passive(id, name, level, summary) {
  return { id, name, level, summary, type: "passive" };
}

function normalizeSkillTiming(value) {
  return value === "trigger" || value === "insert" ? "trigger" : "turn";
}

function isTurnSkill(skillData) {
  return !!skillData && normalizeSkillTiming(skillData.timing) === "turn";
}

function isInsertSkill(skillData) {
  return !!skillData && normalizeSkillTiming(skillData.timing) === "trigger";
}

function isTriggerSkill(skillData) {
  return isInsertSkill(skillData);
}

function classResourceData(classId) {
  return CLASS_RESOURCE_DATA[classId] || { label: "資源", max: 60, start: 0, combat: true };
}

function classResourceLabel(classId) {
  return classResourceData(classId).label;
}

function skillCostLabel(skillData, classId) {
  if (!skillData || skillData.type !== "active") return "被動";
  return skillTimingLabel(skillData);
}

function classResourceStart(member, maxValue) {
  const data = classResourceData(member.classId);
  return Math.min(maxValue, Math.max(0, data.start || 0));
}

const state = {
  showTitle: false,
  view: "town",
  introStage: INTRO_STAGE_OPENING,
  eventDialog: null,
  creatorCompleted: false,
  creatorDraft: null,
  creatorRandomAt: 0,
  money: 900,
  material: 120,
  energy: 60,
  refreshCounter: 0,
  maxClearedLevel: 0,
  selectedMemberId: null,
  detailMemberId: null,
  detailCandidateIndex: null,
  statDetailMemberId: null,
  statDetailCandidateIndex: null,
  activeTacticsFormation: 0,
  skillTab: "equipment",
  itemSort: "order",
  itemFilter: "all",
  focusedInventoryItem: null,
  gearWishlist: [],
  gearCraftSetOpen: {},
  focusedGearRecipeId: "",
  bodySystemUnlocked: false,
  bodySlotUnlocks: {},
  bodyUpgradeMode: "meridian",
  bodySelection: null,
  lastUpgradeId: null,
  recruits: [],
  candidates: [],
  recruitRefreshHourKey: 0,
  party: [null, null, null, null],
  inventory: {},
  inventoryOrder: [],
  itemLogArchive: [],
  chips: [],
  gear: [],
  blueprints: {},
  homePrimaryMenu: "map",
  homeSecondaryMenu: "regions",
  codexFactionOpen: true,
  codexGeographyOpen: true,
  marketMode: "buy",
  marketStock: [],
  marketStockLevel: 0,
  marketExchange: { from: "money", to: "material", amount: 60 },
  newsIndex: 0,
  newsQueue: [],
  activeNewsId: null,
  fortune: { round: 0, drawn: false, result: null },
  gather: { unlocked: false, active: false, completed: false, endsAt: 0, workerName: "", workerId: "", durationMinutes: 10, locationId: "blackwater", reward: null },
  expedition: { unlocked: false, active: false, completed: false, endsAt: 0 },
  townTalkers: [],
  tavernTalkers: [],
  activeTownTalkerId: null,
  activeTavernTalkerId: null,
  tavernTalkerLineIndexes: {},
  activePartyTalkMemberId: null,
  activePartyTalkText: "",
  activeRecruitTalkIndex: null,
  activeRecruitTalkText: "",
  overlayView: null,
  chipDrawer: null,
  workshopTalkEntry: null,
  tutorials: {
    firstTownPlaces: false,
    firstSkillUnlock: false,
    firstMapRouteStep: "",
    wolfWorkshopIntro: false,
    bodyManagementIntro: false,
    autoRepeatIntro: false,
  },
  pendingSkillOrderTutorial: null,
  pendingWolfWorkshopTutorial: null,
  pendingBodyManagementTutorial: null,
  pendingAutoRepeatTutorial: null,
  battle: null,
  battleTimer: null,
  uiRefreshTimer: null,
  battleSpeed: 1,
  autoRepeat: false,
  autoRepeatTimer: null,
  autoRepeatSeq: 0,
  autoRepeatStats: null,
  lastBattleLevel: 1,
  idleProgress: 0,
  pendingBossLevel: null,
  battleLogArchive: [],
  commissions: {},
};

let delegatedUiEventsBound = false;
let uiInteractionLockUntil = 0;
let deferredBattleRenderTimer = null;
let queuedBattleRenderRaf = 0;
let lastBattleRenderAt = 0;
let activeInventoryGearDragId = "";
let activeEquippedGearDrag = null;
let pendingItemFocusPointer = null;
let lastInventoryGearTap = null;
let eventDialogTypingTimer = null;
let renderedScrollScope = "";

function init() {
  bindDelegatedUiEvents();
  applyViewportScale();
  window.addEventListener("resize", applyViewportScale);
  window.addEventListener("beforeunload", () => saveGame());
  if (loadGame()) {
    render();
    return;
  }
  seedNewGame();
  render();
}

function bindDelegatedUiEvents() {
  if (delegatedUiEventsBound) return;
  delegatedUiEventsBound = true;
  document.addEventListener("pointerdown", (ev) => {
    const itemFocusTarget = ev.target.closest("[data-v009-item-focus]");
    const quickEquipTarget = itemFocusTarget?.closest("[data-v009-gear-quick-equip]");
    pendingItemFocusPointer = itemFocusTarget ? {
      pointerId: ev.pointerId,
      category: itemFocusTarget.dataset.v009ItemFocus,
      id: itemFocusTarget.dataset.v009ItemId,
      quickEquipGearId: quickEquipTarget?.dataset.v009GearQuickEquip || "",
      x: ev.clientX,
      y: ev.clientY,
      rect: itemFocusTarget.getBoundingClientRect(),
    } : null;
    const dragScroller = ev.target.closest(".v009-battle-feed, .v009-side-item-list, .full-battle-log-feed, .v009-item-summary");
    if (dragScroller && !ev.target.closest("button, input, select, textarea, a, [data-item-filter], [data-v009-item-focus]")) {
      startDragScroll(ev, dragScroller);
      return;
    }
    if (state.focusedInventoryItem && !ev.target.closest("[data-v009-sell-focused], [data-v009-dismantle-focused]")) {
      clearFocusedInventoryItem();
      pendingItemFocusPointer = null;
      ev.preventDefault();
      ev.stopPropagation();
      render();
      return;
    }
    if (state.v009SkillDrawerOpen && !ev.target.closest(".v009-skill-loadout")) {
      ev.preventDefault();
      ev.stopPropagation();
      state.v009SkillDrawerOpen = false;
      render();
      return;
    }
    const interactive = ev.target.closest("button, input, select, textarea, a, [data-view], [data-overlay-view], [data-home-primary], [data-home-secondary], [data-boss-stage], [data-toggle-front], [data-v009-item-focus], [draggable='true']");
    if (interactive) uiInteractionLockUntil = Date.now() + 360;
    if (ev.target.closest("[data-item-filter]")) return;
    const overlayTrigger = ev.target.closest("[data-overlay-view]");
    if (overlayTrigger) {
      ev.preventDefault();
      ev.stopPropagation();
      state.overlayView = overlayTrigger.dataset.overlayView;
      render();
      return;
    }
    if (state.overlayView && ev.target.closest(".subui-backdrop") && !ev.target.closest(".subui-panel")) {
      ev.preventDefault();
      ev.stopPropagation();
      state.overlayView = null;
      render();
    }
  }, true);
  document.addEventListener("pointerup", (ev) => {
    uiInteractionLockUntil = Math.max(uiInteractionLockUntil, Date.now() + 120);
    if (!pendingItemFocusPointer || pendingItemFocusPointer.pointerId !== ev.pointerId) return;
    const pending = pendingItemFocusPointer;
    pendingItemFocusPointer = null;
    const dx = ev.clientX - pending.x;
    const dy = ev.clientY - pending.y;
    if (Math.hypot(dx, dy) > 8) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (isInventoryGearDoubleTap(pending.quickEquipGearId, ev)) {
      lastInventoryGearTap = null;
      equipGearToFocusedMember(pending.quickEquipGearId);
      return;
    }
    rememberInventoryGearTap(pending.quickEquipGearId, ev);
    focusInventoryItem(pending.category, pending.id, pending.rect);
  }, true);
  document.addEventListener("pointercancel", () => {
    pendingItemFocusPointer = null;
  }, true);
  document.addEventListener("dblclick", (ev) => {
    const equippedGear = ev.target.closest("[data-equipped-gear-member][data-equipped-gear-slot]");
    if (equippedGear) {
      ev.preventDefault();
      ev.stopPropagation();
      pendingItemFocusPointer = null;
      clearFocusedInventoryItem();
      unequipGearToInventory(equippedGear.dataset.equippedGearMember || "", equippedGear.dataset.equippedGearSlot || "");
      return;
    }
    const skillSlot = ev.target.closest("[data-v009-skill-slot]");
    if (skillSlot?.dataset.v009SkillId) {
      ev.preventDefault();
      ev.stopPropagation();
      removeEquippedTypedSkillAtSlot(
        skillSlot.dataset.v009SkillMember,
        skillSlot.dataset.v009SkillSlotType,
        skillSlot.dataset.v009SkillSlot
      );
    }
  }, true);
}

function isInventoryGearDoubleTap(gearId, ev) {
  if (!gearId || !lastInventoryGearTap) return false;
  const dt = Date.now() - lastInventoryGearTap.at;
  const dx = ev.clientX - lastInventoryGearTap.x;
  const dy = ev.clientY - lastInventoryGearTap.y;
  return lastInventoryGearTap.gearId === gearId && dt <= 420 && Math.hypot(dx, dy) <= 12;
}

function rememberInventoryGearTap(gearId, ev) {
  if (!gearId) {
    lastInventoryGearTap = null;
    return;
  }
  lastInventoryGearTap = { gearId, at: Date.now(), x: ev.clientX, y: ev.clientY };
}

function startDragScroll(ev, scroller) {
  if (!scroller) return;
  ev.preventDefault();
  ev.stopPropagation();
  uiInteractionLockUntil = Date.now() + 420;
  const pointerId = ev.pointerId;
  const startY = ev.clientY;
  const startScrollTop = scroller.scrollTop;
  const scale = Math.max(0.1, Number(getComputedStyle(document.documentElement).getPropertyValue("--ui-scale")) || 1);
  scroller.classList.add("is-drag-scrolling");
  try {
    scroller.setPointerCapture(pointerId);
  } catch (error) {
    // Some synthetic browser events do not expose pointer capture.
  }
  const move = (moveEv) => {
    if (moveEv.pointerId !== pointerId) return;
    moveEv.preventDefault();
    const delta = (moveEv.clientY - startY) / scale;
    scroller.scrollTop = startScrollTop - delta;
  };
  const end = (endEv) => {
    if (endEv.pointerId !== pointerId) return;
    scroller.classList.remove("is-drag-scrolling");
    scroller.removeEventListener("pointermove", move);
    scroller.removeEventListener("pointerup", end);
    scroller.removeEventListener("pointercancel", end);
    try {
      scroller.releasePointerCapture(pointerId);
    } catch (error) {
      // Capture may already be released when the pointer leaves the app frame.
    }
  };
  scroller.addEventListener("pointermove", move);
  scroller.addEventListener("pointerup", end);
  scroller.addEventListener("pointercancel", end);
}

function applyViewportScale() {
  const scale = Math.min(window.innerWidth / UI_DESIGN_WIDTH, window.innerHeight / UI_DESIGN_HEIGHT);
  document.documentElement.style.setProperty("--ui-scale", String(scale));
}

function seedNewGame() {
  state.showTitle = false;
  state.view = "town";
  state.introStage = INTRO_STAGE_OPENING;
  state.eventDialog = null;
  state.creatorCompleted = false;
  state.creatorDraft = defaultCreatorDraft();
  state.creatorRandomAt = 0;
  state.money = 900;
  state.material = 120;
  state.energy = 60;
  state.refreshCounter = 0;
  state.maxClearedLevel = 0;
  state.selectedMemberId = null;
  state.detailMemberId = null;
  state.detailCandidateIndex = null;
  state.statDetailMemberId = null;
  state.statDetailCandidateIndex = null;
  state.activeTacticsFormation = 0;
  state.skillTab = "equipment";
  state.itemSort = "order";
  state.itemFilter = "all";
  state.lastUpgradeId = null;
  state.battle = null;
  state.uiRefreshTimer = null;
  state.battleSpeed = 1;
  state.autoRepeat = false;
  state.autoRepeatTimer = null;
  state.autoRepeatStats = null;
  state.pendingAutoRepeatTutorial = null;
  state.lastBattleLevel = 1;
  state.idleProgress = 0;
  state.pendingBossLevel = null;
  state.battleLogArchive = [];
  state.commissions = {};
  state.recruits = [];
  state.party = [null, null, null, null];
  state.recruitRefreshHourKey = currentRecruitRefreshHourKey();
  state.inventory = {};
  state.inventoryOrder = [];
  state.itemLogArchive = [];
  state.chips = [];
  state.gear = [];
  state.gearWishlist = [];
  state.focusedInventoryItem = null;
  state.focusedGearRecipeId = "";
  state.bodySystemUnlocked = false;
  state.bodySlotUnlocks = {};
  state.bodyUpgradeMode = "meridian";
  state.bodySelection = null;
  state.blueprints = {};
  state.marketMode = "buy";
  state.marketStock = [];
  state.marketStockLevel = 0;
  state.marketExchange = { from: "money", to: "material", amount: 60 };
  state.newsIndex = 0;
  state.newsQueue = [];
  state.activeNewsId = null;
  state.fortune = createFortuneState(0);
  state.gather = { unlocked: false, active: false, completed: false, endsAt: 0, workerName: "", workerId: "", durationMinutes: 10, locationId: "blackwater", reward: null };
  state.expedition = { unlocked: false, active: false, completed: false, endsAt: 0 };
  state.townTalkers = [];
  state.tavernTalkers = [];
  state.activeTownTalkerId = null;
  state.activeTavernTalkerId = null;
  state.tavernTalkerLineIndexes = {};
  state.activePartyTalkMemberId = null;
  state.activePartyTalkText = "";
  state.activeRecruitTalkIndex = null;
  state.activeRecruitTalkText = "";
  state.overlayView = null;
  state.chipDrawer = null;
  state.workshopTalkEntry = null;
  state.tutorials = {
    firstTownPlaces: false,
    firstSkillUnlock: false,
    firstMapRouteStep: "",
    wolfWorkshopIntro: false,
    bodyManagementIntro: false,
  };
  state.pendingSkillOrderTutorial = null;
  state.pendingWolfWorkshopTutorial = null;
  state.pendingBodyManagementTutorial = null;
  state.selectedMemberId = null;
  state.candidates = [];
  ensureDefaultCommissions();
}

function saveGame() {
  try {
    const save = {
      version: CURRENT_SAVE_VERSION,
      view: state.view === "battle" ? "map" : state.view,
      introStage: normalizeIntroStage(state.introStage, state.creatorCompleted),
      creatorCompleted: state.creatorCompleted,
      creatorDraft: state.creatorDraft,
      money: state.money,
      material: state.material,
      energy: state.energy,
      refreshCounter: state.refreshCounter,
      maxClearedLevel: state.maxClearedLevel,
      selectedMemberId: state.selectedMemberId,
      itemSort: state.itemSort,
      itemFilter: state.itemFilter,
      recruits: state.recruits,
      candidates: state.candidates,
      recruitRefreshHourKey: state.recruitRefreshHourKey,
      party: state.party,
      inventory: state.inventory,
      inventoryOrder: state.inventoryOrder,
      itemLogArchive: state.itemLogArchive,
      chips: state.chips,
      gear: state.gear,
      gearWishlist: state.gearWishlist,
      focusedGearRecipeId: state.focusedGearRecipeId,
      bodySystemUnlocked: state.bodySystemUnlocked,
      bodySlotUnlocks: state.bodySlotUnlocks,
      bodyUpgradeMode: state.bodyUpgradeMode,
      blueprints: state.blueprints,
      marketMode: state.marketMode,
      marketStock: state.marketStock,
      marketStockLevel: state.marketStockLevel,
      marketExchange: state.marketExchange,
      newsIndex: state.newsIndex,
      newsQueue: state.newsQueue,
      fortune: state.fortune,
      gather: state.gather,
      expedition: state.expedition,
      tutorials: state.tutorials,
      codexFactionOpen: state.codexFactionOpen !== false,
      codexGeographyOpen: state.codexGeographyOpen !== false,
      commissions: state.commissions,
      battleSpeed: state.battleSpeed,
      autoRepeatSession: autoRepeatSaveState(),
      lastBattleLevel: state.lastBattleLevel,
      idleProgress: state.idleProgress,
      battleLogArchive: state.battleLogArchive,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (error) {
    console.warn("Save failed", error);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const save = migrateSave(JSON.parse(raw));
    if (!save) return false;
    state.showTitle = false;
    state.view = save.view && save.view !== "battle" ? save.view : "town";
    state.introStage = save.introStage;
    state.eventDialog = null;
    state.creatorCompleted = save.creatorCompleted;
    state.creatorDraft = save.creatorDraft;
    state.money = save.money;
    state.material = save.material;
    state.energy = save.energy;
    state.refreshCounter = save.refreshCounter;
    state.maxClearedLevel = save.maxClearedLevel;
    state.recruits = save.recruits;
    state.candidates = save.candidates;
    state.recruitRefreshHourKey = save.recruitRefreshHourKey;
    state.party = save.party;
    state.inventory = save.inventory;
    state.inventoryOrder = save.inventoryOrder;
    state.itemLogArchive = save.itemLogArchive;
    state.chips = save.chips;
    state.gear = save.gear;
    state.gearWishlist = save.gearWishlist;
    state.focusedGearRecipeId = save.focusedGearRecipeId;
    state.bodySystemUnlocked = save.bodySystemUnlocked;
    state.bodySlotUnlocks = save.bodySlotUnlocks;
    state.bodyUpgradeMode = save.bodyUpgradeMode;
    state.bodySelection = null;
    state.blueprints = save.blueprints;
    state.itemSort = save.itemSort;
    state.itemFilter = save.itemFilter;
    state.marketMode = save.marketMode;
    state.marketStock = save.marketStock;
    state.marketStockLevel = save.marketStockLevel;
    state.marketExchange = save.marketExchange;
    state.newsIndex = save.newsIndex;
    state.newsQueue = save.newsQueue;
    state.activeNewsId = null;
    state.fortune = save.fortune;
    state.gather = save.gather;
    state.expedition = save.expedition;
    state.tutorials = save.tutorials;
    state.codexFactionOpen = save.codexFactionOpen !== false;
    state.codexGeographyOpen = save.codexGeographyOpen !== false;
    state.selectedMemberId = save.selectedMemberId;
    state.lastUpgradeId = null;
    state.battle = null;
    state.battleTimer = null;
    state.battleSpeed = save.battleSpeed;
    state.autoRepeat = false;
    state.autoRepeatTimer = null;
    state.autoRepeatStats = null;
    state.pendingAutoRepeatTutorial = null;
    state.lastBattleLevel = save.lastBattleLevel;
    state.idleProgress = save.idleProgress;
    state.pendingBossLevel = null;
    state.battleLogArchive = Array.isArray(save.battleLogArchive) ? save.battleLogArchive.slice(0, 200) : [];
    state.commissions = save.commissions;
    state.pendingBodyManagementTutorial = null;
    ensureBodyManagementState();
    ensureDefaultCommissions();
    state.candidates = [];
    restoreOfflineAutoRepeat(save.autoRepeatSession);
    saveGame();
    if (state.autoRepeat) {
      const repeat = state.autoRepeatStats || {};
      setTimeout(() => scheduleAutoRepeat(repeat.level || state.lastBattleLevel, repeat.kind || "mob"), 0);
    }
    return true;
  } catch (error) {
    console.warn("Load failed", error);
    return false;
  }
}

function migrateSave(save) {
  if (!save || typeof save !== "object") return null;
  const recruits = normalizeMemberList(save.recruits, false);
  const creatorCompleted = save.creatorCompleted === undefined ? recruits.length > 0 : !!save.creatorCompleted;
  if (!recruits.length && creatorCompleted) return null;
  const recruitIds = new Set(recruits.map((member) => member.id));
  const candidates = normalizeMemberList(save.candidates, true).slice(0, RECRUIT_CANDIDATE_COUNT);
  const party = Array.isArray(save.party) ? save.party.slice(0, 4).map((id) => recruitIds.has(id) ? id : null) : [null, null, null, null];
  while (party.length < 4) party.push(null);
  const selectedMemberId = recruitIds.has(save.selectedMemberId) ? save.selectedMemberId : recruits[0]?.id || null;
  return {
    version: CURRENT_SAVE_VERSION,
    view: validView(save.view),
    introStage: normalizeIntroStage(save.introStage, creatorCompleted),
    creatorCompleted,
    creatorDraft: normalizeCreatorDraft(save.creatorDraft),
    money: safeNumber(save.money, 900, 0),
    material: safeNumber(save.material, 120, 0),
    energy: safeNumber(save.energy, 60, 0),
    refreshCounter: safeNumber(save.refreshCounter, 0, 0),
    maxClearedLevel: Math.min(BLACKWATER_MAX_LEVEL, safeNumber(save.maxClearedLevel, 0, 0)),
    selectedMemberId,
    itemSort: ["order", "type", "value"].includes(save.itemSort) ? save.itemSort : "order",
    itemFilter: ["all", "gear", "chip", "material", "quest"].includes(save.itemFilter) ? save.itemFilter : "all",
    recruits,
    candidates,
    recruitRefreshHourKey: safeNumber(save.recruitRefreshHourKey, currentRecruitRefreshHourKey(), 0),
    party,
    inventory: normalizeInventory(save.inventory),
    inventoryOrder: normalizeInventoryOrder(save.inventoryOrder, save.inventory),
    itemLogArchive: Array.isArray(save.itemLogArchive) ? save.itemLogArchive.slice(0, 200) : [],
    chips: normalizeChipInventory(save.chips),
    gear: normalizeGearInventory(save.gear),
    gearWishlist: normalizeGearWishlist(save.gearWishlist),
    focusedGearRecipeId: GEAR_CRAFT_RECIPES.some((recipe) => recipe.id === save.focusedGearRecipeId) ? save.focusedGearRecipeId : "",
    bodySystemUnlocked: !!save.bodySystemUnlocked || Math.min(BLACKWATER_MAX_LEVEL, safeNumber(save.maxClearedLevel, 0, 0)) >= 10,
    bodySlotUnlocks: normalizeBodySlotUnlocks(save.bodySlotUnlocks, Math.min(BLACKWATER_MAX_LEVEL, safeNumber(save.maxClearedLevel, 0, 0))),
    bodyUpgradeMode: ["switch", "meridian"].includes(save.bodyUpgradeMode) ? save.bodyUpgradeMode : "meridian",
    blueprints: normalizeBlueprints(save.blueprints, Math.min(BLACKWATER_MAX_LEVEL, safeNumber(save.maxClearedLevel, 0, 0))),
    marketMode: save.marketMode === "sell" ? "sell" : "buy",
    marketStock: normalizeMarketStock(save.marketStock, Math.max(1, safeNumber(save.maxClearedLevel, 0, 0) + 1)),
    marketStockLevel: safeNumber(save.marketStockLevel, 0, 0),
    marketExchange: normalizeMarketExchange(save.marketExchange),
    newsIndex: normalizeNewsIndex(save.newsIndex),
    newsQueue: normalizeNewsQueue(save.newsQueue),
    fortune: normalizeFortune(save.fortune),
    gather: normalizeTimedTask(save.gather),
    expedition: normalizeTimedTask(save.expedition),
    tutorials: normalizeTutorials(save.tutorials),
    codexFactionOpen: save.codexFactionOpen !== false,
    codexGeographyOpen: save.codexGeographyOpen !== false,
    commissions: normalizeCommissions(save.commissions),
    battleSpeed: save.battleSpeed === 2 ? 2 : 1,
    autoRepeatSession: normalizeAutoRepeatSession(save.autoRepeatSession),
    lastBattleLevel: Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, safeNumber(save.lastBattleLevel, 1, 1))),
    idleProgress: Math.min(IDLE_BOSS_PROGRESS_REQUIRED, safeNumber(save.idleProgress, 0, 0)),
    battleLogArchive: Array.isArray(save.battleLogArchive) ? save.battleLogArchive.slice(0, 200) : [],
  };
}

function normalizeAutoRepeatSession(session) {
  if (!session || typeof session !== "object" || !session.active) return null;
  const level = Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, safeNumber(session.level, 1, 1)));
  const kind = normalizeBattleKind(session.kind || "mob");
  if (kind.startsWith("event_")) return null;
  const stats = normalizeAutoRepeatStats(session.stats, level, kind);
  return {
    active: true,
    level,
    kind,
    lastAt: safeNumber(session.lastAt, Date.now(), 0),
    stats,
  };
}

function normalizeAutoRepeatStats(stats, level, kind) {
  const source = stats && typeof stats === "object" ? stats : {};
  const items = {};
  Object.entries(source.items || {}).forEach(([id, count]) => {
    if (ITEM_DATA[id]) items[id] = safeNumber(count, 0, 0);
  });
  return {
    level: Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, safeNumber(source.level, level, 1))),
    kind: normalizeBattleKind(source.kind || kind),
    battles: safeNumber(source.battles, 0, 0),
    exp: safeNumber(source.exp, 0, 0),
    money: safeNumber(source.money, 0, 0),
    material: safeNumber(source.material, 0, 0),
    energy: safeNumber(source.energy, 0, 0),
    items,
    gear: safeNumber(source.gear, 0, 0),
  };
}

function normalizeIntroStage(stage, creatorCompleted) {
  if ([INTRO_STAGE_OPENING, INTRO_STAGE_CREATOR, INTRO_STAGE_AFTER_CREATOR, INTRO_STAGE_MAIN, INTRO_STAGE_DONE].includes(stage)) return stage;
  return creatorCompleted ? INTRO_STAGE_DONE : INTRO_STAGE_OPENING;
}

function normalizeTimedTask(task) {
  return {
    unlocked: !!task?.unlocked,
    active: !!task?.active,
    completed: !!task?.completed,
    endsAt: safeNumber(task?.endsAt, 0, 0),
    workerName: typeof task?.workerName === "string" ? task.workerName : "",
    workerId: typeof task?.workerId === "string" ? task.workerId : "",
    durationMinutes: GATHER_DURATIONS.includes(Number(task?.durationMinutes)) ? Number(task.durationMinutes) : 10,
    locationId: typeof task?.locationId === "string" ? task.locationId : "blackwater",
    reward: normalizeGatherReward(task?.reward),
  };
}

function normalizeGatherReward(reward) {
  if (!reward || typeof reward !== "object") return null;
  return {
    energy: safeNumber(reward.energy, 0, 0),
    items: Array.isArray(reward.items)
      ? reward.items.filter((item) => ITEM_DATA[item.id]).map((item) => ({ id: item.id, count: safeNumber(item.count, 1, 1) }))
      : [],
    efficiency: safeNumber(reward.efficiency, 1, 0),
  };
}

function normalizeTutorials(tutorials) {
  return {
    firstTownPlaces: !!tutorials?.firstTownPlaces,
    firstSkillUnlock: !!tutorials?.firstSkillUnlock,
    firstMapRouteStep: ["map", "blackwater", "battle", "done"].includes(tutorials?.firstMapRouteStep) ? tutorials.firstMapRouteStep : "",
    wolfWorkshopIntro: !!tutorials?.wolfWorkshopIntro,
    bodyManagementIntro: !!tutorials?.bodyManagementIntro,
    autoRepeatIntro: !!tutorials?.autoRepeatIntro,
  };
}

function normalizeBodySlotUnlocks(unlocks, maxClearedLevel = state.maxClearedLevel) {
  const source = unlocks && typeof unlocks === "object" ? unlocks : {};
  const normalized = {};
  if (maxClearedLevel >= 10 || state.bodySystemUnlocked) normalized[1] = true;
  for (let index = 1; index < BODY_SLOT_COUNT; index += 1) {
    if (source[index] || source[String(index)]) normalized[index] = true;
  }
  return normalized;
}

function normalizeMemberList(list, candidate) {
  if (!Array.isArray(list)) return [];
  return list.map((member) => normalizeMember(member, candidate)).filter(Boolean);
}

function normalizeMember(member, candidate = false) {
  if (!member || typeof member !== "object" || !CLASS_DATA[member.classId]) return null;
  const gender = normalizeGender(member.gender);
  const level = Math.min(MAX_LEVEL, safeNumber(member.level, 1, 1));
  const normalized = {
    ...member,
    id: typeof member.id === "string" && member.id ? member.id : cryptoRandomId(),
    name: typeof member.name === "string" && member.name ? member.name : randomName(CLASS_DATA[member.classId], null, gender),
    gender,
    classId: member.classId,
    rarity: "white",
    tier: safeNumber(member.tier, 1, 1),
    level,
    stats: fixedStatsForClassLevel(member.classId, level),
    equippedActive: normalizeEquippedActives(member),
    equippedPassive: normalizeEquippedPassive(member),
    front: true,
    recruitCost: safeNumber(member.recruitCost, V009_RECRUIT_COST, 0),
    exp: safeNumber(member.exp, 0, 0),
    equipment: normalizeEquipment(member.equipment),
    meridians: normalizeMeridians(member.meridians || member.equipment),
    portraitAssetId: typeof member.portraitAssetId === "string" ? member.portraitAssetId : "",
    portraitPath: typeof member.portraitPath === "string" ? member.portraitPath : "",
    portraitFaction: typeof member.portraitFaction === "string" ? member.portraitFaction : "",
    portraitVariant: typeof member.portraitVariant === "string" ? member.portraitVariant : "",
    bodySlotIndex: Number.isFinite(Number(member.bodySlotIndex)) ? Math.max(0, Math.min(BODY_SLOT_COUNT - 1, Number(member.bodySlotIndex))) : -1,
    bodyKind: ["original", "blank"].includes(member.bodyKind) ? member.bodyKind : "",
    bodyOriginal: !!member.bodyOriginal,
  };
  ensureMemberPortrait(normalized);
  if (candidate) normalized.locked = !!member.locked;
  return normalized;
}

function normalizeStats(stats) {
  const source = stats && typeof stats === "object" ? stats : {};
  return Object.fromEntries(STAT_KEYS.map((key) => [key, safeNumber(source[key], 1, 1)]));
}

function normalizeGender(gender) {
  return GENDERS[gender] ? gender : Math.random() < 0.5 ? "male" : "female";
}

function ensureMemberPortrait(member) {
  if (!member) return member;
  if (isRejectedPortraitPath(member.portraitPath) || isLegacyCutePortraitPath(member.portraitPath)) {
    member.portraitAssetId = "";
    member.portraitPath = "";
    member.portraitFaction = "";
    member.portraitVariant = "";
  }
  if (!member.portraitPath) {
    const gender = normalizeGender(member.gender);
    const portraitPath = randomPortraitPath(member.classId, gender);
    if (portraitPath) {
      member.gender = gender;
      member.portraitAssetId = `${member.classId}_${gender}_${String(portraitPath).split("/").pop()?.replace(/\.png$/, "") || "v008_cute_portrait"}`;
      member.portraitPath = portraitPath;
      member.portraitFaction = member.classId;
      member.portraitVariant = gender;
    }
  }
  return member;
}

function randomPortraitPath(classId, gender) {
  const normalizedGender = normalizeGender(gender);
  const catalogPool = PORTRAIT_CATALOG.portraitsByClass?.[classId]?.[normalizedGender] || [];
  if (catalogPool.length) return randomOf(catalogPool);
  return V008_CUTE_PORTRAIT_BY_CLASS_AND_GENDER[classId]?.[normalizedGender]
    || V008_CUTE_PORTRAIT_BY_CLASS_AND_GENDER[classId]?.male
    || "";
}

function portraitUrl(member) {
  const path = member?.portraitPath || member?.portrait || member?.fullBody || member?.fullPortrait || member?.portraitFull || member?.standingPortrait || member?.bust || member?.bustUrl || member?.portraitBust || "";
  if (isRejectedPortraitPath(path)) return "";
  return assetUrl(path);
}

function isRejectedPortraitPath(path) {
  if (!path) return false;
  const source = String(path).replace(/\\/g, "/");
  return REJECTED_PORTRAIT_PACKAGE_PATHS.some((rejectedPath) => source.includes(rejectedPath));
}

function isLegacyCutePortraitPath(path) {
  if (!path) return false;
  const source = String(path).replace(/\\/g, "/");
  if (source.includes(CURRENT_PORTRAIT_PACKAGE_PATH)) return false;
  return LEGACY_CUTE_PORTRAIT_PACKAGE_PATHS.some((legacyPath) => source.includes(legacyPath));
}

function assetUrl(path) {
  if (!path) return "";
  const source = String(path).replace(/\\/g, "/");
  if (/^(?:data:|blob:|https?:|file:)/.test(source) || source.startsWith("./") || source.startsWith("../")) return source;
  const href = window.location.href.replace(/\\/g, "/");
  if (href.includes("/builds/v008_playtest_web/")) return `../../${source}`;
  if (href.includes("/v008-playtest/")) return `../codex/${source}`;
  return source;
}

function normalizeEquippedActives(member) {
  const tempMember = { ...member, level: safeNumber(member.level, 1, 1) };
  const knownActiveIds = new Set(knownSkills(tempMember, "active").map((skillData) => skillData.id));
  if (!Array.isArray(member.equippedActive)) return [...knownActiveIds].slice(0, ACTIVE_SKILL_SLOT_COUNT);
  return member.equippedActive
    .map((id) => upgradedSkillIdForMember(tempMember, id))
    .filter((id) => knownActiveIds.has(id))
    .slice(0, ACTIVE_SKILL_SLOT_COUNT);
}

function normalizeEquippedPassive(member) {
  const knownPassiveIds = new Set((CLASS_DATA[member.classId]?.skills || [])
    .filter((skillData) => skillData.type === "passive" && skillData.level <= safeNumber(member.level, 1, 1))
    .map((skillData) => skillData.id));
  return knownPassiveIds.has(member.equippedPassive) ? member.equippedPassive : null;
}

function normalizeEquipment(equipment) {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot.key, normalizeGearInstance(equipment?.[slot.key])]));
}

function normalizeMeridians(meridians) {
  return Object.fromEntries(MERIDIAN_CHIP_SLOTS.map((slot) => [slot.key, meridians?.[slot.key] || null]));
}

function normalizeBlueprints(blueprints, maxClearedLevel = -1) {
  const normalized = {};
  Object.keys(BLUEPRINT_DATA).forEach((key) => {
    normalized[key] = !!blueprints?.[key];
  });
  if (maxClearedLevel >= 5) {
    normalized.prototype_chip_1 = true;
    normalized.wolf_pack_chip = true;
    normalized.wolf_king_gear = true;
  }
  if (maxClearedLevel >= 10) {
    normalized.steel_scorpion_gear = true;
  }
  return normalized;
}

function hasBlueprint(key) {
  state.blueprints = normalizeBlueprints(state.blueprints, state.maxClearedLevel);
  return !!state.blueprints[key];
}

function hasAnyBlueprint() {
  state.blueprints = normalizeBlueprints(state.blueprints, state.maxClearedLevel);
  return Object.values(state.blueprints).some(Boolean);
}

function unlockBlueprint(key) {
  if (!BLUEPRINT_DATA[key]) return false;
  state.blueprints = normalizeBlueprints(state.blueprints);
  if (state.blueprints[key]) return false;
  state.blueprints[key] = true;
  return true;
}

function normalizeChipInventory(chips) {
  if (!Array.isArray(chips)) return [];
  return chips.map(normalizeChipInstance).filter(Boolean);
}

function normalizeGearInventory(gear) {
  if (!Array.isArray(gear)) return [];
  return gear.map(normalizeGearInstance).filter(Boolean);
}

function craftedGearRecipeIdFor(gear) {
  if (!gear || typeof gear !== "object") return "";
  if (gear.recipeId && GEAR_CRAFT_RECIPES.some((recipe) => recipe.id === gear.recipeId)) return gear.recipeId;
  const name = typeof gear.name === "string" ? gear.name : "";
  const matched = GEAR_CRAFT_RECIPES.find((recipe) => recipe.name === name);
  return matched?.id || "";
}

function isProductionGearCandidate(gear) {
  if (!gear || typeof gear !== "object") return false;
  if (gear.source === "crafted") return true;
  return !!craftedGearRecipeIdFor(gear);
}

function hasNonGearNamePart(name) {
  return typeof name === "string" && NON_GEAR_NAME_PARTS.some((part) => name.includes(part));
}

function normalizeGearWishlist(list) {
  const recipeIds = new Set(GEAR_CRAFT_RECIPES.map((recipe) => recipe.id));
  const seen = new Set();
  return Array.isArray(list)
    ? list.filter((id) => {
      if (!recipeIds.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    : [];
}

function normalizeGearInstance(gear) {
  if (!gear || typeof gear !== "object") return null;
  if (!isProductionGearCandidate(gear) || hasNonGearNamePart(gear.name)) return null;
  const slot = GEAR_SLOT_DATA[gear.slot] ? gear.slot : "";
  if (!slot) return null;
  const recipeId = craftedGearRecipeIdFor(gear);
  const level = Math.min(MAX_LEVEL, Math.max(1, safeNumber(gear.level, 1, 1)));
  const classId = gear.classId && CLASS_DATA[gear.classId] ? gear.classId : "";
  const setId = GEAR_SET_DATA[gear.setId] ? gear.setId : (GEAR_SET_DATA[GEAR_CRAFT_RECIPES.find((recipe) => recipe.id === recipeId)?.setId] ? GEAR_CRAFT_RECIPES.find((recipe) => recipe.id === recipeId).setId : "");
  const stats = Array.isArray(gear.stats)
    ? gear.stats.filter((entry) => STAT_KEYS.includes(entry?.key)).slice(0, 2).map((entry) => ({ key: entry.key, value: safeNumber(entry.value, 1, 1) }))
    : [];
  if (stats.length < 2) return null;
  const combat = normalizeGearCombatEntries(gear.combat);
  if (!combat.length) combat.push({ key: "powerAmp", value: 1 });
  return {
    id: typeof gear.id === "string" && gear.id ? gear.id : cryptoRandomId(),
    name: typeof gear.name === "string" && gear.name ? gear.name : gearName({ slot, level, classId }),
    slot,
    level,
    classId,
    setId,
    stats,
    combat: combat.length === 1 ? combat[0] : combat,
    source: "crafted",
    recipeId,
  };
}

function normalizeGearCombatEntries(combat) {
  const entries = Array.isArray(combat) ? combat : (combat ? [combat] : []);
  return entries
    .filter((entry) => GEAR_COMBAT_STAT_DATA[entry?.key])
    .map((entry) => ({
      key: entry.key,
      value: safeNumber(entry.value, 1, 1),
    }))
    .slice(0, 4);
}

function normalizeChipInstance(chip) {
  if (!chip || typeof chip !== "object") return null;
  const tier = [1, 2, 3].includes(Number(chip.tier)) ? Number(chip.tier) : 1;
  const setId = CHIP_SET_DATA[chip.setId] ? chip.setId : "wolf_pack";
  const abilityStats = Array.isArray(chip.abilityStats)
    ? chip.abilityStats
        .filter((entry) => STAT_KEYS.includes(entry?.key))
        .slice(0, 2)
        .map((entry) => ({ key: entry.key, value: safeNumber(entry.value, 1, 1) }))
    : [];
  if (abilityStats.length < 2) return null;
  const combat = CHIP_COMBAT_STAT_DATA[chip.combat?.key]
    ? { key: chip.combat.key, value: safeNumber(chip.combat.value, 1, 1) }
    : { key: "critRate", value: 1 };
  return {
    id: typeof chip.id === "string" && chip.id ? chip.id : cryptoRandomId(),
    name: typeof chip.name === "string" && chip.name ? chip.name : chipName({ ...chip, tier, setId, abilityStats }),
    tier,
    setId,
    level: Math.min(CHIP_TIER_DATA[tier].maxLevel, safeNumber(chip.level, 1, 1)),
    abilityStats,
    combat,
  };
}

function normalizeInventory(inventory) {
  if (!inventory || typeof inventory !== "object") return {};
  if (Array.isArray(inventory)) {
    return inventory.reduce((items, entry) => {
      if (typeof entry === "string" && ITEM_DATA[entry]) items[entry] = (items[entry] || 0) + 1;
      else if (entry?.id && ITEM_DATA[entry.id]) items[entry.id] = (items[entry.id] || 0) + safeNumber(entry.count, 1, 1);
      return items;
    }, {});
  }
  return Object.entries(inventory).reduce((items, [id, count]) => {
    if (ITEM_DATA[id]) items[id] = safeNumber(count, 0, 0);
    return items;
  }, {});
}

function addInventoryItems(items) {
  state.inventory = normalizeInventory(state.inventory);
  for (const item of items || []) {
    if (!ITEM_DATA[item.id]) continue;
    const count = safeNumber(item.count, 0, 0);
    if (count <= 0) continue;
    markItemSeen(item.id);
    state.inventory[item.id] = (state.inventory[item.id] || 0) + count;
    addItemLog(item.id, count);
  }
}

function addGearItems(items) {
  state.gear = normalizeGearInventory(state.gear);
  const added = [];
  for (const item of items || []) {
    const gear = normalizeGearInstance(item);
    if (!gear) continue;
    state.gear.push(gear);
    added.push(gear);
    state.itemLogArchive = [
      { text: `取得 ${gear.name}。`, kind: "gold" },
      ...(Array.isArray(state.itemLogArchive) ? state.itemLogArchive : []),
    ].slice(0, 200);
  }
  return added;
}

function gearName(gear) {
  const slotData = GEAR_SLOT_DATA[gear.slot] || GEAR_SLOT_DATA.weapon;
  const prefix = randomOf(GEAR_NAME_PREFIXES);
  const suffix = randomOf(GEAR_NAME_SUFFIXES);
  const classTerm = gear.classId ? CLASS_GEAR_TERMS[gear.classId] || CLASS_DATA[gear.classId]?.name || "" : "";
  const noun = randomOf(slotData.nouns);
  return [prefix, classTerm, noun, suffix].filter(Boolean).join("");
}

function addItemLog(id, count) {
  const data = ITEM_DATA[id];
  if (!data) return;
  const kind = itemLogKind(id);
  state.itemLogArchive = [
    { text: `取得 ${data.name} x${count}。`, kind },
    ...(Array.isArray(state.itemLogArchive) ? state.itemLogArchive : []),
  ].slice(0, 200);
}

function itemLogKind(id) {
  const rarity = itemLabelRarity({ id, value: itemValue(id) });
  if (rarity.id === "legendary" || rarity.id === "rare") return "gold";
  if (ITEM_DATA[id]?.type === "medicine") return "good";
  return "";
}

function normalizeInventoryOrder(order, inventory) {
  const normalizedInventory = normalizeInventory(inventory);
  const seen = new Set();
  const result = [];
  if (Array.isArray(order)) {
    order.forEach((id) => {
      if (ITEM_DATA[id] && normalizedInventory[id] > 0 && !seen.has(id)) {
        seen.add(id);
        result.push(id);
      }
    });
  }
  Object.keys(normalizedInventory).forEach((id) => {
    if (normalizedInventory[id] > 0 && !seen.has(id)) result.push(id);
  });
  return result;
}

function markItemSeen(id) {
  if (!ITEM_DATA[id]) return;
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  if (!state.inventoryOrder.includes(id)) state.inventoryOrder.push(id);
}

function itemName(id) {
  return ITEM_DATA[id]?.name || id;
}

function itemValue(id) {
  return ITEM_VALUES[id] || 1;
}

function craftCostMoneyValue(cost) {
  if (!cost) return 0;
  if (cost.resource) return (RESOURCE_EXCHANGE_VALUES[cost.resource] || 0) * safeNumber(cost.count, 0, 0);
  return itemValue(cost.id) * safeNumber(cost.count, 0, 0);
}

function gearRecipeFor(gear) {
  const recipeId = craftedGearRecipeIdFor(gear);
  return GEAR_CRAFT_RECIPES.find((recipe) => recipe.id === recipeId) || null;
}

function gearSellValue(gear) {
  const recipe = gearRecipeFor(gear);
  if (recipe) {
    const craftValue = recipe.costs.reduce((sum, cost) => sum + craftCostMoneyValue(cost), 0);
    return Math.max(1, Math.round(craftValue * 0.5));
  }
  return Math.max(20, Math.round(safeNumber(gear?.level, 1, 1) * 45));
}

function chipSellValue(chip) {
  const tier = safeNumber(chip?.tier, 1, 1);
  const level = safeNumber(chip?.level, 1, 1);
  return Math.max(20, Math.round(tier * 80 + level * 18));
}

function itemTypeLabel(id) {
  return {
    region: "區域素材",
    monster: "魔物素材",
  }[ITEM_DATA[id]?.type] || "素材";
}

function inventoryEntries() {
  const inventory = normalizeInventory(state.inventory);
  const order = normalizeInventoryOrder(state.inventoryOrder, inventory);
  return Object.entries(inventory)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ id, count, order: order.indexOf(id), data: ITEM_DATA[id], value: itemValue(id) }));
}

function sortedInventoryEntries() {
  const entries = inventoryEntries();
  const sort = ["order", "type", "value"].includes(state.itemSort) ? state.itemSort : "order";
  return entries.sort((a, b) => {
    if (sort === "type") return itemTypeLabel(a.id).localeCompare(itemTypeLabel(b.id), "zh-Hant") || a.order - b.order;
    if (sort === "value") return b.value - a.value || a.order - b.order;
    return a.order - b.order;
  });
}

function unlockedMarketItems(openLevel = Math.max(1, state.maxClearedLevel + 1)) {
  return Object.entries(ITEM_UNLOCK_LEVEL)
    .filter(([id, level]) => ITEM_DATA[id] && level <= openLevel && ITEM_DATA[id].type !== "chip-core")
    .map(([id]) => ({ id, data: ITEM_DATA[id], value: itemValue(id), buyPrice: itemValue(id) * 3 }));
}

function marketWeight(id) {
  const value = itemValue(id);
  if (value <= 30) return 8;
  if (value <= 100) return 4;
  if (value <= 200) return 2;
  return 1;
}

function marketStockAmount(id) {
  const value = itemValue(id);
  if (value <= 30) return randomAmount(4, 7);
  if (value <= 100) return randomAmount(2, 4);
  if (value <= 200) return randomAmount(1, 3);
  return 1;
}

function normalizeMarketStock(stock, openLevel = Math.max(1, state.maxClearedLevel + 1)) {
  const eligibleIds = new Set(unlockedMarketItems(openLevel).map((entry) => entry.id));
  if (!Array.isArray(stock)) return [];
  return stock.map((item) => {
    if (typeof item === "string") return { id: item, stock: marketStockAmount(item) };
    return {
      id: item?.id,
      stock: safeNumber(item?.stock, 0, 0),
    };
  }).filter((item) => eligibleIds.has(item.id) && item.stock > 0);
}

function normalizeMarketExchange(exchange) {
  const resourceIds = Object.keys(RESOURCE_EXCHANGE_VALUES);
  const from = resourceIds.includes(exchange?.from) ? exchange.from : "money";
  let to = resourceIds.includes(exchange?.to) ? exchange.to : "material";
  if (to === from) to = resourceIds.find((id) => id !== from) || "material";
  return {
    from,
    to,
    amount: safeNumber(exchange?.amount, 60, 1),
  };
}

function ensureMarketStock() {
  const openLevel = Math.max(1, state.maxClearedLevel + 1);
  const eligible = unlockedMarketItems(openLevel);
  const eligibleIds = new Set(eligible.map((entry) => entry.id));
  state.marketStock = normalizeMarketStock(state.marketStock, openLevel);
  if (state.marketStockLevel === openLevel && state.marketStock.length) return;
  const pool = [];
  eligible.forEach((entry) => {
    for (let i = 0; i < marketWeight(entry.id); i += 1) pool.push(entry.id);
  });
  const picked = [];
  while (pool.length && picked.length < Math.min(6, eligible.length)) {
    const index = Math.floor(Math.random() * pool.length);
    const [id] = pool.splice(index, 1);
    if (!picked.includes(id)) picked.push(id);
  }
  state.marketStock = picked.map((id) => ({ id, stock: marketStockAmount(id) }));
  state.marketStockLevel = openLevel;
}

function refreshMarketStock() {
  state.marketStock = [];
  state.marketStockLevel = 0;
  ensureMarketStock();
}

function marketBuyEntries() {
  ensureMarketStock();
  const eligible = new Map(unlockedMarketItems().map((entry) => [entry.id, entry]));
  return state.marketStock.map((item) => {
    const entry = eligible.get(item.id);
    return entry ? { ...entry, stock: item.stock } : null;
  }).filter(Boolean);
}

function normalizeCommissions(commissions) {
  const normalized = {};
  if (commissions && typeof commissions === "object") {
    Object.entries(commissions).forEach(([id, entry]) => {
      const data = normalizeCommissionData(entry?.data || COMMISSION_DATA[id]);
      if (!data) return;
      normalized[id] = normalizeCommissionEntry(id, entry, data);
    });
  }
  return normalized;
}

function normalizeCommissionData(data) {
  if (!data || typeof data !== "object") return null;
  const reward = normalizeCommissionReward(data.reward);
  return {
    name: typeof data.name === "string" && data.name ? data.name : "無名委託",
    summary: typeof data.summary === "string" && data.summary ? data.summary : "完成指定戰鬥。",
    target: safeNumber(data.target, 1, 1),
    minLevel: safeNumber(data.minLevel, 1, 1),
    difficulty: safeNumber(data.difficulty, 1, 1),
    reward,
  };
}

function normalizeCommissionReward(reward) {
  return {
    money: safeNumber(reward?.money, 0, 0),
    material: safeNumber(reward?.material, 0, 0),
    energy: safeNumber(reward?.energy, 0, 0),
    items: Array.isArray(reward?.items)
      ? reward.items.filter((item) => ITEM_DATA[item.id]).map((item) => ({ id: item.id, count: safeNumber(item.count, 1, 1) }))
      : [],
    chips: Array.isArray(reward?.chips)
      ? normalizeChipInventory(reward.chips)
      : [],
  };
}

function normalizeCommissionEntry(id, entry, data) {
  const progress = Math.max(0, Math.min(data.target, safeNumber(entry?.progress, 0, 0)));
  return {
    id,
    data,
    accepted: !!entry?.accepted,
    progress,
    completed: !!entry?.completed || progress >= data.target,
    claimed: !!entry?.claimed,
  };
}

function ensureDefaultCommissions() {
  state.commissions = normalizeCommissions(state.commissions);
  Object.entries(COMMISSION_DATA).forEach(([id, rawData]) => {
    if (state.commissions[id]) return;
    const data = normalizeCommissionData(rawData);
    state.commissions[id] = normalizeCommissionEntry(id, { data }, data);
  });
}

function normalizeNewsIndex(index) {
  return safeNumber(index, 0, 0) % TIANYA_NEWS_DATA.length;
}

function normalizeNewsQueue(queue) {
  if (!Array.isArray(queue)) return [];
  const validIds = new Set(TIANYA_NEWS_DATA.map((item) => item.id));
  return queue.filter((id) => validIds.has(id)).slice(0, 12);
}

function createFortuneState(round = 0) {
  return { round, drawn: false, result: null };
}

function normalizeFortune(fortune) {
  const result = normalizeFortuneResult(fortune?.result);
  return {
    round: safeNumber(fortune?.round, 0, 0),
    drawn: !!fortune?.drawn && !!result,
    result,
  };
}

function normalizeFortuneResult(result) {
  if (!result || typeof result !== "object") return null;
  const reading = fortuneReadingById(result.readingId);
  const resource = RESOURCE_DATA[result.resource] ? result.resource : "";
  const amount = safeNumber(result.amount, 0, 0);
  if (!reading || !resource || amount <= 0) return null;
  return { readingId: reading.id, resource, amount };
}

function fortuneReadingById(id) {
  return FORTUNE_READINGS.find((item) => item.id === id) || null;
}

function currentFortune() {
  state.fortune = normalizeFortune(state.fortune);
  return state.fortune;
}

function refreshFortune() {
  const current = normalizeFortune(state.fortune);
  state.fortune = createFortuneState(current.round + 1);
}

function drawFortune() {
  const fortune = currentFortune();
  if (fortune.drawn) return;
  const reading = randomOf(FORTUNE_READINGS);
  const reward = randomOf(FORTUNE_RESOURCE_REWARDS);
  const amount = randomAmount(reward.min, reward.max);
  addResource(reward.resource, amount);
  state.fortune = {
    round: fortune.round,
    drawn: true,
    result: { readingId: reading.id, resource: reward.resource, amount },
  };
  saveGame();
  render();
}

function fortuneRewardText(result) {
  if (!result) return "本輪可刮";
  const resource = RESOURCE_DATA[result.resource];
  return `${resource.name} +${result.amount}`;
}

function fortuneScratchButton() {
  const fortune = currentFortune();
  const result = fortune.result;
  const reading = result ? fortuneReadingById(result.readingId) : null;
  const title = reading
    ? `<span class="fortune-reading">${reading.title}</span><span class="fortune-separator">｜</span><span class="fortune-reward resource-${RESOURCE_DATA[result.resource].tone}">${fortuneRewardText(result)}</span>`
    : "運勢刮刮樂";
  const body = reading ? reading.text : "刮開今日籤運";
  return `
    <button class="tianya-fortune-card ${fortune.drawn ? "revealed" : ""}" data-draw-fortune ${fortune.drawn ? "disabled" : ""}>
      <span>${fortune.drawn ? "已解籤" : "可刮一次"}</span>
      <b>${title}</b>
      <i>${body}</i>
    </button>
  `;
}

function newsById(id) {
  return TIANYA_NEWS_DATA.find((item) => item.id === id) || TIANYA_NEWS_DATA[0];
}

function currentTianyaNews() {
  return TIANYA_NEWS_DATA[normalizeNewsIndex(state.newsIndex)];
}

function queueTianyaNews(id) {
  if (!TIANYA_NEWS_DATA.some((item) => item.id === id) || state.newsQueue.includes(id)) return;
  state.newsQueue.push(id);
}

function rotateTianyaNews(context = {}) {
  if (!TIANYA_NEWS_DATA.length) return;
  queueStoryNews(context);
  if (state.newsQueue.length) {
    const id = state.newsQueue.shift();
    const index = TIANYA_NEWS_DATA.findIndex((item) => item.id === id);
    if (index >= 0) state.newsIndex = index;
    return;
  }
  state.newsIndex = (normalizeNewsIndex(state.newsIndex) + 1) % TIANYA_NEWS_DATA.length;
}

function queueStoryNews(context) {
  if (context.victory && context.level === 5 && !context.alreadyCleared) {
    queueTianyaNews("special_wolf_blueprint");
  }
}

function tianyaNewsArchive() {
  const current = currentTianyaNews();
  const normal = TIANYA_NEWS_DATA.filter((item) => item.id !== current.id && item.type !== "特報").slice(0, 4);
  return [current, ...normal].slice(0, 5);
}

function validView(view) {
  const allowed = ["town", "camp", "tactics", "tavern", "workshop", "workshopUpgrade", "workshopChip", "notice", "map", "gather", "expedition", "market", "items"];
  return allowed.includes(view) ? view : "town";
}

function safeNumber(value, fallback, min = -Infinity) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.floor(number));
}

function compactWanNumber(value) {
  const number = safeNumber(value, 0, 0);
  if (number >= 10000) return `${Math.floor(number / 10000)}萬`;
  return String(number);
}

function resetSavedGame() {
  if (!confirm("確定要重置 v009 測試資料？")) return;
  if (state.battleTimer) clearInterval(state.battleTimer);
  if (state.autoRepeatTimer) clearTimeout(state.autoRepeatTimer);
  state.battleTimer = null;
  state.autoRepeatTimer = null;
  state.pendingSkillOrderTutorial = null;
  state.pendingWolfWorkshopTutorial = null;
  localStorage.removeItem(SAVE_KEY);
  state.recruits = [];
  state.candidates = [];
  state.party = [null, null, null, null];
  seedNewGame();
  saveGame();
  render();
  updateTopbar();
}

function createCharacter(classId, rarityId = null, usedNames = null, options = {}) {
  const cls = CLASS_DATA[classId];
  const stats = fixedStatsForClassLevel(classId, 1);
  const gender = normalizeGender(options.gender);
  const name = sanitizeCreatorName(options.name) || randomName(cls, usedNames, gender);
  const character = {
    id: cryptoRandomId(),
    name,
    gender,
    classId,
    rarity: "white",
    tier: 1,
    level: 1,
    exp: 0,
    stats,
    equippedActive: [],
    equippedPassive: null,
    equipment: normalizeEquipment(),
    meridians: normalizeMeridians(),
    front: true,
    recruitCost: V009_RECRUIT_COST,
  };
  if (options.portraitPath) {
    character.portraitPath = options.portraitPath;
    character.portraitAssetId = `${classId}_${gender}_${String(options.portraitPath).split("/").pop()?.replace(/\.png$/, "") || "creator"}`;
    character.portraitFaction = classId;
    character.portraitVariant = gender;
  } else {
    ensureMemberPortrait(character);
  }
  if (usedNames) addUsedName(usedNames, name);
  autoEquip(character);
  return character;
}

function cryptoRandomId() {
  return "c" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function rollRarity() {
  return "white";
}

function allocateStats(total, cls) {
  const stats = Object.fromEntries(STAT_KEYS.map((k) => [k, 1]));
  let remaining = total - STAT_KEYS.length;
  while (remaining > 0) {
    const bucket = Math.random();
    const key = bucket < 0.68
      ? randomOf(cls.main)
      : bucket < 0.9
        ? randomOf(cls.secondary)
        : randomOf(STAT_KEYS);
    stats[key] += 1;
    remaining -= 1;
  }
  return stats;
}

function statRoleBucketsForClass(classId) {
  const cls = CLASS_DATA[classId] || CLASS_DATA.xinhuo;
  const main = (cls.main || []).filter((key) => STAT_KEYS.includes(key)).slice(0, 2);
  const secondary = (cls.secondary || []).filter((key) => STAT_KEYS.includes(key) && !main.includes(key)).slice(0, 2);
  for (const key of STAT_KEYS) {
    if (main.length < 2 && !main.includes(key)) main.push(key);
    if (main.length >= 2 && secondary.length < 2 && !main.includes(key) && !secondary.includes(key)) secondary.push(key);
  }
  const rest = STAT_KEYS.filter((key) => !main.includes(key) && !secondary.includes(key));
  return { main, secondary, rest };
}

function fixedBaseStatsForClass(classId) {
  const { main, secondary, rest } = statRoleBucketsForClass(classId);
  const stats = Object.fromEntries(STAT_KEYS.map((key) => [key, 4]));
  main.forEach((key) => { stats[key] = 8; });
  secondary.forEach((key) => { stats[key] = 5; });
  rest.forEach((key) => { stats[key] = 4; });
  return stats;
}

function fixedGrowthForLevel(classId, level) {
  const current = Math.min(MAX_LEVEL, Math.max(2, safeNumber(level, 2, 2)));
  const { main, secondary, rest } = statRoleBucketsForClass(classId);
  const support = [secondary[0], secondary[1], rest[0]].filter(Boolean);
  const stats = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  const add = (key) => {
    if (STAT_KEYS.includes(key)) stats[key] += 1;
  };
  main.forEach(add);
  const cycle = (current - 2) % 4;
  if (cycle === 0 || cycle === 3) {
    add(secondary[0]);
    add(secondary[1]);
  } else if (cycle === 1) {
    add(secondary[0]);
    add(rest[0]);
  } else {
    add(secondary[1]);
    add(rest[0]);
  }
  const points = v009LevelGrowthPoints(current);
  if (points >= 5) add(main[(current - 2) % main.length]);
  if (points >= 6) add(main[(current - 1) % main.length]);
  for (let total = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0); total < points; total += 1) {
    add(support[(current + total) % support.length] || main[total % main.length]);
  }
  return stats;
}

function fixedStatsForClassLevel(classId, level) {
  const current = Math.min(MAX_LEVEL, Math.max(1, safeNumber(level, 1, 1)));
  const stats = fixedBaseStatsForClass(classId);
  for (let next = 2; next <= current; next += 1) {
    const growth = fixedGrowthForLevel(classId, next);
    STAT_KEYS.forEach((key) => { stats[key] += growth[key] || 0; });
  }
  return normalizeStats(stats);
}

function randomName(cls, usedNames = null, gender = normalizeGender()) {
  const used = usedNames || usedNameParts();
  const givenA = gender === "female" ? GIVEN_FEMALE_A : GIVEN_MALE_A;
  const givenB = gender === "female" ? GIVEN_FEMALE_B : GIVEN_MALE_B;
  let fallback = "";
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const surname = randomOf(cls.surnames);
    const given = randomOf(givenA) + randomOf(givenB);
    const name = surname + given;
    if (!fallback) fallback = name;
    if (!used.full.has(name) && !used.given.has(given)) return name;
  }
  return fallback || randomOf(cls.surnames) + randomOf(givenA) + randomOf(givenB);
}

function needsCharacterCreation() {
  return [INTRO_STAGE_OPENING, INTRO_STAGE_CREATOR].includes(state.introStage) && (!state.creatorCompleted || !partyMembers().length);
}

function shouldRunIntroDialogue() {
  return state.introStage === INTRO_STAGE_OPENING || state.introStage === INTRO_STAGE_AFTER_CREATOR || state.introStage === INTRO_STAGE_MAIN || !!state.eventDialog;
}

function ensureIntroDialogueState() {
  if (state.eventDialog || state.introStage === INTRO_STAGE_CREATOR || state.introStage === INTRO_STAGE_DONE) return;
  if (state.introStage === INTRO_STAGE_OPENING) {
    startEventDialogue("intro_pre_creator");
    return;
  }
  if (state.introStage === INTRO_STAGE_AFTER_CREATOR) {
    startEventDialogue("intro_post_creator");
    return;
  }
  if (state.introStage === INTRO_STAGE_MAIN) {
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "regions";
    startEventDialogue("intro_main_tutorial");
  }
}

function startEventDialogue(sequenceId) {
  const sequence = EVENT_DIALOGUE_SEQUENCES[sequenceId];
  if (!sequence?.lines?.length) return;
  clearEventDialogueTimer();
  state.eventDialog = {
    sequenceId,
    lineIndex: 0,
    visibleChars: 0,
  };
}

function currentEventDialogueSequence() {
  return EVENT_DIALOGUE_SEQUENCES[state.eventDialog?.sequenceId] || null;
}

function eventDialogueLineAvailable(line) {
  if (!line?.condition) return true;
  const context = eventDialogueTokenContext();
  if (line.condition.startsWith("playerClass:")) return context.classId === line.condition.slice("playerClass:".length);
  if (line.condition.startsWith("notPlayerClass:")) return context.classId !== line.condition.slice("notPlayerClass:".length);
  return true;
}

function nextAvailableEventDialogueIndex(sequence, startIndex) {
  if (!sequence?.lines?.length) return -1;
  let index = Math.max(0, startIndex || 0);
  while (index < sequence.lines.length && !eventDialogueLineAvailable(sequence.lines[index])) {
    index += 1;
  }
  return index < sequence.lines.length ? index : -1;
}

function currentEventDialogueLine() {
  const sequence = currentEventDialogueSequence();
  if (!sequence || !state.eventDialog) return null;
  const index = nextAvailableEventDialogueIndex(sequence, state.eventDialog.lineIndex || 0);
  if (index < 0) return null;
  if (index !== state.eventDialog.lineIndex) {
    state.eventDialog.lineIndex = index;
    state.eventDialog.visibleChars = 0;
  }
  return sequence.lines[index] || null;
}

function resolveEventDialogueText(line) {
  const context = eventDialogueTokenContext();
  return String(line?.text || "")
    .replaceAll("{className}", context.className)
    .replaceAll("{playerName}", context.playerName)
    .replaceAll("{postCreatorClassLine}", context.postCreatorClassLine);
}

function eventDialogueTokenContext() {
  const member = playerCombatMember() || state.recruits[0] || null;
  const classId = member?.classId || creatorDraft().classId || "";
  const className = classId ? CLASS_DATA[classId]?.name || "" : "";
  const playerName = member?.name || creatorDraft().name || "";
  const postCreatorClassLine = INTRO_POST_CREATOR_CLASS_LINES[classId] || "數據綁定成功，登陸完成了！";
  return { classId, className, playerName, postCreatorClassLine };
}

function eventDialogueVisibleText() {
  const line = currentEventDialogueLine();
  if (!line) return "";
  return Array.from(resolveEventDialogueText(line)).slice(0, state.eventDialog?.visibleChars || 0).join("");
}

function eventDialogueVisibleHtml() {
  const context = eventDialogueTokenContext();
  let html = escapeHtml(eventDialogueVisibleText());
  [context.className, context.playerName]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach((token) => {
      html = html.replace(new RegExp(escapeRegExp(escapeHtml(token)), "g"), `<b class="event-dialogue-token">${escapeHtml(token)}</b>`);
    });
  return html;
}

function eventDialogueCurrentTextLength() {
  const line = currentEventDialogueLine();
  return line ? Array.from(resolveEventDialogueText(line)).length : 0;
}

function eventDialogueSpeaker(line = currentEventDialogueLine()) {
  return EVENT_SPEAKERS[line?.speaker] || { name: "？？？", avatar: "？", role: "" };
}

function eventDialogueSpeakerPortrait(speaker) {
  if (speaker?.image) return `<img src="${escapeHtml(v009ProjectAssetUrl(speaker.image))}" alt="">`;
  return escapeHtml(speaker?.avatar || "？");
}

function eventDialogueCompleteAction(action) {
  clearEventDialogueTimer();
  state.eventDialog = null;
  if (action === "openCreator") {
    state.introStage = INTRO_STAGE_CREATOR;
  } else if (action === "openMainIntro") {
    state.introStage = INTRO_STAGE_MAIN;
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "regions";
  } else if (action === "startFirstMapTutorial") {
    state.introStage = INTRO_STAGE_DONE;
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "regions";
    state.tutorials.firstTownPlaces = true;
    state.tutorials.firstMapRouteStep = "map";
  } else if (action === "startWolfWorkshopIntroTutorial") {
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "stages";
    state.pendingWolfWorkshopTutorial = { step: "introWorkshop" };
  } else if (action === "startWolfWorkshopCraftTutorial") {
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "stages";
    state.pendingWolfWorkshopTutorial = { step: "openWorkshop" };
  } else if (action === "startBodyManagementTutorial") {
    state.bodySystemUnlocked = true;
    ensureBodyManagementState();
    state.view = "town";
    state.homePrimaryMenu = "upgrade";
    state.homeSecondaryMenu = "body";
    state.bodyUpgradeMode = "meridian";
    state.pendingBodyManagementTutorial = { step: "switchTab" };
  } else if (action === "resumeBodyManagementTutorialAfterSelect") {
    state.view = "town";
    state.homePrimaryMenu = "upgrade";
    state.homeSecondaryMenu = "body";
    state.pendingBodyManagementTutorial = { step: "originalBody" };
  } else if (action === "enterMain") {
    state.introStage = INTRO_STAGE_DONE;
  }
  saveGame();
  render();
}

function advanceEventDialogue() {
  if (!state.eventDialog) return;
  const sequence = currentEventDialogueSequence();
  const line = currentEventDialogueLine();
  if (!sequence || !line) {
    eventDialogueCompleteAction(sequence?.onComplete || "enterMain");
    return;
  }
  const textLength = eventDialogueCurrentTextLength();
  if ((state.eventDialog.visibleChars || 0) < textLength) {
    state.eventDialog.visibleChars = textLength;
    clearEventDialogueTimer();
    updateEventDialogueTextNode();
    return;
  }
  const nextIndex = nextAvailableEventDialogueIndex(sequence, (state.eventDialog.lineIndex || 0) + 1);
  if (nextIndex < 0) {
    eventDialogueCompleteAction(sequence.onComplete || "enterMain");
    return;
  }
  state.eventDialog.lineIndex = nextIndex;
  state.eventDialog.visibleChars = 0;
  saveGame();
  render();
}

function clearEventDialogueTimer() {
  if (eventDialogTypingTimer) {
    clearTimeout(eventDialogTypingTimer);
    eventDialogTypingTimer = null;
  }
}

function scheduleEventDialogueTyping() {
  clearEventDialogueTimer();
  if (!state.eventDialog) return;
  const textLength = eventDialogueCurrentTextLength();
  if ((state.eventDialog.visibleChars || 0) >= textLength) return;
  eventDialogTypingTimer = setTimeout(() => {
    if (!state.eventDialog) return;
    state.eventDialog.visibleChars = Math.min(textLength, (state.eventDialog.visibleChars || 0) + EVENT_DIALOGUE_CHAR_STEP);
    updateEventDialogueTextNode();
    scheduleEventDialogueTyping();
  }, EVENT_DIALOGUE_CHAR_MS);
}

function updateEventDialogueTextNode() {
  const textNode = document.querySelector("[data-event-dialogue-text]");
  if (textNode) textNode.innerHTML = eventDialogueVisibleHtml();
  const hintNode = document.querySelector("[data-event-dialogue-hint]");
  if (hintNode) {
    const finished = (state.eventDialog?.visibleChars || 0) >= eventDialogueCurrentTextLength();
    hintNode.textContent = finished ? "點擊繼續" : "點擊顯示全文";
  }
}

function defaultCreatorDraft() {
  const classId = randomOf(Object.keys(CLASS_DATA));
  const gender = Math.random() < 0.5 ? "male" : "female";
  const portraitPool = creatorPortraitPool(classId, gender);
  return {
    classId,
    gender,
    portraitIndex: portraitPool.length ? Math.floor(Math.random() * portraitPool.length) : 0,
    name: randomName(CLASS_DATA[classId], usedNameParts(), gender),
    stats: creatorStatsForClass(classId),
  };
}

function normalizeCreatorDraft(draft) {
  const classId = CLASS_DATA[draft?.classId] ? draft.classId : "xinhuo";
  const gender = GENDERS[draft?.gender] ? draft.gender : "male";
  const portraitPool = creatorPortraitPool(classId, gender);
  const portraitIndex = Math.max(0, Math.min(Math.max(0, portraitPool.length - 1), safeNumber(draft?.portraitIndex, 0, 0)));
  const hasName = Object.prototype.hasOwnProperty.call(draft || {}, "name");
  return {
    classId,
    gender,
    portraitIndex,
    name: hasName ? sanitizeCreatorName(draft?.name) : randomName(CLASS_DATA[classId], usedNameParts(), gender),
    stats: creatorStatsForClass(classId),
  };
}

function creatorDraft() {
  state.creatorDraft = normalizeCreatorDraft(state.creatorDraft || defaultCreatorDraft());
  return state.creatorDraft;
}

function creatorStatsForClass(classId) {
  return fixedStatsForClassLevel(classId, 1);
}

function creatorPortraitPool(classId, gender) {
  const normalizedGender = normalizeGender(gender);
  const catalogPool = (PORTRAIT_CATALOG.portraitsByClass?.[classId]?.[normalizedGender] || [])
    .filter((path) => !isRejectedPortraitPath(path) && !isLegacyCutePortraitPath(path));
  if (catalogPool.length) return uniquePortraitPaths(catalogPool);
  const fallback = V008_CUTE_PORTRAIT_BY_CLASS_AND_GENDER[classId]?.[normalizedGender] || "";
  return uniquePortraitPaths([fallback].filter(Boolean));
}

function uniquePortraitPaths(paths) {
  const seen = new Set();
  return paths.filter((path) => {
    const key = String(path)
      .replace(/_right(?=\.png$)/, "")
      .replace(/_mirrored(?=\.png$)/, "")
      .replace(/_mirror(?=\.png$)/, "")
      .replace(/\\/g, "/")
      .toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function creatorPortraitPath(draft = creatorDraft()) {
  const pool = creatorPortraitPool(draft.classId, draft.gender);
  return pool[draft.portraitIndex % Math.max(1, pool.length)] || randomPortraitPath(draft.classId, draft.gender);
}

function sanitizeCreatorName(value) {
  return Array.from(String(value || "").trim()).filter((char) => /[\u4e00-\u9fffA-Za-z]/.test(char)).slice(0, 6).join("");
}

function creatorNameIsValid(value) {
  return /^[\u4e00-\u9fffA-Za-z]{1,6}$/.test(String(value || "").trim());
}

function updateCreatorDraft(patch = {}) {
  const draft = creatorDraft();
  const next = { ...draft, ...patch };
  if (patch.classId && patch.classId !== draft.classId) {
    next.stats = creatorStatsForClass(patch.classId);
    next.portraitIndex = 0;
    next.name = randomName(CLASS_DATA[patch.classId], usedNameParts(), next.gender);
  }
  if (patch.gender && patch.gender !== draft.gender) {
    next.portraitIndex = 0;
    next.name = randomName(CLASS_DATA[next.classId], usedNameParts(), patch.gender);
  }
  state.creatorDraft = normalizeCreatorDraft(next);
}

function randomizeCreatorDraft() {
  const now = Date.now();
  if (now - (state.creatorRandomAt || 0) < 1000) return false;
  state.creatorRandomAt = now;
  const classId = randomOf(Object.keys(CLASS_DATA));
  const gender = Math.random() < 0.5 ? "male" : "female";
  const pool = creatorPortraitPool(classId, gender);
  state.creatorDraft = normalizeCreatorDraft({
    classId,
    gender,
    portraitIndex: pool.length ? Math.floor(Math.random() * pool.length) : 0,
    name: randomName(CLASS_DATA[classId], usedNameParts(), gender),
    stats: creatorStatsForClass(classId),
  });
  return true;
}

function completeCreator() {
  const draft = creatorDraft();
  const name = sanitizeCreatorName(draft.name);
  if (!creatorNameIsValid(name)) {
    alert("姓名需為 1 到 6 個中英文字。");
    return;
  }
  const member = createCharacter(draft.classId, "white", usedNameParts(), {
    gender: draft.gender,
    name,
    stats: draft.stats,
    portraitPath: creatorPortraitPath(draft),
  });
  member.bodySlotIndex = 0;
  member.bodyKind = "original";
  member.bodyOriginal = true;
  state.recruits = [member];
  state.party = [member.id, null, null, null];
  state.selectedMemberId = member.id;
  state.creatorCompleted = true;
  state.creatorDraft = null;
  state.candidates = [];
  state.introStage = INTRO_STAGE_AFTER_CREATOR;
  state.eventDialog = null;
  saveGame();
  render();
}

function usedNameParts() {
  const used = { full: new Set(), given: new Set() };
  [
    ...(state?.recruits || []),
    ...(state?.candidates || []),
    ...(state?.townTalkers || []),
    ...fixedTownNpcNames().map((name) => ({ name })),
  ].forEach((item) => {
    if (item?.name) addUsedName(used, item.name);
  });
  return used;
}

function addUsedName(used, name) {
  used.full.add(name);
  if (name.length >= 2) used.given.add(name.slice(1));
}

function fixedTownNpcNames() {
  return ["羅知微", "溫素策", "何映川", "梁阿照", "馬青舟", "辛守安", "周定陵", "柳承枝", "陸聞白", "程既安", "任折砂"];
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function getRarity(id) {
  return RARITIES.find((r) => r.id === id);
}

function getMember(id) {
  return state.recruits.find((m) => m.id === id);
}

function knownSkills(member, type = null) {
  const all = visibleSkillsForMember(member);
  return type ? all.filter((s) => s.type === type) : all;
}

function visibleSkillsForMember(member) {
  if (!member || !CLASS_DATA[member.classId]) return [];
  const level = safeNumber(member.level, 1, 1);
  const unlocked = CLASS_DATA[member.classId].skills.filter((skillData) => skillData.level <= level);
  const unlockedIds = new Set(unlocked.map((skillData) => skillData.id));
  const replacedIds = new Set();
  for (const [upperId, lowerIds] of Object.entries(SKILL_UPGRADES)) {
    if (!unlockedIds.has(upperId)) continue;
    lowerIds.forEach((lowerId) => replacedIds.add(lowerId));
  }
  return unlocked
    .filter((skillData) => !replacedIds.has(skillData.id))
    .sort((a, b) => a.level - b.level || CLASS_DATA[member.classId].skills.indexOf(a) - CLASS_DATA[member.classId].skills.indexOf(b));
}

function upgradedSkillIdForMember(member, skillId) {
  if (!member || !skillId || !CLASS_DATA[member.classId]) return skillId;
  skillId = LEGACY_SKILL_ID_MAP[skillId] || skillId;
  const level = safeNumber(member.level, 1, 1);
  const unlockedIds = new Set(CLASS_DATA[member.classId].skills
    .filter((skillData) => skillData.level <= level)
    .map((skillData) => skillData.id));
  for (const [upperId, lowerIds] of Object.entries(SKILL_UPGRADES)) {
    if (unlockedIds.has(upperId) && lowerIds.includes(skillId)) return upperId;
  }
  return skillId;
}

function autoEquip(member) {
  const actives = knownSkills(member, "active").slice(0, ACTIVE_SKILL_SLOT_COUNT).map((s) => s.id);
  member.equippedActive = actives;
  const passiveSkill = knownSkills(member, "passive")[0];
  member.equippedPassive = passiveSkill ? passiveSkill.id : null;
}

function generateCandidates() {
  const classIds = Object.keys(CLASS_DATA);
  const used = usedNameParts();
  state.candidates = Array.from({ length: RECRUIT_CANDIDATE_COUNT }, (_, index) => {
    const current = state.candidates[index];
    if (current?.locked) {
      addUsedName(used, current.name);
      return current;
    }
    return createCharacter(randomOf(classIds), null, used);
  });
}

function currentRecruitRefreshHourKey() {
  return Math.floor(Date.now() / 3600000);
}

function nextRecruitRefreshText() {
  const next = (currentRecruitRefreshHourKey() + 1) * 3600000;
  return new Date(next).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function updateRecruitRefreshByClock() {
  const key = currentRecruitRefreshHourKey();
  if (!state.recruitRefreshHourKey) {
    state.recruitRefreshHourKey = key;
    return;
  }
  if (key <= state.recruitRefreshHourKey) return;
  state.recruitRefreshHourKey = key;
  generateCandidates();
}

function paidRefreshCandidates() {
  if (state.money < RECRUIT_REFRESH_COST) return;
  state.money -= RECRUIT_REFRESH_COST;
  state.recruitRefreshHourKey = currentRecruitRefreshHourKey();
  generateCandidates();
  state.detailCandidateIndex = null;
  state.statDetailCandidateIndex = null;
  saveGame();
  render();
}

function scrollScopeKey() {
  return [
    state.view || "",
    state.homePrimaryMenu || "",
    state.homeSecondaryMenu || "",
    state.overlayView || "",
    state.bodyUpgradeMode || "",
    state.workshopTalkEntry || "",
  ].join("|");
}

function scrollElementSignature(el) {
  const classes = Array.from(el.classList || []).sort().join(".");
  const attrs = [
    el.dataset?.view ? `view=${el.dataset.view}` : "",
    el.dataset?.homePrimary ? `primary=${el.dataset.homePrimary}` : "",
    el.dataset?.homeSecondary ? `secondary=${el.dataset.homeSecondary}` : "",
    el.dataset?.overlayView ? `overlay=${el.dataset.overlayView}` : "",
    el.dataset?.gearCraftSet ? `craftSet=${el.dataset.gearCraftSet}` : "",
    el.dataset?.codexCategoryToggle ? `codex=${el.dataset.codexCategoryToggle}` : "",
  ].filter(Boolean).join("|");
  return `${el.tagName.toLowerCase()}${classes ? `.${classes}` : ""}${attrs ? `[${attrs}]` : ""}`;
}

function viewScrollableElements() {
  const root = document.getElementById("view");
  if (!root) return [];
  return [root, ...root.querySelectorAll("*")].filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1) return false;
    const style = getComputedStyle(el);
    return /\b(auto|scroll|overlay)\b/.test(`${style.overflowY} ${style.overflowX}`);
  });
}

function captureScrollPositions() {
  const elements = viewScrollableElements();
  if (!elements.length) return { scope: renderedScrollScope, positions: [] };
  const counts = new Map();
  const positions = [];
  elements.forEach((el) => {
    const signature = scrollElementSignature(el);
    const index = counts.get(signature) || 0;
    counts.set(signature, index + 1);
    if (el.scrollTop > 0 || el.scrollLeft > 0) {
      positions.push({ key: `${signature}#${index}`, top: el.scrollTop, left: el.scrollLeft });
    }
  });
  return { scope: renderedScrollScope, positions };
}

function restoreScrollPositions(snapshot) {
  if (!snapshot || !snapshot.positions?.length) return;
  if (snapshot.scope !== scrollScopeKey()) return;
  const wanted = new Map(snapshot.positions.map((entry) => [entry.key, entry]));
  const counts = new Map();
  viewScrollableElements().forEach((el) => {
    const signature = scrollElementSignature(el);
    const index = counts.get(signature) || 0;
    counts.set(signature, index + 1);
    const entry = wanted.get(`${signature}#${index}`);
    if (!entry) return;
    el.scrollTop = entry.top;
    el.scrollLeft = entry.left;
  });
}

function render() {
  const scrollSnapshot = captureScrollPositions();
  syncProgressUnlocks();
  updateRecruitRefreshByClock();
  updateTimedTasks();
  scheduleTimedTaskRefresh();
  state.showTitle = false;
  document.getElementById("app").classList.toggle("title-mode", false);
  document.getElementById("app").classList.toggle("home-mode", state.view === "town");
  updateTopbar();
  const view = document.getElementById("view");
  if (state.view !== "town") {
    state.activeTownTalkerId = null;
    state.activePartyTalkMemberId = null;
    state.activePartyTalkText = "";
  }
  if (state.view !== "tavern") state.activeTavernTalkerId = null;
  if (state.view !== "notice") state.activeNewsId = null;
  if (!["camp", "tactics"].includes(state.view)) {
    state.detailMemberId = null;
    state.statDetailMemberId = null;
  }
  if (state.view !== "tavern") state.statDetailCandidateIndex = null;
  if (state.view === "town") view.innerHTML = townConsoleTemplate();
  if (state.view === "camp") view.innerHTML = campTemplate();
  if (state.view === "tactics") view.innerHTML = tacticsTemplate();
  if (state.view === "tavern") view.innerHTML = tavernTemplate();
  if (state.view === "workshop") view.innerHTML = workshopTemplate();
  if (state.view === "workshopUpgrade") view.innerHTML = workshopUpgradeTemplate();
  if (state.view === "workshopChip") view.innerHTML = workshopChipTemplate();
  if (state.view === "market") view.innerHTML = marketTemplate();
  if (state.view === "items") view.innerHTML = itemsTemplate();
  if (state.view === "gather") view.innerHTML = gatherTemplate();
  if (state.view === "expedition") view.innerHTML = expeditionTemplate();
  if (state.view === "notice") view.innerHTML = noticeTemplate();
  if (state.view === "map") view.innerHTML = mapTemplate();
  if (state.view === "battle") view.innerHTML = townConsoleTemplate();
  if (state.overlayView) view.innerHTML += subUiOverlayTemplate();
  if (state.detailMemberId || state.detailCandidateIndex !== null) view.innerHTML += memberDetailModal();
  if (state.statDetailMemberId || state.statDetailCandidateIndex !== null) view.innerHTML += memberStatDetailModal();
  if (state.activeNewsId) view.innerHTML += tianyaNewsModal();
  ensureIntroDialogueState();
  if (needsCharacterCreation()) view.innerHTML += characterCreatorOverlay();
  if (state.bodySelection) view.innerHTML += bodySelectionOverlay();
  if (state.eventDialog) view.innerHTML += eventDialogueOverlay();
  if (state.autoRepeat) view.innerHTML += autoRepeatStatsPanel();
  bindEvents();
  if (!state.battle || state.battle.over) saveGame();
  scheduleEventDialogueTyping();
  requestAnimationFrame(() => {
    restoreScrollPositions(scrollSnapshot);
    renderedScrollScope = scrollScopeKey();
    clampFocusedInventoryPopout();
    showPendingTutorials();
  });
}

function titleTemplate() {
  return `
    <section class="title-screen" data-start-game>
      <div class="title-mark">
        <div class="title-eyebrow">v009 Prototype</div>
        <h1>大荒散記</h1>
        <div class="title-line"></div>
        <p>點擊以開始遊戲</p>
      </div>
      <div class="title-version">${APP_VERSION}</div>
    </section>
  `;
}

function showPendingTutorials() {
  if (state.eventDialog || state.bodySelection || state.introStage !== INTRO_STAGE_DONE || needsCharacterCreation()) return;
  if (document.querySelector(".tutorial-overlay")) return;
  if (showWolfWorkshopTutorial()) return;
  if (showBodyManagementTutorial()) return;
  if (showSkillOrderTutorial()) return;
  if (showFirstMapRouteTutorial()) return;
  if (state.view === "town" && !state.tutorials.firstTownPlaces) {
    showTutorial({
      target: ".town-menu",
      title: "聚落場所",
      body: "底部主操作列是主要行動入口。戰術營帳整備隊伍，工房強化成員，酒肆招募人才，布告亭承接委託，出戰前往戰場。",
      onConfirm: () => {
        state.tutorials.firstTownPlaces = true;
        saveGame();
      },
    });
  }
}

function queueWolfWorkshopIntroAfterBattle(battle, alreadyCleared) {
  if (!battle || state.tutorials.wolfWorkshopIntro || state.pendingWolfWorkshopTutorial) return false;
  if (alreadyCleared || battle.kind !== "boss" || battle.level !== 5) return false;
  if (state.introStage !== INTRO_STAGE_DONE || needsCharacterCreation()) return false;
  state.pendingWolfWorkshopTutorial = null;
  state.view = "town";
  state.homePrimaryMenu = "map";
  state.homeSecondaryMenu = "stages";
  startEventDialogue("wolf_king_workshop_intro");
  return true;
}

function queueBodyManagementIntroAfterBattle(battle, alreadyCleared) {
  if (!battle || state.tutorials.bodyManagementIntro || state.pendingBodyManagementTutorial) return false;
  if (alreadyCleared || battle.kind !== "boss" || battle.level !== 10) return false;
  if (state.introStage !== INTRO_STAGE_DONE || needsCharacterCreation()) return false;
  state.bodySystemUnlocked = true;
  ensureBodyManagementState();
  state.view = "town";
  state.homePrimaryMenu = "upgrade";
  state.homeSecondaryMenu = "body";
  startEventDialogue("body_management_intro");
  return true;
}

function showBodyManagementTutorial() {
  const pending = state.pendingBodyManagementTutorial;
  if (!pending || state.tutorials.bodyManagementIntro || state.view !== "town") return false;
  if (state.homePrimaryMenu !== "upgrade" || state.homeSecondaryMenu !== "body") {
    state.homePrimaryMenu = "upgrade";
    state.homeSecondaryMenu = "body";
    render();
    return true;
  }
  if (pending.step === "switchTab") {
    const target = document.querySelector(`[data-body-upgrade-mode="switch"]`);
    if (!target) return false;
    showClickTutorial({
      target,
      body: "義體管理功能開放",
      onTargetClick: () => {
        state.bodyUpgradeMode = "switch";
        state.pendingBodyManagementTutorial = { step: "blankBody" };
        saveGame();
      },
    });
    return true;
  }
  if (pending.step === "blankBody") {
    state.bodyUpgradeMode = "switch";
    const target = document.querySelector(`[data-body-slot="1"]`);
    if (!target) return false;
    showClickTutorial({
      target,
      body: "點選你的第一具空白義體，選擇一個想體驗的門派吧",
      onTargetClick: () => {
        state.pendingBodyManagementTutorial = { step: "blankBody" };
        saveGame();
      },
    });
    return true;
  }
  if (pending.step === "originalBody") {
    state.bodyUpgradeMode = "switch";
    const target = document.querySelector(`[data-body-slot="0"]`);
    if (!target) return false;
    showAnyClickTutorial({
      target,
      body: "從義體管理介面就能隨時切換回原本的門派，所有義體的等級獨立計算。",
      onAnyClick: () => {
        state.pendingBodyManagementTutorial = { step: "lockedBody" };
        requestAnimationFrame(showPendingTutorials);
      },
    });
    return true;
  }
  if (pending.step === "lockedBody") {
    state.bodyUpgradeMode = "switch";
    const target = document.querySelector(`[data-body-slot="2"]`);
    if (!target) return false;
    showAnyClickTutorial({
      target,
      body: "如果想嘗試更多門派，試著蒐集義體殘片帶給姚衡舟吧。",
      onAnyClick: () => {
        state.tutorials.bodyManagementIntro = true;
        state.pendingBodyManagementTutorial = null;
        saveGame();
      },
    });
    return true;
  }
  state.pendingBodyManagementTutorial = null;
  return false;
}

function showWolfWorkshopTutorial() {
  const pending = state.pendingWolfWorkshopTutorial;
  if (!pending || state.tutorials.wolfWorkshopIntro || state.view !== "town") return false;
  if (pending.step === "introWorkshop") {
    const target = document.querySelector(`[data-home-primary="upgrade"]`);
    if (!target) return false;
    showClickTutorial({
      target,
      body: "點擊工坊，可以進行各種製作與改造",
      onTargetClick: () => {
        state.pendingWolfWorkshopTutorial = null;
        saveGame();
        setTimeout(() => {
          startEventDialogue("wolf_king_workshop_yao");
          saveGame();
          render();
        }, 0);
      },
    });
    return true;
  }
  if (pending.step === "openWorkshop") {
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "stages";
    const target = document.querySelector(`[data-home-primary="upgrade"]`);
    if (!target) return false;
    showClickTutorial({
      target,
      body: "點擊工坊，可以進行各種製作與改造",
      onTargetClick: () => {
        state.pendingWolfWorkshopTutorial = { step: "craftTab" };
        saveGame();
      },
    });
    return true;
  }
  if (pending.step === "craftTab") {
    if (state.homePrimaryMenu !== "upgrade") {
      state.homePrimaryMenu = "upgrade";
      state.homeSecondaryMenu = normalizeHomeSecondaryMenu("upgrade", "");
      render();
      return true;
    }
    const target = document.querySelector(`[data-home-secondary="craft"]`);
    if (!target) return false;
    showClickTutorial({
      target,
      body: "點擊裝備鍛造，查看狼王式裝備藍圖",
      onTargetClick: () => {
        state.pendingWolfWorkshopTutorial = { step: "wolfGear" };
        state.gearCraftSetOpen = state.gearCraftSetOpen && typeof state.gearCraftSetOpen === "object" ? state.gearCraftSetOpen : {};
        state.gearCraftSetOpen.wolf_king = true;
        saveGame();
      },
    });
    return true;
  }
  if (pending.step === "wolfGear") {
    if (state.homePrimaryMenu !== "upgrade" || state.homeSecondaryMenu !== "craft") {
      state.homePrimaryMenu = "upgrade";
      state.homeSecondaryMenu = "craft";
      state.gearCraftSetOpen = state.gearCraftSetOpen && typeof state.gearCraftSetOpen === "object" ? state.gearCraftSetOpen : {};
      state.gearCraftSetOpen.wolf_king = true;
      render();
      return true;
    }
    const target = document.querySelector(`[data-gear-craft-set="wolf_king"]`);
    if (!target) return false;
    showAnyClickTutorial({
      target,
      body: "取得狼王式裝備藍圖",
      onAnyClick: () => {
        state.tutorials.wolfWorkshopIntro = true;
        state.pendingWolfWorkshopTutorial = null;
        saveGame();
      },
    });
    return true;
  }
  state.pendingWolfWorkshopTutorial = null;
  return false;
}

function queueSkillOrderTutorial(member, oldLevel, newLevel, unlockedSkills) {
  if (!member || state.tutorials.firstSkillUnlock || state.pendingSkillOrderTutorial) return;
  if (!(oldLevel < 3 && newLevel >= 3)) return;
  const learnedLevelThreeSkill = (unlockedSkills || []).some((skillData) => skillData && skillData.level === 3);
  if (!learnedLevelThreeSkill) return;
  state.pendingSkillOrderTutorial = { memberId: member.id, step: "log" };
}

function showSkillOrderTutorial() {
  const pending = state.pendingSkillOrderTutorial;
  if (!pending || state.tutorials.firstSkillUnlock || state.view !== "town") return false;
  if (pending.step === "log") {
    const target = document.querySelector(".v009-battle-feed .feed-chip.skill-unlock, .home-feed-preview .feed-chip.skill-unlock, .feed-chip.skill-unlock");
    if (!target) return false;
    showAnyClickTutorial({
      target,
      body: "你學會了新技能",
      onAnyClick: () => {
        state.pendingSkillOrderTutorial = { ...pending, step: "skills" };
        requestAnimationFrame(showPendingTutorials);
      },
    });
    return true;
  }
  if (pending.step === "skills") {
    const target = document.querySelector(".v009-skill-loadout");
    if (!target) return false;
    showAnyClickTutorial({
      target,
      body: "在技能列中調整技能的使用順序吧",
      onAnyClick: () => {
        state.tutorials.firstSkillUnlock = true;
        state.pendingSkillOrderTutorial = null;
        saveGame();
      },
    });
    return true;
  }
  state.pendingSkillOrderTutorial = null;
  return false;
}

function showFirstMapRouteTutorial() {
  const step = state.tutorials.firstMapRouteStep || "";
  if (!step || step === "done" || state.view !== "town") return false;
  const config = {
    map: {
      target: `[data-home-primary="map"]`,
      body: "首先點選「地圖」",
      next: "blackwater",
      beforeShow: () => {
        state.homePrimaryMenu = "map";
        state.homeSecondaryMenu = "regions";
      },
    },
    blackwater: {
      target: `[data-region-id="blackwater"]`,
      body: "接著選擇出行地點，第一站是「黑水砂原」",
      next: "battle",
      beforeShow: () => {
        state.homePrimaryMenu = "map";
        state.homeSecondaryMenu = "regions";
      },
    },
    battle: {
      target: `[data-stage="1"]`,
      body: "再選擇對手，正式展開你的大荒之旅吧",
      next: "done",
      beforeShow: () => {
        state.homePrimaryMenu = "map";
        state.homeSecondaryMenu = "stages";
      },
    },
  }[step];
  if (!config) return false;
  config.beforeShow();
  const target = document.querySelector(config.target);
  if (!target) return false;
  showClickTutorial({
    target,
    body: config.body,
    onTargetClick: () => {
      state.tutorials.firstMapRouteStep = config.next;
      state.tutorials.firstTownPlaces = true;
      saveGame();
    },
  });
  return true;
}

function skipCurrentTutorialSequence() {
  if (state.pendingBodyManagementTutorial) {
    state.pendingBodyManagementTutorial = null;
    state.bodySelection = null;
    state.bodySystemUnlocked = true;
    ensureBodyManagementState();
    state.tutorials.bodyManagementIntro = true;
    state.homePrimaryMenu = "upgrade";
    state.homeSecondaryMenu = "body";
    state.bodyUpgradeMode = "switch";
  } else if (state.pendingWolfWorkshopTutorial) {
    state.pendingWolfWorkshopTutorial = null;
    state.tutorials.wolfWorkshopIntro = true;
    state.gearCraftSetOpen = state.gearCraftSetOpen && typeof state.gearCraftSetOpen === "object" ? state.gearCraftSetOpen : {};
    state.gearCraftSetOpen.wolf_king = true;
    state.homePrimaryMenu = "upgrade";
    state.homeSecondaryMenu = "craft";
  } else if (state.pendingSkillOrderTutorial) {
    state.pendingSkillOrderTutorial = null;
    state.tutorials.firstSkillUnlock = true;
  } else if (state.pendingAutoRepeatTutorial) {
    state.pendingAutoRepeatTutorial = null;
    state.tutorials.autoRepeatIntro = true;
  } else if (state.tutorials.firstMapRouteStep && state.tutorials.firstMapRouteStep !== "done") {
    state.tutorials.firstMapRouteStep = "done";
    state.tutorials.firstTownPlaces = true;
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "stages";
  } else if (!state.tutorials.firstTownPlaces) {
    state.tutorials.firstTownPlaces = true;
  }
  saveGame();
  render();
}

function tutorialSkipButtonHtml() {
  return `<button class="tutorial-skip" data-skip-tutorial>跳過教學</button>`;
}

function bindTutorialSkipButton(overlay, targetEl = null) {
  overlay.querySelector("[data-skip-tutorial]")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (targetEl) targetEl.classList.remove("tutorial-target-active");
    overlay.remove();
    skipCurrentTutorialSequence();
  }, { once: true });
}

function showTutorial({ target, title, body, onConfirm }) {
  const targetEl = typeof target === "string" ? document.querySelector(target) : target;
  if (!targetEl) {
    if (onConfirm) onConfirm();
    return;
  }
  const rect = targetEl.getBoundingClientRect();
  const pad = 8;
  const frame = {
    left: Math.max(8, rect.left - pad),
    top: Math.max(8, rect.top - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  };
  const noteWidth = Math.min(420, window.innerWidth - 28);
  const noteLeft = Math.max(14, (window.innerWidth - noteWidth) / 2);
  const noteTop = Math.max(14, (window.innerHeight - 180) / 2);
  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay";
  overlay.innerHTML = `
    <div class="tutorial-dim"></div>
    <div class="tutorial-frame" style="left:${frame.left}px;top:${frame.top}px;width:${frame.width}px;height:${frame.height}px;"></div>
    <div class="tutorial-note dialogue-bubble system-dialogue" style="left:${noteLeft}px;top:${noteTop}px;width:${noteWidth}px;">
      <b>${title}</b>
      <p>${body}</p>
      <button class="tutorial-confirm">確認</button>
    </div>
    ${tutorialSkipButtonHtml()}
  `;
  document.body.appendChild(overlay);
  bindTutorialSkipButton(overlay);
  overlay.querySelector(".tutorial-confirm").addEventListener("click", () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });
}

function showAnyClickTutorial({ target, body, onAnyClick }) {
  const targetEl = typeof target === "string" ? document.querySelector(target) : target;
  if (!targetEl) {
    if (onAnyClick) onAnyClick();
    return;
  }
  const rect = targetEl.getBoundingClientRect();
  const pad = 8;
  const frame = {
    left: Math.max(8, rect.left - pad),
    top: Math.max(8, rect.top - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  };
  const noteWidth = Math.min(360, window.innerWidth - 28);
  const preferredLeft = frame.left + frame.width + 14;
  const noteLeft = Math.max(14, Math.min(window.innerWidth - noteWidth - 14, preferredLeft));
  const noteTop = Math.max(14, Math.min(window.innerHeight - 96, frame.top));
  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay tutorial-any-click-overlay";
  overlay.innerHTML = `
    <div class="tutorial-dim"></div>
    <div class="tutorial-frame" style="left:${frame.left}px;top:${frame.top}px;width:${frame.width}px;height:${frame.height}px;"></div>
    <div class="tutorial-note tutorial-click-note dialogue-bubble system-dialogue" style="left:${noteLeft}px;top:${noteTop}px;width:${noteWidth}px;">
      <p>${escapeHtml(body)}</p>
    </div>
    ${tutorialSkipButtonHtml()}
  `;
  document.body.appendChild(overlay);
  targetEl.classList.add("tutorial-target-active");
  bindTutorialSkipButton(overlay, targetEl);
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    targetEl.classList.remove("tutorial-target-active");
    overlay.remove();
    if (onAnyClick) onAnyClick();
  };
  overlay.addEventListener("click", finish, { once: true });
}

function showClickTutorial({ target, body, onTargetClick }) {
  const targetEl = typeof target === "string" ? document.querySelector(target) : target;
  if (!targetEl) {
    if (onTargetClick) onTargetClick();
    return;
  }
  const rect = targetEl.getBoundingClientRect();
  const pad = 8;
  const frame = {
    left: Math.max(8, rect.left - pad),
    top: Math.max(8, rect.top - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  };
  const noteWidth = Math.min(360, window.innerWidth - 28);
  const preferredLeft = frame.left + frame.width + 14;
  const noteLeft = Math.max(14, Math.min(window.innerWidth - noteWidth - 14, preferredLeft));
  const noteTop = Math.max(14, Math.min(window.innerHeight - 96, frame.top));
  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay tutorial-click-overlay";
  overlay.innerHTML = `
    <div class="tutorial-blocker" style="left:0;top:0;width:100%;height:${frame.top}px;"></div>
    <div class="tutorial-blocker" style="left:0;top:${frame.top + frame.height}px;width:100%;height:${Math.max(0, window.innerHeight - frame.top - frame.height)}px;"></div>
    <div class="tutorial-blocker" style="left:0;top:${frame.top}px;width:${frame.left}px;height:${frame.height}px;"></div>
    <div class="tutorial-blocker" style="left:${frame.left + frame.width}px;top:${frame.top}px;width:${Math.max(0, window.innerWidth - frame.left - frame.width)}px;height:${frame.height}px;"></div>
    <div class="tutorial-frame" style="left:${frame.left}px;top:${frame.top}px;width:${frame.width}px;height:${frame.height}px;"></div>
    <button class="tutorial-hit-target" style="left:${frame.left}px;top:${frame.top}px;width:${frame.width}px;height:${frame.height}px;" aria-label="教學目標"></button>
    <div class="tutorial-note tutorial-click-note dialogue-bubble system-dialogue" style="left:${noteLeft}px;top:${noteTop}px;width:${noteWidth}px;">
      <p>${escapeHtml(body)}</p>
    </div>
    ${tutorialSkipButtonHtml()}
  `;
  document.body.appendChild(overlay);
  targetEl.classList.add("tutorial-target-active");
  bindTutorialSkipButton(overlay, targetEl);
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    targetEl.classList.remove("tutorial-target-active");
    overlay.remove();
    if (onTargetClick) onTargetClick();
    targetEl.click();
  };
  overlay.querySelector(".tutorial-hit-target")?.addEventListener("click", finish, { once: true });
}

function updateTopbar() {
  document.getElementById("locationTitle").textContent = currentLocationTitle();
  const moneyText = document.getElementById("moneyText");
  if (moneyText) moneyText.textContent = state.money;
  const materialText = document.getElementById("materialText");
  if (materialText) materialText.textContent = state.material;
  const energyText = document.getElementById("energyText");
  if (energyText) energyText.textContent = state.energy;
  const progressText = document.getElementById("progressText");
  if (progressText) progressText.textContent = "";
}

function syncProgressUnlocks() {
  if (state.maxClearedLevel >= 5) state.gather.unlocked = true;
  if (state.maxClearedLevel >= 10) state.bodySystemUnlocked = true;
  ensureBodyManagementState();
  state.blueprints = normalizeBlueprints(state.blueprints, state.maxClearedLevel);
}

function currentLocationTitle() {
  if (state.view === "battle" && state.battle) {
    const level = state.battle.level;
    return `Lv${level} ${state.battle.title || battleStageName(level)}`;
  }
  return {
    town: "黑水戰線",
    camp: "戰術營帳",
    tactics: "戰術盤",
    tavern: "招募",
    gather: "採集",
    expedition: "遠征",
    workshop: "工坊",
    workshopUpgrade: "義體管理",
    workshopChip: "晶片打造",
    market: "市集",
    items: "所持物品",
    notice: "布告亭",
    map: "大荒探索",
  }[state.view] || "翠穹聚落";
}

function ensureTownTalkers() {
  if (state.townTalkers.length === 3) return;
  const talkers = shuffled(partyMembers()).slice(0, 3).map((member) => ({
    id: `member-${member.id}`,
    type: "member",
    name: member.name,
    subtitle: memberClassName(member),
    classId: member.classId,
    tone: roleToneClass(member.classId),
    lines: memberTownLines(member),
    lineIndex: 0,
  }));
  const npcs = shuffled(createTownNpcPool());
  while (talkers.length < 3 && npcs.length) talkers.push(npcs.shift());
  state.townTalkers = talkers;
  state.activeTownTalkerId = null;
}

function refreshTownTalkers() {
  state.townTalkers = [];
  state.activeTownTalkerId = null;
}

function memberTownLines(member) {
  const cls = CLASS_DATA[member.classId];
  const bestStat = STAT_KEYS.slice().sort((a, b) => member.stats[b] - member.stats[a])[0];
  const reviewLines = poolLines("memberTown", member.classId).map((line) =>
    resolveDialogueLine(line, { member, bestStat: STAT_LABELS[bestStat] }),
  );
  if (reviewLines.length) return shuffled(reviewLines).slice(0, 3);
  const lines = {
    tianshu: [
      `黑水砂原的動向很亂，我會先把威脅最高的目標標出來。`,
      `我的${STAT_LABELS[bestStat]}還能再校準，下一場會看得更準。`,
      `若學了新招，記得去戰術營帳調整技能優先序，不然實戰未必會先用。`,
      genderedLine(member, `陣勢別急著推，我先算清敵群站位。`, `陣勢別急著推，我先把敵群站位算清楚。`),
    ],
    tang: [
      `砂原的毒性不單純，唐家的藥囊最好出戰前補滿。`,
      `我會盯著隊伍血線，別讓傷口拖到毒氣裡。`,
      `治療手越早升級越穩，工房的強化不要只留給輸出。`,
      genderedLine(member, `毒能救人，也能殺人，差別只在下手的分寸。`, `毒能救人，也能殺人，分寸我會拿捏。`),
    ],
    chanlin: [
      `若要深入砂原，前排得先站穩，心也得穩。`,
      `我這身骨還撐得住，工房強化後能替隊伍擋更久。`,
      `把能承傷的人放在防護位，敵人的火力會比較常打到他身上。`,
      genderedLine(member, `站我身後，砂原要吞人也得先過我這關。`, `站我身後，砂原要吞人，也得先過我這關。`),
    ],
    leishi: [
      `砂風會影響彈道，但雷氏火器還是能掃出一條路。`,
      `只要給我後排位置，我能把整列敵人壓下去。`,
      `後排能放大攻勢，但被打到時也別指望站得太久。`,
      genderedLine(member, `彈匣檢過了，下一場別讓我站錯排。`, `彈匣檢過了，下一場位置排好就行。`),
    ],
    xinhuo: [
      `路不好走就慢點走，我先頂在前面。`,
      `護航的人不能倒太快，該強化就先強化。`,
      `隊伍撐不住時先去工房，硬闖只會把補給磨光。`,
      genderedLine(member, `我皮厚，先讓我挨，別讓後排被撕開。`, `我撐前面，後排別被撕開就好。`),
    ],
    wangchuan: [
      `砂原越亂，越容易找到該消失的人。`,
      `讓我站後排，等對方露出破綻就夠了。`,
      `出手順序很要命，戰術營帳裡排在前面的主動技會優先判斷。`,
      genderedLine(member, `別問我怎麼進去，問我什麼時候回來。`, `別問我怎麼進去，等我回來就知道。`),
    ],
    emei: [
      `義體接點有砂蝕痕跡，出戰前最好檢查一輪。`,
      `我能修補傷勢，但隊伍位置也要配好。`,
      `隊員學會新技能後，先看技能說明和影響屬性，再決定要不要裝上。`,
      genderedLine(member, `我先看接口，話等修完再說。`, `我先看接口，修完再慢慢說。`),
    ],
    furnace: [
      `氣宗主流是能量攻擊，輸出、蓄能、散熱，一樣都不能亂。`,
      `過熱還壓得住，下一次梅光會更重。`,
      `大型敵人吃範圍能量爆發很虧，遇到頭目時技能搭配比硬升一級更重要。`,
      genderedLine(member, `出力不夠就充能，撐不住才叫問題。`, `出力不夠就充能，但別讓爐心亂跳。`),
    ],
  };
  return shuffled(lines[member.classId] || [`${cls.name}的人不怕砂原，只怕準備不足。`]).slice(0, 3);
}

function partyTalkLine(member) {
  const lines = memberTownLines(member);
  return randomOf(lines) || `${member.name}已待命。`;
}

function genderedLine(member, maleLine, femaleLine) {
  return member.gender === "female" ? femaleLine : maleLine;
}

function recruitTalkLine(member) {
  const reviewLines = poolLines("recruit", member.classId).map((line) => resolveDialogueLine(line, { member }));
  if (reviewLines.length) return randomOf(reviewLines);
  const lines = {
    tianshu: [
      `我擅長標定與防壁，隊裡缺戰術眼就帶我走。`,
      genderedLine(member, `給我一個穩定位置，我能把敵群拆清楚。`, `給我一個穩定位置，我會把敵群拆清楚。`),
      `打大型敵人時，先標出核心會省很多力。`,
    ],
    tang: [
      `唐家生化能救場，隊裡缺治療可以考慮我。`,
      genderedLine(member, `毒不是只拿來殺人的，也能把局勢拖回來。`, `毒不只拿來殺人，也能把局勢拖回來。`),
      `我能處理毒勢，也能把傷口壓住。`,
    ],
    chanlin: [
      `我站前排，隊伍才有喘息的空間。`,
      genderedLine(member, `要硬碰頭目，先讓我把防線架起來。`, `要硬碰頭目，先讓我把防線架起來。`),
      `禪林的功夫不怕慢，只怕隊伍心急。`,
    ],
    leishi: [
      `雷氏火器重在火線壓制，後排越穩我打得越準。`,
      genderedLine(member, `給我後排，我替你把橫列掃乾淨。`, `給我後排，我替你把橫列掃乾淨。`),
      `遇到成排敵人時，我的價值會很明顯。`,
    ],
    xinhuo: [
      `我能護航承傷，隊伍缺前排就找我。`,
      genderedLine(member, `路不好走，我先扛著。`, `路不好走，我先扛著。`),
      `後排要能輸出，前面就得有人站住。`,
    ],
    wangchuan: [
      `忘川渡的人不擅長站著挨打，擅長讓對方先倒。`,
      genderedLine(member, `標定或殘血目標交給我，別浪費時間。`, `標定或殘血目標交給我，別浪費時間。`),
      `隊伍缺收割手的話，我能補上這一段。`,
    ],
    emei: [
      `我能修補義體，也能幫隊伍調整位置。`,
      genderedLine(member, `別只看傷害，能把隊伍拉回來也很重要。`, `別只看傷害，能把隊伍拉回來也很重要。`),
      `站位亂了，我能把人牽回該在的位置。`,
    ],
    furnace: [
      `華山軍工的能量兵裝很直白，調律、充能、放出。`,
      genderedLine(member, `我打大型目標更順手，但別讓散熱閾值爆掉。`, `我打大型目標更順手，但別讓散熱閾值爆掉。`),
      `隊伍缺爆發出力，就把資源投在我身上。`,
    ],
  };
  return randomOf(lines[member.classId] || [`${CLASS_DATA[member.classId].name}出身，能補上隊伍缺口。`]);
}

function createTownNpcPool() {
  if (Array.isArray(DIALOGUE_POOLS.townNpcs) && DIALOGUE_POOLS.townNpcs.length) {
    return DIALOGUE_POOLS.townNpcs.map((npc, index) => ({
      id: npc.id || `npc-${index}-${npc.name}`,
      type: "npc",
      name: npc.name,
      subtitle: npc.subtitle,
      tone: npc.tone || "role-civilian",
      lines: shuffled(npc.lines || []).slice(0, 3),
      lineIndex: 0,
    }));
  }
  const scholars = [
    ["羅知微", "森羅學會記錄員", ["學會的人說，黑水砂原的夜間讀數這幾天一直在跳。", "如果要追查異常，先從已開放的低階戰場累積資料比較穩。", "同一關重打也有價值，樣本量夠了才看得出變化。"]],
    ["溫素策", "森羅學會測繪員", ["砂原外緣多了幾處新陷坑，像是底下有東西在移動。", "出戰路線是逐級推進的，打過的節點可以回頭重打。", "每五級的頭目節點別硬碰，先看隊伍有沒有補強。"]],
    ["何映川", "森羅學會採樣員", ["採回來的黑砂會吸附微弱能場，這不太像自然沉積。", "毒蠍和機械殘骸的素材反應不同，之後也許能接工房鍛造。", "如果戰報顯示死裡逃生，那份樣本通常也不太乾淨。"]],
  ];
  const residents = [
    ["梁阿照", "翠穹聚落居民", ["昨晚又有人聽見砂原裡傳來狼嚎，離聚落比以前近。", "狼群不會單獨亂跑，碰上狼王前最好把前排練硬些。", "聽說站防護位的人比較容易被盯上，這事你們自己掂量。"]],
    ["馬青舟", "巡荒口搬運人", ["商隊最近都繞路，寧願多花半天也不想貼著黑水走。", "酒肆候選不會招一個補一個，要等出戰三次後整批換人。", "看上好苗子又沒錢，先鎖住，別等刷新後才後悔。"]],
    ["辛守安", "翠穹聚落醫工", ["回來的人身上常有細小割傷，像被砂子磨過一整夜。", "治療手不是擺著好看的，隊伍血線不穩就先補治療。", "工房強化不只加傷害，耐久和供能也會救命。"]],
    ["周定陵", "聚落哨手", ["哨塔看見過幾次藍白閃光，不像雷，也不像槍火。", "黑水那邊不平靜，推到頭目節點前先整理隊伍。", "後排打得痛，可真被打穿時也倒得快。"]],
    ["柳承枝", "翠穹聚落嚮導", ["酒肆候選不會招一個補一個，要等出戰三次後整批換人。", "戰術營帳裡能調整隊伍配置，別只看等級。", "新技能學了不代表會用，技能優先序要自己整備。"]],
    ["陸聞白", "巡荒口整備員", ["戰報出現死裡逃生或戰敗時，多半該回工房補強了。", "如果下一關打得太吃力，重打舊關卡攢資源也行。", "頭目戰會解鎖正式裝備藍圖，材料備齊後再到工房鍛造。"]],
    ["程既安", "戰術營帳書記", ["戰術營帳裡能調整技能優先序，排越前面的主動技越早被考慮。", "主動技能不是越多越好，順序錯了會拖節奏。", "前後排可以在戰鬥中點名條切換，但出戰前先排好更穩。"]],
    ["任折砂", "工房助手", ["升級會提高義體素質，出力、反應、供能、耐久、精準都會影響戰鬥。", "缺輸出看出力和精準，缺續戰看耐久和供能。", "反應高的人行動條跑得快，出手頻率也會更好看。"]],
  ];
  return [...scholars, ...residents].map(([name, subtitle, lines], index) => ({
    id: `npc-${index}-${name}`,
    type: "npc",
    name,
    subtitle,
    tone: "role-civilian",
    lines: shuffled(lines).slice(0, 3),
    lineIndex: 0,
  }));
}

function poolLines(section, key) {
  const entry = DIALOGUE_POOLS[section]?.[key];
  return Array.isArray(entry?.lines) ? entry.lines : [];
}

function resolveDialogueLine(line, context = {}) {
  if (typeof line === "object" && line) {
    line = context.member?.gender === "female" ? line.female || line.male || "" : line.male || line.female || "";
  }
  return String(line || "")
    .replaceAll("{{bestStat}}", context.bestStat || "")
    .replaceAll("{{className}}", context.member ? CLASS_DATA[context.member.classId].name : "");
}

function townConsoleTemplate() {
  const summary = townConsoleSummary();
  const cockpit = townBattleCockpitModel(summary);
  const activeMenu = normalizeHomePrimaryMenu(state.homePrimaryMenu);
  const activeSecondary = normalizeHomeSecondaryMenu(activeMenu, state.homeSecondaryMenu);
  return `
    <section class="screen town-console home-battle-console v009-blueprint-home">
      <aside class="console-rail v009-primary-menu">
        <div class="v009-primary-stack">
          ${v009HomePrimaryMenu(activeMenu)}
        </div>
      </aside>

      <section class="console-rail v009-function-content">
        ${v009HomeFunctionContent(activeMenu, activeSecondary, summary, cockpit)}
      </section>

    <main class="console-core home-battle-core v009-battle-stack">
      ${v009HomeCombatArena(cockpit)}
      ${v009CombatSkillLoadout(cockpit)}
      <section class="v009-battle-log-shelf">
        <div class="feed v009-battle-feed">
          ${homeBattleFeedItems(cockpit)}
        </div>
      </section>
      ${v009CharacterDetailPanel(cockpit)}
    </main>

      <aside class="console-rail console-context-panel v009-right-stack">
        <section class="v009-side-panel v009-task-records" data-v009-open-commission-list>
          <div class="v009-section-title">委託清單</div>
          <div class="v009-task-list">
            ${v009TaskList(cockpit)}
          </div>
        </section>
        ${v009GearTrackingPanel({ side: true, showEmpty: true })}
        <section class="v009-side-panel v009-item-column">
          <div class="v009-section-title">物品欄</div>
          <div class="v009-item-summary">${v009InventoryList()}</div>
        </section>
        <section class="v009-side-panel v009-resource-footer">
          ${homeResourceLedger()}
        </section>
      </aside>

      <button class="reset-save-button home-debug-reset" data-reset-save title="重置測試存檔">Reset</button>
    </section>
  `;
}

function characterCreatorOverlay() {
  const draft = creatorDraft();
  const cls = CLASS_DATA[draft.classId];
  const portrait = v009ProjectAssetUrl(creatorPortraitPath(draft));
  const traitRows = creatorClassTraits(draft.classId);
  return `
    <div class="creator-overlay" role="dialog" aria-modal="true">
      <section class="creator-panel">
        <div class="creator-top">
          <div>
            <span>角色建立</span>
            <h2>選定大荒行者</h2>
          </div>
          <b>${cls.name}</b>
        </div>
        <div class="creator-layout">
          <aside class="creator-class-list">
            ${Object.entries(CLASS_DATA).map(([classId, data]) => `
              <button class="${draft.classId === classId ? "active" : ""}" data-creator-class="${classId}">
                <b>${data.name}</b>
              </button>
            `).join("")}
          </aside>
          <section class="creator-preview">
            <div class="creator-portrait-stage">
        <button class="creator-portrait-nav" data-creator-portrait="-1" aria-label="上一張">&lt;</button>
              <img src="${escapeHtml(portrait)}" alt="">
        <button class="creator-portrait-nav" data-creator-portrait="1" aria-label="下一張">&gt;</button>
            </div>
            <div class="creator-gender-row">
              ${Object.entries(GENDERS).map(([gender, label]) => `
                <button class="${draft.gender === gender ? "active" : ""}" data-creator-gender="${gender}">${label}</button>
              `).join("")}
            </div>
            <div class="creator-name-row">
              <input data-creator-name maxlength="6" value="${escapeHtml(draft.name)}" autocomplete="off" spellcheck="false">
              <button data-creator-random-name>隨機姓名</button>
            </div>
          </section>
          <section class="creator-info">
            <p>${creatorClassDescription(draft.classId)}</p>
            <div class="creator-stat-grid">
              ${STAT_KEYS.map((key) => `<span><i>${STAT_LABELS[key]}</i><b>${draft.stats[key]}</b></span>`).join("")}
            </div>
            <div class="creator-style-list">
              ${traitRows.map((entry) => `<span><b>${entry.title}</b><i>${entry.text}</i></span>`).join("")}
            </div>
          </section>
        </div>
        <div class="creator-actions">
          <button class="creator-random-button" data-creator-random>隨機生成</button>
          <button class="creator-enter-button" data-creator-complete>進入大荒</button>
        </div>
      </section>
    </div>
  `;
}

function bodySelectionOverlay() {
  const selection = normalizeBodySelection(state.bodySelection);
  if (!selection) return "";
  state.bodySelection = selection;
  const draft = bodySelectionDraft();
  const cls = CLASS_DATA[draft.classId];
  const portrait = v009ProjectAssetUrl(creatorPortraitPath(draft));
  const traitRows = creatorClassTraits(draft.classId);
  const installed = installedBodyClassIds();
  return `
    <div class="creator-overlay body-select-overlay" role="dialog" aria-modal="true">
      <section class="creator-panel">
        <div class="creator-top">
          <div>
            <span>義體門派選擇</span>
            <h2>安裝戰鬥紀錄</h2>
          </div>
          <b>${cls.name}</b>
        </div>
        <div class="creator-layout">
          <aside class="creator-class-list">
            ${Object.entries(CLASS_DATA).map(([classId, data]) => {
              const disabled = installed.has(classId);
              return `
                <button class="${draft.classId === classId ? "active" : ""} ${disabled ? "locked" : ""}" ${disabled ? "disabled aria-disabled=\"true\"" : `data-body-select-class="${classId}"`}>
                  <b>${data.name}</b>
                  ${disabled ? `<i>已擁有</i>` : ""}
                </button>
              `;
            }).join("")}
          </aside>
          <section class="creator-preview">
            <div class="creator-portrait-stage">
              <button class="creator-portrait-nav" data-body-select-portrait="-1" aria-label="上一張">&lt;</button>
              <img src="${escapeHtml(portrait)}" alt="">
              <button class="creator-portrait-nav" data-body-select-portrait="1" aria-label="下一張">&gt;</button>
            </div>
            <div class="creator-gender-row">
              ${Object.entries(GENDERS).map(([gender, label]) => `
                <button class="${draft.gender === gender ? "active" : ""}" data-body-select-gender="${gender}">${label}</button>
              `).join("")}
            </div>
          </section>
          <section class="creator-info">
            <p>${creatorClassDescription(draft.classId)}</p>
            <div class="creator-stat-grid">
              ${STAT_KEYS.map((key) => `<span><i>${STAT_LABELS[key]}</i><b>${draft.stats[key]}</b></span>`).join("")}
            </div>
            <div class="creator-style-list">
              ${traitRows.map((entry) => `<span><b>${entry.title}</b><i>${entry.text}</i></span>`).join("")}
            </div>
          </section>
        </div>
        <div class="creator-actions">
          <button class="creator-random-button" data-body-select-cancel>取消</button>
          <button class="creator-enter-button" data-body-select-confirm>確定安裝</button>
        </div>
      </section>
    </div>
  `;
}

function eventDialogueOverlay() {
  const line = currentEventDialogueLine();
  const speaker = eventDialogueSpeaker(line);
  const text = eventDialogueVisibleText();
  const finished = (state.eventDialog?.visibleChars || 0) >= eventDialogueCurrentTextLength();
  return `
    <div class="event-dialogue-overlay" role="dialog" aria-live="polite" data-event-dialogue-next>
      <section class="event-dialogue-window">
        <div class="event-speaker-portrait" aria-hidden="true">${eventDialogueSpeakerPortrait(speaker)}</div>
        <div class="event-dialogue-main">
          <div class="event-speaker-row">
            <b>${escapeHtml(speaker.name)}</b>
            ${speaker.role ? `<span>${escapeHtml(speaker.role)}</span>` : ""}
          </div>
          <p data-event-dialogue-text>${eventDialogueVisibleHtml()}</p>
          <i data-event-dialogue-hint>${finished ? "點擊繼續" : "點擊顯示全文"}</i>
        </div>
      </section>
    </div>
  `;
}

function creatorClassDescription(classId) {
  return {
    tianshu: "天樞派，全名「天樞量子運算科技與矩陣防務集團」，由舊世代的道門「武當」傳承立派，總壇位於平流層上的空中要塞「真武雲圖」，坐擁這個全界域最大的雲端數據中心。天樞派的武學以演算為本，冷靜分析推演戰況後再以精準的劍勢切入致勝。",
    tang: "唐家生化，全名「唐氏醫療與毒物生物化學研究聯合」，是以唐氏世家為主體的學者、研究者聯合。雖然在醫毒兩面同負盛名，實際上越是純種的唐家人越癡迷於與「毒」相關的事物，當世第一的醫術只是生化研究中的副產物。",
    chanlin: "數百年前曾經的機皇統治讓整個界域進入了仰賴科技的時代，然而仍有一群人堅守者生物倫理的界線，抗拒將身體替換成機械義體。透過苦修與獨特的肉體強化技術，「禪林生物倫理與生態監管基金會」完成了與義體截然不同的強化路線。",
    leishi: "沒有什麼開槍不能解決的事，如果有就多開幾槍。「雷氏動能火器與物理彈道工業實業」是全界域最大的武器研發與生產企業，長久傳承的雷氏世家幾乎壟斷了全界域的礦產，讓這群軍武狂在實現火器的點子上毫無後顧之憂。",
    xinhuo: "雖然「丐幫」已隨著時代演變消逝在舊世代，但有人的地方就有江湖，有社會就有階層，而出身街巷、廢城與荒野的底層人，為了互助形成了「薪火武裝航運與洲際物流互助會」，以身為盾守護同為底層的夥伴，薪火象徵精神的傳承。",
    wangchuan: "舉世知名的殺手組織「忘川渡」，卻又沒人能說清這是一個怎樣的組織。與「浮光物聯網人力資源與即時物流平台」互為表裡的傳言從沒停過，但究竟浮光會是忘川渡的掩護？還是忘川渡是浮光會旗下的一支業務？能確定的只有沒人想被委託上忘川渡的生死簿。",
    emei: "雖然義體已經是十分泛用的技術，「峨嵋霓裳義體精密工業」仍令上流人士趨之若鶩的理由，在於峨嵋出品的義體傳動流暢、運動性頂尖又穩定，最重要的是從外觀到姿態全都體現對美的追求。峨嵋出身的武者們延續千年傳承同時，更是精密義體的活招牌。",
    furnace: "舊世代華山派的劍宗與氣宗之爭早已劃下句點，「華山能源轉化與軍事工業」是以氣宗為主體，專注於能量武器的勢力。手上沒有能源優勢，也沒有無窮盡的礦產資源，讓華山另闢蹊徑，憑藉傳承的紫霞神功研究出獨特的「紫氣」能量轉化技術，以此立足於江湖。",
  }[classId] || "這一脈尚在整理資料。";
}

function creatorClassTraits(classId) {
  return {
    tianshu: [
      { title: "門派印象", text: "劍法、陣式、解析深度、後期爆發" },
    ],
    tang: [
      { title: "門派印象", text: "暗器、毒術、醫術、持續傷害" },
    ],
    chanlin: [
      { title: "門派印象", text: "體術、金剛身、不動心、抗傷反擊" },
    ],
    leishi: [
      { title: "門派印象", text: "火槍、彈藥、爆炸、火力壓制" },
    ],
    xinhuo: [
      { title: "門派印象", text: "拳法、正面衝突、攻防一體、怒氣掌控" },
    ],
    wangchuan: [
      { title: "門派印象", text: "暗器、暗殺秘術、身如鬼魅、索命收割" },
    ],
    emei: [
      { title: "門派印象", text: "足技、身法、高速行動、連綿攻擊" },
    ],
    furnace: [
      { title: "門派印象", text: "掌法、能量攻擊、紫氣轉化、蓄勢爆發" },
    ],
  }[classId] || [];
}

function v009HomePrimaryMenu(activeMenu) {
  return v009HomeMenuConfig().map((item) => `
    <button class="v009-primary-button ${activeMenu === item.id ? "active" : ""}" data-home-primary="${item.id}">
      <b>${item.name}</b>
    </button>
  `).join("");
}

function v009HomeMenuConfig() {
  return [
    { id: "map", name: "地圖", hint: "八大區 | 關卡" },
    { id: "upgrade", name: "工坊", hint: "鍛造 | 義體" },
    { id: "market", name: "商店", hint: "購買 | 互換" },
    { id: "commission", name: "委託", hint: "任務揭榜" },
    { id: "codex", name: "事典", hint: "勢力 | 條目" },
  ];
}

function workshopUnlocked() {
  return state.maxClearedLevel >= 5;
}

function bodyManagementUnlocked() {
  return !!state.bodySystemUnlocked || state.maxClearedLevel >= 10;
}

function ensureBodyManagementState() {
  state.bodySystemUnlocked = bodyManagementUnlocked();
  state.bodySlotUnlocks = normalizeBodySlotUnlocks(state.bodySlotUnlocks, state.maxClearedLevel);
  if (state.bodySystemUnlocked) state.bodySlotUnlocks[1] = true;
  const firstMember = state.recruits[0] || null;
  let original = state.recruits.find((member) => member.bodyOriginal || member.bodySlotIndex === 0) || firstMember;
  if (original) {
    original.bodySlotIndex = 0;
    original.bodyKind = "original";
    original.bodyOriginal = true;
    state.party[0] = state.party[0] || original.id;
    if (!state.selectedMemberId) state.selectedMemberId = original.id;
  }
  state.recruits.forEach((member) => {
    if (member !== original && member.bodySlotIndex === 0) member.bodySlotIndex = -1;
    if (original && member !== original && isSimulatedBody(member) && safeNumber(member.bodySlotIndex, -1, -1) >= 1) {
      member.name = original.name;
    }
  });
}

function isSimulatedBody(member) {
  return !!member && !member.bodyOriginal && member.bodyKind === "blank";
}

function bodyOriginalName() {
  const original = state.recruits.find((member) => member.bodyOriginal || member.bodySlotIndex === 0);
  return original?.name || state.recruits[0]?.name || "";
}

function bodySlotMember(slotIndex) {
  ensureBodyManagementState();
  return state.recruits.find((member) => safeNumber(member.bodySlotIndex, -1, -1) === slotIndex) || null;
}

function bodySlotUnlocked(slotIndex) {
  if (slotIndex === 0) return true;
  if (!bodyManagementUnlocked()) return false;
  state.bodySlotUnlocks = normalizeBodySlotUnlocks(state.bodySlotUnlocks, state.maxClearedLevel);
  return !!state.bodySlotUnlocks[slotIndex];
}

function activeBodySlotIndex() {
  const member = playerCombatMember();
  return Math.max(0, safeNumber(member?.bodySlotIndex, 0, 0));
}

function bodyFragmentCount() {
  return normalizeInventory(state.inventory)[BODY_FRAGMENT_ITEM_ID] || 0;
}

function consumeBodyFragments(count) {
  state.inventory = normalizeInventory(state.inventory);
  if ((state.inventory[BODY_FRAGMENT_ITEM_ID] || 0) < count) return false;
  state.inventory[BODY_FRAGMENT_ITEM_ID] -= count;
  if (state.inventory[BODY_FRAGMENT_ITEM_ID] <= 0) delete state.inventory[BODY_FRAGMENT_ITEM_ID];
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  return true;
}

function installedBodyClassIds() {
  return new Set(state.recruits
    .filter((member) => safeNumber(member.bodySlotIndex, -1, -1) >= 0)
    .map((member) => member.classId));
}

function selectableBodyClassIds() {
  const installed = installedBodyClassIds();
  return Object.keys(CLASS_DATA).filter((classId) => !installed.has(classId));
}

function bodyClassSelectable(classId) {
  return !!CLASS_DATA[classId] && !installedBodyClassIds().has(classId);
}

function normalizeBodySelection(selection) {
  if (!selection || typeof selection !== "object") return null;
  const slotIndex = Math.max(1, Math.min(BODY_SLOT_COUNT - 1, safeNumber(selection.slotIndex, 1, 1)));
  const fallbackClassId = firstSelectableBodyClassId();
  const draftSource = selection.draft && bodyClassSelectable(selection.draft.classId)
    ? selection.draft
    : { ...selection.draft, classId: fallbackClassId };
  if (!fallbackClassId) return null;
  return {
    slotIndex,
    draft: normalizeCreatorDraft(draftSource || defaultCreatorDraft()),
  };
}

function bodySelectionDraft() {
  state.bodySelection = normalizeBodySelection(state.bodySelection) || {
    slotIndex: 1,
    draft: normalizeCreatorDraft({
      ...defaultCreatorDraft(),
      classId: firstSelectableBodyClassId(),
      name: "義體",
    }),
  };
  return state.bodySelection.draft;
}

function firstSelectableBodyClassId() {
  return selectableBodyClassIds()[0] || "";
}

function updateBodySelectionDraft(patch = {}) {
  if (!state.bodySelection) return;
  if (patch.classId && !bodyClassSelectable(patch.classId)) return;
  const draft = bodySelectionDraft();
  const next = { ...draft, ...patch };
  if (patch.classId && patch.classId !== draft.classId) {
    next.stats = creatorStatsForClass(patch.classId);
    next.portraitIndex = 0;
    next.name = "義體";
  }
  if (patch.gender && patch.gender !== draft.gender) {
    next.portraitIndex = 0;
  }
  state.bodySelection.draft = normalizeCreatorDraft(next);
}

function openBodySelection(slotIndex) {
  if (!bodySlotUnlocked(slotIndex) || bodySlotMember(slotIndex)) return;
  const classId = firstSelectableBodyClassId();
  if (!classId) {
    alert("所有門派都已經有義體紀錄。");
    return;
  }
  state.bodySelection = {
    slotIndex,
    draft: normalizeCreatorDraft({
      classId,
      gender: "male",
      portraitIndex: 0,
      name: "義體",
      stats: creatorStatsForClass(classId),
    }),
  };
  saveGame();
  render();
}

function confirmBodySelection() {
  const selection = normalizeBodySelection(state.bodySelection);
  if (!selection || !bodySlotUnlocked(selection.slotIndex) || bodySlotMember(selection.slotIndex)) return;
  const draft = normalizeCreatorDraft(selection.draft);
  if (installedBodyClassIds().has(draft.classId)) {
    alert("這個門派已經有義體紀錄。");
    return;
  }
  const className = CLASS_DATA[draft.classId]?.name || "門派";
  const member = createCharacter(draft.classId, "white", usedNameParts(), {
    gender: draft.gender,
    name: bodyOriginalName() || `${className}義體`.slice(0, 6),
    stats: draft.stats,
    portraitPath: creatorPortraitPath(draft),
  });
  member.bodySlotIndex = selection.slotIndex;
  member.bodyKind = "blank";
  member.bodyOriginal = false;
  state.recruits.push(member);
  switchBodySlot(selection.slotIndex, { silent: true, render: false });
  state.bodySelection = null;
  state.bodyUpgradeMode = "switch";
  if (state.pendingBodyManagementTutorial?.step === "blankBody") {
    state.pendingBodyManagementTutorial = null;
    setTimeout(() => {
      startEventDialogue("body_management_after_select");
      saveGame();
      render();
    }, 0);
  }
  saveGame();
  render();
}

function switchBodySlot(slotIndex, options = {}) {
  const member = bodySlotMember(slotIndex);
  if (!member) return false;
  if (state.battle && !state.battle.over) {
    alert("戰鬥中無法切換義體。");
    return false;
  }
  state.party = [member.id, null, null, null];
  state.selectedMemberId = member.id;
  state.townTalkers = [];
  if (!options.silent) addFeed(`切換義體：${member.name}（${memberClassName(member)}）。`, "gold");
  saveGame();
  if (options.render !== false) render();
  return true;
}

function handleBodySlotClick(slotIndex) {
  ensureBodyManagementState();
  if (bodySlotMember(slotIndex)) {
    switchBodySlot(slotIndex);
    return;
  }
  if (bodySlotUnlocked(slotIndex)) {
    openBodySelection(slotIndex);
    return;
  }
  if (consumeBodyFragments(BODY_SLOT_UNLOCK_FRAGMENT_COST)) {
    state.bodySlotUnlocks[slotIndex] = true;
    state.bodyUpgradeMode = "switch";
    addFeed(`交付 ${itemName(BODY_FRAGMENT_ITEM_ID)} x${BODY_SLOT_UNLOCK_FRAGMENT_COST}，開放第 ${slotIndex + 1} 具空白義體。`, "gold");
  } else {
    alert(`解鎖條件：蒐集 ${BODY_SLOT_UNLOCK_FRAGMENT_COST} 個${itemName(BODY_FRAGMENT_ITEM_ID)}。目前 ${bodyFragmentCount()}/${BODY_SLOT_UNLOCK_FRAGMENT_COST}。`);
  }
  saveGame();
  render();
}

function normalizeHomePrimaryMenu(menu) {
  return v009HomeMenuConfig().some((item) => item.id === menu) ? menu : "map";
}

function v009HomeSecondaryConfig(menu) {
  return {
    map: [
      { id: "regions", name: "八大區" },
      { id: "stages", name: "各區關卡場所" },
    ],
    upgrade: workshopUnlocked()
      ? [
        { id: "craft", name: "裝備鍛造", disabled: !hasAnyBlueprint() },
        { id: "body", name: "義體管理" },
      ]
      : [
        { id: "locked", name: "尚未開放" },
      ],
    market: [
      { id: "buy", name: "購買列表" },
      { id: "exchange", name: "資源互換" },
    ],
    commission: [
      { id: "board", name: "委託清單" },
    ],
    codex: [
      { id: "factions", name: "勢力" },
      { id: "geography", name: "地理" },
    ],
  }[menu] || [];
}

function normalizeHomeSecondaryMenu(menu, secondary) {
  const items = v009HomeSecondaryConfig(menu);
  return items.some((item) => item.id === secondary && !item.disabled) ? secondary : items.find((item) => !item.disabled)?.id || "";
}

function v009HomeSecondaryTabs(menu, activeSecondary) {
  return `
    <div class="v009-secondary-tabs v009-secondary-tabs-${menu}">
      ${v009HomeSecondaryConfig(menu).map((item) => {
        const isCodexFactionToggle = menu === "codex" && item.id === "factions";
        const expandedAttr = isCodexFactionToggle ? ` aria-expanded="${state.codexFactionOpen !== false ? "true" : "false"}"` : "";
        return `
          <button class="${activeSecondary === item.id ? "active" : ""} ${item.disabled ? "locked" : ""}" ${item.disabled ? "disabled aria-disabled=\"true\"" : `data-home-secondary="${item.id}"`}${expandedAttr}>
            ${item.name}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function v009HomeFunctionContent(menu, secondary, summary, cockpit) {
  const tabs = ["upgrade", "market", "commission"].includes(menu) && !(menu === "upgrade" && !workshopUnlocked()) ? v009HomeSecondaryTabs(menu, secondary) : "";
  return `
    <div class="v009-function-body">
      ${tabs}
      ${v009HomeFunctionBody(menu, secondary, summary, cockpit)}
    </div>
  `;
}

function v009HomeFunctionBody(menu, secondary, summary, cockpit) {
  if (menu === "map" && secondary === "regions") return v009RegionPanel();
  if (menu === "map") return v009StagePanel(cockpit);
  if (menu === "upgrade" && !workshopUnlocked()) return v009WorkshopLockedPanel();
  if (menu === "upgrade" && secondary === "craft") return v009CraftPanel();
  if (menu === "upgrade" && secondary === "body") return v009BodyUpgradePanel();
  if (menu === "market" && secondary === "buy") return v009MarketBuyPanel();
  if (menu === "market" && secondary === "exchange") return v009MarketExchangePanel();
  if (menu === "commission") return v009CommissionPanel(summary);
  if (menu === "codex") return v009CodexPanel();
  return v009CodexLockedPanel();
}

function v009WorkshopLockedPanel() {
  return `
    <div class="v009-locked-panel">
      <b>工坊尚未開放</b>
    </div>
  `;
}

function v009RegionPanel() {
  return `
    <div class="v009-region-grid">
      ${REGION_DATA.map((region) => `
        <button class="v009-region-tile tone-${region.tone} ${region.open ? "open" : "locked"}" data-region-id="${region.id}" ${region.open ? `data-home-secondary="stages"` : "disabled aria-disabled=\"true\""}>
          <b>${region.name}</b>
          <span>${region.status || "未開放"}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function v009StagePanel(cockpit) {
  const opened = Array.from({ length: BLACKWATER_MAX_LEVEL }, (_, i) => stageNode(BLACKWATER_MAX_LEVEL - i)).filter(Boolean);
  return `
    <div class="v009-stage-head">
      <b>黑水砂原 Lv${cockpit.level}</b>
      <button data-home-secondary="regions">返回</button>
    </div>
    <div class="map-path expedition-path v009-stage-list">
      ${opened.join("")}
    </div>
  `;
}

function v009CraftPanel() {
  const recipes = visibleGearCraftRecipes();
  return `
    <div class="v009-craft-list v009-gear-craft-list">
      ${recipes.length ? v009GearCraftGroups(recipes) : `<div class="inventory-empty">尚未取得裝備藍圖。</div>`}
    </div>
  `;
}

function visibleGearCraftRecipes() {
  return GEAR_CRAFT_RECIPES
    .map((recipe, index) => ({ recipe, index }))
    .filter(({ recipe }) => recipe.blueprintKey && hasBlueprint(recipe.blueprintKey))
    .sort((a, b) => (b.recipe.level || 0) - (a.recipe.level || 0) || a.index - b.index)
    .map(({ recipe }) => recipe);
}

function v009GearCraftGroups(recipes) {
  const groups = [];
  const byKey = new Map();
  for (const recipe of recipes) {
    const key = recipe.setId && GEAR_SET_DATA[recipe.setId] ? recipe.setId : "loose";
    if (!byKey.has(key)) {
      byKey.set(key, []);
      groups.push({ key, recipes: byKey.get(key) });
    }
    byKey.get(key).push(recipe);
  }
  return groups.map(v009GearCraftSetGroup).join("");
}

function v009GearCraftSetGroup(group) {
  const set = GEAR_SET_DATA[group.key];
  const title = set?.name || "散件裝備";
  const openState = state.gearCraftSetOpen && typeof state.gearCraftSetOpen === "object" ? state.gearCraftSetOpen : {};
  const open = openState[group.key] !== false;
  const readyCount = group.recipes.filter(canCraftGear).length;
  const trackedCount = group.recipes.filter((recipe) => isGearTracked(recipe.id)).length;
  return `
    <section class="v009-gear-craft-set ${open ? "open" : "collapsed"}" data-gear-craft-set="${escapeHtml(group.key)}">
      <button class="v009-gear-craft-set-head" data-toggle-gear-set="${escapeHtml(group.key)}" aria-expanded="${open ? "true" : "false"}">
        <b>${escapeHtml(title)}</b>
        <span>${group.recipes.length} 件｜可鍛造 ${readyCount}｜追蹤 ${trackedCount}</span>
      </button>
      ${open ? `<div class="v009-gear-craft-set-body">${group.recipes.map(v009GearCraftCard).join("")}</div>` : ""}
    </section>
  `;
}

function v009GearCraftCard(recipe) {
  const canCraft = canCraftGear(recipe);
  const tracked = isGearTracked(recipe.id);
  return `
    <div class="chip-craft-card v009-gear-craft-card">
      <div class="chip-craft-head">
        <b>${escapeHtml(recipe.name)}</b>
        ${gearCraftAbilityRows(recipe)}
      </div>
      ${chipCraftCosts(recipe)}
      <div class="v009-craft-actions">
        <button data-craft-gear="${recipe.id}" ${canCraft ? "" : "disabled"}>鍛造</button>
        <button class="v009-track-button ${tracked ? "active" : ""}" data-track-gear="${recipe.id}" title="${tracked ? "取消追蹤" : "追蹤材料"}">${tracked ? "追蹤中" : "追蹤"}</button>
      </div>
    </div>
  `;
}

function gearCraftAbilityRows(recipe) {
  const set = GEAR_SET_DATA[recipe.setId];
  const combatCount = Math.max(1, Math.floor(recipe.combatCount || 1));
  const combatText = recipe.combatValue
    ? `隨機 ${combatCount} 條，各 +${recipe.combatValue}%`
    : `隨機 ${combatCount} 條`;
  const rows = [
    { label: "部位", value: `${gearSlotLabel(recipe.slot)} | Lv${recipe.level}` },
    { label: "能力", value: "隨機 2 條" },
    { label: "戰鬥", value: combatText },
  ];
  if (set) {
    set.effects.forEach((effect) => {
      rows.push({ label: `${effect.pieces}件`, value: effect.text, set: true });
    });
  }
  return `
    <div class="v009-gear-ability-rows">
      ${rows.map((row) => `
        <span class="${row.set ? "set-bonus" : ""}">
          <i>${escapeHtml(row.label)}</i>
          <b>${escapeHtml(row.value)}</b>
        </span>
      `).join("")}
    </div>
  `;
}

function v009BodyUpgradePanel() {
  const member = playerCombatMember() || partyMembers()[0] || state.recruits[0];
  if (!member) return `<div class="inventory-empty">尚未編入作戰角色</div>`;
  ensureBodyManagementState();
  const mode = bodyManagementUnlocked() && state.bodyUpgradeMode === "switch" ? "switch" : "meridian";
  return `
    <div class="v009-meridian-board">
      <div class="v009-body-mode-tabs">
        <button class="${mode === "switch" ? "active" : ""} ${bodyManagementUnlocked() ? "" : "locked"}" ${bodyManagementUnlocked() ? `data-body-upgrade-mode="switch"` : "disabled aria-disabled=\"true\""}>義體切換</button>
        <button class="${mode === "meridian" ? "active" : ""}" data-body-upgrade-mode="meridian">經脈改造</button>
      </div>
      ${mode === "switch" ? v009BodySwitchPanel() : `
        <div class="v009-meridian-columns">
          ${v009MeridianColumn(member, "任脈")}
          ${v009MeridianColumn(member, "督脈")}
        </div>
        ${chipInventoryPanel({ compact: true, memberId: member.id })}
      `}
    </div>
  `;
}

function v009BodySwitchPanel() {
  const fragmentCount = bodyFragmentCount();
  return `
    <div class="v009-body-switch-panel">
      <div class="v009-body-switch-head">
        <b>義體切換</b>
        <span>${itemName(BODY_FRAGMENT_ITEM_ID)} ${fragmentCount}</span>
      </div>
      <div class="v009-body-slot-grid">
        ${Array.from({ length: BODY_SLOT_COUNT }, (_, index) => v009BodySlotCard(index)).join("")}
      </div>
    </div>
  `;
}

function v009BodySlotCard(index) {
  const member = bodySlotMember(index);
  const unlocked = bodySlotUnlocked(index);
  const active = activeBodySlotIndex() === index;
  const fragmentCount = bodyFragmentCount();
  if (member) {
    const portrait = v009ProjectAssetUrl(member.portraitPath || randomPortraitPath(member.classId, member.gender));
    return `
      <button class="v009-body-slot filled ${active ? "active" : ""} ${member.bodyOriginal ? "original" : ""}" data-body-slot="${index}">
        <span class="v009-body-slot-portrait"><img src="${escapeHtml(portrait)}" alt=""></span>
        <span class="v009-body-slot-info">
          <b>${escapeHtml(CLASS_DATA[member.classId]?.name || "")}</b>
          <em>Lv${member.level} ${member.bodyOriginal ? "初始義體" : "模擬義體"}</em>
        </span>
        <i>${active ? "目前" : "切換"}</i>
      </button>
    `;
  }
  if (unlocked) {
    return `
      <button class="v009-body-slot blank" data-body-slot="${index}">
        <span class="v009-body-slot-portrait empty-mark">+</span>
        <span class="v009-body-slot-info">
          <b>--</b>
          <em>Lv 0 空白義體</em>
        </span>
        <i>選擇</i>
      </button>
    `;
  }
  const canUnlock = fragmentCount >= BODY_SLOT_UNLOCK_FRAGMENT_COST;
  return `
    <button class="v009-body-slot locked ${canUnlock ? "can-unlock" : ""}" data-body-slot="${index}">
      <span class="v009-body-slot-portrait locked-mark">${lockIcon()}</span>
      <span class="v009-body-slot-info">
        <b>--</b>
        <em>Lv 0 空白義體</em>
      </span>
      <i>解鎖</i>
    </button>
  `;
}

function v009MeridianColumn(member, channel) {
  const slots = MERIDIAN_CHIP_SLOTS.filter((slot) => slot.channel === channel);
  return `
    <section class="v009-meridian-column">
      <b>${channel}</b>
      <div class="v009-meridian-slot-list">
        ${slots.map((slot, index) => equipmentChipSlot(member, slot, index)).join("")}
      </div>
    </section>
  `;
}

function v009MarketBuyPanel() {
  const entries = marketBuyEntries();
  return `
    <div class="market-list v009-market-list">
      ${entries.length ? entries.map(marketBuyRow).join("") : `<div class="inventory-empty">沒有可購買物品</div>`}
    </div>
  `;
}

function v009MarketExchangePanel() {
  return `
    <div class="v009-exchange-stack">
      ${marketResourcePanel()}
      ${marketExchangePanel()}
    </div>
  `;
}

function v009CommissionPanel(summary) {
  ensureDefaultCommissions();
  const commissions = noticeCommissionItems();
  return `
    <div class="v009-subtitle-line"><b>委託</b><span>${summary.commissionState}</span></div>
    <div class="notice-commission-list v009-commission-list">
      ${commissions.length ? commissions.map(noticeCommissionCard).join("") : `<div class="inventory-empty">目前沒有可處理委託</div>`}
    </div>
  `;
}

function trackedGearRecipes() {
  state.gearWishlist = normalizeGearWishlist(state.gearWishlist);
  const tracked = new Set(state.gearWishlist);
  return GEAR_CRAFT_RECIPES.filter((recipe) => tracked.has(recipe.id));
}

function isGearTracked(recipeId) {
  return normalizeGearWishlist(state.gearWishlist).includes(recipeId);
}

function toggleGearTracking(recipeId) {
  const recipe = GEAR_CRAFT_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) return;
  const craftScroller = document.querySelector(".v009-gear-craft-list");
  const scrollTop = craftScroller ? craftScroller.scrollTop : null;
  const current = normalizeGearWishlist(state.gearWishlist);
  state.gearWishlist = current.includes(recipeId)
    ? current.filter((id) => id !== recipeId)
    : [...current, recipeId];
  saveGame();
  render();
  if (scrollTop !== null) {
    requestAnimationFrame(() => {
      const nextScroller = document.querySelector(".v009-gear-craft-list");
      if (nextScroller) nextScroller.scrollTop = scrollTop;
    });
  }
}

function toggleGearCraftSet(setId) {
  const key = setId && (GEAR_SET_DATA[setId] || setId === "loose") ? setId : "loose";
  state.gearCraftSetOpen = state.gearCraftSetOpen && typeof state.gearCraftSetOpen === "object" ? state.gearCraftSetOpen : {};
  state.gearCraftSetOpen[key] = state.gearCraftSetOpen[key] === false;
  render();
}

function v009GearTrackingPanel(options = {}) {
  const recipes = trackedGearRecipes();
  if (!recipes.length && !options.showEmpty) return "";
  const classes = ["v009-tracking-panel"];
  if (!options.side) classes.push("v009-commission-tracking-panel");
  if (options.side) classes.push("v009-side-panel", "v009-side-tracking-panel");
  const title = options.side
    ? `<div class="v009-section-title"><b>追蹤清單</b><span>${recipes.length ? `${recipes.length} 件裝備` : "未追蹤"}</span></div>`
    : `<div class="v009-subtitle-line"><b>追蹤清單</b><span>${recipes.length ? `${recipes.length} 件裝備` : "未追蹤"}</span></div>`;
  return `
    <section class="${classes.join(" ")}">
      ${title}
      ${
        recipes.length
          ? `<div class="v009-tracking-list">${recipes.map(v009GearTrackingCard).join("")}</div>`
          : `<div class="inventory-empty">尚未追蹤鍛造目標</div>`
      }
    </section>
  `;
}

function v009GearTrackingCard(recipe) {
  const ready = canCraftGear(recipe);
  return `
    <div class="v009-tracking-card ${ready ? "ready" : ""}">
      <div class="v009-tracking-head">
        <b>${escapeHtml(recipe.name)}</b>
        <span>${ready ? "材料足夠" : "材料不足"}</span>
      </div>
      <div class="v009-tracking-costs">
        ${recipe.costs.map(v009TrackingCost).join("")}
      </div>
    </div>
  `;
}

function v009TrackingCost(cost) {
  const held = craftCostHeld(cost);
  const ok = held >= cost.count ? "ok" : "bad";
  return `<span class="${ok} ${craftCostToneClass(cost)}"><i>${escapeHtml(craftCostName(cost))}</i><b>${held}/${cost.count}</b></span>`;
}

function v009CodexLockedPanel() {
  return `
    <div class="v009-locked-panel">
      <b>事典暫不開放</b>
      <span>此座雛型保留入口，後續再接角色、敵人、素材、區域與戰鬥詞條。</span>
    </div>
  `;
}

function v009CodexPanel() {
  const factionEntries = [
    ...CODEX_FACTION_ENTRIES.map(v009CodexTextEntry),
    ...Object.entries(CLASS_DATA).map(([classId, data]) => v009CodexFactionEntry(classId, data)),
  ].join("");
  const geographyEntries = CODEX_GEOGRAPHY_ENTRIES.map(v009CodexTextEntry).join("");
  const factionOpen = state.codexFactionOpen !== false;
  const geographyOpen = state.codexGeographyOpen !== false;
  return `
    <div class="v009-codex-panel stacked">
      <section class="v009-codex-category ${factionOpen ? "open" : "collapsed"}">
        <button class="v009-codex-category-head" data-codex-category-toggle="factions" aria-expanded="${factionOpen ? "true" : "false"}">
          <b>勢力</b>
          <span>${factionOpen ? "收起" : "展開"}</span>
        </button>
        ${factionOpen ? `
          <div class="v009-codex-entry-list">
            ${factionEntries}
          </div>
        ` : ""}
      </section>
      <section class="v009-codex-category ${geographyOpen ? "open" : "collapsed"}">
        <button class="v009-codex-category-head" data-codex-category-toggle="geography" aria-expanded="${geographyOpen ? "true" : "false"}">
          <b>地理</b>
          <span>${geographyOpen ? "收起" : "展開"}</span>
        </button>
        ${geographyOpen ? `
          <div class="v009-codex-entry-list">
            ${geographyEntries}
          </div>
        ` : ""}
      </section>
    </div>
  `;
}

function v009CodexFactionPanel() {
  const entries = Object.entries(CLASS_DATA);
  if (state.codexFactionOpen === false) {
    return `<div class="v009-codex-panel"></div>`;
  }
  return `
    <div class="v009-codex-panel">
      <div class="v009-codex-entry-list">
        ${CODEX_FACTION_ENTRIES.map(v009CodexTextEntry).join("")}
        ${entries.map(([classId, data]) => v009CodexFactionEntry(classId, data)).join("")}
      </div>
    </div>
  `;
}

function v009CodexEntryPanel(entries) {
  return `
    <div class="v009-codex-panel">
      <div class="v009-codex-entry-list">
        ${(entries || []).map(v009CodexTextEntry).join("")}
      </div>
    </div>
  `;
}

function v009CodexTextEntry(entry) {
  return `
    <article class="v009-codex-entry text-entry">
      <header>
        <b>${escapeHtml(entry.title)}</b>
      </header>
      ${(entry.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </article>
  `;
}

function v009CodexFactionEntry(classId, data) {
  const traits = creatorClassTraits(classId);
  return `
    <article class="v009-codex-entry">
      <header>
        <b>${escapeHtml(data.name)}</b>
        ${classId !== "tang" && data.officialName && data.officialName !== data.name ? `<span>${escapeHtml(data.officialName)}</span>` : ""}
      </header>
      <p>${escapeHtml(creatorClassDescription(classId))}</p>
      ${traits.length ? `
        <div class="v009-codex-traits">
          ${traits.map((entry) => `
            <span>
              <b>${escapeHtml(entry.title)}</b>
              <i>${escapeHtml(entry.text)}</i>
            </span>
          `).join("")}
        </div>
      ` : ""}
    </article>
  `;
}

function v009HomeCombatArena(cockpit) {
  const actor = cockpit.party[0] || null;
  const actionBanner = v009ActiveActionBanner(state.battle);
  const actionLabel = actionBanner?.label || "";
  const actionSource = actionBanner || null;
  const primaryEnemy = v009PrimaryEnemy(cockpit, actionSource);
  const defeatFlash = cockpit.defeatFlash || (state.v009DefeatFlashUntil && state.v009DefeatFlashUntil > Date.now());
  return `
    <section class="v009-combat-arena ${defeatFlash ? "is-defeat-flash" : ""}">
      ${v009EnemyCornerLabel(primaryEnemy)}
      ${v009CombatStatStrip(cockpit)}
      <div class="v009-combat-stage region-blackwater">
        ${v009ActionBanner(actionLabel, actionSource?.side || "")}
        ${v009TriggerBanner(state.battle?.triggerBanner)}
        ${v009StageFxTemplate(state.battle?.stageFx)}
        <div class="v009-combat-side player-side">
          ${v009MechanicMeter(actor)}
          <div class="v009-combat-avatar player ${actor ? "has-art" : ""} ${actor ? fxClass(actor) : ""}"${actor ? fxStyle(actor) : ""}>
            ${actor ? `<img src="${escapeHtml(v009CombatPortraitUrl(actor))}" alt="">` : "玩家<br>角色"}
          </div>
        </div>
        <div class="v009-action-lane" aria-hidden="true"></div>
        <div class="v009-combat-side enemy">
          <div class="v009-enemy-formation">
            ${v009EnemyStageUnits(cockpit.enemies, actionSource, actionLabel)}
          </div>
        </div>
      </div>
      ${v009VersusVitals(actor, primaryEnemy)}
    </section>
  `;
}

function v009CombatStatStrip(cockpit) {
  if (!cockpit?.inBattle) return "";
  const stats = cockpit.combatStats || { maxSingleDamage: 0, averageTurnDamage: 0 };
  return `
    <div class="v009-combat-stat-strip">
      <span><b>最大單下</b><strong>${compactWanNumber(Math.floor(stats.maxSingleDamage || 0))}</strong></span>
      <span><b>回合均傷</b><strong>${compactWanNumber(Math.floor(stats.averageTurnDamage || 0))}</strong></span>
    </div>
  `;
}

function v009EnemyCornerLabel(enemy) {
  if (!enemy) return "";
  return `
    <div class="v009-enemy-corner-label">
      <b>${escapeHtml(enemy.name)}</b>
      <span>Lv${enemy.level || 1}</span>
    </div>
  `;
}

function v009PrimaryEnemy(cockpit, actionSource = null) {
  if (!cockpit?.enemies?.length) return null;
  if (actionSource?.side === "enemy") {
    const actingEnemy = cockpit.enemies.find((enemy) => enemy.id === actionSource.id || enemy.name === actionSource.name);
    if (actingEnemy) return actingEnemy;
  }
  return cockpit.enemies.find((enemy) => enemy.hp > 0) || cockpit.enemies[0] || null;
}

function v009VersusVitals(actor, enemy) {
  return `
    <div class="v009-versus-vitals">
      ${v009FighterVitals(actor, "player")}
      <div class="v009-versus-gap" aria-hidden="true"></div>
      ${v009FighterVitals(enemy, "enemy")}
    </div>
  `;
}

function v009FighterVitals(unit, side) {
  if (!unit) {
    return `
      <div class="v009-versus-card ${side} empty">
        ${v009FightHpBar(0, 1, side === "enemy", 0)}
        <div class="v009-status-tags empty" aria-hidden="true"></div>
      </div>
    `;
  }
  const hp = displayHpValue(unit.hp);
  const maxHp = Math.max(1, Math.floor(unit.maxHp || 1));
  return `
    <div class="v009-versus-card ${side}">
      <div class="v009-versus-hp-value">${hp}/${maxHp}</div>
      ${v009FightHpBar(hp, maxHp, side === "enemy", unit.shield)}
      ${v009CombatStatusTags(unit, side)}
    </div>
  `;
}

function v009MechanicMeter(actor) {
  if (!actor) return `<div class="v009-mechanic-meter empty"></div>`;
  const data = classResourceData(actor.classId);
  if (data.combat === false) return `<div class="v009-mechanic-meter empty"></div>`;
  const max = Math.max(1, Math.floor(actor.maxResource || data.max || 100));
  const value = Math.max(0, Math.min(max, Math.floor(actor.resource || 0)));
  if (actor.classId === "furnace") {
    return `
      <div class="v009-mechanic-meter mechanic-${actor.classId} mark-meter">
        <b>${data.label}</b>
        <div class="v009-mark-pips">${Array.from({ length: max }, (_, index) => `<i class="${index < value ? "active" : ""}"></i>`).join("")}</div>
      </div>
    `;
  }
  if (actor.classId === "wangchuan") {
    const seals = actor.wangSeals || {};
    return `
      <div class="v009-mechanic-meter mechanic-${actor.classId} seal-meter">
        <b>${data.label}</b>
        <div class="v009-seal-pips">
          <i class="seal-body ${seals.body ? "active" : ""}" title="破體"></i>
          <i class="seal-soul ${seals.soul ? "active" : ""}" title="斷魂"></i>
          <i class="seal-spirit ${seals.spirit ? "active" : ""}" title="裂魄"></i>
        </div>
      </div>
    `;
  }
  if (actor.classId === "leishi") {
    return `
      <div class="v009-mechanic-meter mechanic-${actor.classId} ammo-meter">
        <b>${data.label}</b>
        <div class="v009-ammo-pips">${Array.from({ length: max }, (_, index) => `<i class="${index < value ? "active" : ""}"></i>`).join("")}</div>
      </div>
    `;
  }
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const label = data.label;
  const pips = max <= 10
    ? `<div class="v009-mechanic-pips">${Array.from({ length: max }, (_, index) => `<i class="${index < value ? "active" : ""}"></i>`).join("")}</div>`
    : "";
  return `
    <div class="v009-mechanic-meter mechanic-${actor.classId}">
      <b>${label}</b>
      <div class="v009-mechanic-bar"><i style="height:${pct.toFixed(1)}%"></i></div>
      <em>${value}/${max}</em>
      ${pips}
    </div>
  `;
}

function v009ActiveActionBanner(battle) {
  const banner = battle?.actionBanner || null;
  if (!banner || !banner.label) return null;
  if (banner.expiresAt && Date.now() >= banner.expiresAt) return null;
  return banner;
}

function v009ActionBanner(label, side = "") {
  if (!label || label === "交戰中") return "";
  const sideClass = side ? ` side-${escapeHtml(side)}` : "";
  return `<div class="v009-action-banner${sideClass}">${escapeHtml(label)}</div>`;
}

function v009TriggerBanner(banner) {
  if (!banner || !banner.label || (banner.ttl || 0) <= 0) return "";
  const sideClass = banner.side ? ` side-${escapeHtml(banner.side)}` : "";
  const ageMs = Math.max(0, Date.now() - (banner.startedAt || Date.now()));
  return `<div class="v009-trigger-banner${sideClass}" style="--v009-trigger-banner-age:${Math.round(ageMs)}ms"><span>觸發</span><b>${escapeHtml(banner.label)}</b></div>`;
}

function v009StageFxTemplate(fx) {
  return `<canvas class="v009-stage-fx-canvas" aria-hidden="true"></canvas>`;
}

function v009StageFxDurationMs(hits = 1) {
  const count = Math.max(1, Math.min(6, Math.floor(hits || 1)));
  return 720 + (count - 1) * 90;
}

function v009StageFxExpired(fx) {
  return !!fx?.expiresAt && Date.now() >= fx.expiresAt;
}

const V009_STAGE_FX_COLORS = {
  aqua: "#67f4ff",
  gold: "#ffd35f",
  orange: "#ff9a2e",
  green: "#66ffb0",
  red: "#ff324a",
  darkred: "#8b1020",
  darkgreen: "#1f9b55",
  purple: "#b26dff",
  purple2: "#6b2cff",
  sealBody: "#ff5f78",
  sealSoul: "#66d8ff",
  sealSpirit: "#c999ff",
  whitegold: "#fff1b6",
  white: "#ffffff",
};

const V009_STAGE_FX_RUNTIME = {
  forms: [],
  sparks: [],
  rings: [],
  raf: 0,
  last: 0,
  lastErrorAt: 0,
  canvas: null,
  ctx: null,
};

function v009StageFxCanvas() {
  const canvas = document.querySelector(".v009-stage-fx-canvas");
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr));
  const height = Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr));
  if (canvas.width !== width || canvas.height !== height || V009_STAGE_FX_RUNTIME.canvas !== canvas) {
    canvas.width = width;
    canvas.height = height;
    V009_STAGE_FX_RUNTIME.canvas = canvas;
    V009_STAGE_FX_RUNTIME.ctx = canvas.getContext("2d");
  }
  if (V009_STAGE_FX_RUNTIME.ctx) {
    V009_STAGE_FX_RUNTIME.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return canvas;
}

function v009StageFxCanvasScale(canvas) {
  const rect = canvas?.getBoundingClientRect();
  const width = Math.max(1, canvas?.clientWidth || 1);
  return rect?.width ? rect.width / width : 1;
}

function v009StageFxNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function v009StageFxPositive(value, fallback = 1) {
  const numeric = v009StageFxNumber(value, fallback);
  return numeric > 0 ? numeric : fallback;
}

function v009StageFxColor(color, fallback = V009_STAGE_FX_COLORS.white) {
  return typeof color === "string" && color ? color : fallback;
}

function v009NormalizeStageFxForm(form) {
  if (!form || typeof form !== "object" || typeof form.type !== "string") return null;
  const life = v009StageFxPositive(form.life, 1);
  const maxLife = Math.max(life, v009StageFxPositive(form.maxLife ?? life, life));
  return {
    ...form,
    life,
    maxLife,
    color: v009StageFxColor(form.color),
  };
}

function v009ReportStageFxError(error, label = "runtime") {
  const fx = V009_STAGE_FX_RUNTIME;
  const now = Date.now();
  if (now - fx.lastErrorAt < 1200) return;
  fx.lastErrorAt = now;
  console.warn(`[v009 fx] skipped broken ${label} effect`, error);
}

function v009RoundRectPath(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.max(0, Math.min(radius || 0, Math.abs(width) * 0.5, Math.abs(height) * 0.5));
  const right = x + width;
  const bottom = y + height;
  ctx.moveTo(x + r, y);
  ctx.lineTo(right - r, y);
  ctx.quadraticCurveTo(right, y, right, y + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(x + r, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function v009StageFxPoint(canvas, side, role) {
  const w = Math.max(1, canvas.clientWidth || 1);
  const h = Math.max(1, canvas.clientHeight || 1);
  const player = {
    source: { x: w * 0.33, y: h * 0.58 },
    mid: { x: w * 0.51, y: h * 0.52 },
    target: { x: w * 0.72, y: h * 0.50 },
  };
  const enemy = {
    source: { x: w * 0.70, y: h * 0.50 },
    mid: { x: w * 0.50, y: h * 0.54 },
    target: { x: w * 0.33, y: h * 0.58 },
  };
  const map = side === "enemy" ? enemy : player;
  return map[role] || map.target;
}

function v009StageFxUnitCenterPoint(canvas, side) {
  if (!canvas) return null;
  const selector = side === "enemy"
    ? ".v009-enemy-unit:not(.dead) img, .v009-enemy-unit img"
    : ".v009-combat-avatar.player img, .v009-combat-avatar.player";
  const unit = document.querySelector(selector);
  if (!unit) return null;
  const canvasRect = canvas.getBoundingClientRect();
  const unitRect = unit.getBoundingClientRect();
  if (!canvasRect.width || !canvasRect.height || !unitRect.width || !unitRect.height) return null;
  const scale = v009StageFxCanvasScale(canvas);
  return {
    x: (unitRect.left - canvasRect.left + unitRect.width * 0.5) / scale,
    y: (unitRect.top - canvasRect.top + unitRect.height * 0.5) / scale,
  };
}

function v009StageFxSequenceVariation(index = 0, count = 1) {
  const total = Math.max(1, Number(count) || 1);
  if (total <= 1) {
    return {
      source: { x: 0, y: 0 },
      mid: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      angle: 0,
    };
  }
  const lane = Number(index || 0) - (total - 1) / 2;
  const yLane = lane * 14;
  const randomX = () => Math.round(Math.random() * 16 - 8);
  const randomY = (scale = 1) => Math.round((Math.random() * 12 - 6) * scale);
  return {
    source: { x: randomX() * 0.5, y: yLane * 0.35 + randomY(0.5) },
    mid: { x: randomX(), y: yLane * 0.75 + randomY() },
    target: { x: randomX(), y: yLane + randomY(1.15) },
    angle: (Math.random() * 0.22 - 0.11) + lane * 0.035,
  };
}

function v009OffsetPoint(point, offset) {
  return {
    x: point.x + (offset?.x || 0),
    y: point.y + (offset?.y || 0),
  };
}

function v009AddStageFxForm(form) {
  const normalized = v009NormalizeStageFxForm(form);
  if (!normalized) return;
  V009_STAGE_FX_RUNTIME.forms.push(normalized);
  v009StartStageFxLoop();
}

function v009AddStageFxBurst(x, y, color, count, power, size, life, spread = Math.PI * 2, dir = -Math.PI / 2, opacity = 1) {
  const fx = V009_STAGE_FX_RUNTIME;
  const safeX = v009StageFxNumber(x, NaN);
  const safeY = v009StageFxNumber(y, NaN);
  if (!Number.isFinite(safeX) || !Number.isFinite(safeY)) return;
  const safeCount = Math.max(0, Math.min(120, Math.floor(v009StageFxNumber(count, 0))));
  const safePower = v009StageFxPositive(power, 1);
  const safeSize = v009StageFxPositive(size, 1);
  const safeLife = v009StageFxPositive(life, 1);
  const safeSpread = v009StageFxPositive(spread, Math.PI * 2);
  const safeDir = v009StageFxNumber(dir, -Math.PI / 2);
  const safeColor = v009StageFxColor(color);
  const safeOpacity = Math.max(0, Math.min(1, v009StageFxNumber(opacity, 1)));
  for (let i = 0; i < safeCount; i += 1) {
    const angle = safeDir - safeSpread / 2 + Math.random() * safeSpread;
    const p = safePower * (0.55 + Math.random() * 0.85);
    fx.sparks.push({
      x: safeX,
      y: safeY,
      vx: Math.cos(angle) * p,
      vy: Math.sin(angle) * p,
      color: safeColor,
      size: safeSize * (0.65 + Math.random() * 0.8),
      life: safeLife,
      maxLife: safeLife,
      drag: 0.92 + Math.random() * 0.04,
      opacity: safeOpacity,
    });
  }
  v009StartStageFxLoop();
}

function v009AddStageFxLineBurst(x, y, color, count, length, spread, dir, life) {
  const fx = V009_STAGE_FX_RUNTIME;
  const safeX = v009StageFxNumber(x, NaN);
  const safeY = v009StageFxNumber(y, NaN);
  if (!Number.isFinite(safeX) || !Number.isFinite(safeY)) return;
  const safeCount = Math.max(0, Math.min(120, Math.floor(v009StageFxNumber(count, 0))));
  const safeLength = v009StageFxPositive(length, 1);
  const safeSpread = v009StageFxPositive(spread, Math.PI * 2);
  const safeDir = v009StageFxNumber(dir, -Math.PI / 2);
  const safeLife = v009StageFxPositive(life, 1);
  const safeColor = v009StageFxColor(color);
  for (let i = 0; i < safeCount; i += 1) {
    const angle = safeDir - safeSpread / 2 + Math.random() * safeSpread;
    const p = 5.4 + Math.random() * 7.2;
    fx.sparks.push({
      x: safeX,
      y: safeY,
      vx: Math.cos(angle) * p,
      vy: Math.sin(angle) * p,
      color: safeColor,
      size: 3.4 + Math.random() * safeLength,
      life: safeLife,
      maxLife: safeLife,
      drag: 0.9 + Math.random() * 0.04,
    });
  }
  v009StartStageFxLoop();
}

function v009PersistentBattleFxActive() {
  return !!state.battle?.allies?.some((ally) => ally?.hp > 0 && ally.vajraReflectReady);
}

function v009AddStageFxRing(x, y, color, radius, life, width) {
  const safeX = v009StageFxNumber(x, NaN);
  const safeY = v009StageFxNumber(y, NaN);
  if (!Number.isFinite(safeX) || !Number.isFinite(safeY)) return;
  const safeLife = v009StageFxPositive(life, 1);
  V009_STAGE_FX_RUNTIME.rings.push({
    x: safeX,
    y: safeY,
    color: v009StageFxColor(color),
    radius: v009StageFxPositive(radius, 1),
    life: safeLife,
    maxLife: safeLife,
    width: v009StageFxPositive(width, 1),
  });
  v009StartStageFxLoop();
}

function v009StartStageFxLoop() {
  const fx = V009_STAGE_FX_RUNTIME;
  if (fx.raf) return;
  fx.last = performance.now();
  fx.raf = requestAnimationFrame(v009TickStageFxCanvas);
}

function emitV009StageCanvasFx(kind, side = "player", hits = 1) {
  const config = V009_ATTACK_FX_CONFIG[kind];
  if (!config) return;
  const canvas = v009StageFxCanvas();
  if (!canvas) return;
  const count = Math.max(1, Math.min(6, Math.floor(hits || 1)));
  for (let i = 0; i < count; i += 1) {
    setTimeout(() => emitV009StageCanvasFxOne(config, side === "enemy" ? "enemy" : "player", { index: i, count }), i * 86);
  }
  v009StartStageFxLoop();
}

function emitV009StageCanvasFxOne(config, side, sequence = null) {
  const canvas = v009StageFxCanvas();
  if (!canvas) return;
  const variation = v009StageFxSequenceVariation(sequence?.index || 0, sequence?.count || 1);
  const source = v009OffsetPoint(v009StageFxPoint(canvas, side, "source"), variation.source);
  const mid = v009OffsetPoint(v009StageFxPoint(canvas, side, "mid"), variation.mid);
  const target = v009OffsetPoint(v009StageFxPoint(canvas, side, "target"), variation.target);
  const color = V009_STAGE_FX_COLORS[config.tone] || V009_STAGE_FX_COLORS.gold;
  const color2 = config.tone === "purple" ? V009_STAGE_FX_COLORS.purple2 : color;
  const mirror = side === "enemy";
  const angle = Math.atan2(target.y - source.y, target.x - source.x) + variation.angle;

  if (config.family === "punch") {
    v009AddStageFxForm({ type: "punch", x1: source.x, y1: source.y, x2: mid.x, y2: mid.y, life: 420, maxLife: 420, color });
    setTimeout(() => {
      if (config.hit === "crit") v009ImpactCrit(target.x, target.y, color);
      else v009ImpactPunch(target.x, target.y, color, mirror);
    }, 285);
    return;
  }

  if (config.family === "selfCrit") {
    const self = v009StageFxUnitCenterPoint(canvas, side) || source;
    v009ImpactCritScaled(self.x, self.y, color, config.scale || 1);
    return;
  }

  if (config.family === "vajraReflect") {
    const hover = v009VajraHoverPoint(canvas, side);
    v009AddStageFxForm({ type: "vajraPunchRelease", x1: hover.x, y1: hover.y, x2: target.x, y2: target.y, life: 390, maxLife: 390, color });
    setTimeout(() => v009ImpactCrit(target.x, target.y, color), 260);
    return;
  }

  if (config.family === "directSword") {
    v009AddStageFxForm({
      type: "directSword",
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      life: 507,
      maxLife: 507,
      color,
      scale: 0.8,
      trail: [],
    });
    setTimeout(() => v009ImpactCrit(target.x, target.y, color), 333);
    return;
  }

  if (config.family === "slash") {
    v009AddStageFxForm({
      type: "swordArc",
      pivotX: mirror ? mid.x + 39 : mid.x - 39,
      pivotY: mid.y + 39,
      life: 280,
      maxLife: 280,
      color,
      mirror,
      scale: 0.5,
      angleOffset: variation.angle,
      cuts: [],
    });
    setTimeout(() => {
      if (mirror) v009ImpactPunch(target.x, target.y, V009_STAGE_FX_COLORS.darkred, true);
      else v009ImpactSlash(target.x, target.y, color, false);
    }, 155);
    return;
  }

  if (config.family === "needle") {
    const fireStart = {
      x: mid.x - Math.cos(angle) * 42,
      y: mid.y - Math.sin(angle) * 42,
    };
    const fireAngle = Math.atan2(target.y - fireStart.y, target.x - fireStart.x);
    v009AddStageFxForm({ type: "throwArc", x: source.x, y: source.y, angle: fireAngle, life: 360, maxLife: 360, color, mirror });
    v009AddStageFxForm({ type: "needleFire", x1: fireStart.x, y1: fireStart.y, x2: target.x, y2: target.y, life: 400, maxLife: 400, color });
    setTimeout(() => v009ImpactNeedle(target.x, target.y, color, mirror, fireAngle, v009NeedleHitOptions(target.x, target.y, fireAngle)), 400);
    return;
  }

  if (config.family === "needleTriple") {
    const baseFireStart = {
      x: mid.x - Math.cos(angle) * 42,
      y: mid.y - Math.sin(angle) * 42,
    };
    [
      { dy: -18, opacity: 0.42 },
      { dy: 0, opacity: 1 },
      { dy: 18, opacity: 0.56 },
    ].forEach((layer) => {
      const layerSource = { x: source.x, y: source.y + layer.dy * 0.35 };
      const layerFireStart = { x: baseFireStart.x, y: baseFireStart.y + layer.dy };
      const layerTarget = { x: target.x, y: target.y + layer.dy };
      const fireAngle = Math.atan2(layerTarget.y - layerFireStart.y, layerTarget.x - layerFireStart.x);
      v009AddStageFxForm({ type: "throwArc", x: layerSource.x, y: layerSource.y, angle: fireAngle, life: 360, maxLife: 360, color, mirror, opacity: layer.opacity });
      v009AddStageFxForm({ type: "needleFire", x1: layerFireStart.x, y1: layerFireStart.y, x2: layerTarget.x, y2: layerTarget.y, life: 400, maxLife: 400, color, opacity: layer.opacity });
      setTimeout(() => v009ImpactNeedle(layerTarget.x, layerTarget.y, color, mirror, fireAngle, { ...v009NeedleHitOptions(layerTarget.x, layerTarget.y, fireAngle), opacity: layer.opacity }), 400);
    });
    return;
  }

  if (config.family === "gun") {
    v009AddStageFxForm({ type: "gunFire", x1: source.x, y1: source.y, x2: target.x, y2: target.y, life: 360, maxLife: 360, color, mirror });
    setTimeout(() => v009ImpactCrit(target.x, target.y, color), 185);
    return;
  }

  if (config.family === "beam") {
    v009AddStageFxForm({ type: "energyBeam", x1: source.x, y1: source.y, x2: target.x, y2: target.y, life: 520, maxLife: 520, color, color2 });
    setTimeout(() => v009ImpactCrit(target.x, target.y, color), 350);
    return;
  }

  if (config.family === "lifeDeathSeal") {
    setTimeout(() => v009ImpactLifeDeathSeals(target.x, target.y), 260);
    return;
  }

  if (config.family === "energy") {
    v009AddStageFxForm({ type: "energyBall", x1: source.x, y1: source.y, x2: target.x, y2: target.y, life: 720, maxLife: 720, color, trail: [] });
    setTimeout(() => v009ImpactPunch(target.x, target.y, color, mirror), 520);
    return;
  }

  if (config.family === "bite") {
    v009AddStageFxForm({ type: "bite", x: target.x, y: target.y, angle: mirror ? Math.PI : 0, life: 430, maxLife: 430, color });
    setTimeout(() => v009ImpactPunch(target.x, target.y, V009_STAGE_FX_COLORS.darkred, true), 245);
    return;
  }

  if (config.family === "crescent") {
    const x1 = Math.max(source.x - 16, 82);
    const y1 = source.y + 56;
    const x2 = Math.min(x1 + 260, canvas.clientWidth - 82);
    const y2 = Math.max(82, y1 - 72);
    v009AddStageFxForm({ type: "crescentKick", x1, y1, x2, y2, life: 210, maxLife: 210, color, trail: [] });
    setTimeout(() => v009ImpactCrit(target.x, target.y, color), 145);
  }
}

function v009ImpactPunch(x, y, color, mirror = false) {
  v009AddStageFxForm({ type: "punchImpact", x, y, life: 360, maxLife: 360, color, angle: (mirror ? Math.PI : 0) - 0.12 + Math.random() * 0.24 });
  v009AddStageFxBurst(x, y, color, 28, 7.4, 4.8, 460, Math.PI * 1.1, mirror ? 0 : Math.PI);
  v009AddStageFxBurst(x, y, V009_STAGE_FX_COLORS.white, 10, 4.2, 3.4, 260);
  v009AddStageFxLineBurst(x, y, color, 16, 5.6, Math.PI * 0.72, mirror ? 0 : Math.PI, 340);
  v009AddStageFxRing(x, y, color, 7, 300, 5);
}

function v009ImpactCrit(x, y, color) {
  v009AddStageFxBurst(x, y, color, 70, 9.4, 8.5, 880);
  v009AddStageFxBurst(x, y, V009_STAGE_FX_COLORS.white, 34, 5.8, 5.2, 520);
  v009AddStageFxRing(x, y, color, 18, 640, 8);
  v009AddStageFxRing(x, y, V009_STAGE_FX_COLORS.white, 8, 320, 4);
}

function v009ImpactCritScaled(x, y, color, scale = 1) {
  const s = Math.max(0.5, Math.min(3, Number(scale) || 1));
  v009AddStageFxBurst(x, y, color, 70, 9.4 * s, 8.5 * s, 880);
  v009AddStageFxBurst(x, y, V009_STAGE_FX_COLORS.white, 34, 5.8 * s, 5.2 * s, 520);
  v009AddStageFxRing(x, y, color, 18 * s, 640, 8 * s);
  v009AddStageFxRing(x, y, V009_STAGE_FX_COLORS.white, 8 * s, 320, 4 * s);
}

function v009ImpactLifeDeathSeals(x, y) {
  [
    { color: V009_STAGE_FX_COLORS.sealBody, dx: -18, dy: -10, delay: 0 },
    { color: V009_STAGE_FX_COLORS.sealSoul, dx: 16, dy: 0, delay: 46 },
    { color: V009_STAGE_FX_COLORS.sealSpirit, dx: 0, dy: 16, delay: 92 },
  ].forEach((seal) => {
    setTimeout(() => v009ImpactCrit(x + seal.dx, y + seal.dy, seal.color), seal.delay);
  });
}

function v009ImpactSlash(x, y, color, mirror = false) {
  const angle = mirror ? Math.PI + 0.58 : -0.58;
  v009AddStageFxForm({ type: "slashMark", x, y, life: 620, maxLife: 620, color, angle, shake: 1 });
  v009AddStageFxBurst(x, y, color, 28, 6.8, 4.8, 520, Math.PI * 0.82, angle - Math.PI / 2);
  v009AddStageFxBurst(x, y, V009_STAGE_FX_COLORS.white, 12, 4.2, 3.6, 300);
  v009AddStageFxRing(x, y, color, 12, 420, 5);
}

function v009NeedleHitOptions(x, y, angle) {
  return {
    hitX: x + Math.cos(angle) * 34,
    hitY: y + Math.sin(angle) * 34,
  };
}

function v009ImpactNeedle(x, y, color, mirror = false, angleOverride = null, options = {}) {
  const angle = Number.isFinite(angleOverride) ? angleOverride : (mirror ? 0.08 : Math.PI + 0.08);
  const opacity = Math.max(0, Math.min(1, v009StageFxNumber(options.opacity, 1)));
  const burstScale = Math.max(0.35, opacity);
  const hitX = Number.isFinite(options.hitX) ? options.hitX : x + Math.cos(angle) * 30;
  const hitY = Number.isFinite(options.hitY) ? options.hitY : y + Math.sin(angle) * 30;
  const centerX = hitX - Math.cos(angle) * 30;
  const centerY = hitY - Math.sin(angle) * 30;
  v009AddStageFxForm({ type: "needleStuck", x: centerX, y: centerY, life: 620, maxLife: 620, color, angle, shake: 1, opacity });
  v009AddStageFxForm({ type: "needleTailPulse", x: hitX, y: hitY, life: 360, maxLife: 360, color, opacity });
  v009AddStageFxBurst(hitX, hitY, color, Math.max(5, Math.round(18 * opacity)), 4.8 * burstScale, 3.4 * burstScale, 440, Math.PI * 1.0, angle, opacity);
  v009AddStageFxBurst(hitX, hitY, V009_STAGE_FX_COLORS.white, Math.max(2, Math.round(6 * opacity)), 2.8 * burstScale, 2.2 * burstScale, 220, Math.PI * 2, -Math.PI / 2, opacity);
}

function v009DrawStageFxForm(ctx, f, t, dt) {
  if (f.type === "punch") v009DrawPunchForm(ctx, f, t);
  if (f.type === "hoverPunch") v009DrawHoverPunchForm(ctx, f, t);
  if (f.type === "vajraPunchRelease") v009DrawVajraPunchReleaseForm(ctx, f, t);
  if (f.type === "gunFire") v009DrawGunFireForm(ctx, f, t);
  if (f.type === "throwArc") v009DrawThrowArcForm(ctx, f, t);
  if (f.type === "crescentKick") v009DrawCrescentKickForm(ctx, f, t, dt);
  if (f.type === "needleFire") v009DrawNeedleFireForm(ctx, f, t);
  if (f.type === "energyBall") v009DrawEnergyBallForm(ctx, f, t, dt);
  if (f.type === "energyBeam") v009DrawEnergyBeamForm(ctx, f, t);
  if (f.type === "bite") v009DrawBiteForm(ctx, f, t);
  if (f.type === "directSword") v009DrawDirectSwordForm(ctx, f, t, dt);
  if (f.type === "swordArc") v009DrawSwordArcForm(ctx, f, t, dt);
  if (f.type === "slashSwing") v009DrawSlashSwingForm(ctx, f, t);
  if (f.type === "slashMark") v009DrawSlashMarkForm(ctx, f, t);
  if (f.type === "needleStuck") v009DrawNeedleStuckForm(ctx, f, t);
  if (f.type === "needleTailPulse") v009DrawNeedleTailPulseForm(ctx, f, t);
  if (f.type === "punchImpact") v009DrawPunchImpactForm(ctx, f, t);
}

function v009TickStageFxCanvas(now) {
  const fx = V009_STAGE_FX_RUNTIME;
  const canvas = v009StageFxCanvas();
  if (!canvas || !fx.ctx) {
    fx.raf = 0;
    return;
  }
  const ctx = fx.ctx;
  const dt = Math.max(0, Math.min(34, now - (fx.last || now)));
  fx.last = now;
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();
  try {
    ctx.globalCompositeOperation = "lighter";

    for (let i = fx.sparks.length - 1; i >= 0; i -= 1) {
      const s = fx.sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        fx.sparks.splice(i, 1);
        continue;
      }
      s.vx *= s.drag;
      s.vy *= s.drag;
      s.x += s.vx * dt / 16.67;
      s.y += s.vy * dt / 16.67;
      if (!Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.life) || !Number.isFinite(s.maxLife)) {
        fx.sparks.splice(i, 1);
        continue;
      }
      const a = Math.max(0, Math.min(1, s.life / Math.max(1, s.maxLife))) * Math.max(0, Math.min(1, v009StageFxNumber(s.opacity, 1)));
      ctx.globalAlpha = a;
      v009DrawGlowDot(ctx, s.x, s.y, s.color, s.size * (2.2 - a * 0.3), a);
    }

    for (let i = fx.rings.length - 1; i >= 0; i -= 1) {
      const r = fx.rings[i];
      r.life -= dt;
      if (r.life <= 0) {
        fx.rings.splice(i, 1);
        continue;
      }
      if (!Number.isFinite(r.x) || !Number.isFinite(r.y) || !Number.isFinite(r.life) || !Number.isFinite(r.maxLife)) {
        fx.rings.splice(i, 1);
        continue;
      }
      const p = Math.max(0, Math.min(1, 1 - r.life / Math.max(1, r.maxLife)));
      ctx.globalAlpha = (1 - p) * 0.88;
      ctx.strokeStyle = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = Math.max(0.5, r.width * (1 - p * 0.38));
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(0.5, r.radius + p * 56), 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = fx.forms.length - 1; i >= 0; i -= 1) {
      const f = fx.forms[i];
      f.life -= dt;
      if (f.life <= 0) {
        fx.forms.splice(i, 1);
        continue;
      }
      if (!Number.isFinite(f.life) || !Number.isFinite(f.maxLife)) {
        fx.forms.splice(i, 1);
        continue;
      }
      const t = Math.max(0, Math.min(1, f.life / Math.max(1, f.maxLife)));
      try {
        v009DrawStageFxForm(ctx, f, t, dt);
      } catch (error) {
        fx.forms.splice(i, 1);
        v009ReportStageFxError(error, f.type);
      }
    }

    try {
      v009DrawPersistentBattleFx(ctx, canvas, dt);
    } catch (error) {
      v009ReportStageFxError(error, "persistent");
    }
  } catch (error) {
    v009ReportStageFxError(error, "runtime");
  } finally {
    ctx.restore();
  }
  if (fx.forms.length || fx.sparks.length || fx.rings.length || v009PersistentBattleFxActive()) {
    fx.raf = requestAnimationFrame(v009TickStageFxCanvas);
  } else {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    fx.raf = 0;
  }
}

function v009DrawPersistentBattleFx(ctx, canvas, dt) {
  if (!v009PersistentBattleFxActive()) return;
  const color = V009_STAGE_FX_COLORS.gold;
  const t = (performance.now() % 1280) / 1280;
  const point = v009VajraHoverPoint(canvas, "player");
  const bob = Math.sin(t * Math.PI * 2) * 7;
  ctx.save();
  ctx.translate(point.x, point.y + bob);
  ctx.rotate(-0.12 + Math.sin(t * Math.PI * 2) * 0.04);
  ctx.scale(0.34, 0.34);
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = color;
  ctx.shadowBlur = 34;
  v009DrawFistShape(ctx, color, 0.88);
  ctx.restore();
  v009DrawGlowDot(ctx, point.x, point.y + bob, color, 52, 0.28);
}

function v009VajraHoverPoint(canvas, side = "player") {
  const w = Math.max(1, canvas.clientWidth || 1);
  const h = Math.max(1, canvas.clientHeight || 1);
  if (side === "enemy") return { x: w * 0.70, y: h * 0.34 };
  return { x: w * 0.31, y: h * 0.35 };
}

function v009DrawGlowDot(ctx, x, y, color, size, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, size);
  g.addColorStop(0, `${color}ff`);
  g.addColorStop(0.32, `${color}${Math.floor(190 * alpha).toString(16).padStart(2, "0")}`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function v009DrawSlashLine(ctx, x, y, angle, color, length, width, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  const grad = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
  grad.addColorStop(0, `${color}00`);
  grad.addColorStop(0.28, color);
  grad.addColorStop(0.52, "#ffffff");
  grad.addColorStop(0.76, color);
  grad.addColorStop(1, `${color}00`);
  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-length / 2, 0);
  ctx.lineTo(length / 2, 0);
  ctx.stroke();
  ctx.restore();
}

function v009DrawFistShape(ctx, color, alpha) {
  const outline = ctx.createLinearGradient(-170, 0, 110, 0);
  outline.addColorStop(0, `${color}18`);
  outline.addColorStop(0.34, `${color}74`);
  outline.addColorStop(0.72, "#fff1aa");
  outline.addColorStop(1, color);
  ctx.fillStyle = outline;
  ctx.strokeStyle = "#fff4b8";
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-168, -31);
  ctx.lineTo(-94, -35);
  ctx.quadraticCurveTo(-48, -36, -18, -12);
  ctx.quadraticCurveTo(-1, -42, 34, -53);
  ctx.quadraticCurveTo(58, -60, 68, -38);
  ctx.quadraticCurveTo(76, -18, 101, -8);
  ctx.quadraticCurveTo(119, 1, 98, 15);
  ctx.quadraticCurveTo(107, 34, 75, 43);
  ctx.quadraticCurveTo(77, 62, 47, 66);
  ctx.quadraticCurveTo(44, 84, 8, 78);
  ctx.quadraticCurveTo(-13, 75, -30, 62);
  ctx.quadraticCurveTo(-69, 58, -105, 48);
  ctx.lineTo(-168, 45);
  ctx.quadraticCurveTo(-120, 31, -74, 37);
  ctx.quadraticCurveTo(-28, 43, 10, 43);
  ctx.quadraticCurveTo(34, 44, 45, 31);
  ctx.quadraticCurveTo(70, 31, 76, 12);
  ctx.quadraticCurveTo(50, 6, 32, -8);
  ctx.quadraticCurveTo(8, -3, -13, 11);
  ctx.quadraticCurveTo(-52, 4, -88, -3);
  ctx.quadraticCurveTo(-125, -9, -168, -31);
  ctx.closePath();
  ctx.globalAlpha = alpha * 0.42;
  ctx.fill();
  ctx.globalAlpha = alpha * 0.96;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.globalAlpha = alpha * 0.42;
  ctx.stroke();
  ctx.strokeStyle = "#fff6c7";
  ctx.lineWidth = 4;
  ctx.globalAlpha = alpha * 0.9;
  [
    [28, -10, 61, -10, 82, 2],
    [8, 15, 50, 13, 76, 23],
    [-6, 39, 34, 40, 56, 50],
    [39, -35, 45, -18, 62, -10],
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
  });
}

function v009DrawPunchForm(ctx, f, t) {
  const p = 1 - Math.pow(t, 3.2);
  const x = f.x1 + (f.x2 - f.x1) * p;
  const y = f.y1 + (f.y2 - f.y1) * p;
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const alpha = Math.sin((1 - t) * Math.PI);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(0.62, 0.62);
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 38;
  for (let i = 3; i >= 1; i -= 1) {
    ctx.save();
    ctx.translate(-i * 30, 0);
    ctx.globalAlpha = alpha * (0.12 * i);
    v009DrawFistShape(ctx, f.color, alpha * (0.26 / i));
    ctx.restore();
  }
  const smear = ctx.createLinearGradient(-210, 0, -20, 0);
  smear.addColorStop(0, `${f.color}00`);
  smear.addColorStop(0.42, `${f.color}28`);
  smear.addColorStop(1, `${f.color}78`);
  ctx.globalAlpha = alpha * 0.76;
  ctx.fillStyle = smear;
  ctx.beginPath();
  ctx.moveTo(-220, -38);
  ctx.quadraticCurveTo(-138, -52, -24, -16);
  ctx.lineTo(-18, 26);
  ctx.quadraticCurveTo(-132, 58, -220, 42);
  ctx.closePath();
  ctx.fill();
  v009DrawFistShape(ctx, f.color, alpha);
  ctx.restore();
}

function v009DrawHoverPunchForm(ctx, f, t) {
  const alpha = Math.sin((1 - t) * Math.PI);
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle || -0.12);
  ctx.scale(0.34, 0.34);
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 34;
  v009DrawFistShape(ctx, f.color, alpha);
  ctx.restore();
}

function v009DrawVajraPunchReleaseForm(ctx, f, t) {
  const p = 1 - Math.pow(t, 2.9);
  const x = f.x1 + (f.x2 - f.x1) * p;
  const y = f.y1 + (f.y2 - f.y1) * p;
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const alpha = Math.sin((1 - t) * Math.PI);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(0.46 + p * 0.16, 0.46 + p * 0.16);
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 42;
  const smear = ctx.createLinearGradient(-230, 0, -20, 0);
  smear.addColorStop(0, `${f.color}00`);
  smear.addColorStop(0.5, `${f.color}30`);
  smear.addColorStop(1, `${f.color}90`);
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = smear;
  ctx.beginPath();
  ctx.moveTo(-230, -34);
  ctx.quadraticCurveTo(-132, -54, -18, -18);
  ctx.lineTo(-15, 28);
  ctx.quadraticCurveTo(-130, 58, -230, 40);
  ctx.closePath();
  ctx.fill();
  v009DrawFistShape(ctx, f.color, alpha);
  ctx.restore();
}

function v009DrawPunchImpactForm(ctx, f, t) {
  const p = 1 - t;
  const alpha = Math.sin(p * Math.PI);
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle || 0);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i += 1) {
    const a = -1.1 + i * 0.36;
    const len = 24 + p * 46 + (i % 2) * 10;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();
}

function v009DrawGunFireForm(ctx, f, t) {
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const alpha = Math.sin((1 - t) * Math.PI);
  ctx.save();
  ctx.translate(f.x1, f.y1);
  ctx.rotate(angle);
  ctx.globalAlpha = Math.min(1, alpha * 1.25);
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 36;
  const metal = ctx.createLinearGradient(-88, 0, 34, 0);
  metal.addColorStop(0, `${f.color}33`);
  metal.addColorStop(0.45, `${f.color}aa`);
  metal.addColorStop(1, "rgba(255, 246, 218, 0.95)");
  ctx.fillStyle = metal;
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  v009RoundRectPath(ctx, -84, -11, 102, 22, 5);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-42, 10);
  ctx.lineTo(-24, 46);
  ctx.lineTo(-2, 42);
  ctx.lineTo(-16, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 240, 0.9)";
  ctx.fillRect(10, -5, 20, 10);
  v009DrawMuzzlePetal(ctx, f.color, 28, 0, 132, 52, alpha * 0.82);
  v009DrawMuzzlePetal(ctx, f.color, 31, -30, 92, 20, alpha * 0.46, -0.28);
  v009DrawMuzzlePetal(ctx, f.color, 31, 30, 82, 17, alpha * 0.36, 0.24);
  ctx.restore();
}

function v009DrawMuzzlePetal(ctx, color, x, y, length, height, alpha, rotate = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.globalAlpha = alpha;
  const flame = ctx.createLinearGradient(0, 0, length, 0);
  flame.addColorStop(0, color);
  flame.addColorStop(0.56, `${color}88`);
  flame.addColorStop(1, `${color}00`);
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length * 0.28, -height * 0.46);
  ctx.lineTo(length * 0.62, -height * 0.18);
  ctx.lineTo(length, 0);
  ctx.lineTo(length * 0.62, height * 0.18);
  ctx.lineTo(length * 0.28, height * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function v009DrawThrowArcForm(ctx, f, t) {
  const p = 1 - t;
  const opacity = Math.max(0, Math.min(1, v009StageFxNumber(f.opacity, 1)));
  const alpha = Math.sin(p * Math.PI) * opacity;
  const length = 92;
  const endY = 30;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = f.color;
  ctx.lineCap = "round";
  [
    { sx: -74, sy: -48, cx: 34, cy: -46, ex: length, ey: endY, width: 6, a: 0.52 },
    { sx: -44, sy: -35, cx: 48, cy: -36, ex: length - 5, ey: endY + 3, width: 4, a: 0.42 },
    { sx: -10, sy: -25, cx: 67, cy: -29, ex: length - 10, ey: endY + 1, width: 2.4, a: 0.3 },
  ].forEach((arc) => {
    ctx.lineWidth = arc.width;
    ctx.globalAlpha = alpha * arc.a;
    ctx.beginPath();
    ctx.moveTo(arc.sx, arc.sy);
    ctx.quadraticCurveTo(arc.cx, arc.cy, arc.ex, arc.ey);
    ctx.stroke();
  });
  ctx.strokeStyle = "#effff7";
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = alpha * 0.72;
  ctx.beginPath();
  ctx.moveTo(-38, -35);
  ctx.quadraticCurveTo(48, -34, length - 4, endY + 2);
  ctx.stroke();
  v009DrawGlowDot(ctx, length, endY, f.color, 11, alpha * 0.48);
  ctx.restore();
}

function v009DrawCrescentKickForm(ctx, f, t, dt) {
  const p = Math.min(1, 1 - Math.pow(t, 2.2));
  const alpha = Math.sin((1 - t) * Math.PI);
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const length = Math.min(276, Math.hypot(f.x2 - f.x1, f.y2 - f.y1));
  const height = 104;
  f.trailSampleMs = (f.trailSampleMs || 0) + dt;
  if (!f.trail.length || f.trailSampleMs >= 32) {
    f.trail.push({ p, life: 180, maxLife: 180 });
    f.trailSampleMs = 0;
  }
  if (f.trail.length > 7) f.trail.splice(0, f.trail.length - 7);
  ctx.save();
  ctx.translate(f.x1, f.y1);
  ctx.rotate(angle);
  ctx.shadowColor = f.color;
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowBlur = 16;
  for (let i = f.trail.length - 1; i >= 0; i -= 1) {
    const tr = f.trail[i];
    tr.life -= dt;
    if (tr.life <= 0) {
      f.trail.splice(i, 1);
      continue;
    }
    const a = (tr.life / tr.maxLife) * 0.28;
    v009DrawCrescentKickPath(ctx, length, height, tr.p, f.color, a, true, 0.55);
  }
  ctx.shadowBlur = 30;
  v009DrawCrescentKickPath(ctx, length, height, p, f.color, alpha, false, 1);
  ctx.restore();
}

function v009DrawCrescentKickPath(ctx, length, height, progress, color, alpha, ghost, stepScale = 1) {
  if (length < 12 || progress <= 0) return;
  const steps = Math.max(8, Math.floor(46 * progress * Math.max(0.35, stepScale)));
  const activeStart = Math.max(0, progress - 0.34);
  let prev = v009CrescentKickPoint(length, height, activeStart);
  for (let i = 1; i <= steps; i += 1) {
    const u = activeStart + (progress - activeStart) * (i / steps);
    const cur = v009CrescentKickPoint(length, height, u);
    const local = i / steps;
    const width = (ghost ? 10 : 16) * (0.35 + local * 0.65) * (1 - Math.max(0, u - 0.88) * 1.8);
    const fade = alpha * (ghost ? 0.36 : 0.88) * (0.36 + local * 0.64);
    ctx.globalAlpha = fade * 0.42;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 13;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    ctx.globalAlpha = fade * 0.9;
    ctx.strokeStyle = "#fff8c6";
    ctx.lineWidth = Math.max(2.4, width * 0.22);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y - width * 0.12);
    ctx.lineTo(cur.x, cur.y - width * 0.12);
    ctx.stroke();
    prev = cur;
  }
  const head = v009CrescentKickPoint(length, height, progress);
  v009DrawGlowDot(ctx, head.x, head.y, color, ghost ? 12 : 20, alpha * (ghost ? 0.18 : 0.5));
}

function v009CrescentKickPoint(length, height, u) {
  const split = 0.58;
  if (u <= split) {
    const k = u / split;
    return v009CubicPoint(
      { x: 0, y: 0 },
      { x: length * 0.28, y: -height * 0.18 },
      { x: length * 0.62, y: -height * 1.18 },
      { x: length, y: -height * 0.52 },
      k,
    );
  }
  const k = (u - split) / (1 - split);
  return v009CubicPoint(
    { x: length, y: -height * 0.52 },
    { x: length * 0.78, y: -height * 0.06 },
    { x: length * 0.34, y: height * 0.08 },
    { x: length * 0.08, y: -height * 0.04 },
    k,
  );
}

function v009CubicPoint(a, b, c, d, t) {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

function v009DrawNeedleFireForm(ctx, f, t) {
  const p = 1 - Math.pow(t, 2.5);
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const x = f.x1 + (f.x2 - f.x1) * p;
  const y = f.y1 + (f.y2 - f.y1) * p;
  const opacity = Math.max(0, Math.min(1, v009StageFxNumber(f.opacity, 1)));
  const alpha = Math.sin((1 - t) * Math.PI) * opacity;
  v009DrawSlashLine(ctx, (f.x1 + x) / 2, (f.y1 + y) / 2, angle, f.color, Math.max(80, Math.hypot(x - f.x1, y - f.y1)), 3, alpha * 0.86);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = "#edfff8";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(34, 0);
  ctx.stroke();
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 7;
  ctx.globalAlpha = alpha * 0.38;
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  ctx.restore();
}

function v009DrawEnergyBallForm(ctx, f, t, dt) {
  const p = 1 - Math.pow(t, 2.45);
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const x = f.x1 + (f.x2 - f.x1) * p;
  const y = f.y1 + (f.y2 - f.y1) * p - Math.sin(p * Math.PI) * 28;
  f.trail.push({ x, y, life: 620, maxLife: 620, wobble: (Math.random() - 0.5) * 12 });
  if (f.trail.length > 34) f.trail.shift();
  for (let i = f.trail.length - 1; i >= 0; i -= 1) {
    const tr = f.trail[i];
    tr.life -= dt;
    if (tr.life <= 0) {
      f.trail.splice(i, 1);
      continue;
    }
    const a = tr.life / tr.maxLife;
    v009DrawGlowDot(ctx, tr.x - Math.cos(angle) * (18 + a * 28), tr.y + tr.wobble * (1 - a), f.color, 24 + a * 28, a * 0.45);
  }
}

function v009DrawEnergyBeamForm(ctx, f, t) {
  const p = 1 - t;
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  const length = Math.hypot(f.x2 - f.x1, f.y2 - f.y1);
  const alpha = Math.sin(p * Math.PI);
  ctx.save();
  ctx.translate(f.x1, f.y1);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 34;
  ctx.globalAlpha = alpha;
  const sourceGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 64);
  sourceGlow.addColorStop(0, "#ffffff");
  sourceGlow.addColorStop(0.22, "#e6d2ff");
  sourceGlow.addColorStop(0.52, f.color);
  sourceGlow.addColorStop(1, `${f.color}00`);
  ctx.fillStyle = sourceGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.fill();
  const beam = ctx.createLinearGradient(0, 0, length, 0);
  beam.addColorStop(0, `${f.color}00`);
  beam.addColorStop(0.12, f.color);
  beam.addColorStop(0.5, "#ffffff");
  beam.addColorStop(0.86, f.color2 || f.color);
  beam.addColorStop(1, `${f.color}00`);
  ctx.globalAlpha = alpha * 0.44;
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.82;
  ctx.strokeStyle = beam;
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(length - 10, 0);
  ctx.stroke();
  ctx.restore();
}

function v009DrawBiteForm(ctx, f, t) {
  const p = 1 - Math.pow(t, 2.4);
  const alpha = Math.sin((1 - t) * Math.PI);
  const gap = 52 - p * 35;
  const biteScale = 0.84 + p * 0.18;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle);
  ctx.scale(biteScale, biteScale);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 28;
  ctx.fillStyle = `${f.color}aa`;
  ctx.strokeStyle = "#ffd0d6";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  [-1, 1].forEach((sign) => {
    const y = sign * gap;
    const pointY = sign * 7;
    ctx.beginPath();
    ctx.moveTo(-76, y);
    ctx.quadraticCurveTo(-34, y - sign * 17, 0, y - sign * 14);
    ctx.quadraticCurveTo(34, y - sign * 17, 76, y);
    ctx.lineTo(56, pointY);
    ctx.lineTo(34, y - sign * 5);
    ctx.lineTo(18, pointY);
    ctx.lineTo(0, y - sign * 6);
    ctx.lineTo(-18, pointY);
    ctx.lineTo(-34, y - sign * 5);
    ctx.lineTo(-56, pointY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function v009DrawDirectSwordBody(ctx, color) {
  const blade = ctx.createLinearGradient(-58, 0, 98, 0);
  blade.addColorStop(0, `${color}78`);
  blade.addColorStop(0.44, "#bdfcff");
  blade.addColorStop(1, `${color}ec`);
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(110, 0);
  ctx.lineTo(58, -10);
  ctx.lineTo(-52, -8);
  ctx.lineTo(-52, 8);
  ctx.lineTo(58, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a9f8ff";
  ctx.fillRect(-74, -4, 36, 8);
  ctx.fillRect(-63, -23, 15, 46);
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.82;
  ctx.fillRect(-98, -5, 36, 10);
}

function v009DirectSwordPosition(f, p) {
  const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
  return {
    x: f.x1 + (f.x2 - f.x1) * p,
    y: f.y1 + (f.y2 - f.y1) * p - Math.sin(p * Math.PI) * 26,
    angle,
  };
}

function v009DrawDirectSwordForm(ctx, f, t, dt) {
  const p = 1 - Math.pow(t, 3);
  const pos = v009DirectSwordPosition(f, p);
  const scale = f.scale || 1;
  f.trail = Array.isArray(f.trail) ? f.trail : [];
  f.trail.push({
    x: pos.x,
    y: pos.y,
    angle: pos.angle,
    life: 260,
    maxLife: 260,
  });
  if (f.trail.length > 26) f.trail.shift();
  for (let i = f.trail.length - 1; i >= 0; i -= 1) {
    const tr = f.trail[i];
    tr.life -= dt;
    if (tr.life <= 0) {
      f.trail.splice(i, 1);
      continue;
    }
    const a = tr.life / tr.maxLife;
    ctx.globalAlpha = a * 0.55;
    v009DrawGlowDot(ctx, tr.x, tr.y, f.color, (12 + a * 10) * scale, a);
  }
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.angle);
  ctx.scale(scale, scale);
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 38 * scale;
  ctx.globalAlpha = 0.94;
  v009DrawDirectSwordBody(ctx, f.color);
  ctx.restore();
}

function v009DrawPivotSwordBody(ctx, color) {
  const blade = ctx.createLinearGradient(0, 0, 188, 0);
  blade.addColorStop(0, `${color}90`);
  blade.addColorStop(0.42, "#bdfcff");
  blade.addColorStop(1, `${color}ee`);

  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(196, 0);
  ctx.lineTo(150, -12);
  ctx.lineTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.lineTo(150, 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.82;
  ctx.fillRect(-70, -6, 46, 12);
}

function v009DrawPivotMoonTrail(ctx, f, fromAngle, toAngle, alpha, width) {
  const inner = 16;
  const outer = 224;
  const scale = f.scale || 1;
  ctx.save();
  ctx.translate(f.pivotX, f.pivotY);
  ctx.scale(f.mirror ? -scale : scale, scale);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 34 * alpha;

  const grad = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
  grad.addColorStop(0, `${f.color}00`);
  grad.addColorStop(0.55, `${f.color}${Math.floor(82 * alpha).toString(16).padStart(2, "0")}`);
  grad.addColorStop(0.82, `rgba(255,255,255,${0.52 * alpha})`);
  grad.addColorStop(1, `${f.color}00`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, outer, fromAngle, toAngle, false);
  ctx.arc(0, 0, inner + 34, toAngle, fromAngle, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function v009DrawSwordArcForm(ctx, f, t, dt) {
  const progress = Math.min(1, (1 - Math.pow(t, 4.2)) * 1.16);
  const startAngle = -Math.PI / 2;
  const endAngle = 0.06;
  const angle = startAngle + (endAngle - startAngle) * progress + (f.angleOffset || 0);
  const fromAngle = Math.max(startAngle, angle - 0.48);
  v009DrawPivotMoonTrail(ctx, f, fromAngle, angle, Math.sin((1 - t) * Math.PI), 34);

  const scale = f.scale || 1;
  ctx.save();
  ctx.translate(f.pivotX, f.pivotY);
  ctx.scale(f.mirror ? -scale : scale, scale);
  ctx.rotate(angle);
  ctx.globalAlpha = Math.sin((1 - t) * Math.PI);
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 38;
  v009DrawPivotSwordBody(ctx, f.color);
  ctx.restore();
}

function v009DrawSlashSwingForm(ctx, f, t) {
  const p = 1 - Math.pow(t, 2.1);
  const alpha = Math.sin((1 - t) * Math.PI);
  const sweep = 150 + p * 28;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle + (f.mirror ? -p * 0.32 : p * 0.32));
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 36;
  const blade = ctx.createLinearGradient(-sweep / 2, 0, sweep / 2, 0);
  blade.addColorStop(0, `${f.color}00`);
  blade.addColorStop(0.22, f.color);
  blade.addColorStop(0.56, "#ffffff");
  blade.addColorStop(0.9, f.color);
  blade.addColorStop(1, `${f.color}00`);
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(-sweep / 2, 8);
  ctx.quadraticCurveTo(-sweep * 0.12, -50, sweep / 2, -4);
  ctx.quadraticCurveTo(sweep * 0.18, 34, -sweep / 2, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#eaffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-sweep * 0.38, 2);
  ctx.quadraticCurveTo(0, -36, sweep * 0.42, -2);
  ctx.stroke();
  ctx.restore();
}

function v009DrawSlashMarkForm(ctx, f, t) {
  const alpha = Math.sin((1 - t) * Math.PI);
  const length = 184 * (1 - t * 0.12);
  const width = 16 * alpha + 3;
  const jitter = v009StableImpactJitter(f, 3.5);
  ctx.save();
  ctx.translate(f.x + jitter.x, f.y + jitter.y);
  ctx.rotate(f.angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 28;
  const blade = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
  blade.addColorStop(0, `${f.color}00`);
  blade.addColorStop(0.22, f.color);
  blade.addColorStop(0.5, "#ffffff");
  blade.addColorStop(0.78, f.color);
  blade.addColorStop(1, `${f.color}00`);
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(-length / 2, 0);
  ctx.quadraticCurveTo(-length * 0.32, -width * 0.72, 0, -width * 0.52);
  ctx.quadraticCurveTo(length * 0.32, -width * 0.28, length / 2, 0);
  ctx.quadraticCurveTo(length * 0.32, width * 0.72, 0, width * 0.52);
  ctx.quadraticCurveTo(-length * 0.32, width * 0.28, -length / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#eaffff";
  ctx.lineWidth = Math.max(2, width * 0.18);
  ctx.lineCap = "round";
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  ctx.moveTo(-length * 0.42, -width * 0.12);
  ctx.quadraticCurveTo(-length * 0.08, -width * 0.62, length * 0.42, width * 0.1);
  ctx.stroke();
  ctx.restore();
}

function v009DrawNeedleStuckForm(ctx, f, t) {
  const opacity = Math.max(0, Math.min(1, v009StageFxNumber(f.opacity, 1)));
  const alpha = Math.sin((1 - t) * Math.PI) * opacity;
  const jitter = v009StableImpactJitter(f, 2.5);
  ctx.save();
  ctx.translate(f.x + jitter.x, f.y + jitter.y);
  ctx.rotate(f.angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = "#effff7";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-36, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 8;
  ctx.globalAlpha = alpha * 0.32;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();
  ctx.restore();
}

function v009StableImpactJitter(f, amount) {
  if (!f?.shake) return { x: 0, y: 0 };
  if (!Number.isFinite(f.shakeX) || !Number.isFinite(f.shakeY)) {
    f.shakeX = (Math.random() - 0.5) * amount;
    f.shakeY = (Math.random() - 0.5) * amount;
  }
  const age = Math.max(0, (f.maxLife || 0) - (f.life || 0));
  const decay = Math.max(0, 1 - age / 140);
  return { x: f.shakeX * decay, y: f.shakeY * decay };
}

function v009DrawNeedleTailPulseForm(ctx, f, t) {
  const p = 1 - t;
  const opacity = Math.max(0, Math.min(1, v009StageFxNumber(f.opacity, 1)));
  const alpha = Math.sin(p * Math.PI) * opacity;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 3 + p * 4;
  ctx.beginPath();
  ctx.arc(0, 0, 7 + p * 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#effff7";
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha * 0.78;
  ctx.beginPath();
  ctx.arc(0, 0, 3 + p * 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function v009BattleActionSource(cockpit, text) {
  const source = String(text || "");
  const ally = cockpit.party.find((item) => item?.name && source.startsWith(item.name));
  if (ally) return { side: "player", id: ally.id || ally.sourceId };
  const enemy = cockpit.enemies.find((item) => item?.name && source.startsWith(item.name));
  if (enemy) return { side: "enemy", id: enemy.id, name: enemy.name };
  return null;
}

function v009EnemyStageUnits(enemies, actionSource = null, actionLabel = "") {
  return enemies.length ? enemies.map((enemy) => {
    const bossClass = enemy?.w > 1 || enemy?.h > 1 ? "boss" : "small";
    const duelClass = enemy?.duelOpponent ? "duel-opponent" : "";
    return `
      <div class="v009-enemy-unit ${bossClass} ${duelClass} ${fxClass(enemy)}"${fxStyle(enemy)}>
        ${combatFloat(enemy)}
        <img src="${escapeHtml(enemyPlaceholderUrl(enemy))}" alt="">
      </div>
    `;
  }).join("") : "";
}

function enemyPlaceholderUrl(enemyOrType) {
  const enemy = typeof enemyOrType === "object" && enemyOrType ? enemyOrType : { type: enemyOrType };
  if (enemy.duelOpponent) return v009CombatPortraitUrl(enemy);
  const type = enemy.type;
  const boss = enemy.w > 1 || enemy.h > 1;
  const base = "./assets/v009_runtime_preview/monsters";
  if (boss) {
    const bossMap = {
      wolf: "black_sand_wolf_king_192x192_preview.png",
      scorpion: "steel_tail_scorpion_192x192_preview.png",
      slime: "corrupt_light_mother_core_192x192_preview.png",
      machine: "sand_fate_machine_192x192_preview.png",
    };
    if (bossMap[type]) return v009VersionedAssetUrl(`${base}/${bossMap[type]}`);
  }
  const map = {
    wolf: "sand_wolf_96x96_preview.png",
    scorpion: "venom_scorpion_96x96_preview.png",
    slime: "corrupt_light_slime_96x96_preview.png",
    raider: "wasteland_raider_remnant_96x96_preview.png",
    machine: "sand_machine_soldier_96x96_preview.png",
  };
  return v009VersionedAssetUrl(`${base}/${map[type] || "sand_wolf_96x96_preview.png"}`);
}

function v009VersionedAssetUrl(path) {
  const url = v009ProjectAssetUrl(path);
  return `${url}${url.includes("?") ? "&" : "?"}v=20260607_monsters`;
}

function v009ProjectAssetUrl(path) {
  if (!path) return "";
  const source = String(path).replace(/\\/g, "/");
  if (/^(?:data:|blob:|https?:|file:)/.test(source)) return source;
  if (source.startsWith("./")) return source;
  if (source.startsWith("../")) return `./${source.replace(/^(\.\.\/)+/, "")}`;
  if (source.startsWith("assets/")) return `./${source}`;
  return source;
}

function v009CombatPortraitUrl(actor) {
  const sourceMember = actor?.sourceId ? getMember(actor.sourceId) : (actor?.id ? getMember(actor.id) : null);
  const directPath = actor?.portrait || actor?.portraitPath || actor?.fullBody || actor?.fullPortrait || "";
  const memberPath = sourceMember ? portraitUrl(sourceMember) : "";
  const fallbackPath = randomPortraitPath(actor?.classId || sourceMember?.classId, actor?.gender || sourceMember?.gender);
  return v009ProjectAssetUrl(directPath || memberPath || fallbackPath);
}

function v009PartyStatusBars(party) {
  return party.length ? party.slice(0, 1).map((ally) => `
    <div class="v009-party-status">
      <div class="v009-fighter-status-head">
        <b>${ally.name}</b>
        <span>${displayHpValue(ally.hp)}/${Math.max(1, Math.floor(ally.maxHp || 1))}</span>
      </div>
      ${v009FightHpBar(ally.hp, ally.maxHp, false, ally.shield)}
      ${v009CombatStatusTags(ally, "ally")}
    </div>
  `).join("") : `<div class="v009-party-status empty">未指定作戰角色</div>`;
}

function v009FightHpBar(value, max, reverse = false, shield = 0) {
  const safeMax = Math.max(1, Math.floor(max || 1));
  const safeValue = Math.max(0, Math.min(safeMax, Number(value) || 0));
  const pct = Math.max(0, Math.min(100, (safeValue / safeMax) * 100));
  const shieldValue = Math.max(0, Math.floor(shield || 0));
  const shieldPct = Math.max(pct, Math.min(100, ((safeValue + shieldValue) / safeMax) * 100));
  const style = `--hp-pct:${pct.toFixed(1)}%;--shield-pct:${shieldPct.toFixed(1)}%;`;
  return `
    <div class="v009-fight-hp ${v009HpToneClass(safeValue, safeMax)} ${pct <= 0 ? "hp-empty" : ""} ${reverse ? "reverse" : ""}" style="${style}">
      <i class="hp-fill"></i>
      ${shieldValue > 0 && shieldPct > pct ? `<i class="shield-fill"></i>` : ""}
    </div>
  `;
}

function displayHpValue(value) {
  const hp = Number(value) || 0;
  return hp <= 0 ? 0 : Math.max(1, Math.ceil(hp));
}

function v009HpToneClass(value, max) {
  const ratio = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  if (ratio <= 0.32) return "hp-critical";
  if (ratio <= 0.68) return "hp-wounded";
  return "hp-healthy";
}

function v009CombatStatusTags(unit, side = "ally") {
  if (!unit) return "";
  const tags = [];
  if (side !== "enemy") tags.push(...classResourceStatusTags(unit));
  const shield = Math.floor(unit.shield || 0);
  const guard = Math.floor(unit.guard || 0);
  const evade = Math.ceil(unit.evade || 0);
  const heat = Math.floor(unit.heat || 0);
  if (shield > 0) tags.push({ tone: "buff", text: `護盾 ${shield}` });
  if (guard > 0) tags.push({ tone: "buff", text: `護身 ${guard}` });
  if (guard < 0) tags.push({ tone: "debuff", text: `失衡 ${Math.abs(guard)}` });
  if (evade > 0) tags.push({ tone: "buff", text: `迴避 ${evade}` });
  if (unit.wangBianStepActive) tags.push({ tone: "buff", text: "彼岸 1" });
  if (unit.wangSoulEvadeTurns > 0) tags.push({ tone: "buff", text: `銷魂 ${Math.ceil(unit.wangSoulEvadeTurns)}` });
  if (unit.vajraReflectReady) tags.push({ tone: "buff", text: "金剛反 1" });
  if (unit.charged) tags.push({ tone: "buff", text: "蓄勢 1" });
  if (unit.flowActive) tags.push({ tone: "buff", text: `流光勢 ${Math.max(1, Math.ceil(unit.flowTurns || evade || 1))}` });
  if (unit.tianshuArray) tags.push({ tone: "buff", text: "劍陣 1" });
  if ((unit.resource || 0) <= 0 && unit.reloadTurns > 0) tags.push({ tone: "buff", text: `裝填 ${Math.ceil(unit.reloadTurns)}` });
  if (unit.marked) tags.push({ tone: "debuff", text: `標記 ${Math.max(1, Math.ceil(unit.markTurns || 1))}` });
  for (const poison of activePoisonEntries(unit).slice(0, 4)) {
    tags.push({ tone: "debuff", text: `${poison.key} ${Math.ceil(poison.duration)}` });
  }
  if (unit.armorDown) tags.push({ tone: "debuff", text: `破甲 ${Math.ceil(unit.armorDown)}` });
  if (unit.vulnerableTurns) tags.push({ tone: "debuff", text: `裂甲 ${Math.ceil(unit.vulnerableTurns)}` });
  if (unit.slow) tags.push({ tone: "debuff", text: `遲滯 ${Math.ceil(unit.slow)}` });
  if (unit.seals?.body) tags.push({ tone: "debuff", text: `破體印 ${Math.ceil(unit.seals.body)}` });
  if (unit.seals?.soul) tags.push({ tone: "debuff", text: `斷魂印 ${Math.ceil(unit.seals.soul)}` });
  if (unit.seals?.spirit) tags.push({ tone: "debuff", text: `裂魄印 ${Math.ceil(unit.seals.spirit)}` });
  if (heat > 0) tags.push({ tone: "debuff", text: `過熱 ${heat}` });
  if (!tags.length) return `<div class="v009-status-tags empty" aria-hidden="true"></div>`;
  return `<div class="v009-status-tags ${side}">${tags.map(v009StatusTagHtml).join("")}</div>`;
}

function classResourceStatusTags(unit) {
  if (!unit?.classId) return [];
  if (unit.classId === "wangchuan") {
    return sealResourceStatusTags(unit.wangSeals || {});
  }
  const data = classResourceData(unit.classId);
  if (!data?.combat) return [];
  const value = Math.max(0, Math.floor(unit.resource || 0));
  if (value <= 0) return [];
  const resourceTone = unit.classId === "furnace" ? "buff resource-furnace" : "buff";
  return [{ tone: resourceTone, text: `${data.label} ${value}` }];
}

function sealResourceStatusTags(seals) {
  return Object.entries(WANG_SEAL_STATUS_LABELS)
    .map(([key, label]) => ({ label, count: Math.floor(seals?.[key] || 0) }))
    .filter((entry) => entry.count > 0)
    .map((entry) => ({ tone: "buff", text: `${entry.label} ${entry.count}` }));
}

function v009StatusTagHtml(tag) {
  return `<span class="v009-status-tag ${escapeHtml(tag?.tone || "")}">${statusTagTextHtml(tag?.text || "")}</span>`;
}

function combatStatusTagHtml(tag) {
  const toneClasses = String(tag?.tone || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((tone) => `status-${tone}`)
    .join(" ");
  return `<span class="combat-status-tag ${escapeHtml(toneClasses)}">${statusTagTextHtml(tag?.text || "")}</span>`;
}

function statusTagTextHtml(text) {
  const raw = String(text || "").trim();
  const match = raw.match(/^(.+?)\s+([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return escapeHtml(raw);
  return `${escapeHtml(match[1])}<b class="status-suffix-number">${escapeHtml(match[2])}</b>`;
}

function v009CharacterDetailPanel(cockpit) {
  const member = v009FocusedMember(cockpit);
  if (!member) {
    return `
      <section class="v009-character-detail">
        <div class="inventory-empty">尚未編入角色</div>
      </section>
    `;
  }
  const stats = memberStatsWithChips(member);
  const skills = (member.activeSkillIds || []).map(findSkill).filter(Boolean);
  const equipment = normalizeEquipment(member.equipment);
  const combatBonusRows = Object.entries(memberCombatBonuses(member))
    .filter(([, value]) => value)
    .map(([key, value]) => `<span>${combatBonusLabel(key)}<i>${value}${combatBonusUnit(key)}</i></span>`)
    .join("");
  const nextExp = member.level >= MAX_LEVEL ? 0 : xpForNextLevel(member.level);
  const expValue = Math.floor(member.exp || 0);
  const expPct = nextExp ? Math.max(0, Math.min(100, (expValue / nextExp) * 100)) : 100;
  const mainStats = new Set(CLASS_DATA[member.classId]?.main || []);
  return `
    <section class="v009-character-detail">
      <div class="v009-character-grid">
        <div class="v009-character-profile">
          <div class="v009-character-nameplate">
            <b>${member.name}</b>
            <span><strong>等級 ${member.level}</strong><i>${memberClassName(member)}</i></span>
          </div>
          <div class="v009-character-exp">
            <span>經驗 <b>${nextExp ? `${expValue} / ${nextExp}` : "MAX"}</b></span>
            <i><b style="width:${expPct.toFixed(1)}%"></b></i>
          </div>
          <div class="v009-stat-list">
            ${STAT_KEYS.map((key) => {
              const isMain = mainStats.has(key);
              return `<i class="${isMain ? "is-main" : ""}" title="${isMain ? `門派主要能力：${STAT_LABELS[key]}` : STAT_LABELS[key]}"><span>${STAT_LABELS[key]}</span><b>${stats[key]}</b></i>`;
            }).join("")}
          </div>
          <div class="v009-derived-combat-list">
            ${derivedCombatStats(member, stats).map((entry) => `<span><i>${entry.label}</i><b>${entry.value}</b></span>`).join("")}
          </div>
          <div class="v009-skill-list">
            ${skills.length ? skills.map((skillData) => `<i>${skillData.name}</i>`).join("") : `<i>未裝備技能</i>`}
          </div>
        </div>
        <div class="v009-equipment-summary">
          <b>裝備</b>
          ${EQUIPMENT_SLOTS.map((slot) => {
            const gear = equipment[slot.key];
            const title = gear ? `${gearDisplayName(gear)}｜${gearAbilitySummary(gear)}` : `${slot.label}｜拖入${slot.label}裝備`;
            const focused = gear ? isFocusedInventoryEntry({ category: "gear", id: gear.id }) : false;
            const focusAttrs = gear ? ` data-v009-item-focus="gear" data-v009-item-id="${escapeHtml(gear.id)}"` : "";
            return `<span class="v009-equipment-slot ${gear ? "filled" : ""} ${focused ? "focused" : ""}" data-gear-member="${member.id}" data-gear-slot="${slot.key}"${focusAttrs} ${gear ? `draggable="true" data-equipped-gear-member="${member.id}" data-equipped-gear-slot="${slot.key}"` : ""} title="${escapeHtml(title)}">${slot.label}<i>${gear ? gearDisplayName(gear) : slot.empty}</i></span>`;
          }).join("")}
          ${combatBonusRows ? `<div class="v009-equipment-bonus-list">
            ${combatBonusRows}
          </div>` : ""}
        </div>
      </div>
    </section>
  `;
}

function v009FocusedMember(cockpit) {
  const selected = state.selectedMemberId ? getMember(state.selectedMemberId) : null;
  return selected || partyMembers()[0] || cockpit.party[0] || null;
}

function v009TrackedTasks(cockpit) {
  return [
    ...homeReportItems(cockpit.level),
    `主線推進：Lv${cockpit.level} ${cockpit.progressLabel}`,
    `作戰角色：${playerCombatMember() ? playerCombatMember().name : "未指定"}`,
  ].slice(0, 8).map((item) => `<div class="feed-chip">${formatFeedText(item)}</div>`).join("");
}

function v009TaskList(cockpit) {
  ensureDefaultCommissions();
  const rows = [];
  for (const commission of acceptedCommissionItems().slice(0, 5)) {
    const current = commission.state || state.commissions[commission.id] || {};
    const data = commission.data || COMMISSION_DATA[commission.id] || {};
    rows.push({
      title: data.name || "委託",
      detail: current.completed ? "可回報" : `進行中 ${current.progress || 0}/${data.target || 1}`,
      tone: current.completed ? "gold" : "cyan",
      link: "commission",
      commissionId: commission.id,
    });
  }
  if (!rows.length) return `<div class="v009-list-row empty"><b>尚未承接委託</b><span>點選查看</span></div>`;
  return rows.map((item) => `
    <button class="v009-list-row task tone-${item.tone}" data-v009-task-link="${item.link}" ${item.commissionId ? `data-v009-task-commission="${item.commissionId}"` : ""}>
      <b>${item.title}</b>
      <span>${item.detail}</span>
    </button>
  `).join("");
}

function v009InventoryList() {
  const filter = v009ActiveItemFilter();
  const entries = v009SideInventoryEntries().filter((entry) => filter === "all" || entry.category === filter);
  const focusedEntry = v009FocusedInventoryEntry(entries);
  const rows = entries.length
    ? entries.map(v009SideInventoryRow).join("")
    : `<div class="v009-list-row empty"><b>沒有符合項目</b><span></span></div>`;
  return `
    ${v009ItemFilterTabs(filter)}
    <div class="v009-side-item-list" data-gear-inventory-drop>${rows}</div>
    ${focusedEntry ? v009InventoryItemPopout(focusedEntry) : ""}
  `;
}

function v009ActiveItemFilter() {
  return ["all", "gear", "chip", "material", "quest"].includes(state.itemFilter) ? state.itemFilter : "all";
}

function v009ItemFilterTabs(active) {
  const filters = [
    ["all", "全部"],
    ["gear", "裝備"],
    ["chip", "晶片"],
    ["material", "素材"],
    ["quest", "任務"],
  ];
  return `
    <div class="v009-item-filter-tabs">
      ${filters.map(([key, label]) => `<button class="${active === key ? "active" : ""}" data-item-filter="${key}">${label}</button>`).join("")}
    </div>
  `;
}

function v009SideInventoryEntries() {
  const gearEntries = normalizeGearInventory(state.gear).map((item) => ({
    id: item.id,
    name: gearDisplayName(item),
    count: 1,
    category: "gear",
    typeLabel: "裝備",
    gear: item,
    actionAttr: "",
  }));
  const chipEntries = normalizeChipInventory(state.chips).map((chip) => ({
    id: chip.id,
    name: chipDisplayName(chip),
    count: 1,
    category: "chip",
    typeLabel: "晶片",
    chip,
    actionAttr: "",
  }));
  const itemEntries = inventoryEntries().map((entry) => {
    const category = v009InventoryItemCategory(entry.id);
    return {
      id: entry.id,
      name: itemName(entry.id),
      count: entry.count,
      category,
      typeLabel: v009ItemCategoryLabel(category),
      itemData: entry.data,
      actionAttr: "",
    };
  });
  return [...gearEntries, ...chipEntries, ...itemEntries];
}

function v009InventoryItemCategory(id) {
  const type = ITEM_DATA[id]?.type;
  if (type === "quest") return "quest";
  return "material";
}

function v009ItemCategoryLabel(category) {
  return { gear: "裝備", chip: "晶片", material: "素材", quest: "任務" }[category] || "素材";
}

function v009SideInventoryRow(entry) {
  const focused = isFocusedInventoryEntry(entry);
  const tag = `<i class="v009-item-type-tag type-${entry.category}">${escapeHtml(entry.typeLabel)}</i>`;
  const gearAttrs = entry.category === "gear"
    ? ` draggable="true" data-inventory-gear-id="${escapeHtml(entry.id)}" data-v009-gear-quick-equip="${escapeHtml(entry.id)}"`
    : "";
  const content = `
    <span class="v009-side-item-main">
      <b>${escapeHtml(entry.name)}</b>
      ${tag}
    </span>
    <strong>${entry.count}</strong>
  `;
  return `<div class="v009-list-row item type-${entry.category} ${focused ? "focused" : ""}" data-v009-item-focus="${entry.category}" data-v009-item-id="${escapeHtml(entry.id)}"${gearAttrs}>${content}</div>`;
}

function v009FocusedInventoryEntry(preferredEntries = []) {
  const focused = state.focusedInventoryItem;
  if (!focused) return null;
  const preferred = preferredEntries.find(isFocusedInventoryEntry);
  if (preferred) return preferred;
  const inventoryEntry = v009SideInventoryEntries().find(isFocusedInventoryEntry);
  if (inventoryEntry) return inventoryEntry;
  if (focused.category === "gear") return v009FocusedEquippedGearEntry(focused.id);
  return null;
}

function v009FocusedEquippedGearEntry(gearId) {
  if (!gearId) return null;
  for (const member of state.recruits || []) {
    const gear = Object.values(normalizeEquipment(member.equipment)).find((item) => item?.id === gearId);
    if (!gear) continue;
    return {
      id: gear.id,
      name: gearDisplayName(gear),
      count: 1,
      category: "gear",
      typeLabel: "裝備",
      gear,
      member,
      actionAttr: "",
    };
  }
  return null;
}

function isFocusedInventoryEntry(entry) {
  const focused = state.focusedInventoryItem;
  return !!focused && focused.category === entry.category && focused.id === entry.id;
}

function focusInventoryItem(category, id, anchorRect = null) {
  if (!category || !id) return;
  const position = v009InventoryPopoutPosition(anchorRect);
  const top = position.top;
  const left = position.left;
  state.focusedInventoryItem = { category, id, top, left };
  render();
}

function v009FloatingUiBounds() {
  return {
    width: Math.max(320, Math.min(1600, window.innerWidth || 1600)),
    height: Math.max(240, Math.min(900, window.innerHeight || 900)),
  };
}

function clampFloatingRect(left, top, width = 232, height = 180) {
  const margin = 12;
  const bounds = v009FloatingUiBounds();
  const maxLeft = Math.max(margin, bounds.width - width - margin);
  const maxTop = Math.max(margin, bounds.height - height - margin);
  return {
    left: Math.round(Math.max(margin, Math.min(maxLeft, left))),
    top: Math.round(Math.max(margin, Math.min(maxTop, top))),
  };
}

function v009InventoryPopoutPosition(anchorRect = null) {
  if (!anchorRect) return clampFloatingRect(900, 120);
  const bounds = v009FloatingUiBounds();
  const margin = 12;
  const width = 232;
  const gap = 10;
  let left = anchorRect.right + gap;
  if (left + width > bounds.width - margin) left = anchorRect.left - width - gap;
  return clampFloatingRect(left, anchorRect.top, width, 220);
}

function clampFocusedInventoryPopout() {
  const focused = state.focusedInventoryItem;
  if (!focused) return;
  const popout = document.querySelector(".v009-item-popout");
  if (!popout) return;
  const bounds = v009FloatingUiBounds();
  popout.style.maxWidth = `${Math.max(220, bounds.width - 24)}px`;
  popout.style.maxHeight = `${Math.max(140, bounds.height - 24)}px`;
  popout.style.overflow = "auto";
  const rect = popout.getBoundingClientRect();
  const clamped = clampFloatingRect(focused.left, focused.top, rect.width || 232, rect.height || 180);
  popout.style.left = `${clamped.left}px`;
  popout.style.top = `${clamped.top}px`;
}

function clearFocusedInventoryItem(id = "") {
  if (!state.focusedInventoryItem) return;
  if (id && state.focusedInventoryItem.id !== id) return;
  state.focusedInventoryItem = null;
}

function v009InventoryItemPopout(entry) {
  const detail = v009InventoryItemDetail(entry, entry.member || v009InventoryDetailMember());
  const focused = state.focusedInventoryItem || {};
  const style = Number.isFinite(focused.left) && Number.isFinite(focused.top)
    ? ` style="left:${Math.round(focused.left)}px;top:${Math.round(focused.top)}px"`
    : "";
  return `
    <aside class="v009-item-popout type-${entry.category}" aria-label="${escapeHtml(entry.name)}"${style}>
      <b>${escapeHtml(entry.name)}</b>
      <div class="v009-item-popout-tags">
        ${detail.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${v009InventoryDetailBody(detail)}
      ${detail.note ? `<i>${escapeHtml(detail.note)}</i>` : ""}
      ${v009InventoryPopoutActions(entry)}
    </aside>
  `;
}

function v009EquippedGearTag(gear, member = null) {
  if (!gear) return "";
  const entry = {
    id: gear.id,
    name: gearDisplayName(gear),
    category: "gear",
    typeLabel: "裝備",
    gear,
  };
  const detail = v009InventoryItemDetail(entry, member);
  return `
    <aside class="v009-item-popout v009-equipped-gear-popout type-gear" aria-label="${escapeHtml(entry.name)}">
      <b>${escapeHtml(entry.name)}</b>
      <div class="v009-item-popout-tags">
        ${detail.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${v009InventoryDetailBody(detail)}
      ${detail.note ? `<i>${escapeHtml(detail.note)}</i>` : ""}
      ${v009InventoryPopoutActions(entry)}
    </aside>
  `;
}

function v009InventoryPopoutActions(entry) {
  const sellValue = focusedEntrySellValue(entry);
  const sellButton = sellValue > 0
    ? `<button class="sell" data-v009-sell-focused>販售 <b>${sellValue}</b></button>`
    : "";
  const dismantleButton = entry.category === "gear" && entry.gear
    ? `<button class="dismantle" data-v009-dismantle-focused>拆解</button>`
    : "";
  if (!sellButton && !dismantleButton) return "";
  return `<div class="v009-item-popout-actions">${sellButton}${dismantleButton}</div>`;
}

function v009InventoryDetailMember() {
  return state.selectedMemberId ? getMember(state.selectedMemberId) : playerCombatMember();
}

function v009InventoryDetailBody(detail) {
  if (Array.isArray(detail.lines) || detail.setProgress) {
    return `
      ${Array.isArray(detail.lines) && detail.lines.length ? `<div class="v009-item-ability-list">
        ${detail.lines.map((line) => v009InventoryAbilityLineHtml(line)).join("")}
      </div>` : ""}
      ${detail.setProgress ? `<div class="v009-item-set-block">
        <strong>${escapeHtml(detail.setProgress.title)}</strong>
        ${detail.setProgress.effects.map((effect) => `<span class="${effect.active ? "active" : ""}">${escapeHtml(effect.text)}</span>`).join("")}
      </div>` : ""}
    `;
  }
  return `<p>${escapeHtml(detail.body)}</p>`;
}

function v009InventoryAbilityLineHtml(line) {
  if (!line || typeof line !== "object") return `<span>${escapeHtml(line)}</span>`;
  return `<span class="${line.mainStat ? "main-stat" : ""}">${escapeHtml(line.text)}</span>`;
}

function gearAbilityLines(gear, member = null) {
  if (!gear) return [];
  const classId = member?.classId || playerCombatMember()?.classId || "";
  const mainStats = new Set((CLASS_DATA[classId]?.main || []).filter((key) => STAT_KEYS.includes(key)));
  const statLines = (gear.stats || []).map((entry) => {
    const value = safeNumber(entry.value, 0, 0);
    return {
      text: `${STAT_LABELS[entry.key]} +${value}`,
      mainStat: mainStats.has(entry.key),
    };
  });
  const combatLines = gearCombatEntries(gear).map((entry) => {
    const value = safeNumber(entry.value, 0, 0);
    return {
      text: `${combatBonusLabel(entry.key)} +${value}${combatBonusUnit(entry.key)}`,
    };
  });
  return [...statLines, ...combatLines].filter(Boolean);
}

function gearSetProgress(gear, member = null) {
  const set = gear?.setId ? GEAR_SET_DATA[gear.setId] : null;
  if (!set) return null;
  const count = member ? equippedGear(member).filter((item) => item.setId === gear.setId).length : 0;
  const maxPieces = Math.max(...set.effects.map((effect) => effect.pieces), count, 1);
  return {
    title: `${set.name} ${count}/${maxPieces}`,
    effects: set.effects.map((effect) => ({
      active: count >= effect.pieces,
      text: `${effect.pieces}件效果：${effect.text}${count >= effect.pieces ? "（已啟動）" : ""}`,
    })),
  };
}

function v009InventoryItemDetail(entry, member = null) {
  if (entry.category === "gear" && entry.gear) {
    const gear = entry.gear;
    const className = gear.classId ? CLASS_DATA[gear.classId]?.name : "";
    return {
      tags: [`${gearSlotLabel(gear.slot)}`, `Lv${gear.level}`, className].filter(Boolean),
      lines: gearAbilityLines(gear, member),
      body: gearAbilitySummary(gear) || "未標示能力。",
      setProgress: gearSetProgress(gear, member),
      note: "雙擊或拖曳裝卸。",
    };
  }
  if (entry.category === "chip" && entry.chip) {
    return {
      tags: [`Lv${entry.chip.level}`, CHIP_SET_DATA[entry.chip.setId]?.name || "套裝"].filter(Boolean),
      body: [chipAbilitySummary(entry.chip), chipSetSummary(entry.chip)].filter(Boolean).join("｜") || "未標示能力。",
      note: "經脈晶片仍由角色裝備頁配置。",
    };
  }
  const item = entry.itemData || ITEM_DATA[entry.id] || {};
  return {
    tags: [entry.typeLabel, `持有 ${entry.count}`],
    body: item.description || item.summary || "素材與任務物品，暫無額外效果。",
    note: "",
  };
}

function townBattleCockpitModel(summary) {
  const activeBattle = state.battle && !state.battle.over ? state.battle : null;
  const pendingBattle = null;
  const displayBattle = activeBattle || pendingBattle;
  const level = displayBattle?.level || currentIdleLevel();
  const party = displayBattle ? displayBattle.allies.slice(0, 1) : playerCombatMemberModels();
  return {
    level,
    inBattle: !!activeBattle,
    battleKind: displayBattle?.kind || "mob",
    battleFeed: state.battleLogArchive.length ? state.battleLogArchive : activeBattle?.feed || [],
    stageName: battleStageName(level, displayBattle?.kind || stageBattleKind(level)),
    party,
    enemies: displayBattle ? displayBattle.enemies : [],
    targetLabel: activeBattle?.kind === "boss" ? bossName(level) : "清理敵群",
    modeLabel: "手動出戰",
    nextMilestone: `Lv${level}`,
    clearText: `${state.maxClearedLevel}/${BLACKWATER_MAX_LEVEL}`,
    actionLabel: activeBattle ? "戰鬥中" : "開始",
    statusLabel: activeBattle ? (activeBattle.kind === "boss" ? "頭目戰中" : "戰鬥中") : "待命",
    loopPurpose: "點選一關打一關。",
    suggestedAction: party.length ? homeSuggestedAction(party, level) : "戰術營帳至少編入 1 名成員。",
    progressPct: 0,
    progressLabel: "手動出戰",
    bossLevel: level,
    bossReady: false,
    bossQueued: false,
    bossInProgress: activeBattle?.kind === "boss",
    defeatFlash: !!activeBattle?.defeatFlash || (state.v009DefeatFlashUntil && state.v009DefeatFlashUntil > Date.now()),
    combatStats: activeBattle ? v009BattleCombatStats(activeBattle) : null,
    bossLevels: Array.from({ length: state.maxClearedLevel }, (_, index) => index + 1),
    reportItems: homeReportItems(level),
  };
}

function v009BattleCombatStats(battle) {
  const stats = battle?.stats || {};
  const turns = Math.max(1, Math.floor(stats.playerTurns || 0));
  return {
    maxSingleDamage: Math.max(0, Math.floor(stats.maxSingleDamage || 0)),
    averageTurnDamage: Math.max(0, Math.floor((stats.playerDamageTotal || 0) / turns)),
  };
}

function playerCombatMember() {
  return partyMembers()[0] || null;
}

function playerCombatMemberModels() {
  const member = playerCombatMember();
  return member ? [homeAllyModel(member)] : [];
}

function ensureHomeAutoBattle() {
  return false;
}

function currentIdleLevel() {
  return Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, state.maxClearedLevel + 1));
}

function idleProgress() {
  return Math.min(IDLE_BOSS_PROGRESS_REQUIRED, Math.max(0, safeNumber(state.idleProgress, 0, 0)));
}

function canChallengeBoss(level) {
  level = Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, Number(level) || currentIdleLevel()));
  return level <= state.maxClearedLevel || level === currentIdleLevel();
}

function homeAllyModel(member) {
  const stats = memberStatsWithChips(member);
  const maxHp = maxHpOf(member, stats);
  const maxResource = maxResourceOf(member, stats);
  const damage = Math.round(stats.output * 3 + stats.precision * 1.4 + member.level * 0.8);
  const heal = Math.round(stats.supply * (CLASS_DATA[member.classId].role.includes("治療") ? 3.2 : 1.2));
  const block = Math.round(stats.armor * 2.6 + (member.front ? 18 : 4));
  const pressure = Math.round(stats.reaction * 1.8 + stats.precision * 1.2);
  return {
    ...member,
    stats,
    hp: maxHp,
    maxHp,
    resource: classResourceStart(member, maxResource),
    maxResource,
    action: Math.min(96, 26 + stats.reaction * 3),
    contribution: { damage, heal, taken: block },
    pressure,
    portrait: portraitUrl(member),
  };
}

function homeSuggestedAction(party, level) {
  const member = party[0];
  if (!member) return "尚未指定作戰角色，先在戰術營帳放入 1 名出戰者。";
  if (level % 5 === 0 && member.level < level) return "頭目戰前建議先重打舊關或進工坊補強。";
  if (member.contribution.taken < 28) return "單人承壓不足，優先補強生命、護盾或耐久。";
  return "單人作戰配置可進入下一輪戰鬥。";
}

function homeReportItems(level) {
  const items = [];
  if (state.maxClearedLevel <= 0) items.push(`待命於黑水砂原外緣，下一戰為 Lv${level}。`);
  else items.push(`已清除 Lv${state.maxClearedLevel}，下一輪推進 Lv${level}。`);
  const commission = state.commissions.sand_patrol;
  if (commission?.accepted && !commission.claimed) {
    items.push(`委託「${COMMISSION_DATA.sand_patrol.name}」進度 ${commission.progress}/${COMMISSION_DATA.sand_patrol.target}。`);
  }
  if (state.gather.completed) items.push("採集完成，可領取資源。");
  if (state.expedition.completed) items.push("遠征完成，可回收成果。");
  return items.slice(0, 4);
}

function homeFunctionRail(summary) {
  const entries = [
    { name: "戰術盤", hint: "技能順序", view: "tactics", tone: "cyan" },
    { name: "營帳", hint: `${summary.partyCount}/4`, view: "camp", tone: "jade" },
    { name: "工坊", hint: `${summary.upgradeReady}`, view: "workshop", tone: "gold" },
    { name: "招募", hint: `${summary.candidates}`, view: "tavern", tone: "gold" },
    { name: "市集", hint: "補給", view: "market", tone: "jade" },
    { name: "委託", hint: summary.commissionState, view: "notice", tone: "cyan" },
  ];
  return `
    <div class="home-function-grid">
      ${entries.map((entry) => `
        <button class="home-function-button tone-${entry.tone}" data-overlay-view="${entry.view}">
          <b>${entry.name}</b>
          <span>${entry.hint}</span>
        </button>
      `).join("")}
    </div>
    <div class="home-rail-news">
      ${homeNewsPanel(summary)}
    </div>
  `;
}

function homeTaskHint(task) {
  if (!task.unlocked) return "未開放";
  if (task.completed) return "可領";
  if (task.active) return formatRemaining(task.endsAt);
  return "可派";
}

function homeAllySlot(ally, index) {
  if (!ally) {
    return `
      <button class="home-ally-slot empty" data-view="camp">
        <b>空位</b>
        <i>編入成員</i>
      </button>
    `;
  }
  return `
    <button class="home-ally-slot ${roleToneClass(ally.classId)} ${ally.front ? "front" : "back"}" data-view="camp">
      <span class="home-ally-portrait ${ally.portrait ? "has-portrait" : ""}">
        ${ally.portrait ? `<img src="${escapeHtml(ally.portrait)}" alt="">` : `<i>${ally.name.slice(0, 1)}</i>`}
      </span>
      <span class="home-ally-main">
        <span class="home-ally-name"><b>${ally.name}</b><i>Lv${ally.level} ${memberClassName(ally)}</i></span>
        <span class="home-meter hp"><em>生命</em>${combatBar("hp", ally.hp, ally.maxHp)}</span>
        <span class="home-meter resource"><em>${classResourceLabel(ally.classId)}</em>${combatBar("resource", ally.resource, ally.maxResource)}</span>
        <span class="home-meter act"><em>行動</em>${combatBar("act", ally.action, 100)}</span>
        ${homeAllySkillStrip(ally)}
      </span>
    </button>
  `;
}

function homeAllySkillStrip(ally) {
  const skills = [
    ...((ally.equippedActive || ally.activeSkillIds || []).map(findSkill).filter(Boolean)),
    ally.equippedPassive || ally.passiveId ? findSkill(ally.equippedPassive || ally.passiveId) : null,
  ].filter(Boolean).slice(0, ACTIVE_SKILL_SLOT_COUNT);
  return `
    <span class="home-ally-skills">
      ${skills.length ? skills.map((skillData) => `<i>${skillData.name}</i>`).join("") : `<i>未裝備技能</i>`}
    </span>
  `;
}

function homePreviewEnemies(level, kind = "mob") {
  if (kind === "boss") {
    const type = bossEnemyType(level);
    return [
      homePreviewEnemy(bossName(level), level, type, 1, 1, 2, 2),
    ];
  }
  const types = [
    ["wolf", "wolf", "scorpion"],
    ["scorpion", "slime", "scorpion", "wolf"],
    ["slime", "slime", "raider", "wolf"],
    ["raider", "machine", "raider", "scorpion"],
  ][Math.floor((level - 1) / 4) % 4];
  const positions = [{ x: 2, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 2 }];
  const count = 1;
  return Array.from({ length: count }, (_, index) => {
    const type = types[index % types.length];
    const pos = positions[index];
    return homePreviewEnemy(enemyTypeName(type), level, type, pos.x, pos.y, 1, 1);
  });
}

function homePreviewEnemy(name, level, type, x, y, w, h) {
  const boss = w > 1 || h > 1;
  const maxHp = (boss ? 120 : 45) + level * (boss ? 28 : 10);
  return {
    id: `home-${level}-${type}-${x}-${y}`,
    name,
    type,
    level,
    x,
    y,
    w,
    h,
    hp: maxHp,
    maxHp,
    action: 0,
    stats: {},
    marked: false,
    poisoned: 0,
    miasma: 0,
    bleed: 0,
    poisons: {},
    armorDown: 0,
    slow: 0,
    seals: { body: 0, soul: 0, spirit: 0 },
    castFx: 0,
    hitFx: 0,
  };
}

function homeBoardCells(enemies) {
  let html = "";
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const front = x === 0 ? "front-edge" : "";
      const flow = x === 0 ? ` ${frontEdgeFlowStyle(y)}` : "";
      html += `<div class="cell ${front}" data-cell="${x}-${y}" style="grid-column:${x + 1}; grid-row:${y + 1};${flow}"></div>`;
    }
  }
  return html + enemies.map(enemyToken).join("");
}

function homeLoopProgress(cockpit) {
  return `
    <section class="home-progress-card">
      <span>關卡狀態</span>
      <b>${cockpit.statusLabel}</b>
      <p>${cockpit.loopPurpose}</p>
    </section>
  `;
}

function homeSpecialBattles(cockpit) {
  return `
    <section class="home-special-card">
      <div class="console-section-title compact"><span>特殊戰鬥</span></div>
      <div class="home-special-list">
        ${
          cockpit.bossLevels.length
            ? cockpit.bossLevels.map((level) => `
              <div class="home-battle-entry boss-auto-entry">
                <button data-boss-stage="${level}"><b>Lv${level} ${bossName(level)}</b><span>重戰取材</span></button>
                <button class="stage-auto-repeat-button home-auto-repeat" data-auto-repeat-boss="${level}" title="自動連戰" aria-label="自動連戰">↻</button>
              </div>
            `).join("")
            : `<button class="empty" disabled><b>尚未討伐頭目</b><span>擊破本級頭目後開放</span></button>`
        }
      </div>
    </section>
  `;
}

function homeNewsPanel(summary) {
  const items = homeNewsItems(summary);
  return `
    <section class="home-news-panel">
      ${items.length
        ? items.map((item) => `
          <button class="home-news-card tone-${item.tone}" data-overlay-view="${item.view}">
            <span>${item.type}</span>
            <b>${item.title}</b>
            <i>${item.detail}</i>
          </button>
        `).join("")
        : `<div class="home-news-card empty"><span>快報</span><b>暫無特殊消息</b><i>招募與市集有稀有內容時會出現在這裡</i></div>`}
    </section>
  `;
}

function homeNewsItems(summary) {
  const items = [];
  const rareCandidate = state.candidates
    .filter((member) => ["orange", "red"].includes(member?.rarity))
    .sort((a, b) => RARITIES.findIndex((rarity) => rarity.id === b.rarity) - RARITIES.findIndex((rarity) => rarity.id === a.rarity))[0];
  if (rareCandidate) {
    const rarity = getRarity(rareCandidate.rarity);
    items.push({
      type: "招募",
      title: `${rarity.name}到訪`,
      detail: `${rareCandidate.name}｜${CLASS_DATA[rareCandidate.classId].name}`,
      view: "tavern",
      tone: rareCandidate.rarity === "red" ? "red" : "gold",
    });
  }
  const rareMarketItem = marketBuyEntries()
    .filter((entry) => itemLabelRarity(entry).id === "rare" || itemLabelRarity(entry).id === "legendary")
    .sort((a, b) => b.value - a.value)[0];
  if (rareMarketItem) {
    items.push({
      type: "市集",
      title: "稀有販售",
      detail: `${itemName(rareMarketItem.id)}｜庫存 ${rareMarketItem.stock}`,
      view: "market",
      tone: itemLabelRarity(rareMarketItem).id === "legendary" ? "red" : "cyan",
    });
  }
  return items.slice(0, 3);
}

function subUiOverlayTemplate() {
  return `
    <div class="subui-backdrop" data-close-subui>
      <section class="panel subui-panel" role="dialog" aria-modal="true">
        <div class="subui-head">
          <b>${subUiTitle(state.overlayView)}</b>
          <button data-close-subui>關閉</button>
        </div>
        ${subUiContentTemplate(state.overlayView)}
      </section>
    </div>
  `;
}

function subUiTitle(view) {
  return {
    bossChallenge: "頭目挑戰",
    fullBattleLog: "戰況紀錄",
    itemLog: "物品取得紀錄",
    camp: "營帳",
    tactics: "戰術盤",
    workshop: "工坊",
    tavern: "招募",
    market: "市集",
    notice: "委託",
    items: "物品",
    gather: "採集",
    expedition: "遠征",
  }[view] || "次級UI";
}

function subUiContentTemplate(view) {
  if (view === "fullBattleLog") return fullBattleLogOverlay();
  if (view === "itemLog") return fullItemLogOverlay();
  if (view === "bossChallenge") return bossChallengeOverlay();
  if (view === "camp") return campTemplate();
  if (view === "tactics") return tacticsTemplate();
  if (view === "workshop") return workshopTemplate();
  if (view === "tavern") return tavernTemplate();
  if (view === "market") return marketTemplate();
  if (view === "notice") return noticeTemplate();
  if (view === "items") return itemsTemplate();
  if (view === "gather") return gatherTemplate();
  if (view === "expedition") return expeditionTemplate();
  return `<div class="subui-empty">未開放</div>`;
}

function fullBattleLogOverlay() {
  const items = state.battleLogArchive.length
    ? state.battleLogArchive
    : state.battle?.feed || [];
  return `
    <section class="full-battle-log-panel">
      <div class="feed full-battle-log-feed">
        ${items.slice(0, 200).reverse().map((item) => `<div class="feed-chip ${item.kind || ""}">${formatFeedText(item.text)}</div>`).join("")}
      </div>
    </section>
  `;
}

function fullItemLogOverlay() {
  const items = Array.isArray(state.itemLogArchive) ? state.itemLogArchive : [];
  return `
    <section class="full-battle-log-panel">
      <div class="feed full-battle-log-feed">
        ${items.length
          ? items.slice(0, 200).reverse().map((item) => `<div class="feed-chip ${item.kind || ""}">${formatFeedText(item.text)}</div>`).join("")
          : `<div class="feed-chip">尚無物品取得紀錄。</div>`}
      </div>
    </section>
  `;
}

function bossChallengeOverlay() {
  const levels = Array.from({ length: state.maxClearedLevel }, (_, index) => index + 1);
  return `
    <div class="boss-challenge-list">
      ${levels.length
        ? levels.map((level) => `
          <div class="boss-challenge-entry">
            <button class="boss-challenge-row" data-boss-stage="${level}">
              <b>Lv${level} ${bossName(level)}</b>
              <span>重複挑戰</span>
            </button>
            <button class="stage-auto-repeat-button" data-auto-repeat-boss="${level}" title="自動連戰" aria-label="自動連戰">↻</button>
          </div>
        `).join("")
        : `<div class="subui-empty">尚未擊破任何頭目</div>`}
    </div>
  `;
}

function homeCombatTelemetry(cockpit) {
  return `
    <section class="home-telemetry-card home-telemetry-stats">
      <div class="panel-title"><span>戰鬥數據</span></div>
      ${homeBattleStatsPanel(cockpit)}
    </section>
    <section class="home-telemetry-records">
      <section class="home-telemetry-card battle-log-panel home-telemetry-log" data-overlay-view="fullBattleLog" title="展開完整戰況紀錄">
        <div class="battle-log-title">戰況紀錄</div>
        <div class="feed home-feed-preview">
          ${homeBattleFeedItems(cockpit)}
        </div>
      </section>
      <section class="home-telemetry-card battle-log-panel home-telemetry-item-log" data-overlay-view="itemLog" title="展開完整物品取得紀錄">
        <div class="battle-log-title">物品取得紀錄</div>
        <div class="feed home-item-log-preview">
          ${homeItemLogPreviewItems(9)}
        </div>
      </section>
    </section>
  `;
}

function homeBattleFeedItems(cockpit) {
  const items = cockpit.battleFeed.length
    ? cockpit.battleFeed.slice(0, 200).map((item) => ({ text: item.text, kind: item.kind || "" }))
    : cockpit.reportItems.map((text) => ({ text, kind: "" }));
  return items.map((item) => `<div class="feed-chip ${item.kind}">${formatFeedText(item.text)}</div>`).join("");
}

function v009CombatSkillLoadout(cockpit) {
  const member = v009SkillLoadoutMember(cockpit);
  if (!member) {
    return `
      <section class="v009-skill-loadout">
        <div class="v009-skill-strip empty">尚未編入作戰角色</div>
      </section>
    `;
  }
  const battleAlly = v009BattleAllyForMember(member);
  return `
    <section class="v009-skill-loadout ${state.v009SkillDrawerOpen ? "is-open" : ""}">
      <div class="v009-skill-strip" data-v009-skill-open="${escapeHtml(member.id)}">
        <div class="v009-skill-group turn">
          <span>回合技</span>
          <div class="v009-skill-slots turn-slots">
            ${Array.from({ length: 5 }, (_, index) => v009CombatSkillSlot(member, "turn", index, battleAlly)).join("")}
          </div>
        </div>
        <div class="v009-skill-group trigger">
          <span>觸發技</span>
          <div class="v009-skill-slots trigger-slots">
            ${Array.from({ length: 3 }, (_, index) => v009CombatSkillSlot(member, "trigger", index, battleAlly)).join("")}
          </div>
        </div>
      </div>
      ${state.v009SkillDrawerOpen ? v009CombatSkillDrawer(member) : ""}
    </section>
  `;
}

function v009SkillLoadoutMember(cockpit) {
  return playerCombatMember() || v009FocusedMember(cockpit);
}

function v009BattleAllyForMember(member) {
  if (!member || !state.battle || state.battle.over) return null;
  return state.battle.allies?.find((ally) => ally.sourceId === member.id && ally.hp > 0) || null;
}

function v009CombatSkillSlot(member, timing, index, battleAlly = null) {
  const skillId = equippedSkillIdsByTiming(member, timing)[index] || "";
  const skillData = skillId ? findSkill(skillId) : null;
  const triggerReady = skillData && timing === "trigger" && triggerSkillReadyForUi(battleAlly, skillData, state.battle);
  const comboState = skillData && timing === "turn" ? v009SkillComboSlotState(member, index) : null;
  const comboClass = comboState?.active ? `combo-linked combo-${comboState.role}` : "";
  return `
    <div
      class="v009-skill-slot ${timing} ${skillData ? "filled" : "empty"} ${triggerReady ? "trigger-ready" : ""} ${comboClass}"
      data-v009-skill-slot="${index}"
      data-v009-skill-slot-type="${timing}"
      data-v009-skill-member="${escapeHtml(member.id)}"
      data-v009-skill-id="${escapeHtml(skillId)}"
      draggable="${skillData ? "true" : "false"}"
      title="${skillData ? escapeHtml(skillPresentationText(skillData)) : "拖曳技能到此格"}"
    >
      <b>${skillData ? escapeHtml(skillData.name) : "空格"}</b>
      ${skillData ? `<em>${escapeHtml(skillTimingLabel(skillData))}</em>` : ""}
    </div>
  `;
}

function v009SkillComboSlotState(member, index) {
  const turnIds = equippedSkillIdsByTiming(member, "turn");
  const skillId = turnIds[index] || "";
  const previousId = turnIds[index - 1] || "";
  const nextId = turnIds[index + 1] || "";
  const combo = SKILL_COMBO_DEFINITIONS[skillId];
  if (combo && previousId === skillComboPreviousSkillId(member, combo)) {
    return { active: true, role: "end" };
  }
  const nextCombo = SKILL_COMBO_DEFINITIONS[nextId];
  if (nextCombo && skillId === skillComboPreviousSkillId(member, nextCombo)) {
    return { active: true, role: "start" };
  }
  return null;
}

function skillComboPreviousSkillId(unit, combo) {
  if (!combo) return "";
  if (combo.upgradedPreviousSkillId && skillKnownByUnit(unit, combo.upgradedPreviousSkillId)) return combo.upgradedPreviousSkillId;
  return combo.previousSkillId || "";
}

function skillComboMatchedPreviousSkillId(ally, skillId) {
  const combo = SKILL_COMBO_DEFINITIONS[skillId];
  if (!combo || !ally) return "";
  const turnIds = (ally.activeSkillIds || []).slice(0, 5);
  const index = turnIds.indexOf(skillId);
  if (index <= 0) return "";
  const previousId = skillComboPreviousSkillId(ally, combo);
  return turnIds[index - 1] === previousId ? previousId : "";
}

function addSkillComboFeed(ally, skillId, previousId) {
  if (!ally || !skillId || !previousId) return;
  const previousName = findSkill(previousId)?.name || "前式";
  const skillNameText = findSkill(skillId)?.name || "後式";
  addFeed(`${ally.name} 連段達成：${previousName} → ${skillNameText}，威力提高。`, "gold");
}

function skillKnownByUnit(unit, skillId) {
  if (!unit || !skillId) return false;
  if (Array.isArray(unit.activeSkillIds) && unit.activeSkillIds.includes(skillId)) return true;
  if (Array.isArray(unit.equippedActive) && unit.equippedActive.includes(skillId)) return true;
  const skillData = findSkill(skillId);
  return !!skillData && unit.classId === skillOwnerClassId(skillId) && safeNumber(unit.level, 1, 1) >= skillData.level;
}

function skillOwnerClassId(skillId) {
  for (const [classId, classData] of Object.entries(CLASS_DATA)) {
    if (classData.skills.some((skillData) => skillData.id === skillId)) return classId;
  }
  return "";
}

function skillComboBonusCoefficient(ally, skillId, options = {}) {
  const combo = SKILL_COMBO_DEFINITIONS[skillId];
  if (!combo || !ally) return 0;
  const previousId = skillComboMatchedPreviousSkillId(ally, skillId);
  if (!previousId) return 0;
  if (options.log !== false) addSkillComboFeed(ally, skillId, previousId);
  return combo.bonusCoefficient || 0;
}

function v009CombatSkillDrawer(member) {
  const skills = knownSkills(member, "active");
  const turnSkills = skills.filter(isTurnSkill);
  const triggerSkills = skills.filter(isTriggerSkill);
  return `
    <div class="v009-skill-drawer" role="dialog" aria-label="技能配置">
      <div class="v009-skill-drawer-body">
        ${v009SkillChoiceColumn(member, "turn", turnSkills)}
        ${v009SkillChoiceColumn(member, "trigger", triggerSkills)}
      </div>
    </div>
  `;
}

function v009SkillChoiceColumn(member, timing, skills) {
  return `
    <section class="v009-skill-choice-column ${timing}">
      <div class="v009-skill-choice-list">
        ${skills.length ? skills.map((skillData) => v009SkillChoice(member, skillData)).join("") : ""}
      </div>
    </section>
  `;
}

function v009SkillChoice(member, skillData) {
  const text = skillPresentationText(skillData);
  const detail = skillDetail(skillData, member);
  return `
    <div
      class="v009-skill-choice ${skillData.timing}"
      data-v009-skill-choice="${escapeHtml(skillData.id)}"
      data-v009-skill-member="${escapeHtml(member.id)}"
      data-v009-skill-choice-type="${escapeHtml(skillData.timing)}"
      draggable="true"
      title="${escapeHtml(text)}"
    >
      <div class="skill-name-with-tag">
        <b>${escapeHtml(skillData.name)}</b>
        ${skillTimingTag(skillData)}
      </div>
      <i>${escapeHtml(text)}</i>
      ${skillEffectLineHtml(detail)}
    </div>
  `;
}

function skillPresentationText(skillData) {
  if (!skillData) return "";
  return SKILL_PRESENTATION_TEXT[skillData.id] || skillData.summary || "";
}

function skillTimingLabel(skillData) {
  const timing = normalizeSkillTiming(skillData?.timing);
  return SKILL_TIMINGS[timing]?.label || SKILL_TIMINGS.turn.label;
}

function skillTimingTagLabel(skillData) {
  if (!skillData || skillData.type !== "active") return "被動";
  return normalizeSkillTiming(skillData.timing) === "trigger" ? "觸發" : "回合";
}

function skillTimingTag(skillData) {
  const type = skillData?.type === "active" ? normalizeSkillTiming(skillData.timing) : "passive";
  return `<span class="skill-timing-tag ${type}">${escapeHtml(skillTimingTagLabel(skillData))}</span>`;
}

function homeUtilityDock(summary, cockpit) {
  return `
    <section class="home-bottom-card home-dock-resources">
      ${homeResourceLedger()}
    </section>
    <section class="home-bottom-card home-dock-actions">
      <div class="home-dock-action-grid">
        <button data-overlay-view="bossChallenge"><b>頭目挑戰</b><span>${cockpit.bossLevels.length ? `${cockpit.bossLevels.length} 名已開放` : "尚未開放"}</span></button>
        <button data-overlay-view="gather"><b>採集</b><span>${state.gather.unlocked ? "資源回收" : "未開放"}</span></button>
        <button data-overlay-view="expedition"><b>遠征</b><span>${state.expedition.unlocked ? "外派行動" : "未開放"}</span></button>
      </div>
    </section>
    <section class="home-bottom-card home-dock-items">
      ${homeItemDock()}
    </section>
  `;
}

function homeResourceLedger() {
  return `
    <div class="home-resource-ledger">
      <div class="resource-ledger-item money"><span>荒幣</span><b>${compactWanNumber(state.money)}</b></div>
      <div class="resource-ledger-item material"><span>資材</span><b>${compactWanNumber(state.material)}</b></div>
      <div class="resource-ledger-item energy"><span>能源</span><b>${compactWanNumber(state.energy)}</b></div>
    </div>
  `;
}

function homeItemDock() {
  return `
    <button class="home-item-entry" data-overlay-view="items">
      <b>物品</b>
    </button>
    <div class="home-item-stock-count">${inventoryEntries().length} 種庫存</div>
  `;
}

function homeItemLogPreviewItems(limit = 7) {
  const items = Array.isArray(state.itemLogArchive) ? state.itemLogArchive.slice(0, limit).reverse() : [];
  return items.length
    ? items.map((item) => `<div class="feed-chip ${item.kind || ""}">${formatFeedText(item.text)}</div>`).join("")
    : `<div class="feed-chip">尚無物品取得紀錄。</div>`;
}

function homeBattleReport(cockpit) {
  return `
    <section class="home-bottom-card home-report-card">
      <div class="console-section-title compact"><span>戰況紀錄</span></div>
      <div class="home-report-list">
        ${
          cockpit.battleFeed.length
            ? cockpit.battleFeed.slice(0, 8).map((item) => `<p class="${item.kind || ""}">${formatFeedText(item.text)}</p>`).join("")
            : cockpit.reportItems.map((item) => `<p>${formatFeedText(item)}</p>`).join("")
        }
      </div>
    </section>
  `;
}

function homeBattleLog(cockpit) {
  return homeBattleReport(cockpit);
}

function homeBattleStatsPanel(cockpit) {
  const allies = cockpit.party || [];
  const maxValues = battleStatMaxValues(allies.map((ally) => ({
    contribution: ally.contribution || {},
  })));
  return `
    <div class="home-battle-stats-table">
      <div class="home-battle-stats-head"><span>成員</span><b>傷害</b><b>治療</b><b>承傷</b></div>
      ${allies.map((ally) => homeBattleStatRow(ally, maxValues)).join("")}
    </div>
  `;
}

function homeBattleStatRow(ally, maxValues) {
  const stats = ally.contribution || {};
  return `
    <div class="battle-party-stat-row home-battle-stat-row ${roleToneClass(ally.classId)}">
      <span>${ally.name}</span>
      ${battlePartyStatBar("damage", stats.damage || 0, maxValues.damage)}
      ${battlePartyStatBar("heal", stats.heal || 0, maxValues.heal)}
      ${battlePartyStatBar("taken", stats.taken || 0, maxValues.taken)}
    </div>
  `;
}

function homeTeamDiagnosis(cockpit) {
  const frontline = cockpit.party.filter((member) => member.front).length;
  const totalDamage = cockpit.party.reduce((sum, member) => sum + member.contribution.damage, 0);
  const totalBlock = cockpit.party.reduce((sum, member) => sum + member.contribution.taken, 0);
  return `
    <section class="home-bottom-card">
      <div class="console-section-title compact"><span>診斷</span></div>
      <div class="home-diagnosis-grid">
        <span><b>${frontline}</b><i>前排</i></span>
        <span><b>${totalDamage}</b><i>傷害估測</i></span>
        <span><b>${totalBlock}</b><i>承壓估測</i></span>
      </div>
      <p>${cockpit.suggestedAction}</p>
    </section>
  `;
}

function homeGoalLedger(summary, cockpit) {
  const battleLocked = state.battle && !state.battle.over;
  const autoRepeatLocked = battleLocked || cockpit.level > state.maxClearedLevel;
  return `
    <section class="home-bottom-card">
      <div class="console-section-title compact"><span>目標</span></div>
      <div class="home-goal-list">
        <div class="home-battle-entry">
          <button data-stage="${cockpit.level}" ${battleLocked ? "disabled aria-disabled=\"true\"" : ""}><b>${battleLocked ? "戰鬥中" : `推進 Lv${cockpit.level}`}</b><span>${cockpit.stageName}</span></button>
          <button class="stage-auto-repeat-button home-auto-repeat" data-auto-repeat-stage="${cockpit.level}" ${autoRepeatLocked ? "disabled aria-disabled=\"true\"" : ""} title="${autoRepeatLocked ? "首次通關後開放自動連戰" : "自動連戰"}" aria-label="自動連戰">↻</button>
        </div>
        <button data-view="notice"><b>委託</b><span>${summary.commissionState}</span></button>
        <button data-view="workshop"><b>可強化</b><span>${summary.upgradeReady} 名</span></button>
      </div>
    </section>
  `;
}

function consoleItemShortcut() {
  return `
    <button class="console-item-shortcut" data-view="items">
      <b>物品</b>
    </button>
  `;
}

function townConsoleSummary() {
  ensureDefaultCommissions();
  const party = partyMembers();
  const candidates = state.candidates.filter(Boolean).length;
  const highestRecruitRarity = highestCandidateRarity();
  const upgradeReady = state.recruits.filter((member) => {
    const cost = upgradeCost(member);
    return member.level < MAX_LEVEL && state.money >= cost.money && state.material >= cost.material;
  }).length;
  const commission = state.commissions.sand_patrol;
  const commissionState = commission.completed
    ? "可回報"
    : commission.accepted
      ? `${commission.progress}/${COMMISSION_DATA.sand_patrol.target}`
      : "未接";
  const nextStage = Math.min(state.maxClearedLevel + 1, BLACKWATER_MAX_LEVEL);
  const pulses = consolePulseItems({ commission, nextStage });
  return {
    partyCount: party.length,
    candidates,
    highestRecruitRarity,
    upgradeReady,
    commissionState,
    nextStage,
    pulses,
    acceptedCommissions: acceptedCommissionItems(),
  };
}

function consolePulseItems({ commission, nextStage }) {
  return [
    timedPulseItem("gather", "採集", state.gather, "jade"),
    timedPulseItem("expedition", "遠征", state.expedition, "cyan"),
  ];
}

function timedPulseItem(id, label, task, tone) {
  if (!task.unlocked) return { id, label, title: "未開放", detail: "", active: false, tone: "muted" };
  if (task.completed) {
    return { id, label, title: id === "gather" ? "已完成" : "遠征已完成", detail: "", active: true, tone: "gold", claimAction: id };
  }
  if (task.active) {
    const title = id === "gather" ? `${task.workerName || "成員"}採集中` : "遠征進行中";
    return { id, label, title, detail: formatRemaining(task.endsAt), active: true, tone, view: id };
  }
  return { id, label, title: "可派遣", detail: "", active: true, tone, view: id };
}

function consoleMetric(label, value, hint, tone = "cyan") {
  return `
    <div class="console-metric tone-${tone}">
      <span>${label}</span>
      <b>${value}</b>
      <i>${hint}</i>
    </div>
  `;
}

function highestCandidateRarity() {
  const candidates = state.candidates.filter(Boolean);
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) =>
    RARITIES.findIndex((rarity) => rarity.id === b.rarity) - RARITIES.findIndex((rarity) => rarity.id === a.rarity),
  );
  return getRarity(sorted[0].rarity);
}

function consoleRecruitMetric(rarity) {
  const rarityClass = rarity ? `rarity-${rarity.id}` : "rarity-empty";
  return `
    <div class="console-metric console-recruit-metric tone-gold">
      <b><em class="${rarityClass}">${rarity?.name || "無"}</em><span>成員正等待招募</span></b>
    </div>
  `;
}

function consoleUpgradeMetric(count) {
  return `
    <div class="console-metric console-upgrade-metric tone-jade">
      <b><em>${count}名</em><span>成員可強化</span></b>
    </div>
  `;
}

function consolePartyCard(index) {
  const member = getMember(state.party[index]);
  if (!member) {
    return `
      <button class="console-party-card empty" data-view="camp">
        ${consoleBustSlot(null, index)}
        <b>空位</b>
      </button>
    `;
  }
  return `
    <button class="console-party-card ${roleToneClass(member.classId)}" data-view="camp">
      ${consoleBustSlot(member, index)}
      ${characterIdentity(member, {
        extraClass: "console-character-identity",
        nameAttrs: `data-console-party-talk="${member.id}"`,
      })}
      ${consolePartyDialogue(member)}
    </button>
  `;
}

function consoleBustSlot(member, index) {
  const bust = portraitUrl(member);
  return `
    <span class="console-slot-no console-bust-slot ${member ? roleToneClass(member.classId) : "empty"}"
      ${member ? `data-bust-member="${member.id}" data-bust-class="${member.classId}"` : ""}
      data-bust-slot="${index}">
      ${bust ? `<img src="${escapeHtml(bust)}" alt="">` : ""}
    </span>
  `;
}

function consolePartyDialogue(member) {
  if (state.activePartyTalkMemberId !== member.id) return "";
  const text = state.activePartyTalkText || partyTalkLine(member);
  return dialogueBubble(text, "console-party-dialogue active-dialogue", member.name);
}

function consoleDistrictMap(summary) {
  const districts = [
    { id: "tavern", name: "招募", hint: `${summary.candidates}`, view: "tavern", tone: "gold", icon: "招" },
    { id: "camp", name: "戰術營帳", hint: `${summary.partyCount}/4`, view: "camp", tone: "jade", icon: "隊" },
    { id: "workshop", name: "工坊", hint: `${summary.upgradeReady}`, view: "workshop", tone: "cyan", icon: "工" },
    { id: "market", name: "市集", hint: "買賣", view: "market", tone: "jade", icon: "市" },
    { id: "notice", name: "布告亭", hint: summary.commissionState, view: "notice", tone: "gold", icon: "任" },
    { id: "codex", name: "學會總部", hint: "未開放", view: "", tone: "muted", icon: "錄", disabled: true },
  ];
  return `
    <section class="console-city-map">
      <div class="console-map-backdrop" aria-hidden="true"></div>
      <div class="console-tree-anchor" aria-hidden="true"></div>
      <div class="console-district-grid">
        ${districts.map(consoleDistrictTile).join("")}
      </div>
    </section>
  `;
}

function consoleDistrictTile(district) {
  const attrs = district.disabled ? "disabled aria-disabled=\"true\"" : `data-view="${district.view}"`;
  const buildingSrc = `./assets/ui_facility_button_${district.id}_transparent_preview_v004.png`;
  const glowSrc = `./assets/ui_facility_button_${district.id}_edge_glow_preview_v004.png`;
  return `
    <button class="console-district district-${district.id} tone-${district.tone} ${district.featured ? "featured" : ""}" ${attrs}>
      <span class="district-icon">${district.icon}</span>
      <img class="district-glow" src="${glowSrc}" alt="" aria-hidden="true">
      <img class="district-building" src="${buildingSrc}" alt="" aria-hidden="true">
      <b>${district.name}</b>
    </button>
  `;
}

function consolePulseStack(summary) {
  return `
    <div class="console-pulse-stack">
      ${summary.pulses.map(consolePulseCard).join("")}
    </div>
  `;
}

function consolePulseCard(item) {
  const tag = item.view ? "button" : "div";
  const viewAttr = item.view ? `data-overlay-view="${item.view}"` : "";
  const claimAttr = item.claimAction ? `data-claim-task="${item.claimAction}"` : "";
  const element = item.claimAction ? "button" : tag;
  return `
    <${element} class="console-pulse-card pulse-${item.id} tone-${item.tone} ${item.active ? "active" : "idle"}" ${viewAttr} ${claimAttr}>
      <span>${item.label}</span>
      <b>${item.title}</b>
      <i>${item.detail}</i>
    </${element}>
  `;
}

function acceptedCommissionItems() {
  ensureDefaultCommissions();
  return Object.entries(COMMISSION_DATA)
    .map(([id, data]) => ({ id, data, state: state.commissions[id] }))
    .filter((item) => item.state?.accepted && !item.state?.claimed);
}

function consoleCommissionBoard(summary) {
  return `
    <div class="console-quest-board">
      <span>委託</span>
      <div class="console-quest-list">
        ${
          summary.acceptedCommissions.length
            ? summary.acceptedCommissions.map(consoleQuestRow).join("")
            : `<button class="console-quest-row empty" data-view="notice"><b>無承接委託</b></button>`
        }
      </div>
    </div>
  `;
}

function consoleQuestRow(item) {
  const status = item.state.completed
    ? "已完成"
    : `<span class="quest-key">${item.state.progress}</span><span class="quest-separator">/</span><span class="quest-key">${item.data.target}</span>`;
  return `
    <button class="console-quest-row ${item.state.completed ? "complete" : ""}" data-view="notice">
      <b>${item.data.name}</b>
      <i>${status}</i>
    </button>
  `;
}

function highlightCommissionNumbers(text) {
  return text.replace(/(\d+)/g, '<span class="quest-key">$1</span>');
}

function commissionRewardHtml(reward, exp = 0) {
  const money = `<span class="quest-money">荒幣 <b>${reward.money}</b></span>`;
  const material = reward.material ? `<span class="quest-key">資材 <b>${reward.material}</b></span>` : "";
  const energy = reward.energy ? `<span class="quest-energy">能源 <b>${reward.energy}</b></span>` : "";
  const experience = exp ? `<span class="quest-key">經驗 <b>${exp}</b></span>` : "";
  const items = (reward.items || []).map((item) => `<span class="quest-key">${itemName(item.id)} <b>${item.count}</b></span>`);
  const chips = (reward.chips || []).map((chip) => `<span class="quest-energy">${chip.name}</span>`);
  return [money, material, energy, experience, ...items, ...chips].filter(Boolean).join(" ");
}

function noticeCommissionItems() {
  ensureDefaultCommissions();
  return Object.entries(COMMISSION_DATA)
    .slice(0, COMMISSION_BOARD_SIZE)
    .map(([id, data]) => ({ id, data, state: state.commissions[id] }))
    .filter((item) => item.state && !item.state.claimed);
}

function commissionStatusText(commission, data) {
  if (commission.completed) return commission.claimed ? "已回報" : "可回報";
  if (commission.accepted) return `進行中 ${commission.progress}/${data.target}`;
  return "可承接";
}

function noticeCommissionCard(item) {
  const status = commissionStatusText(item.state, item.data);
  const focused = state.focusedCommissionId === item.id;
  const showStatus = item.state.accepted || item.state.completed;
  const actionHtml = item.state.completed && !item.state.claimed
    ? `<button data-claim-commission="${item.id}">回報</button>`
    : !item.state.accepted
      ? `<button data-commission="${item.id}">承接</button>`
      : "";
  return `
    <div class="commission-card notice-commission-card ${focused ? "focused" : ""}">
      <div class="notice-card-head">
        <b>${item.data.name}</b>
        ${showStatus ? `<span class="tag ${item.state.accepted ? "active" : ""}">${status}</span>` : ""}
      </div>
      <p>${highlightCommissionNumbers(item.data.summary)}</p>
      <div class="notice-reward-line">${commissionRewardHtml(item.data.reward, commissionExperienceAmount(item.data))}</div>
      ${actionHtml ? `<div class="notice-card-actions">${actionHtml}</div>` : ""}
    </div>
  `;
}

function consoleTacticsEntry() {
  return `
    <div class="console-tactics-stack">
      <button class="console-tactics-entry" data-view="tactics">
        <img class="console-tactics-glow" src="./assets/ui_facility_button_tactics_edge_glow_preview_v001.png" alt="" aria-hidden="true">
        <img class="console-tactics-art" src="./assets/ui_facility_button_tactics_transparent_preview_v001.png" alt="" aria-hidden="true">
        <b>戰術盤</b>
      </button>
    </div>
  `;
}

function consoleResourceList() {
  return `
    <div class="console-resource-list">
      <span class="resource-money">荒幣 <b>${state.money}</b></span>
      <span class="resource-material">資材 <b>${state.material}</b></span>
      <span class="resource-energy">能源 <b>${state.energy}</b></span>
    </div>
  `;
}

function townTemplate() {
  return `
    <section class="screen town">
      <nav class="town-menu panel">
        <div class="town-menu-main">
          <button data-view="camp"><b>戰術營帳</b><br><span class="muted">調整隊伍配置</span></button>
          <button data-view="workshop"><b>工坊</b><br><span class="muted">鍛造與義體管理</span></button>
          <button data-view="tavern"><b>招募</b><br><span class="muted">招募新成員</span></button>
          <button data-view="notice"><b>布告亭</b><br><span class="muted">承接委託</span></button>
        </div>
        <button class="sortie-button"><b>出戰</b></button>
      </nav>
      <section class="large-panel town-dashboard">
        <div class="panel-title town-talk-title"><span>聚落人聲</span><span class="muted">點選對象交談</span></div>
        <div class="town-talk-grid">
          ${state.townTalkers.map(townTalkerCard).join("")}
        </div>
        <div class="reset-save-zone">
          <p>測試版會在這台機器保留進度；想重新開始時，可清空資料重來。</p>
          <button class="reset-save-button" data-reset-save>重置資料</button>
        </div>
      </section>
    </section>
  `;
}

function townTalkerCard(talker, options = {}) {
  const active = talker.id === state.activeTownTalkerId ? "active" : "";
  const showDialogue = options.showDialogue || active;
  return `
    <button class="town-talker ${active} ${talker.tone}" data-town-talk="${talker.id}">
      <span class="talker-avatar">${talker.name.slice(0, 1)}</span>
      <span class="talker-main">
        <b>${talker.name}</b>
        <span class="town-talker-tags">${townTalkerTag(talker)}</span>
      </span>
      ${showDialogue ? townDialogue(talker, active) : ""}
    </button>
  `;
}

function tavernRegulars() {
  const regularNames = new Set(["馬青舟", "柳承枝", "陸聞白"]);
  const lineIndexes = state.tavernTalkerLineIndexes || {};
  if (!Array.isArray(state.tavernTalkers) || state.tavernTalkers.length !== regularNames.size) {
    state.tavernTalkers = createTownNpcPool().filter((talker) => regularNames.has(talker.name));
  }
  return state.tavernTalkers.map((talker) => ({
    ...talker,
    lineIndex: lineIndexes[talker.id] || 0,
  }));
}

function tavernRegularCard(talker) {
  const active = talker.id === state.activeTavernTalkerId ? "active" : "";
  return `
    <button class="town-talker tavern-regular ${active} ${talker.tone}" data-tavern-talk="${talker.id}">
      <span class="talker-avatar">${talker.name.slice(0, 1)}</span>
      <span class="talker-main">
        <b>${talker.name}</b>
        <span class="town-talker-tags">${townTalkerTag(talker)}</span>
      </span>
      ${active ? townDialogue(talker, true) : ""}
    </button>
  `;
}

function townTalkerTag(talker) {
  if (talker.classId) return classTag(talker.classId);
  const tagClass = talker.subtitle.includes("森羅學會") ? "class-tag" : "role-feature";
  return `<span class="meta-tag ${tagClass}">${talker.subtitle}</span>`;
}

function dialogueBubble(text, extraClass = "", speaker = "") {
  const label = speaker ? `<b class="dialogue-speaker-name">${speaker}</b>` : "";
  return `
    <div class="dialogue-bubble ${extraClass}">
      ${label}
      <p>${text}</p>
    </div>
  `;
}

function townDialogue(talker, active = false) {
  const line = talker.lines?.[talker.lineIndex || 0] || "";
  return dialogueBubble(line, `town-dialogue ${active ? "active-dialogue" : "echo-dialogue"}`, talker.name);
}

function campTemplate() {
  return `
    <section class="screen camp management-screen place-screen">
      ${settlementNav("camp")}
      <section class="large-panel camp-roster-panel">
        <div class="panel-title"><span>成員名冊</span><span class="muted">點擊查看詳情，拖曳編隊</span></div>
        <div class="list roster-drop roster-grid" data-roster-drop>
          ${state.recruits.map(memberCard).join("")}
        </div>
      </section>
      <aside class="camp-side-stack">
        <section class="panel camp-formation-panel">
          <div class="panel-title"><span>第一編隊</span><button class="compact-action-button" data-clear-formation="0">清空編隊</button></div>
          <div class="party-slots compact-party-slots">
            ${state.party.map((id, index) => campFormationSlot(id, index)).join("")}
          </div>
        </section>
        <section class="panel camp-reserve-panel">
          <div class="panel-title"><span>第二編隊</span></div>
          <div class="reserve-formation-preview">
            <span>02</span>
            <b>未開放</b>
          </div>
        </section>
      </aside>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function settlementNav(active) {
  return `
    <nav class="management-nav">
      <button class="${active === "town" ? "active" : ""}" data-view="town">翠穹聚落</button>
      <button class="${active === "camp" ? "active" : ""}" data-view="camp">戰術營帳</button>
      <button class="${active === "tactics" ? "active" : ""}" data-view="tactics">戰術盤</button>
      <button class="${active === "workshop" ? "active" : ""}" data-view="workshop">工坊</button>
      <button class="${active === "tavern" ? "active" : ""}" data-view="tavern">招募</button>
      <button class="${active === "market" ? "active" : ""}" data-view="market">市集</button>
      <button class="${active === "notice" ? "active" : ""}" data-view="notice">布告亭</button>
    </nav>
  `;
}

function placeHeader(kicker, title, stateText, chips = []) {
  return `
    <header class="place-header">
      <div>
        <span>${kicker}</span>
        <h2>${title}</h2>
      </div>
      <div class="place-header-state">
        <b>${stateText}</b>
        <div class="place-chip-row">
          ${chips.map((chip) => `<i>${chip}</i>`).join("")}
        </div>
      </div>
    </header>
  `;
}

function characterIdentity(member, options = {}) {
  const rarity = getRarity(member.rarity);
  const attrs = options.attrs || "";
  const nameAttrs = options.nameAttrs || "";
  const extraClass = options.extraClass || "";
  const action = options.action || "";
  const badge = options.badge === "tier" ? tierBadge(member) : levelBadge(member);
  return `
    <div class="character-identity member-name role-strip ${roleToneClass(member.classId)} ${extraClass}" ${attrs}>
      <span class="name-with-level"><b ${nameAttrs}>${member.name}</b>${badge}</span>
      <span class="character-rarity rarity-${member.rarity}">${rarity?.name || ""}</span>
      ${action}
    </div>
  `;
}

function memberPortraitFigure(member, extraClass = "") {
  const portrait = portraitUrl(member);
  return `
    <span class="member-inline-portrait ${roleToneClass(member.classId)} ${extraClass}">
      ${portrait ? `<img src="${escapeHtml(portrait)}" alt="">` : `<i>${member.name.slice(0, 1)}</i>`}
    </span>
  `;
}

function combatIdentity(ally) {
  const pseudoMember = { classId: ally.classId, level: ally.level || 1, bodyKind: ally.bodyKind || "", bodyOriginal: !!ally.bodyOriginal };
  return `
    <div class="character-identity combat-character-identity name-line role-strip ${roleToneClass(ally.classId)}">
      <span class="portrait">${ally.name.slice(0, 1)}</span>
      <div class="combat-character-main">
        <span class="name-with-level"><b>${ally.name}</b>${levelBadge(pseudoMember)}</span>
        <div class="member-tags character-tags combat-character-tags">
          ${memberClassTag(pseudoMember)}
          ${roleTag(ally.classId)}
        </div>
      </div>
    </div>
  `;
}

function metaPill(text, extraClass = "", title = "") {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<span class="meta-tag ${extraClass}"${titleAttr}>${text}</span>`;
}

function equipmentTag(member, extraClass = "") {
  return metaPill(equipmentSummary(member), `equipment-tag ${extraClass}`);
}

function costTag(label, value, extraClass = "") {
  return metaPill(`${label} ${value}`, `cost-tag ${extraClass}`);
}

function characterSpecTags(member, options = {}) {
  const extraClass = options.extraClass || "";
  const tags = [
    memberClassTag(member, extraClass),
    roleTag(member.classId, extraClass),
  ];
  if (options.cost != null) tags.push(costTag("雇用", options.cost, extraClass));
  if (options.growth != null) tags.push(costTag("成長", `+${options.growth}`, extraClass));
  return `<div class="member-tags character-tags">${tags.join("")}</div>`;
}

function memberCard(member) {
  const selected = member.id === state.selectedMemberId ? "selected" : "";
  return `
    <div class="member-card ${selected}" draggable="true" data-member-id="${member.id}">
      ${memberPortraitFigure(member, "member-list-portrait")}
      ${characterIdentity(member)}
      ${characterSpecTags(member)}
    </div>
  `;
}

function partySlot(id, index) {
  const member = id ? getMember(id) : null;
  if (!member) {
    return `<div class="party-slot empty" data-slot="${index}">隊伍位置 ${index + 1}</div>`;
  }
  return `
    <div class="party-slot" data-slot="${index}" data-party-member-id="${member.id}">
      ${characterIdentity(member, {
        attrs: `draggable="true" data-party-drag="${index}"`,
        action: `<button data-remove-slot="${index}">離隊</button>`,
      })}
      ${characterSpecTags(member)}
    </div>
  `;
}

function campFormationSlot(id, index) {
  const member = id ? getMember(id) : null;
  if (!member) {
    return `
      <div class="party-slot camp-formation-slot empty" data-slot="${index}">
        <span>0${index + 1}</span>
        <b>空位</b>
      </div>
    `;
  }
  return `
    <div class="party-slot camp-formation-slot ${roleToneClass(member.classId)}" draggable="true" data-slot="${index}" data-party-drag="${index}" data-party-member-id="${member.id}">
      <b>${member.name}</b>
      <span>Lv${member.level}</span>
      <i>${CLASS_DATA[member.classId].role}</i>
      <button data-remove-slot="${index}">離隊</button>
    </div>
  `;
}

function equipmentSummary(member) {
  const count = EQUIPMENT_SLOTS.filter((slot) => normalizeEquipment(member.equipment)[slot.key]).length;
  return `裝備 ${count}/${EQUIPMENT_SLOTS.length}`;
}

function memberDetail(member, options = {}) {
  const cls = CLASS_DATA[member.classId];
  const recruitMode = options.mode === "recruit";
  const statDetailAttrs = recruitMode
    ? `data-open-candidate-stats="${options.candidateIndex}"`
    : `data-open-member-stats="${member.id}"`;
  return `
    <div class="member-detail-layout">
      <div class="member-fullbody-stage ${roleToneClass(member.classId)}" aria-hidden="true">
        ${memberFullBodyPortrait(member)}
      </div>
      <section class="member-detail-info">
        ${characterIdentity(member, { extraClass: "character-detail-head" })}
        ${characterSpecTags(member)}
        <div class="detail-grid">
          ${STAT_KEYS.map((key) => statBox(member, key)).join("")}
        </div>
        <button class="detail-stats-button" ${statDetailAttrs}>詳細能力</button>
        ${recruitMode ? recruitSkillList(member, cls) : `${skillPriorityPanel(member)}${skillPager(member, cls)}`}
      </section>
    </div>
  `;
}

function memberFullBodyPortrait(member) {
  const portrait = portraitUrl(member);
  if (!portrait) {
    return `
      <div class="member-fullbody-placeholder">
        <i></i>
      </div>
    `;
  }
  return `<img src="${escapeHtml(portrait)}" alt="">`;
}

function memberDetailModal() {
  const recruitMode = state.detailCandidateIndex !== null;
  const candidateIndex = recruitMode ? Number(state.detailCandidateIndex) : null;
  const member = recruitMode
    ? state.candidates[candidateIndex]
    : getMember(state.detailMemberId);
  if (!member) return "";
  return `
    <div class="modal-backdrop member-detail-backdrop" data-close-member-detail>
      <article class="panel member-detail-modal" role="dialog" aria-modal="true">
        <button class="modal-close" data-close-member-detail>關閉</button>
        ${memberDetail(member, { mode: recruitMode ? "recruit" : "member", candidateIndex })}
      </article>
    </div>
  `;
}

function memberStatDetailModal() {
  const recruitMode = state.statDetailCandidateIndex !== null;
  const candidateIndex = recruitMode ? Number(state.statDetailCandidateIndex) : null;
  const member = recruitMode ? state.candidates[candidateIndex] : getMember(state.statDetailMemberId);
  if (!member) return "";
  const stats = memberStatsWithChips(member);
  return `
    <div class="modal-backdrop stat-detail-backdrop" data-close-stat-detail>
      <article class="panel stat-detail-modal" role="dialog" aria-modal="true">
        <button class="modal-close" data-close-stat-detail>關閉</button>
        <div class="stat-detail-head">
          ${characterIdentity(member, { extraClass: "character-detail-head" })}
          ${characterSpecTags(member)}
        </div>
        <div class="stat-detail-layout">
          <section class="stat-detail-section">
            <div class="panel-title"><span>能力構成</span></div>
            <div class="stat-breakdown-table">
              <div class="stat-breakdown-row head"><span>項目</span><span>基礎</span><span>晶片</span><span>合計</span></div>
              ${STAT_KEYS.map((key) => statBreakdownRow(member, key)).join("")}
            </div>
          </section>
          <section class="stat-detail-section">
            <div class="panel-title"><span>戰鬥數值</span></div>
            <div class="derived-stat-grid">
              ${derivedCombatStats(member, stats).map(derivedStatCard).join("")}
            </div>
          </section>
          <section class="stat-detail-section stat-chip-section">
            <div class="panel-title"><span>晶片與套裝</span></div>
            <div class="stat-chip-list">
              ${equippedChips(member).filter((chip) => typeof chip === "object").length
                ? equippedChips(member).filter((chip) => typeof chip === "object").map(statChipRow).join("")
                : `<div class="stat-empty">未裝備經脈晶片</div>`}
            </div>
          </section>
        </div>
      </article>
    </div>
  `;
}

function statBreakdownRow(member, key) {
  const base = normalizeStats(member.stats)[key];
  const total = memberStatsWithChips(member)[key];
  const chip = total - base;
  return `
    <div class="stat-breakdown-row">
      <span>${STAT_LABELS[key]}</span>
      <b>${base}</b>
      <b class="${chip ? "positive" : ""}">${chip ? `+${chip}` : "0"}</b>
      <strong>${total}</strong>
    </div>
  `;
}

function derivedCombatStats(member, stats) {
  const bonuses = memberCombatBonuses(member);
  const battleBonuses = activeBattleDerivedBonuses(member);
  const totalSpeedPct = Math.max(0, bonuses.speedPct || 0) + battleBonuses.speedPct;
  const actionGain = (2.1 + stats.reaction * 0.18) * (1 + totalSpeedPct / 100);
  const baseDamage = classDamageStatScore(member.classId, stats);
  const attackPower = baseDamage
    * (1 + Math.max(0, bonuses.powerAmp || 0) / 100)
    * (1 + Math.max(0, bonuses.classBoost || 0) / 100)
    * (1 + battleBonuses.attackPct / 100);
  const critRate = Math.max(0, bonuses.critRate || 0) + battleBonuses.critRate;
  const critDamage = 50 + Math.max(0, bonuses.critDamage || 0) + battleBonuses.critDamage;
  const hitRate = Math.min(99, Math.max(60, 76 + stats.precision * 2 + Math.max(0, bonuses.hitRate || 0) + battleBonuses.hitRate));
  const reflectRate = Math.max(0, bonuses.reflectRate || bonuses.counterDamage || 0);
  const passiveEvadeRate = Math.max(0, bonuses.evadeRate || 0) + battleBonuses.evadeRate;
  const evadeRate = Number.isFinite(battleBonuses.evadeRateOverride) ? battleBonuses.evadeRateOverride : passiveEvadeRate;
  const damageReduce = Math.min(90, battleBonuses.damageReduce || Math.max(0, bonuses.damageReduce || 0));
  const resourceText = battleBonuses.resourceRegenFlat
    ? `+${battleBonuses.resourceRegenFlat}/回合`
    : `+${Math.max(0, bonuses.resourceGain || 0) + battleBonuses.resourceGain}%`;
  return [
    { label: "最大生命", value: Math.round(maxHpOf(member, stats)), note: "主要受耐久影響" },
    { label: "行動速度", value: actionGain.toFixed(2), note: battleBonuses.speedNote || "反應與速度加成" },
    { label: "命中", value: `${hitRate}%`, note: battleBonuses.hitRateNote || "主要受精準影響" },
    { label: "閃避", value: `${evadeRate}%`, note: battleBonuses.evadeRateNote || "裝備與戰鬥狀態" },
    { label: "減傷", value: `${damageReduce}%`, note: battleBonuses.damageReduceNote || "裝備與防禦狀態" },
    { label: "反傷", value: `${reflectRate}%`, note: "受裝備與晶片影響" },
    { label: "攻擊力", value: attackPower.toFixed(1), note: battleBonuses.attackNote || "主屬、裝備與當前目標狀態" },
    { label: "爆擊機率", value: `${critRate}%`, note: battleBonuses.critRateNote || "裝備與技能直接加算" },
    { label: "爆擊傷害", value: `+${critDamage}%`, note: battleBonuses.critDamageNote || "裝備、晶片與戰鬥印記" },
    { label: "資源取得", value: resourceText, note: battleBonuses.resourceNote || "裝備與戰鬥狀態" },
  ];
}

function activeBattleDerivedBonuses(member) {
  const empty = {
    attackPct: 0,
    attackNote: "",
    speedPct: 0,
    speedNote: "",
    hitRate: 0,
    hitRateNote: "",
    evadeRate: 0,
    evadeRateOverride: null,
    evadeRateNote: "",
    damageReduce: 0,
    damageReduceNote: "",
    critRate: 0,
    critRateNote: "",
    critDamage: 0,
    critDamageNote: "",
    resourceGain: 0,
    resourceRegenFlat: 0,
    resourceNote: "",
  };
  if (!member || !state.battle || state.battle.over) return empty;
  const ally = state.battle.allies?.find((item) => item.sourceId === member.id && item.hp > 0);
  if (!ally) return empty;
  const target = activeBattleTargetForUi();
  const attackNotes = [];
  let attackPct = 0;
  if (!ally.front) {
    attackPct += 16;
    attackNotes.push("後排攻擊 +16%");
  }
  if (ally.charged) {
    attackPct += 45;
    attackNotes.push("蓄勢 +45%");
  }
  if (ally.tianshuArray) {
    const arrayPct = Math.round(Math.min(50, Math.max(0, (ally.resource || 0) / 2)));
    if (arrayPct) {
      attackPct += arrayPct;
      attackNotes.push(`勾股交陣 +${arrayPct}%`);
    }
  }
  if (target?.marked) {
    attackPct += 16;
    attackNotes.push("目標標記 +16%");
  }
  if (target?.vulnerableTurns > 0) {
    attackPct += 15;
    attackNotes.push("裂甲 +15%");
  }
  if (target?.seals?.body) {
    attackPct += 5;
    attackNotes.push("破體印 +5%");
  }

  const critRateBonus = Math.max(0, ally.critRateBonus || 0);
  const analysisCritBonus = tianshuAnalysisCritRateBonusPercent(ally);
  const soulSealBonus = activeSoulSealCritRateBonusForUi(ally, target);
  const critRate = critRateBonus + analysisCritBonus + soulSealBonus;
  const critRateNotes = [
    critRateBonus ? `技能|狀態 +${critRateBonus}%` : "",
    analysisCritBonus ? `解析深度 +${analysisCritBonus}%` : "",
    soulSealBonus ? "斷魂印 +5%" : "",
  ].filter(Boolean);
  const critDamageBonus = activeSpiritSealCritDamageBonusForUi(target);
  const critDamageNotes = [
    critDamageBonus ? "裂魄印 +10%" : "",
  ].filter(Boolean);

  const hitRate = Math.max(0, ally.accuracyBonus || 0);
  const evadeRate = activeEvadeRateBonus(ally);
  let evadeRateOverride = null;
  const evadeNotes = [];
  if (ally.wangBianStepActive) evadeNotes.push("彼岸步伐 +30%");
  else if (ally.evadeRateBonus) evadeNotes.push(`技能|狀態 +${Math.max(0, ally.evadeRateBonus || 0)}%`);
  if (ally.wangSoulEvadeTurns > 0) evadeNotes.push("二印銷魂 50%");
  if ((ally.evade || 0) > 0 || ally.flowActive || ally.wangSoulEvadeTurns > 0 || ally.wangBianStepActive) {
    const activeChance = Math.min(82,
      (ally.flowActive ? 72 : 45)
      + Math.max(0, ally.combatBonuses?.evadeRate || 0)
      + activeEvadeRateBonus(ally)
    );
    evadeRateOverride = Math.round(activeChance);
    evadeNotes.push(`目前觸發率 ${evadeRateOverride}%`);
  }

  const defense = activeBattleDamageReductionForUi(ally);
  const resourceNotes = [];
  if (ally.emeiFlowRegenBonus) resourceNotes.push(`斗轉 流光回復 +${Math.max(0, ally.emeiFlowRegenBonus || 0)}/回合`);
  if (ally.emeiChaseEnabled) resourceNotes.push("追影 命中後可能回收流光");
  if (ally.ziqiEast) resourceNotes.push("紫氣東來 消耗紫氣時追加引爆");
  return {
    attackPct,
    attackNote: attackNotes.join("，"),
    speedPct: 0,
    speedNote: "",
    hitRate,
    hitRateNote: hitRate ? `技能|狀態 +${hitRate}%` : "",
    evadeRate,
    evadeRateOverride,
    evadeRateNote: evadeNotes.join("，"),
    damageReduce: defense.value,
    damageReduceNote: defense.note,
    critRate,
    critRateNote: critRateNotes.join("，"),
    critDamage: critDamageBonus,
    critDamageNote: critDamageNotes.join("，"),
    resourceGain: 0,
    resourceRegenFlat: ally.classId === "emei" ? 20 + Math.max(0, ally.emeiFlowRegenBonus || 0) : 0,
    resourceNote: resourceNotes.join("，"),
  };
}

function activeEvadeRateBonus(ally) {
  return Math.max(0, ally?.evadeRateBonus || 0) + (ally?.wangSoulEvadeTurns > 0 ? 5 : 0);
}

function activeBattleTargetForUi() {
  if (!state.battle || state.battle.over) return null;
  const enemies = (state.battle.enemies || []).filter((enemy) => enemy.hp > 0);
  if (!enemies.length) return null;
  return enemies.find((enemy) => enemy.marked) || enemies.slice().sort((a, b) => a.hp - b.hp)[0] || null;
}

function activeBattleDamageReductionForUi(ally) {
  if (!ally) return { value: 0, note: "" };
  const notes = [];
  let multiplier = 1;
  const gearReduce = Math.min(60, Math.max(0, ally.combatBonuses?.damageReduce || 0));
  if (gearReduce) {
    multiplier *= 1 - gearReduce / 100;
    notes.push(`裝備|晶片 -${gearReduce}%`);
  }
  if ((ally.guard || 0) > 0) {
    const guardMultiplier = Math.max(0.35, 0.68 - Math.max(0, ally.combatBonuses?.guardBoost || 0) / 200);
    const guardReduce = Math.round((1 - guardMultiplier) * 100);
    multiplier *= guardMultiplier;
    notes.push(`護身 -${guardReduce}%`);
  }
  return {
    value: Math.round((1 - multiplier) * 100),
    note: notes.join("，"),
  };
}

function activeSoulSealCritRateBonusForUi(ally, target = null) {
  if (!state.battle || state.battle.over) return 0;
  if (ally?.wangSeals?.soul) return 5;
  if (target?.seals?.soul) return 5;
  return state.battle.enemies?.some((enemy) => enemy.hp > 0 && enemy.seals?.soul) ? 5 : 0;
}

function activeSpiritSealCritDamageBonusForUi(target = null) {
  if (!state.battle || state.battle.over) return 0;
  if (target?.seals?.spirit) return 10;
  return state.battle.enemies?.some((enemy) => enemy.hp > 0 && enemy.seals?.spirit) ? 10 : 0;
}

function battleCritRateBonusPercent(ally) {
  if (!ally) return 0;
  return Math.max(0, ally.critRateBonus || 0) + tianshuAnalysisCritRateBonusPercent(ally);
}

function tianshuAnalysisCritRateBonusPercent(ally) {
  if (!ally || ally.classId !== "tianshu") return 0;
  return Math.min(30, Math.max(0, Math.floor((ally.resource || 0) / 10) * 3));
}

function derivedStatCard(entry) {
  return `
    <div class="derived-stat-card">
      <span>${entry.label}</span>
      <b>${entry.value}</b>
      <i>${entry.note}</i>
    </div>
  `;
}

function statChipRow(chip) {
  return `
    <div class="stat-chip-row">
      <b>${chipDisplayName(chip)}</b>
      <span>${chipAbilitySummary(chip)}</span>
      <i>${chipSetSummary(chip)}</i>
    </div>
  `;
}

function openMemberDetail(memberId, tab = null) {
  if (!memberId || !getMember(memberId)) return;
  state.selectedMemberId = memberId;
  state.detailMemberId = memberId;
  state.detailCandidateIndex = null;
  if (["equipment", "active", "passive"].includes(tab)) state.skillTab = tab;
}

function memberDetailTabFromClick(target) {
  if (!target) return null;
  if (target.closest("[data-equip-slot]")) return "active";
  if (target.closest("[data-chip-key], .equipment-tag")) return "equipment";
  return null;
}

function tacticsTemplate() {
  const activeFormation = normalizeFormationIndex(state.activeTacticsFormation);
  const party = tacticsFormationMembers(activeFormation);
  return `
    <section class="screen tactics-screen management-screen place-screen">
      ${settlementNav("tactics")}
      <section class="large-panel tactics-board">
        <div class="panel-title tactics-panel-title">
          <div class="tactics-title-left">
            <span>${formationLabel(activeFormation)}</span>
            ${tacticsFormationSwitcher(activeFormation)}
          </div>
          <div class="tactics-action-strip">
            <button data-clear-formation="${activeFormation}">清空編隊</button>
            <button data-unequip-formation-chips="${activeFormation}">一鍵卸下</button>
            <button data-auto-equip-formation-chips="${activeFormation}">一鍵裝備</button>
          </div>
        </div>
        <div class="tactics-layout">
          <div class="tactics-member-grid">
            ${[0, 1, 2, 3].map((index) => tacticsMemberColumn(party[index], index)).join("")}
          </div>
          <aside class="tactics-side-rail">
            ${chipInventoryPanel({ compact: true })}
            <button class="primary console-sortie-command tactics-sortie-command" data-view="map">
              <b>出戰</b>
            </button>
          </aside>
        </div>
        ${chipEquipmentDrawer()}
      </section>
    </section>
  `;
}

function tacticsFormationSwitcher(activeFormation) {
  return `
    <div class="tactics-formation-switcher" aria-label="切換編隊">
      <button class="${activeFormation === 0 ? "active" : ""}" data-tactics-formation="0">一</button>
      <button class="${activeFormation === 1 ? "active" : ""}" data-tactics-formation="1">二</button>
    </div>
  `;
}

function normalizeFormationIndex(index) {
  return Number(index) === 1 ? 1 : 0;
}

function formationLabel(index) {
  return index === 1 ? "第二編隊" : "第一編隊";
}

function tacticsFormationMemberIds(index) {
  if (index === 1) return [null, null, null, null];
  return state.party;
}

function tacticsFormationMembers(index) {
  return tacticsFormationMemberIds(index).map(getMember);
}

function tacticsOtherFormationPreview(activeFormation) {
  const formations = [0, 1].filter((index) => index !== activeFormation);
  return `
    <section class="panel tactics-formation-preview">
      <div class="tactics-preview-title">其他編隊</div>
      <div class="tactics-preview-list">
        ${formations.map(tacticsFormationPreviewButton).join("")}
      </div>
    </section>
  `;
}

function tacticsFormationPreviewButton(index) {
  const members = tacticsFormationMembers(index).filter(Boolean);
  return `
    <button class="tactics-preview-formation" data-tactics-formation="${index}">
      <b>${formationLabel(index)}</b>
      <div class="tactics-preview-members">
        ${
          members.length
            ? members.slice(0, 4).map(tacticsPreviewMember).join("")
            : `<span class="tactics-preview-empty">預留</span>`
        }
      </div>
    </button>
  `;
}

function tacticsPreviewMember(member) {
  return `
    <span class="tactics-preview-member ${roleToneClass(member.classId)}">
      <b>${member.name}</b>
      <span>Lv${member.level}</span>
      <i>${CLASS_DATA[member.classId].role}</i>
    </span>
  `;
}

function tacticsMemberColumn(member, index) {
  if (!member) {
    return `
      <section class="tactics-member-card empty" data-slot="${index}">
        <span class="console-slot-no">0${index + 1}</span>
        <b>空位</b>
        <i>回營帳拖入成員</i>
      </section>
    `;
  }
  return `
    <section class="tactics-member-card ${roleToneClass(member.classId)}" data-party-member-id="${member.id}">
      <span class="console-slot-no">0${index + 1}</span>
      <div class="tactics-member-main">
        ${memberPortraitFigure(member, "tactics-member-portrait")}
        ${characterIdentity(member, { extraClass: "tactics-character-head", nameAttrs: `data-tactics-name-camp="${member.id}"` })}
        ${characterSpecTags(member)}
      </div>
      <div class="tactics-loadout-grid">
        <div class="tactics-block tactics-skill-block">
          <div class="tactics-block-title">技能</div>
          <div class="tactics-skill-slots">
            ${Array.from({ length: ACTIVE_SKILL_SLOT_COUNT }, (_, slot) => equipSlotInteractive(member, slot)).join("")}
          </div>
        </div>
        <div class="tactics-block tactics-chip-block">
          <div class="tactics-block-title">經脈</div>
          <div class="tactics-chip-slots">
            ${EQUIPMENT_CHIP_SLOTS.map((slot, slotIndex) => tacticsEquipmentSlot(member, slot, slotIndex)).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function tacticsEquipmentSlot(member, slot, slotIndex) {
  const chip = normalizeMeridians(member.meridians || member.equipment)?.[slot.key] || "";
  const ability = chipAbilitySummary(chip);
  const title = chip
    ? `${chipDisplayName(chip)}｜${ability}｜${chipSetSummary(chip)}｜拖曳到其他成員經脈槽交換`
    : "空槽｜點擊開啟經脈晶片欄";
  const safeTitle = escapeHtml(title);
  return `
    <div class="equipment-slot chip-slot tactics-chip-slot ${chip ? "filled" : ""}"
      data-chip-member="${member.id}"
      data-chip-key="${slot.key}"
      ${chip ? "" : `data-open-chip-drawer="${member.id}" data-open-chip-key="${slot.key}"`}
      draggable="${chip ? "true" : "false"}"
      title="${safeTitle}"
      ${chip ? `data-tooltip="${safeTitle}"` : ""}>
      <b>${chip ? "◆" : ""}</b>
    </div>
  `;
}

function chipEquipmentDrawer() {
  const drawer = state.chipDrawer;
  if (!drawer) return "";
  const member = getMember(drawer.memberId);
  const slot = EQUIPMENT_CHIP_SLOTS.find((item) => item.key === drawer.slotKey);
  if (!member || !slot) return "";
  return `
    <aside class="chip-equipment-drawer">
      <div class="panel-title">
        <span>裝備欄</span>
        <button data-close-chip-drawer>關閉</button>
      </div>
      <div class="chip-drawer-target">
        <b>${member.name}</b>
        <span>${slot.channel}｜${slot.label}</span>
      </div>
      ${chipInventoryPanel({ memberId: member.id, slotKey: slot.key, drawer: true })}
    </aside>
  `;
}

function chipAbilitySummary(chip) {
  if (!chip) return "";
  if (typeof chip === "object") {
    const abilities = (chip.abilityStats || [])
      .map((entry) => `${STAT_LABELS[entry.key]}+${entry.value}`)
      .join(" | ");
    const combat = chip.combat ? `${CHIP_COMBAT_STAT_DATA[chip.combat.key]?.name || "戰鬥屬性"}+${chip.combat.value}${CHIP_COMBAT_STAT_DATA[chip.combat.key]?.unit || ""}` : "";
    return [abilities, combat].filter(Boolean).join("｜");
  }
  const stat = STAT_KEYS.find((key) => chip.includes(STAT_LABELS[key]));
  if (stat) return `${STAT_LABELS[stat]}傾向`;
  return "能力資料待接入";
}

function skillPriorityPanel(member) {
  return `
    <div class="equipment-panel">
      <div class="panel-title"><span>出戰技能欄</span><span class="muted">v009 單人作戰 8 格</span></div>
      <div class="equip-slots">
        ${Array.from({ length: ACTIVE_SKILL_SLOT_COUNT }, (_, i) => equipSlotInteractive(member, i)).join("")}
      </div>
    </div>
  `;
}

function equipmentPanel(member) {
  return `
    <div class="equipment-panel">
      <div class="panel-title"><span>裝備欄</span><span class="muted">${equipmentSummary(member)}</span></div>
      <div class="equipment-slots">
        ${EQUIPMENT_SLOTS.map((slot) => equipmentGearSlot(member, slot)).join("")}
      </div>
      <div class="panel-title"><span>經脈晶片</span><span class="muted">義體管理</span></div>
      <div class="equipment-slots">
        ${EQUIPMENT_CHIP_SLOTS.map((slot, index) => equipmentChipSlot(member, slot, index)).join("")}
      </div>
      ${chipInventoryPanel({ memberId: member.id })}
    </div>
  `;
}

function equipmentGearSlot(member, slot) {
  const gear = normalizeEquipment(member.equipment)[slot.key];
  const title = gear
    ? `${gearDisplayName(gear)}｜${gearAbilitySummary(gear)}`
    : `${slot.label}｜拖入${slot.label}裝備`;
  const safeTitle = escapeHtml(title);
  const focused = gear ? isFocusedInventoryEntry({ category: "gear", id: gear.id }) : false;
  return `
    <div class="equipment-slot gear-slot ${gear ? "filled" : ""} ${focused ? "focused" : ""}"
      data-gear-member="${member.id}"
      data-gear-slot="${slot.key}"
      ${gear ? `data-v009-item-focus="gear" data-v009-item-id="${escapeHtml(gear.id)}"` : ""}
      ${gear ? `draggable="true" data-equipped-gear-member="${member.id}" data-equipped-gear-slot="${slot.key}"` : ""}
      title="${safeTitle}"
      data-tooltip="${safeTitle}">
      <span>${slot.label}</span>
      <b>${gear ? gearDisplayName(gear) : slot.empty}</b>
      <i>${gear ? gearAbilitySummary(gear) : slot.focus}</i>
    </div>
  `;
}

function equipmentChipSlot(member, slot, index) {
  const chip = normalizeMeridians(member.meridians || member.equipment)[slot.key];
  const ability = chipAbilitySummary(chip);
  const title = chip
    ? `${chipDisplayName(chip)}｜${ability}｜${chipSetSummary(chip)}｜拖曳到其他經脈槽交換`
    : "空槽｜點擊開啟經脈晶片欄";
  const safeTitle = escapeHtml(title);
  return `
    <div class="equipment-slot chip-slot ${chip ? "filled" : ""}"
      data-chip-member="${member.id}"
      data-chip-key="${slot.key}"
      ${chip ? "" : `data-open-chip-drawer="${member.id}" data-open-chip-key="${slot.key}"`}
      draggable="${chip ? "true" : "false"}"
      title="${safeTitle}"
      ${chip ? `data-tooltip="${safeTitle}"` : ""}>
      <span>${slot.label}</span>
      <b>${chip ? chipDisplayName(chip) : slot.empty}</b>
      ${chip ? `<i>${chipAbilitySummary(chip)}</i>` : ""}
    </div>
  `;
}

function chipInventoryPanel(options = {}) {
  const chips = availableEquipmentChips();
  const classes = ["chip-inventory-panel"];
  if (options.compact) classes.push("compact");
  if (options.drawer) classes.push("drawer-list");
  return `
    <div class="${classes.join(" ")}">
      ${options.drawer || options.compact ? "" : `<div class="chip-inventory-title">現有晶片</div>`}
      <div class="chip-inventory-list">
        ${
          chips.length
            ? chips.map((chip) => chipInventoryRow(chip, options)).join("")
            : `<div class="inventory-empty chip-inventory-empty">沒有可裝備晶片</div>`
        }
      </div>
    </div>
  `;
}

function chipInventoryRow(chip, options = {}) {
  const set = CHIP_SET_DATA[chip.setId]?.name || "套裝";
  const canDirectEquip = options.memberId && options.slotKey;
  return `
    <button class="chip-inventory-row"
      draggable="true"
      data-inventory-chip-id="${chip.id}"
      ${canDirectEquip ? `data-equip-crafted-chip="${chip.id}" data-equip-chip-member="${options.memberId}" data-equip-chip-key="${options.slotKey}"` : ""}
      title="${escapeHtml(`${chip.name}｜${chipAbilitySummary(chip)}｜${chipSetSummary(chip)}`)}">
      <b>${chip.name}</b>
      <span>${chipAbilitySummary(chip)}</span>
      <i>${set}｜Lv${chip.level}</i>
    </button>
  `;
}

function equippedChipIds() {
  const equipped = state.recruits.flatMap((member) => {
    const meridians = normalizeMeridians(member.meridians || member.equipment);
    return EQUIPMENT_CHIP_SLOTS.map((slot) => meridians[slot.key]).filter(Boolean);
  });
  return new Set(equipped.filter((chip) => typeof chip === "object" && chip.id).map((chip) => chip.id));
}

function availableEquipmentChips() {
  const equippedIds = equippedChipIds();
  state.chips = normalizeChipInventory(state.chips);
  return state.chips.filter((chip) => !equippedIds.has(chip.id));
}

function skillPager(member, cls) {
  const tab = ["equipment", "active", "passive"].includes(state.skillTab) ? state.skillTab : "equipment";
  const activeSkills = cls.skills.filter((s) => s.type === "active");
  const passiveSkills = cls.skills.filter((s) => s.type === "passive");
  return `
    <div class="skills" data-skill-pager>
      <div class="skill-tabs">
        <button class="${tab === "equipment" ? "active" : ""}" data-skill-tab="equipment">裝備</button>
        <button class="${tab === "active" ? "active" : ""}" data-skill-tab="active">主動技能</button>
        <button class="${tab === "passive" ? "active" : ""}" data-skill-tab="passive">被動技能</button>
      </div>
      <div class="skill-page ${tab === "equipment" ? "active" : ""}" data-skill-page="equipment">
        ${equipmentPanel(member)}
      </div>
      <div class="skill-page ${tab === "active" ? "active" : ""}" data-skill-page="active">
        ${activeSkills.map((s) => skillRow(member, s)).join("")}
      </div>
      <div class="skill-page ${tab === "passive" ? "active" : ""}" data-skill-page="passive">
        ${passiveSkills.map((s) => skillRow(member, s)).join("")}
      </div>
    </div>
  `;
}

function recruitSkillList(member, cls) {
  const skills = cls.skills;
  return `
    <div class="skills recruit-skill-list">
      <div class="panel-title"><span>技能清單</span></div>
      <div class="skill-page active">
        ${skills.map((s) => recruitSkillRow(member, s)).join("")}
      </div>
    </div>
  `;
}

function recruitSkillRow(member, s) {
  const locked = member.level < s.level;
  const detail = skillDetail(s, member);
  return `
    <div class="skill-row recruit-skill-row ${locked ? "locked" : ""}" title="${escapeHtml(skillTitleText(detail))}">
      <div class="skill-head">
        <div class="skill-name-with-tag">
          <b>${escapeHtml(s.name)}</b>
          ${skillTimingTag(s)}
        </div>
        <span>${locked ? `Lv${s.level}` : s.type === "active" ? skillCostLabel(s, member.classId) : "被動"}</span>
      </div>
      ${skillLabelBody(detail)}
      ${locked ? `<div class="skill-unlock">Lv${s.level} 解鎖</div>` : ""}
    </div>
  `;
}

function skillRow(member, s) {
  const locked = member.level < s.level;
  const equipped = s.type === "active"
    ? member.equippedActive.includes(s.id)
    : member.equippedPassive === s.id;
  const detail = skillDetail(s, member);
  return `
    <div class="skill-row ${locked ? "locked" : ""} ${equipped ? "equipped" : ""}" data-skill-id="${escapeHtml(s.id)}" data-member-skill="${escapeHtml(member.id)}" draggable="${!locked && s.type === "active" ? "true" : "false"}" title="${escapeHtml(skillTitleText(detail))}">
      <div class="skill-head">
        <div class="skill-name-with-tag">
          <b>${escapeHtml(s.name)}</b>
          ${skillTimingTag(s)}
        </div>
        <span>${locked ? `Lv${s.level}` : s.type === "active" ? skillCostLabel(s, member.classId) : "被動"}</span>
      </div>
      ${skillLabelBody(detail)}
      ${locked ? `<div class="skill-unlock">Lv${s.level} 解鎖</div>` : ""}
    </div>
  `;
}

function skillDetail(skillData, member = null) {
  if (!skillData) return { function: "", power: "無", resource: "無", stat: "無" };
  const override = SKILL_DETAILS[skillData.id] || {};
  const generated = buildSkillDetail(skillData, member);
  return { ...generated, ...override };
}

function skillTitleText(detail) {
  return detail?.function || "";
}

function skillLabelBody(detail) {
  return `
    <div class="skill-detail">
      <p>${skillDetailHtml(detail.function)}</p>
      ${skillEffectLineHtml(detail)}
    </div>
  `;
}

function skillEffectLineHtml(detail) {
  const lines = [];
  [detail?.power, detail?.resource, detail?.combo]
    .map((text) => String(text || "").trim())
    .filter((text) => text && text !== "無")
    .forEach((text) => {
      text.split("；")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const normalized = /[。.!?]$/.test(line) ? line : `${line}。`;
          if (!lines.includes(normalized)) lines.push(normalized);
        });
    });
  if (!lines.length) return "";
  return `
    <div class="skill-effect-line">
      ${lines.map((line) => `<span>${skillDetailHtml(line)}</span>`).join("")}
    </div>
  `;
}

function skillMetricRows(detail) {
  const resourceRow = detail.resource
    ? `<span><i>資源</i>${skillDetailHtml(detail.resource)}</span>`
    : "";
  return `
    <div class="skill-metrics">
      <span><i>傷害</i>${skillDetailHtml(detail.power)}</span>
      ${resourceRow}
      <span><i>主屬</i>${skillStatTags(detail.stat)}</span>
    </div>
  `;
}

function skillDetailHtml(text) {
  let html = escapeHtml(String(text || ""));
  html = html.replace(/([+-]?\d+(?:\.\d+)?%?)/g, '<b class="skill-num">$1</b>');
  ["出力", "反應", "供能", "耐久", "精準", "解析", "不動心", "彈藥", "怒氣", "生死印", "裂魄刺", "流光勢", "流光", "紫氣"].forEach((word) => {
    html = html.split(word).join(`<b class="skill-attr">${word}</b>`);
  });
  return html;
}

function skillStatTags(text) {
  return `<span class="slash-tags skill-stat-tags">${String(text || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<b class="skill-attr">${escapeHtml(item)}</b>`)
    .join("")}</span>`;
}

function buildSkillDetail(skillData, member = null) {
  return {
    function: skillPresentationText(skillData) || skillData.summary || "",
    power: skillPowerText(skillData),
    resource: skillResourceText(skillData),
    combo: skillComboText(skillData, member),
    stat: skillStatText(skillData),
  };
}

function skillComboText(skillData, member = null) {
  const combo = skillData ? SKILL_COMBO_DEFINITIONS[skillData.id] : null;
  if (!combo) return "";
  const previousId = skillComboPreviousSkillId(member, combo);
  return `連段條件：${findSkill(previousId)?.name || findSkill(combo.previousSkillId)?.name || "前置技能"}；達成時威力係數 +${combo.bonusCoefficient || 2}`;
}

function skillPowerText(skillData) {
  const special = {
    tianshu_three: "連擊 3 下，每下造成 100% 傷害。",
    tianshu_region: "造成 400% 傷害，解析越深傷害越高。",
    tianshu_body: "造成 500% 傷害，解析越深傷害越高。",
    tianshu_one: "造成 700% 傷害，解析越深傷害越高。",
    tianshu_array: "解析會提升後續攻擊威力。",
    tianshu_nine: "連擊 9 下，每下約造成 56% 傷害。",
    tang_bee: "命中造成 300% 傷害，生物毒每次造成 200% 傷害，持續 5 回合。",
    tang_soul: "命中造成 200% 傷害，化學毒每次造成 300% 傷害，持續 5 回合。",
    tang_bone: "命中造成 300% 傷害，並引爆目標剩餘毒傷。",
    tang_rain: "主目標造成 300% 傷害。",
    tang_heart: "新增毒種類時觸發，造成 300% 傷害。",
    tang_king: "命中造成 400% 傷害，生物毒每次造成 300% 傷害，持續 6 回合。",
    chanlin_vajra_reflect: "受擊時反彈自身最大生命 50% 傷害。",
    chanlin_stone_heart: "開戰取得最大生命 30% 護盾。",
    lei_lianzhu: "連射 5 下，每下造成 60% 傷害。",
    lei_crack: "造成 300% 傷害，並使目標受傷 +15%，持續 3 回合。",
    lei_fullshot: "每發剩餘彈藥造成 200% 傷害。",
    lei_aim: "命中率 +5%，爆擊率 +10%。",
    lei_quick_reload: "彈藥耗盡時立即補滿。",
    lei_lianzhu_plus: "連射 5 下，每下造成 100% 傷害。",
    xinhuo_life_first: "生命低於 30% 時回復最大生命 20%。",
    xinhuo_star_combo: "連擊 3 下，每下約造成 167% 傷害。",
    wang_life_death: "一印追命：造成 300% 傷害，並造成每回合 300% 傷害，持續 10 回合；二印銷魂：造成 400% 傷害，閃避機率提高到 50%，持續 2 回合；三印渡川：造成 800% 傷害。",
    wang_spirit: "造成 200% 傷害，並追加裂魄印。",
    wang_step: "開戰觸發；持續生效；閃避率 +30%。",
    wang_yellow_spring: "敵人生命低於 15% 時觸發，造成 600% 傷害。",
    emei_meteor: "攻擊 3 下，每下造成 100% 傷害。",
    emei_shadow: "攻擊 1 下，造成 400% 傷害。",
    emei_fall_star: "攻擊 1 下，造成 300% 傷害。",
    emei_turning: "每回合流光恢復 +5。",
    emei_chase_shadow: "命中後 30% 機率追擊，追擊造成 200% 傷害。",
    emei_crash_star: "攻擊 3 下，每下約造成 167% 傷害。",
    furnace_dawn: "造成 150% 傷害，下一回合追加 300% 引爆。",
    furnace_ziqi_end: "每 1 紫氣造成 300% 傷害。",
    furnace_east: "消耗紫氣時追加引爆。",
  };
  if (special[skillData.id]) return special[skillData.id];
  if (skillData.type !== "active") return "被動效果。";
  if (skillData.coefficient > 0) return `造成 ${formatSkillPercent(skillData.coefficient)} 傷害。`;
  return "";
}

function formatSkillPercent(coefficient) {
  return `${Math.round((Number(coefficient) || 0) * 100)}%`;
}

function skillResourceText(skillData) {
  const special = {
    tianshu_three: "取得解析 +12。",
    tianshu_region: "需要解析 10；命中後取得解析 +12。",
    tianshu_body: "需要解析 25；命中後取得解析 +14。",
    tianshu_one: "解析達 50 觸發；不消耗解析；每場一次。",
    tianshu_array: "開戰觸發；不消耗解析；每場一次。",
    tianshu_nine: "取得解析 +18。",
    tang_bee: "套用生物毒。",
    tang_soul: "套用化學毒。",
    tang_bone: "消耗並清除被引爆的毒。",
    tang_rain: "開戰觸發；每場一次。",
    tang_heart: "敵人新增毒種類時觸發。",
    tang_king: "刷新或套用生物毒。",
    chanlin_luohan: "取得不動心 +10。",
    chanlin_tiger: "取得不動心 +10。",
    chanlin_vajra_reflect: "不動心達 100 觸發；消耗不動心 100。",
    chanlin_immovable: "取得不動心 +24。",
    chanlin_stone_heart: "開戰觸發；每場一次。",
    chanlin_mingwang: "取得不動心 +10。",
    lei_lianzhu: "消耗彈藥 1。",
    lei_crack: "消耗彈藥 1。",
    lei_fullshot: "消耗所有剩餘彈藥。",
    lei_aim: "開戰觸發；每場一次。",
    lei_quick_reload: "彈藥耗盡時觸發；補滿 4 發；每場一次。",
    lei_lianzhu_plus: "消耗彈藥 1。",
    xinhuo_first: "取得怒氣 +14。",
    xinhuo_heavy: "需要並消耗怒氣 20；不足時改用總之先揍。",
    xinhuo_voice: "開戰觸發；取得怒氣 +20；每場一次。",
    xinhuo_death: "取得怒氣 +14。",
    xinhuo_life_first: "生命低於 30% 觸發；取得怒氣 +10；每場一次。",
    xinhuo_star_combo: "取得怒氣 +14。",
    wang_body: "取得破體印；破體印使目標受傷 +5%。",
    wang_soul: "取得斷魂印；斷魂印使爆擊率 +5%。",
    wang_life_death: "消耗目標身上所有印；沒有印時改用破體錐。",
    wang_spirit: "成功閃避後觸發；取得裂魄印；裂魄印使爆擊傷害 +10%。",
    wang_step: "每場一次；裂魄刺：閃避成功後施展，造成 200% 傷害並追加裂魄印。",
    wang_yellow_spring: "敵人生命低於 15% 時觸發。",
    wang_body_plus: "取得破體印；破體印使目標受傷 +5%。",
    emei_meteor: "消耗流光 40。",
    emei_shadow: "消耗流光 40。",
    emei_fall_star: "消耗流光 40。",
    emei_turning: "開戰觸發；每回合流光恢復額外 +5；每場一次。",
    emei_chase_shadow: "開戰觸發；命中追擊時取得流光 +5；每場一次。",
    emei_crash_star: "消耗流光 40。",
    furnace_long: "取得紫氣 +1。",
    furnace_dawn: "取得紫氣 +1。",
    furnace_ziqi_end: "需要紫氣 1；消耗所有紫氣。",
    furnace_east: "開戰觸發；啟動紫氣追加引爆；每場一次。",
    furnace_zidian: "獲得紫氣時 20% 機率觸發；不消耗紫氣。",
    furnace_sky: "取得紫氣 +1。",
  };
  if (special[skillData.id]) return special[skillData.id];
  if (skillData.ammoCost === "all") return "消耗所有剩餘彈藥。";
  if (skillData.ammoCost) return `消耗彈藥 ${skillData.ammoCost}。`;
  if (skillData.resourceCost) return `消耗${skillClassResourceLabel(skillData)} ${skillData.resourceCost}。`;
  if (skillData.triggerCondition) return `${triggerConditionText(skillData.triggerCondition)}觸發。`;
  return "";
}

function skillStatText(skillData) {
  const special = {
    tianshu_array: "精準|出力|解析",
    chanlin_vajra_reflect: "耐久|供能",
    chanlin_stone_heart: "耐久",
    lei_aim: "精準|出力",
    lei_quick_reload: "反應|出力",
    xinhuo_life_first: "耐久|供能",
    wang_step: "反應",
    wang_yellow_spring: "反應|精準",
    emei_turning: "反應|供能|流光",
    emei_chase_shadow: "反應|精準|流光",
    furnace_east: "出力|供能|紫氣",
  };
  if (special[skillData.id]) return special[skillData.id];
  const classId = classIdForSkill(skillData.id);
  const cls = CLASS_DATA[classId] || null;
  const keys = [...(cls?.main || []), ...(cls?.secondary || [])].slice(0, 3);
  return keys.length ? keys.map((key) => STAT_LABELS[key] || key).join("|") : "依門派主屬性";
}

function skillClassResourceLabel(skillData) {
  return classResourceLabel(classIdForSkill(skillData.id));
}

function classIdForSkill(skillId) {
  for (const [classId, cls] of Object.entries(CLASS_DATA)) {
    if ((cls.skills || []).some((skillData) => skillData.id === skillId)) return classId;
  }
  return "";
}

function triggerConditionText(condition) {
  return {
    battle_start: "開戰",
    resource_at_50: "特殊資源達 50",
    resource_at_100: "特殊資源達 100",
    new_poison_type: "新增毒種類",
    ammo_empty: "彈藥耗盡",
    ally_hp_below_30: "生命低於 30%",
    enemy_hp_below_15: "敵人生命低於 15%",
    after_evade: "成功閃避後",
    resource_gain_chance_20: "獲得特殊資源時 20% 機率",
  }[condition] || condition || "條件達成時";
}

function slashTags(text, extraClass = "") {
  const parts = String(text)
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length <= 1) return text;
  return `<span class="slash-tags ${extraClass}">${parts.map((item) => `<b>${item}</b>`).join("")}</span>`;
}

function equipSlot(member, index) {
  const skillId = member.equippedActive[index];
  return `<div class="equip-slot ${skillId ? "filled" : ""}">${skillId ? skillName(skillId) : `技能 ${index + 1}`}</div>`;
}

function equipSlotInteractive(member, index) {
  if (index >= ACTIVE_SKILL_SLOT_COUNT) {
    return `<div class="equip-slot locked-slot" title="未開放">${lockIcon()}</div>`;
  }
  const skillId = member.equippedActive[index] || "";
  const filled = Boolean(skillId);
  const title = filled ? `${skillName(skillId)} | 拖曳調整順序 | 右鍵移除` : "拖曳主動技能到這裡";
  return `
    <div class="equip-slot ${filled ? "filled" : ""}" data-equip-member="${member.id}" data-equip-slot="${index}" data-equip-skill="${skillId}" draggable="${filled ? "true" : "false"}" title="${title}">
      <span class="slot-index">${index + 1}</span>
      <b>${filled ? skillName(skillId) : "空位"}</b>
    </div>
  `;
}

function skillName(id) {
  for (const cls of Object.values(CLASS_DATA)) {
    const found = cls.skills.find((s) => s.id === id);
    if (found) return found.name;
  }
  return "未知技能";
}

function memberClassName(member) {
  const className = CLASS_DATA[member?.classId]?.name || "";
  return isSimulatedBody(member) ? `${className}(模擬義體)` : className;
}

function memberClassTag(member, extraClass = "") {
  return classTag(member?.classId, extraClass, memberClassName(member));
}

function classTag(classId, extraClass = "", labelOverride = "") {
  const cls = CLASS_DATA[classId];
  return `<span class="meta-tag class-tag ${extraClass}" title="${classDescription(classId)}">${escapeHtml(labelOverride || cls.name)}</span>`;
}

function roleFeatureTags(classId, extraClass = "") {
  return roleTag(classId, extraClass);
}

function roleTag(classId, extraClass = "") {
  const role = CLASS_ROLE_TONES[classId] || "damage";
  return `<span class="meta-tag role-feature role-tag-${role} ${extraClass}">${ROLE_LABELS[role] || "輸出"}</span>`;
}

function levelBadge(member) {
  return `<span class="level-tag level-inline">一階 Lv${member.level}</span>`;
}

function tierBadge(member) {
  return `<span class="level-tag level-inline">一階</span>`;
}

function tavernTemplate() {
  return `
    <section class="screen management-screen place-screen tavern-place facility-screen">
      ${settlementNav("tavern")}
      <section class="large-panel facility-main-panel tavern-candidate-panel">
        <div class="panel-title tavern-recruit-title">
          <span>招募</span>
          <div class="tavern-refresh-actions">
            <i>下次刷新 ${nextRecruitRefreshText()}</i>
            <button data-refresh-recruits ${state.money < RECRUIT_REFRESH_COST ? "disabled" : ""}>刷新 ${RECRUIT_REFRESH_COST}</button>
          </div>
        </div>
        <div class="town-brief">
          ${state.candidates.map((c, i) => recruitCard(c, i)).join("")}
        </div>
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function lockIcon(extraClass = "") {
  const classes = ["lock-icon", extraClass].filter(Boolean).join(" ");
  return `<img class="${classes}" src="./assets/icons/ui_icon_lock_lieyuan_runtime_128_v001.png" alt="" aria-hidden="true">`;
}

function recruitCard(member, index) {
  if (!member) {
    return `
      <div class="brief-card recruit-card recruit-empty">
        <div class="empty-mark">已招募</div>
        <p class="muted">等待新的緣分到來。</p>
      </div>
    `;
  }
  const locked = !!member.locked;
  const canLock = locked || state.money >= RECRUIT_LOCK_COST;
  const rarityClass = ["orange", "red"].includes(member.rarity) ? ` recruit-rarity-${member.rarity}` : "";
  return `
    <div class="brief-card recruit-card${rarityClass} ${locked ? "locked-candidate" : ""}" data-recruit-detail="${index}">
      <div class="recruit-card-main">
        <div class="recruit-bust-stage ${roleToneClass(member.classId)}">
          ${portraitUrl(member) ? `<img src="${escapeHtml(portraitUrl(member))}" alt="">` : `<i>${member.name.slice(0, 1)}</i>`}
        </div>
        <div class="recruit-card-info">
      ${characterIdentity(member, {
        extraClass: "recruit-talk-name",
      })}
      ${characterSpecTags(member)}
        </div>
      </div>
      <div class="recruit-cost-badge">
        <span>雇用</span>
        <b>${member.recruitCost}</b>
      </div>
      <div class="detail-grid recruit-stats">
        ${STAT_KEYS.map((key) => statBox(member, key)).join("")}
      </div>
      <div class="recruit-actions">
        <button data-recruit="${index}" ${state.money < member.recruitCost ? "disabled" : ""}>招募</button>
        <button class="lock-candidate-button ${locked ? "is-locked" : ""}" data-lock-candidate="${index}" ${canLock ? "" : "disabled"}>
          ${lockIcon("candidate-lock-icon")}
          <span>${locked ? "解鎖" : "鎖定"}</span>
        </button>
      </div>
    </div>
  `;
}

function statBox(member, key) {
  return `<div class="stat" title="${STAT_DESCRIPTIONS[key]}">${STAT_LABELS[key]}<b>${member.stats[key]}</b></div>`;
}

function classDescription(classId) {
  const cls = CLASS_DATA[classId];
  if (!cls) return "";
  const main = cls.main.map((key) => STAT_LABELS[key]).join("、");
  const secondary = cls.secondary.map((key) => STAT_LABELS[key]).join("、");
  return `${cls.name}：${cls.role.replace(/\s*\/\s*/g, "、")}。主屬性 ${main}；副屬性 ${secondary}。`;
}

function roleToneClass(classId) {
  return `role-${CLASS_ROLE_TONES[classId] || "damage"}`;
}

function workshopTemplate() {
  if (!workshopUnlocked()) {
    return `
      <section class="screen management-screen place-screen workshop-place facility-screen">
        ${settlementNav("workshop")}
        <section class="large-panel facility-main-panel">
          <div class="v009-locked-panel">
            <b>工坊尚未開放</b>
          </div>
        </section>
        <button class="back-button" data-view="town">返回</button>
      </section>
    `;
  }
  const chipCraftOpen = hasBlueprint("prototype_chip_1") || hasBlueprint("wolf_pack_chip");
  return `
    <section class="screen management-screen place-screen workshop-place facility-screen">
      ${settlementNav("workshop")}
      <section class="large-panel facility-main-panel">
        <div class="panel-title"><span>工坊</span></div>
        <div class="workshop-menu">
          <button class="workshop-option" data-view="workshopUpgrade">
            <b>義體管理</b>
          </button>
          <button class="workshop-option ${chipCraftOpen ? "" : "locked"}" ${chipCraftOpen ? `data-view="workshopChip"` : "disabled"}>
            <b>晶片打造</b>
          </button>
        </div>
        <div class="workshop-reserve-strip">
          <span>經脈晶片</span>
          <span>晶片組合</span>
          <span>打造記錄</span>
        </div>
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function workshopMaterialShelf() {
  const inventory = normalizeInventory(state.inventory);
  const ids = workshopMaterialIds(inventory);
  return `
    <div class="workshop-material-shelf">
      <div class="panel-title"><span>材料清單</span></div>
      <div class="material-stack-grid">
        ${ids.map((id) => `<span class="material-stack material-${ITEM_DATA[id].type}" title="${ITEM_DATA[id].note || ""}">${itemName(id)} <b>${inventory[id] || 0}</b></span>`).join("")}
      </div>
    </div>
  `;
}

function workshopMaterialIds(inventory) {
  return [
    "worn_chip",
    ...["prototype_chip_1", "prototype_chip_2", "prototype_chip_3"].filter((id) => hasBlueprint(id) || inventory[id] > 0),
    "black_sand",
    "xuan_sand_core",
    ...Object.keys(ITEM_DATA).filter((id) => ITEM_DATA[id].type === "monster"),
  ];
}

function workshopChipTemplate() {
  const recipes = visibleChipCraftRecipes();
  return `
    <section class="screen management-screen place-screen workshop-chip-place">
      ${settlementNav("workshop")}
      <section class="large-panel workshop-craft-panel">
        <div class="panel-title"><span>晶片打造</span></div>
        <div class="chip-craft-grid">
          ${recipes.length ? recipes.map(chipCraftCard).join("") : `<div class="inventory-empty">尚未取得藍圖</div>`}
        </div>
        ${craftedChipList()}
      </section>
      <aside class="panel workshop-material-panel">
        ${workshopMaterialShelf()}
      </aside>
      <button class="back-button" data-view="workshop">返回工坊</button>
    </section>
  `;
}

function chipCraftCard(recipe) {
  const outputName = recipe.kind === "equipment-chip" ? `${CHIP_TIER_DATA[recipe.tier].name}${CHIP_SET_DATA[recipe.setId].name}晶片` : itemName(recipe.output.id);
  const canCraft = canCraftChip(recipe);
  return `
    <div class="chip-craft-card">
      <div class="chip-craft-head">
        <b>${outputName}</b>
        <span>${chipCraftDescription(recipe)}</span>
      </div>
      ${chipCraftCosts(recipe)}
      <button data-craft-chip="${recipe.id}" ${canCraft ? "" : "disabled"}>${recipe.kind === "prototype" ? "改造" : "打造"}</button>
    </div>
  `;
}

function visibleChipCraftRecipes() {
  return CHIP_CRAFT_RECIPES.filter((recipe) => hasBlueprint(recipe.blueprintKey));
}

function chipCraftDescription(recipe) {
  if (recipe.kind === "equipment-chip") {
    return `打造具有${CHIP_SET_DATA[recipe.setId]?.name || "套裝"}之力的晶片。`;
  }
  return ITEM_DATA[recipe.output.id]?.note || "";
}

function chipCraftCosts(recipe) {
  return `
    <div class="chip-craft-costs">
      ${recipe.costs.map((cost) => {
        const held = craftCostHeld(cost);
        const ok = held >= cost.count ? "ok" : "bad";
        return `<span class="${ok} ${craftCostToneClass(cost)}">${craftCostName(cost)} <b>${held}/${cost.count}</b></span>`;
      }).join("")}
    </div>
  `;
}

function canCraftChip(recipe) {
  if (!recipe || !hasBlueprint(recipe.blueprintKey)) return false;
  return recipe.costs.every((cost) => craftCostHeld(cost) >= cost.count);
}

function canCraftGear(recipe) {
  if (!recipe || !hasBlueprint(recipe.blueprintKey)) return false;
  return recipe.costs.every((cost) => craftCostHeld(cost) >= cost.count);
}

function craftChip(recipeId) {
  const recipe = CHIP_CRAFT_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe || !canCraftChip(recipe)) return;
  state.inventory = normalizeInventory(state.inventory);
  recipe.costs.forEach(payCraftCost);
  if (recipe.kind === "equipment-chip") {
    state.chips = normalizeChipInventory(state.chips);
    state.chips.push(generateEquipmentChip(recipe));
  } else {
    addInventoryItems([recipe.output]);
  }
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  saveGame();
  render();
}

function craftGear(recipeId) {
  const recipe = GEAR_CRAFT_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe || !canCraftGear(recipe)) return;
  state.inventory = normalizeInventory(state.inventory);
  recipe.costs.forEach(payCraftCost);
  addGearItems([gearFromRecipe(recipe)]);
  addFeed(`鍛造完成：${recipe.name}。`, "gold");
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  saveGame();
  render();
}

function randomGearStatsForRecipe(recipe) {
  const keys = shuffled(STAT_KEYS).slice(0, 2);
  while (keys.length < 2) keys.push(randomOf(STAT_KEYS));
  const level = Math.max(1, Number(recipe?.level) || 1);
  const high = Math.max(2, Math.round(2.5 + level * 0.38 + Math.random() * 0.8));
  const low = Math.max(1, Math.round(1.5 + level * 0.24 + Math.random() * 0.6));
  return [
    { key: keys[0], value: high },
    { key: keys[1], value: low },
  ].sort((a, b) => b.value - a.value);
}

function randomGearCombatForRecipe(recipe) {
  const pool = GEAR_RANDOM_COMBAT_STAT_KEYS;
  const count = Math.max(1, Math.min(pool.length, Math.floor(recipe?.combatCount || 1)));
  const value = Number.isFinite(recipe?.combatValue) ? Math.max(1, recipe.combatValue) : null;
  const level = Math.max(1, Number(recipe?.level) || 1);
  const keys = shuffled(pool).slice(0, count);
  const entries = keys.map((key) => ({
    key,
    value: value ?? Math.max(1, Math.round(2 + level * 0.22 + Math.random() * 2)),
  }));
  return entries.length === 1 ? entries[0] : entries;
}

function gearFromRecipe(recipe) {
  return normalizeGearInstance({
    id: cryptoRandomId(),
    name: recipe.name,
    source: "crafted",
    recipeId: recipe.id,
    setId: recipe.setId || "",
    slot: recipe.slot,
    level: recipe.level,
    classId: recipe.classId || "",
    stats: randomGearStatsForRecipe(recipe),
    combat: randomGearCombatForRecipe(recipe),
  });
}

function craftCostName(cost) {
  if (cost.resource) return RESOURCE_DATA[cost.resource]?.name || cost.resource;
  return itemName(cost.id);
}

function craftCostHeld(cost) {
  if (cost.resource === "money") return state.money;
  if (cost.resource === "material") return state.material;
  if (cost.resource === "energy") return state.energy;
  const inventory = normalizeInventory(state.inventory);
  return inventory[cost.id] || 0;
}

function craftCostToneClass(cost) {
  if (cost.resource) return `craft-resource-${cost.resource}`;
  return `craft-item-${ITEM_DATA[cost.id]?.type || "material"}`;
}

function payCraftCost(cost) {
  if (cost.resource === "money") {
    state.money -= cost.count;
    return;
  }
  if (cost.resource === "material") {
    state.material -= cost.count;
    return;
  }
  if (cost.resource === "energy") {
    state.energy -= cost.count;
    return;
  }
  state.inventory[cost.id] -= cost.count;
  if (state.inventory[cost.id] <= 0) delete state.inventory[cost.id];
}

function craftedChipList() {
  state.chips = normalizeChipInventory(state.chips);
  return `
    <div class="crafted-chip-shelf">
      <div class="panel-title"><span>已打造晶片</span><span class="muted">${state.chips.length}</span></div>
      <div class="crafted-chip-list">
        ${state.chips.length ? state.chips.map(craftedChipRow).join("") : `<div class="inventory-empty">尚無成品晶片</div>`}
      </div>
    </div>
  `;
}

function craftedChipRow(chip) {
  return `
    <div class="crafted-chip-row">
      <b>${chip.name}</b>
      <span>${chipAbilitySummary(chip)}</span>
      <i>${chipSetSummary(chip)}</i>
    </div>
  `;
}

function generateEquipmentChip(recipe) {
  const tier = recipe.tier || 1;
  const tierData = CHIP_TIER_DATA[tier];
  const setId = recipe.setId || "wolf_pack";
  const progressLevel = Math.min(tierData.maxLevel, Math.max(1, state.maxClearedLevel + 1));
  const statKeys = shuffled(STAT_KEYS).slice(0, 2);
  const mainValue = Math.max(1, Math.round(tierData.abilityBase + progressLevel * tierData.abilityPerLevel + Math.random() * 2));
  const subValue = Math.max(1, Math.round(mainValue * (0.58 + Math.random() * 0.24)));
  const abilityStats = [
    { key: statKeys[0], value: mainValue },
    { key: statKeys[1], value: subValue },
  ].sort((a, b) => b.value - a.value);
  const combatKey = randomOf(CHIP_SET_DATA[setId].combatStats || Object.keys(CHIP_COMBAT_STAT_DATA));
  const combatValue = Math.max(1, Math.round(tierData.combatBase + progressLevel * tierData.combatPerLevel + Math.random()));
  const chip = {
    id: cryptoRandomId(),
    tier,
    setId,
    level: progressLevel,
    abilityStats,
    combat: { key: combatKey, value: combatValue },
  };
  chip.name = chipName(chip);
  return chip;
}

function chipName(chip) {
  const tierName = CHIP_TIER_DATA[chip.tier]?.name || "一階";
  const mainStat = chip.abilityStats?.slice().sort((a, b) => b.value - a.value)[0]?.key || "output";
  const styleName = CHIP_STAT_STYLE_LABELS[mainStat] || "力量型";
  const setName = CHIP_SET_DATA[chip.setId]?.name || "狼群";
  return `${tierName}${styleName}${setName}晶片`;
}

function chipDisplayName(chip) {
  if (!chip) return "";
  return typeof chip === "string" ? chip : chip.name;
}

function gearDisplayName(gear) {
  return gear?.name || "";
}

function gearSlotLabel(slotKey) {
  return EQUIPMENT_SLOTS.find((slot) => slot.key === slotKey)?.label || "裝備";
}

function gearAbilitySummary(gear) {
  if (!gear) return "";
  const stats = (gear.stats || []).map((entry) => `${STAT_LABELS[entry.key]}+${entry.value}`).join(" | ");
  const combat = gearCombatEntries(gear).map((entry) => `${combatBonusLabel(entry.key)}+${entry.value}${combatBonusUnit(entry.key)}`).join(" | ");
  const set = gear.setId && GEAR_SET_DATA[gear.setId] ? GEAR_SET_DATA[gear.setId].name : "";
  return [stats, combat, set].filter(Boolean).join("｜");
}

function gearCombatEntries(gear) {
  if (!gear) return [];
  return normalizeGearCombatEntries(gear.combat);
}

function combatBonusLabel(key) {
  return GEAR_COMBAT_STAT_DATA[key]?.name || CHIP_COMBAT_STAT_DATA[key]?.name || key;
}

function combatBonusUnit(key) {
  return GEAR_COMBAT_STAT_DATA[key]?.unit || CHIP_COMBAT_STAT_DATA[key]?.unit || "";
}

function chipSetId(chip) {
  if (!chip) return "";
  if (typeof chip === "object") return chip.setId || "";
  return equipmentChipSetName(chip);
}

function chipSetSummary(chip) {
  const set = CHIP_SET_DATA[chipSetId(chip)];
  if (!set) return "套裝資料待接入";
  return `${set.name}：${set.effects.map((effect) => `${effect.pieces}件 ${effect.text}`).join(" | ")}`;
}

function equippedChips(member) {
  const meridians = normalizeMeridians(member?.meridians || member?.equipment);
  return MERIDIAN_CHIP_SLOTS.map((slot) => meridians[slot.key]).filter(Boolean);
}

function equippedGear(member) {
  const equipment = normalizeEquipment(member?.equipment);
  return EQUIPMENT_SLOTS.map((slot) => equipment[slot.key]).filter(Boolean);
}

function memberStatsWithChips(member) {
  const stats = { ...normalizeStats(member?.stats) };
  equippedGear(member)
    .filter((gear) => typeof gear === "object")
    .forEach((gear) => {
      (gear.stats || []).forEach((entry) => {
        if (STAT_KEYS.includes(entry.key)) stats[entry.key] += safeNumber(entry.value, 0, 0);
      });
    });
  equippedChips(member)
    .filter((chip) => typeof chip === "object")
    .forEach((chip) => {
      (chip.abilityStats || []).forEach((entry) => {
        if (STAT_KEYS.includes(entry.key)) stats[entry.key] += safeNumber(entry.value, 0, 0);
      });
    });
  return stats;
}

function memberCombatBonuses(member) {
  const bonuses = { critRate: 0, critDamage: 0, classBoost: 0, powerAmp: 0, maxHpPct: 0, speedPct: 0, resourceMax: 0, resourceGain: 0, guardBoost: 0, damageReduce: 0, evadeRate: 0 };
  const gearList = equippedGear(member);
  gearList.forEach((gear) => {
    gearCombatEntries(gear).forEach((entry) => {
      if (GEAR_COMBAT_STAT_DATA[entry.key]) bonuses[entry.key] += safeNumber(entry.value, 0, 0);
    });
  });
  const gearSetCounts = gearList.reduce((counts, gear) => {
    if (gear.setId) counts[gear.setId] = (counts[gear.setId] || 0) + 1;
    return counts;
  }, {});
  Object.entries(gearSetCounts).forEach(([setId, count]) => {
    (GEAR_SET_DATA[setId]?.effects || []).forEach((effect) => {
      if (count >= effect.pieces && GEAR_COMBAT_STAT_DATA[effect.stat]) bonuses[effect.stat] += effect.value;
    });
  });
  const chips = equippedChips(member).filter((chip) => typeof chip === "object");
  chips.forEach((chip) => {
    if (CHIP_COMBAT_STAT_DATA[chip.combat?.key]) bonuses[chip.combat.key] += safeNumber(chip.combat.value, 0, 0);
  });
  const setCounts = chips.reduce((counts, chip) => {
    counts[chip.setId] = (counts[chip.setId] || 0) + 1;
    return counts;
  }, {});
  Object.entries(setCounts).forEach(([setId, count]) => {
    (CHIP_SET_DATA[setId]?.effects || []).forEach((effect) => {
      if (count >= effect.pieces && CHIP_COMBAT_STAT_DATA[effect.stat]) bonuses[effect.stat] += effect.value;
    });
  });
  return bonuses;
}

function yaoHengzhouPanel() {
  const dialogue = state.workshopTalkEntry;
  const active = !!dialogue;
  const line = active ? dialogue.line : "......";
  return `
    <div class="workshop-contact ${active ? "active" : ""}" data-workshop-talk>
      <div class="talker-avatar workshop-avatar">姚</div>
      <div class="workshop-contact-main">
        <div class="workshop-contact-head">
          <b>姚衡舟</b>
          <span class="meta-tag class-tag">華山軍工</span>
          <span class="meta-tag role-feature">翠穹工房負責人</span>
        </div>
        ${dialogueBubble(line, `workshop-dialogue ${active ? "" : "idle-dialogue"}`, "姚衡舟")}
      </div>
    </div>
  `;
}

function yaoDialoguePool() {
  const reviewTopics = DIALOGUE_POOLS.workshopYao || {};
  const reviewEntries = Object.values(reviewTopics).flatMap((topic) =>
    (topic.lines || []).map((line) => ({
      topic: topic.label || topic.topic || "工房",
      tone: topic.tone || "workshop",
      line,
    })),
  );
  if (reviewEntries.length) return reviewEntries;
  return [
    ...YAO_HENGZHOU_LINES.map((line) => ({ topic: "義體武俠", tone: "workshop", line })),
    ...YAO_FEIJIAN_LINES.map((line) => ({ topic: "飛劍執念", tone: "feijian", line })),
    ...YAO_FACTION_LINES.map((line) => ({ topic: "門派吐槽", tone: "faction", line })),
  ];
}

function yaoDialogueEntry(index) {
  const pool = yaoDialoguePool();
  return pool[((index % pool.length) + pool.length) % pool.length] || { topic: "工房", tone: "workshop", line: "" };
}

function randomYaoDialogue() {
  const pool = yaoDialoguePool();
  if (!pool.length) return null;
  const candidates = pool.filter((entry) => entry.line !== state.workshopTalkEntry?.line);
  const source = candidates.length ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function workshopUpgradeTemplate() {
  return `
    <section class="screen management-screen place-screen workshop-upgrade-place">
      ${settlementNav("workshop")}
      ${placeHeader("工坊", "義體管理", `${state.material} 資材`, ["任督晶片"])}
      <section class="large-panel">
        <div class="panel-title"><span>成員調校</span></div>
        <div class="list" style="max-height: calc(100vh - 210px);">
          ${workshopUpgradeMembers().map(workshopRow).join("")}
        </div>
      </section>
      <button class="back-button" data-view="workshop">返回工坊</button>
    </section>
  `;
}

function itemsTemplate() {
  const sortLabels = { order: "取得順序", type: "類型", value: "價值" };
  const entries = sortedInventoryEntries();
  return `
    <section class="screen management-screen place-screen inventory-place">
      ${settlementNav("town")}
      ${placeHeader("所持物品", sortLabels[state.itemSort] || "取得順序", `${entries.length} 種`, ["材料", "晶片"])}
      <section class="large-panel inventory-panel">
        <div class="panel-title">
          <span>物品清單</span>
          <div class="inventory-sort-tabs">
            ${Object.entries(sortLabels).map(([key, label]) => `<button class="${state.itemSort === key ? "active" : ""}" data-item-sort="${key}">${label}</button>`).join("")}
          </div>
        </div>
        <div class="inventory-list">
          ${entries.length ? entries.map(inventoryRow).join("") : `<div class="inventory-empty">尚無物品</div>`}
        </div>
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function inventoryRow(entry) {
  const rarity = itemLabelRarity(entry);
  const note = entry.data.note || itemTypeLabel(entry.id);
  return `
    <div class="inventory-row inventory-item-card item-rarity-${rarity.id} material-${entry.data.type}">
      <div class="item-label-main">
        <b>${itemName(entry.id)}</b>
        <span>${rarity.label}</span>
      </div>
      <div class="item-label-meta">
        <span>${itemTypeLabel(entry.id)}</span>
        <i>價值 ${entry.value}</i>
      </div>
      <p>${note}</p>
      <strong>x${entry.count}</strong>
    </div>
  `;
}

function itemLabelRarity(entry) {
  if (entry.value >= 300) return { id: "legendary", label: "傳奇" };
  if (entry.value >= 150) return { id: "rare", label: "稀有" };
  if (entry.value >= 80) return { id: "magic", label: "精良" };
  return { id: "common", label: "普通" };
}

function marketTemplate() {
  const mode = state.marketMode === "sell" ? "sell" : "buy";
  const entries = mode === "sell" ? inventoryEntries() : marketBuyEntries();
  return `
    <section class="screen management-screen place-screen market-place">
      ${settlementNav("market")}
      <section class="large-panel market-panel">
        <div class="panel-title market-panel-title">
          <div class="market-mode-tabs">
            <button class="${mode === "buy" ? "active" : ""}" data-market-mode="buy">購買</button>
            <button class="${mode === "sell" ? "active" : ""}" data-market-mode="sell">販賣</button>
          </div>
        </div>
        <div class="market-list">
          ${entries.length ? entries.map((entry) => mode === "sell" ? marketSellRow(entry) : marketBuyRow(entry)).join("") : `<div class="inventory-empty">沒有可交易物品</div>`}
        </div>
      </section>
      <aside class="market-side-panel">
        ${marketResourcePanel()}
        ${marketExchangePanel()}
      </aside>
    </section>
  `;
}

function marketBuyRow(entry) {
  const soldOut = entry.stock <= 0;
  const disabled = state.money < entry.buyPrice || soldOut ? "disabled" : "";
  return `
    <div class="market-row material-${entry.data.type}">
      <b>${itemName(entry.id)}</b>
      <span>${itemTypeLabel(entry.id)}</span>
      <i>價值 ${entry.value}</i>
      <em>存貨 ${entry.stock}</em>
      <strong>荒幣 ${entry.buyPrice}</strong>
      <button data-buy-item="${entry.id}" ${disabled}>${soldOut ? "售完" : "購買"}</button>
    </div>
  `;
}

function marketResourcePanel() {
  return `
    <div class="market-resource-panel">
      ${resourceSummaryList()}
    </div>
  `;
}

function marketExchangePanel() {
  const pairs = [
    ["money", "material"],
    ["material", "money"],
    ["money", "energy"],
    ["energy", "money"],
    ["material", "energy"],
    ["energy", "material"],
  ];
  return `
    <div class="market-exchange-panel">
      <div class="market-exchange-buttons">
        ${pairs.map(([from, to]) => marketExchangeButton(from, to)).join("")}
      </div>
    </div>
  `;
}

function marketExchangeButton(from, to) {
  const amount = defaultResourceExchangeAmount(from);
  const output = calculateResourceExchange(from, to, amount);
  const disabled = resourceAmount(from) < amount || output <= 0 ? "disabled" : "";
  return `
    <button class="market-exchange-button ${RESOURCE_DATA[from].tone}-to-${RESOURCE_DATA[to].tone}" data-resource-exchange-from="${from}" data-resource-exchange-to="${to}" ${disabled}>
      <span class="resource-${RESOURCE_DATA[from].tone}">${RESOURCE_DATA[from].name} <b>${amount}</b></span>
      <i>→</i>
      <span class="resource-${RESOURCE_DATA[to].tone}">${RESOURCE_DATA[to].name} <b>${output}</b></span>
    </button>
  `;
}

function defaultResourceExchangeAmount(from) {
  if (from === "money") return 60;
  if (from === "material") return 10;
  if (from === "energy") return 6;
  return 1;
}

function resourceSummaryList() {
  return `
    <div class="console-resource-list market-resource-list">
      <span class="resource-money">荒幣 <b>${state.money}</b></span>
      <span class="resource-material">資材 <b>${state.material}</b></span>
      <span class="resource-energy">能源 <b>${state.energy}</b></span>
    </div>
  `;
}

function resourceAmount(id) {
  if (id === "money") return state.money;
  if (id === "material") return state.material;
  if (id === "energy") return state.energy;
  return 0;
}

function addResource(id, amount) {
  if (id === "money") state.money += amount;
  if (id === "material") state.material += amount;
  if (id === "energy") state.energy += amount;
}

function spendResource(id, amount) {
  if (id === "money") state.money -= amount;
  if (id === "material") state.material -= amount;
  if (id === "energy") state.energy -= amount;
}

function calculateResourceExchange(from, to, amount) {
  if (from === to) return 0;
  const fromValue = RESOURCE_EXCHANGE_VALUES[from] || 0;
  const toValue = RESOURCE_EXCHANGE_VALUES[to] || 0;
  if (!fromValue || !toValue) return 0;
  return Math.floor(amount * fromValue * RESOURCE_EXCHANGE_RATE / toValue);
}

function resourceExchangeRatio(from, to) {
  const fromValue = RESOURCE_EXCHANGE_VALUES[from] || 1;
  const toValue = RESOURCE_EXCHANGE_VALUES[to] || 1;
  const input = Math.ceil(toValue / (fromValue * RESOURCE_EXCHANGE_RATE));
  return `${RESOURCE_DATA[from].name} ${input} : ${RESOURCE_DATA[to].name} 1`;
}

function marketSellRow(entry) {
  return `
    <div class="market-row material-${entry.data.type}">
      <b>${itemName(entry.id)}</b>
      <span>持有 ${entry.count}</span>
      <i>價值 ${entry.value}</i>
      <strong>荒幣 ${entry.value}</strong>
      <button data-sell-item="${entry.id}">販賣</button>
    </div>
  `;
}

function workshopRow(member) {
  const upgraded = member.id === state.lastUpgradeId ? "upgrade-success" : "";
  const partyIndex = state.party.indexOf(member.id);
  const inParty = partyIndex >= 0;
  const meridians = normalizeMeridians(member.meridians || member.equipment);
  const chipCount = MERIDIAN_CHIP_SLOTS.filter((slot) => meridians[slot.key]).length;
  return `
    <div class="member-card workshop-card ${upgraded} ${inParty ? "in-party" : ""}">
      <div class="workshop-identity">
        <div class="workshop-level">
          <span>Lv</span>
          <b>${member.level}</b>
        </div>
        ${memberPortraitFigure(member, "workshop-row-portrait")}
        <div>
          ${characterIdentity(member, { badge: "tier" })}
          ${inParty ? `<div class="workshop-party-mark">第一隊 0${partyIndex + 1}</div>` : ""}
          ${characterSpecTags(member)}
        </div>
      </div>
      <div class="upgrade-cost">
        <span class="cost-ok">經脈晶片 <b>${chipCount}/${MERIDIAN_CHIP_SLOTS.length}</b></span>
        <span>等級由戰鬥經驗提升</span>
      </div>
      <div class="upgrade-actions">
        <button class="upgrade-button" data-view="tactics">調整經脈</button>
      </div>
    </div>
  `;
}

function workshopUpgradeMembers() {
  return state.recruits.slice().sort((a, b) => {
    const aSlot = state.party.indexOf(a.id);
    const bSlot = state.party.indexOf(b.id);
    const aParty = aSlot >= 0 ? aSlot : 99;
    const bParty = bSlot >= 0 ? bSlot : 99;
    return aParty - bParty || b.level - a.level || a.name.localeCompare(b.name, "zh-Hant");
  });
}

function upgradeActionButton(member, levels, label, canPay = null) {
  const targetLevels = levels === "max" ? maxAffordableUpgradeLevels(member) : Math.min(Number(levels), Math.max(0, MAX_LEVEL - member.level));
  const cost = upgradeCostForLevels(member, targetLevels);
  const enabled = canPay == null ? targetLevels > 0 && canPayUpgradeCost(cost) : canPay;
  const title = targetLevels > 0 ? `荒幣 ${cost.money} | 資材 ${cost.material}` : "已達上限";
  return `<button class="upgrade-button" data-upgrade="${member.id}" data-upgrade-levels="${levels}" title="${title}" ${enabled ? "" : "disabled"}>${label}</button>`;
}

function upgradeCost(member) {
  return {
    money: Math.floor(40 + member.level * 12),
    material: Math.floor(10 + member.level * 4),
  };
}

function upgradeCostAtLevel(member, level) {
  return upgradeCost({ ...member, level });
}

function upgradeCostForLevels(member, levels) {
  const count = Math.max(0, Math.min(safeNumber(levels, 0, 0), MAX_LEVEL - (member?.level || MAX_LEVEL)));
  const total = { money: 0, material: 0 };
  for (let i = 0; i < count; i += 1) {
    const cost = upgradeCostAtLevel(member, member.level + i);
    total.money += cost.money;
    total.material += cost.material;
  }
  return total;
}

function canPayUpgradeCost(cost) {
  return state.money >= cost.money && state.material >= cost.material;
}

function maxAffordableUpgradeLevels(member) {
  let levels = 0;
  let money = state.money;
  let material = state.material;
  while (member.level + levels < MAX_LEVEL) {
    const cost = upgradeCostAtLevel(member, member.level + levels);
    if (money < cost.money || material < cost.material) break;
    money -= cost.money;
    material -= cost.material;
    levels += 1;
  }
  return levels;
}

function gatherLocation(id) {
  return GATHER_LOCATIONS.find((location) => location.id === id) || GATHER_LOCATIONS[0];
}

function availableGatherMembers() {
  const partyIds = new Set(state.party.filter(Boolean));
  return state.recruits.filter((member) => !partyIds.has(member.id));
}

function selectedGatherMember() {
  const members = availableGatherMembers();
  const selected = members.find((member) => member.id === state.gather.workerId);
  if (selected) return selected;
  return members[0] || null;
}

function gatherBossCount() {
  return Math.floor(Math.max(0, state.maxClearedLevel) / 5);
}

function gatherEfficiency(member) {
  const levelBonus = Math.max(0, member?.level || 1) * GATHER_MEMBER_LEVEL_BONUS;
  const bossBonus = gatherBossCount() * GATHER_BOSS_BONUS;
  return 1 + levelBonus + bossBonus;
}

function gatherEnergyReward(member, durationMinutes) {
  return Math.round(durationMinutes * GATHER_BASE_ENERGY_PER_MINUTE * gatherEfficiency(member));
}

function gatherDropPool(locationId) {
  const location = gatherLocation(locationId);
  const openLevel = Math.max(1, state.maxClearedLevel + 1);
  const weighted = [];
  const pushDrop = (id, weight) => {
    if (!ITEM_DATA[id] || (ITEM_UNLOCK_LEVEL[id] || 1) > openLevel) return;
    weighted.push({ id, weight: Math.max(1, Math.round(weight)) });
  };
  for (const drop of GLOBAL_DROPS) pushDrop(drop.id, drop.chance * 100);
  for (const drop of location.regionDrops || []) pushDrop(drop.id, drop.chance * 100);
  Object.entries(ITEM_UNLOCK_LEVEL).forEach(([id, level]) => {
    if (level <= openLevel && ITEM_DATA[id]?.type === "monster") pushDrop(id, marketWeight(id));
  });
  return weighted;
}

function rollGatherDrop(locationId) {
  const pool = gatherDropPool(locationId);
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  if (!total) return null;
  let cursor = Math.random() * total;
  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor <= 0) return { id: entry.id, count: 1 };
  }
  return { id: pool[pool.length - 1].id, count: 1 };
}

function calculateGatherReward(member, durationMinutes, locationId) {
  const reward = {
    energy: gatherEnergyReward(member, durationMinutes),
    items: [],
    efficiency: gatherEfficiency(member),
  };
  for (let i = 0; i < Math.floor(durationMinutes / 5); i += 1) {
    mergeRewardItems(reward.items, [rollGatherDrop(locationId)].filter(Boolean));
  }
  return reward;
}

function gatherTemplate() {
  const task = state.gather;
  const locked = !task.unlocked;
  const location = gatherLocation(task.locationId);
  const members = availableGatherMembers();
  const selected = selectedGatherMember();
  const duration = GATHER_DURATIONS.includes(Number(task.durationMinutes)) ? Number(task.durationMinutes) : 10;
  const preview = selected ? calculateGatherReward(selected, duration, task.locationId) : { energy: 0, items: [], efficiency: 1 };
  return `
    <section class="screen management-screen place-screen gather-place">
      ${settlementNav("town")}
      ${placeHeader("採集", timedTaskTitle("gather", task), locked ? "未開放" : location.name, [`能源 x${preview.efficiency.toFixed(2)}`])}
      <section class="large-panel gather-panel">
        ${locked ? gatherLockedCard() : task.active || task.completed ? gatherStatusCard(task) : gatherDispatchCard(members, selected, duration, preview)}
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function gatherLockedCard() {
  return `
    <div class="timed-task-card locked">
      <b>未開放</b>
      <p>擊倒第一隻頭目後開放。</p>
    </div>
  `;
}

function gatherDispatchCard(members, selected, duration, preview) {
  return `
    <div class="gather-layout">
      <div class="gather-column">
        <div class="panel-title"><span>地點</span></div>
        <div class="gather-location-list">
          ${GATHER_LOCATIONS.map(gatherLocationButton).join("")}
        </div>
        <div class="panel-title"><span>時間</span></div>
        <div class="gather-duration-list">
          ${GATHER_DURATIONS.map((minutes) => `<button class="${duration === minutes ? "active" : ""}" data-gather-duration="${minutes}">${minutes}分</button>`).join("")}
        </div>
      </div>
      <div class="gather-column gather-member-column">
        <div class="panel-title"><span>派遣</span></div>
        <div class="gather-member-list">
          ${members.length ? members.map((member) => gatherMemberButton(member, selected?.id)).join("") : `<div class="inventory-empty">沒有可派遣成員</div>`}
        </div>
      </div>
      <div class="gather-column gather-reward-column">
        <div class="panel-title"><span>預估</span></div>
        <div class="gather-reward-card">
          <span>能源</span>
          <b>${preview.energy}</b>
          <i>${Math.floor(duration / 5)} 次掉落</i>
          ${gatherRewardItems(preview.items)}
          <button data-start-gather ${selected ? "" : "disabled"}>開始採集</button>
        </div>
      </div>
    </div>
  `;
}

function gatherStatusCard(task) {
  const reward = task.reward || { energy: 0, items: [] };
  return `
    <div class="gather-status-card">
      <div>
        <span>${gatherLocation(task.locationId).name}</span>
        <b>${task.completed ? "採集完畢" : `${task.workerName || "成員"}採集中`}</b>
        <i>${task.completed ? "可領取" : formatRemaining(task.endsAt)}</i>
      </div>
      <div class="gather-reward-card compact">
        <span>能源</span>
        <b>${reward.energy || 0}</b>
        ${gatherRewardItems(reward.items || [])}
        ${task.completed ? `<button data-claim-task="gather">領取</button>` : ""}
      </div>
    </div>
  `;
}

function gatherLocationButton(location) {
  const open = state.maxClearedLevel >= location.unlockLevel;
  const active = state.gather.locationId === location.id;
  return `
    <button class="${active ? "active" : ""}" data-gather-location="${location.id}" ${open ? "" : "disabled"}>
      <b>${location.name}</b>
      <span>${open ? "可採集" : "未開放"}</span>
    </button>
  `;
}

function gatherMemberButton(member, selectedId) {
  return `
    <button class="gather-member ${roleToneClass(member.classId)} ${member.id === selectedId ? "active" : ""}" data-gather-worker="${member.id}">
      <b>${member.name}</b>
      <span>Lv${member.level}</span>
      <i>${CLASS_DATA[member.classId].role}</i>
    </button>
  `;
}

function gatherRewardItems(items) {
  if (!items?.length) return `<div class="gather-item-list empty">無掉落</div>`;
  return `
    <div class="gather-item-list">
      ${items.map((item) => `<span>${itemName(item.id)} <b>${item.count}</b></span>`).join("")}
    </div>
  `;
}

function expeditionTemplate() {
  const task = state.expedition;
  return timedTaskTemplate({
    view: "expedition",
    title: "遠征",
    stateLabel: timedTaskTitle("expedition", task),
    detail: task.active ? `完成 ${formatRemaining(task.endsAt)}` : "派遣隊伍進行遠征。",
    actionLabel: "開始遠征",
    rewardText: "荒幣 80 | 資材 20",
    startAttr: "data-start-task=\"expedition\"",
  });
}

function timedTaskTemplate(config) {
  const task = state[config.view];
  const locked = !task.unlocked;
  const canStart = task.unlocked && !task.active && !task.completed;
  return `
    <section class="screen management-screen place-screen timed-task-place">
      ${settlementNav("town")}
      ${placeHeader(config.title, config.stateLabel, locked ? "未開放" : config.rewardText)}
      <section class="large-panel facility-main-panel timed-task-panel">
        <div class="panel-title"><span>${config.title}</span></div>
        <div class="timed-task-card ${locked ? "locked" : ""}">
          <b>${config.stateLabel}</b>
          <p>${locked ? "未開放" : config.detail}</p>
          ${task.completed ? `<button data-claim-task="${config.view}">領取</button>` : ""}
          ${canStart ? `<button ${config.startAttr}>${config.actionLabel}</button>` : ""}
        </div>
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function timedTaskTitle(id, task) {
  if (!task.unlocked) return "未開放";
  if (task.completed) return id === "gather" ? "已完成" : "遠征已完成";
  if (task.active) return id === "gather" ? `${task.workerName || "成員"}採集中` : "遠征進行中";
  return "可派遣";
}

function noticeTemplate() {
  ensureDefaultCommissions();
  const commissions = noticeCommissionItems();
  const news = currentTianyaNews();
  return `
    <section class="screen management-screen place-screen notice-place notice-hub-screen">
      ${settlementNav("notice")}
      <section class="large-panel notice-hub-panel">
        <div class="notice-commission-column">
          <div class="panel-title"><span>委託揭榜</span></div>
          <div class="notice-commission-list">
            ${commissions.map(noticeCommissionCard).join("")}
          </div>
        </div>
        <aside class="notice-news-column">
          <div class="panel-title notice-news-title">
            <span>天涯快訊</span>
            <div class="notice-news-controls">
              <button data-news-step="-1">?</button>
              <button data-news-step="1">?</button>
            </div>
          </div>
          <button class="tianya-feature-card" data-open-news="${news.id}">
            <span>${news.type}</span>
            <b>${news.title}</b>
            <i>${news.deck}</i>
          </button>
          <div class="tianya-archive-strip">
            ${tianyaNewsArchive().map((item) => `
              <button class="${item.id === news.id ? "active" : ""}" data-open-news="${item.id}">
                <span>${item.type}</span>
                <b>${item.title}</b>
              </button>
            `).join("")}
            ${fortuneScratchButton()}
          </div>
        </aside>
      </section>
      <button class="back-button" data-view="town">返回</button>
    </section>
  `;
}

function tianyaNewsModal() {
  const news = newsById(state.activeNewsId);
  if (!news) return "";
  return `
    <div class="modal-backdrop news-backdrop" data-close-news>
      <article class="panel news-modal" role="dialog" aria-modal="true">
        <button class="modal-close" data-close-news>關閉</button>
        <div class="news-modal-type">${news.type}</div>
        <h2>${news.title}</h2>
        <p class="news-modal-deck">${news.deck}</p>
        <p>${news.body}</p>
      </article>
    </div>
  `;
}

function mapTemplate() {
  const nextLevel = Math.min(state.maxClearedLevel + 1, BLACKWATER_MAX_LEVEL);
  return `
    <section class="screen map-screen place-screen">
      <section class="large-panel region-board">
        <div class="region-grid">
          ${REGION_DATA.map(regionTile).join("")}
          <button class="region-tile region-return-tile" data-view="town">
            <span>返回翠穹聚落</span>
          </button>
        </div>
      </section>
      <section class="large-panel blackwater-board">
        <div class="panel-title"><span>黑水砂原</span><span class="muted">Lv1-Lv30</span></div>
        <div class="map-path expedition-path">
          ${Array.from({ length: BLACKWATER_MAX_LEVEL }, (_, i) => stageNode(BLACKWATER_MAX_LEVEL - i)).join("")}
        </div>
      </section>
      <aside class="panel expedition-side">
        <div class="expedition-team-switch">
          <span>出戰隊伍</span>
          <div class="team-switch-row">
            <button class="team-switch-button" type="button" disabled aria-disabled="true">?</button>
            <b>第一隊</b>
            <button class="team-switch-button" type="button" disabled aria-disabled="true">?</button>
          </div>
          <div class="expedition-party-list">
            ${[0, 1, 2, 3].map((index) => expeditionPartyMember(index)).join("")}
          </div>
        </div>
        <div class="panel-title"><span>特殊戰役</span></div>
        <div class="expedition-intel-strip">
          <span>大荒競技場</span>
          ${mapGatherIntelCard()}
        </div>
      </aside>
    </section>
  `;
}

function mapGatherIntelCard() {
  const task = state.gather;
  const location = gatherLocation(task.locationId);
  let title = "未開放";
  let detail = "採集";
  let attrs = "disabled aria-disabled=\"true\"";
  let tone = "muted";
  if (task.unlocked) {
    tone = "jade";
    attrs = "data-view=\"gather\"";
    if (task.completed) {
      title = "已完成";
      detail = location.name;
      attrs = "data-claim-task=\"gather\"";
      tone = "gold";
    } else if (task.active) {
      title = `${task.workerName || "成員"}採集中`;
      detail = formatRemaining(task.endsAt);
    } else {
      title = "可派遣";
      detail = location.name;
    }
  }
  return `
    <button class="map-gather-intel tone-${tone}" ${attrs}>
      <b>採集</b>
      <span>${title}</span>
      <i>${detail}</i>
    </button>
  `;
}

function regionTile(region) {
  return `
    <button class="region-tile tone-${region.tone} ${region.open ? "open" : "locked"}" ${region.open ? "" : "disabled"}>
      <span>${region.name}</span>
      ${region.status ? `<b>${region.status}</b>` : ""}
    </button>
  `;
}

function stageNode(level) {
  const unlocked = level <= state.maxClearedLevel + 1;
  if (!unlocked) return "";
  const cleared = level <= state.maxClearedLevel;
  const latest = level === Math.min(state.maxClearedLevel + 1, BLACKWATER_MAX_LEVEL);
  const kind = stageBattleKind(level);
  const title = battleStageName(level, kind);
  const battleLocked = state.battle && !state.battle.over;
  const autoRepeatLocked = battleLocked || !cleared;
  return `
    <div class="stage-entry">
      <div class="stage-node unlocked ${battleLocked ? "battle-locked" : ""} ${cleared ? "cleared" : ""} ${latest ? "latest" : ""} ${kind === "boss" ? "boss" : ""}" data-stage="${level}">
        <div class="stage-title"><b>${title}</b></div>
        <div class="stage-level">Lv${level}</div>
        <div class="stage-state ${cleared ? "repeat" : ""}">${battleLocked ? "戰鬥中" : cleared ? "重戰" : kind === "boss" ? "頭目" : "可挑戰"}</div>
      </div>
      <button class="stage-auto-repeat-button" data-auto-repeat-stage="${level}" ${autoRepeatLocked ? "disabled aria-disabled=\"true\"" : ""} title="${autoRepeatLocked ? "首次通關後開放自動連戰" : "自動連戰"}" aria-label="自動連戰">↻</button>
    </div>
  `;
}

function stageBattleKind(level) {
  return level > 0 && level % 5 === 0 ? "boss" : "mob";
}

function expeditionPartyMember(index) {
  const member = getMember(state.party[index]);
  if (!member) {
    return `<div class="expedition-party-member empty"><span>0${index + 1}</span><b>空位</b></div>`;
  }
  return `
    <div class="expedition-party-member ${roleToneClass(member.classId)}">
      <span>0${index + 1}</span>
      <b>${member.name}</b>
      <i>Lv${member.level}</i>
    </div>
  `;
}

function battleStageName(level, kind = "mob") {
  if (kind === "boss" || kind === "event_ruins") return bossName(level);
  if (kind === "event_rescue") return "救援遭遇戰";
  if (kind === "event_duel") return "門派切磋";
  return "砂原遭遇戰";
}

function bossName(level) {
  return {
    5: "黑砂狼王",
    10: "鋼尾蠍王",
    15: "腐光母核",
    20: "砂原改命機",
  }[level] || `${enemyTypeName(bossEnemyType(level))}首領`;
}

function partyMembers() {
  return state.party.map(getMember).filter(Boolean);
}

function normalizeBattleKind(kind) {
  return ["boss", "mob", "event_rescue", "event_duel", "event_ruins"].includes(kind) ? kind : "mob";
}

function createAutoRepeatStats(level, kind) {
  return {
    level,
    kind,
    battles: 0,
    exp: 0,
    money: 0,
    material: 0,
    energy: 0,
    items: {},
    gear: 0,
  };
}

function autoRepeatSaveState() {
  if (!state.autoRepeat) return null;
  const stats = state.autoRepeatStats || createAutoRepeatStats(state.lastBattleLevel || 1, state.battle?.kind || "mob");
  return {
    active: true,
    level: Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, safeNumber(stats.level || state.battle?.level || state.lastBattleLevel, 1, 1))),
    kind: normalizeBattleKind(stats.kind || state.battle?.kind || "mob"),
    lastAt: Date.now(),
    stats: normalizeAutoRepeatStats(stats, stats.level || state.lastBattleLevel || 1, stats.kind || "mob"),
  };
}

function restoreOfflineAutoRepeat(session) {
  if (!session?.active) return;
  if (session.level > state.maxClearedLevel) return;
  if (session.kind === "boss" && !canChallengeBoss(session.level)) return;
  state.autoRepeat = true;
  state.autoRepeatStats = normalizeAutoRepeatStats(session.stats, session.level, session.kind);
  const completed = offlineAutoRepeatCompletedBattles(session);
  if (completed > 0) {
    applyOfflineAutoRepeatRewards(session.level, session.kind, completed);
  }
}

function offlineAutoRepeatCompletedBattles(session) {
  const elapsed = Math.max(0, Date.now() - safeNumber(session.lastAt, Date.now(), 0));
  return Math.floor(elapsed / offlineAutoRepeatCycleMs(session.kind));
}

function offlineAutoRepeatCycleMs(kind) {
  return (kind === "boss" ? 80000 : 44000) + AUTO_REPEAT_INTERVAL_MS;
}

function applyOfflineAutoRepeatRewards(level, kind, count) {
  const member = playerCombatMember();
  if (!member || count <= 0) return;
  for (let index = 0; index < count; index += 1) {
    const battle = createOfflineAutoRepeatBattle(level, kind, member);
    const reward = applyAutoRepeatRewardDiscount(calculateBattleDrops(battle));
    const expResult = grantBattleExperience(battle, AUTO_REPEAT_REWARD_RATE);
    state.money += reward.money;
    state.material += reward.material;
    addInventoryItems(reward.items);
    addGearItems(reward.gear);
    recordAutoRepeatStats(reward, expResult);
  }
}

function createOfflineAutoRepeatBattle(level, kind, member) {
  return {
    level,
    kind,
    autoRepeat: true,
    standardRewards: true,
    eventContext: null,
    allies: [cloneCombatant(member)],
    enemies: createEnemies(level, kind),
    feed: [],
    stats: {
      interrupts: 0,
      shields: 0,
      marks: 0,
      poison: 0,
      kills: 0,
      playerTurns: 0,
      playerDamageTotal: 0,
      maxSingleDamage: 0,
    },
  };
}

function autoRepeatStatsPanel() {
  const stats = state.autoRepeatStats || createAutoRepeatStats(state.lastBattleLevel || 1, "mob");
  const items = Object.entries(stats.items || {})
    .filter(([, count]) => count > 0)
    .slice(0, 3)
    .map(([id, count]) => `${escapeHtml(itemName(id))} ${count}`)
    .join("、");
  const moreItems = Math.max(0, Object.keys(stats.items || {}).length - 3);
  const itemText = `${items || "尚無"}${moreItems ? `、其他 ${moreItems} 種` : ""}${stats.gear ? `、裝備 ${stats.gear}` : ""}`;
  const phase = state.battle && !state.battle.over ? "本場結束前停止會改為手動完成" : "下一場 10 秒後開始";
  return `
    <aside class="auto-repeat-float" role="status" aria-live="polite">
      <div class="auto-repeat-head">
        <span>自動連戰統計</span>
        <b>${Math.round(AUTO_REPEAT_REWARD_RATE * 100)}% 收益</b>
      </div>
      <div class="auto-repeat-stats">
        <span><i>經驗</i><b>${stats.exp}</b></span>
        <span><i>貨幣</i><b>${stats.money}</b></span>
        <span><i>資材</i><b>${stats.material}</b></span>
        <span class="auto-repeat-items"><i>取得道具</i><b>${itemText}</b></span>
      </div>
      <p>${stats.battles} 場完成 | ${phase}</p>
      <button data-auto-repeat-stop>結束連續狩獵</button>
    </aside>
  `;
}

function startAutoRepeatBattle(level, kind = "mob") {
  kind = normalizeBattleKind(kind);
  if (kind.startsWith("event_")) return;
  if (level > state.maxClearedLevel) return;
  if (kind === "boss" && !canChallengeBoss(level)) return;
  state.autoRepeat = true;
  state.autoRepeatStats = createAutoRepeatStats(level, kind);
  startBattle(level, true, kind);
}

function requestAutoRepeatStart(level, kind, targetEl) {
  if (state.battle && !state.battle.over) return;
  kind = normalizeBattleKind(kind);
  if (kind.startsWith("event_")) return;
  if (level > state.maxClearedLevel) return;
  if (!state.tutorials.autoRepeatIntro) {
    state.pendingAutoRepeatTutorial = { level, kind };
    showAnyClickTutorial({
      target: targetEl,
      body: "點擊這裡將會自動進行重複狩獵，但收益與手動操作相比將會打折",
      onAnyClick: () => {
        state.tutorials.autoRepeatIntro = true;
        state.pendingAutoRepeatTutorial = null;
        saveGame();
        startAutoRepeatBattle(level, kind);
      },
    });
    return;
  }
  startAutoRepeatBattle(level, kind);
}

function startBattle(level, autoRepeat = false, kind = "mob", options = {}) {
  const player = playerCombatMember();
  if (!player) {
    alert("需要 1 名作戰角色。");
    return;
  }
  level = Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, Number(level) || currentIdleLevel()));
  kind = normalizeBattleKind(kind);
  if (kind === "boss" && !canChallengeBoss(level)) return;
  if (state.autoRepeatTimer) clearTimeout(state.autoRepeatTimer);
  state.autoRepeatTimer = null;
  state.autoRepeatSeq = (state.autoRepeatSeq || 0) + 1;
  state.lastBattleLevel = level;
  const repeatEnabled = !!autoRepeat && !kind.startsWith("event_");
  state.autoRepeat = repeatEnabled;
  if (repeatEnabled && !state.autoRepeatStats) state.autoRepeatStats = createAutoRepeatStats(level, kind);
  if (!repeatEnabled) state.autoRepeatStats = null;
  if (kind === "boss" || kind === "mob" || kind.startsWith("event_")) state.pendingBossLevel = null;
  state.view = "town";
  const title = battleStageName(level, kind);
  state.battle = {
    level,
    kind,
    autoRepeat: repeatEnabled,
    title,
    eventContext: options.eventContext || null,
    standardRewards: options.standardRewards !== false,
    feed: [],
    allies: [cloneCombatant(player)],
    enemies: createEnemies(level, kind, options),
    morale: 0,
    flowClock: 0,
    stageFx: null,
    actionBanner: null,
    actionLockUntil: Date.now() + 260,
    lastActionBeat: null,
    triggerBanner: null,
    over: false,
    stats: {
      interrupts: 0,
      shields: 0,
      marks: 0,
      poison: 0,
      kills: 0,
      playerTurns: 0,
      playerDamageTotal: 0,
      maxSingleDamage: 0,
    },
  };
  primeOpeningBattleActions(state.battle);
  addFeed(kind === "boss" || kind === "event_ruins" ? `${player.name}進入 Lv${level} 頭目戰，目標 ${title}。` : `${player.name}抵達${title} Lv${level}。`, "gold");
  state.battle.enemies.forEach((enemy) => addFeed(`${enemy.name} 出現了！`, "gold"));
  render();
  if (state.battleTimer) clearInterval(state.battleTimer);
  state.battleTimer = setInterval(tickBattle, BATTLE_TICK_MS);
}

function primeOpeningBattleActions(battle) {
  if (!battle) return;
  for (const ally of battle.allies || []) {
    ally.action = Math.max(ally.action || 0, BATTLE_OPENING_PLAYER_ACTION + Math.random() * 8);
  }
  for (const enemy of battle.enemies || []) {
    enemy.action = Math.max(enemy.action || 0, BATTLE_OPENING_ENEMY_ACTION + Math.random() * 18);
  }
}

function cloneCombatant(member) {
  const stats = memberStatsWithChips(member);
  const combatBonuses = memberCombatBonuses(member);
  const maxHp = maxHpOf(member, stats);
  const maxResource = maxResourceOf(member, stats);
  return {
    sourceId: member.id,
    name: member.name,
    classId: member.classId,
    bodyKind: member.bodyKind || "",
    bodyOriginal: !!member.bodyOriginal,
    level: member.level,
    portrait: portraitUrl(member),
    fullPortrait: portraitUrl(member),
    stats,
    combatBonuses,
    hp: maxHp,
    maxHp,
    resource: classResourceStart(member, maxResource),
    maxResource,
    action: Math.random() * 25,
    front: member.front,
    shield: 0,
    guard: 0,
    evade: 0,
    cover: null,
    heat: 0,
    charged: false,
    cooldowns: {},
    deathMarks: { body: 0, soul: 0, spirit: 0 },
    flowActive: false,
    flowTurns: 0,
    reloadProgress: 0,
    castFx: 0,
    hitFx: 0,
    healFx: 0,
    reloadFx: 0,
    speechFx: 0,
    speechText: "",
    floatFx: 0,
    floatText: "",
    floatKind: "",
    floatStack: [],
    contribution: { damage: 0, heal: 0, taken: 0 },
    activeSkillIds: battleSkillOrder(member),
    passiveId: member.equippedPassive,
    turnSkillCursor: 0,
    triggeredSkillIds: {},
    lastPoisonTriggerSeq: 0,
    evadedSinceLastTrigger: false,
    pendingResourceTrigger: false,
  };
}

function maxHpOf(member) {
  const stats = arguments.length > 1 ? arguments[1] : memberStatsWithChips(member);
  const bonuses = memberCombatBonuses(member);
  const base = 70 + stats.armor * 9 + member.level * 5;
  return Math.round(base * (1 + Math.max(0, bonuses.maxHpPct || 0) / 100));
}

function maxResourceOf(member) {
  const data = classResourceData(member.classId);
  const bonuses = memberCombatBonuses(member);
  if (data && Number.isFinite(data.max)) return data.max + Math.max(0, bonuses.resourceMax || 0);
  const stats = arguments.length > 1 ? arguments[1] : memberStatsWithChips(member);
  return 35 + stats.supply * 5 + Math.max(0, bonuses.resourceMax || 0);
}

function createEnemies(level, kind = "mob", options = {}) {
  const boss = kind === "boss" || kind === "event_ruins";
  const occupied = [];
  if (kind === "event_duel") {
    const pos = reserveEnemyPosition(1, 1, occupied);
    return [createDuelOpponentEnemy(level, options.eventContext, pos.x, pos.y)];
  }
  if (boss) {
    const bossType = bossEnemyType(level);
    const bossPos = reserveEnemyPosition(2, 2, occupied);
    return [makeEnemy(bossName(level), level, bossType, bossPos.x, bossPos.y, 2, 2, { eventRuinsBoss: kind === "event_ruins" })];
  }
  const [type] = encounterTypes(level, 1);
  const pos = reserveEnemyPosition(1, 1, occupied);
  return [makeEnemy(enemyTypeName(type), level, type, pos.x, pos.y, 1, 1)];
}

function encounterTypes(level, count) {
  const themes = [
    ["wolf", "wolf", "wolf", "scorpion"],
    ["scorpion", "scorpion", "scorpion", "slime"],
    ["slime", "slime", "slime", "wolf"],
    ["raider", "raider", "raider", "machine"],
    ["machine", "machine", "raider", "raider"],
  ];
  const pool = themes[(level + Math.floor(Math.random() * themes.length)) % themes.length];
  return Array.from({ length: count }, (_, index) => pool[index % pool.length]);
}

function bossSupportTypes(level) {
  const designedAdds = {
  };
  return designedAdds[level] || [];
}

function reserveEnemyPosition(w, h, occupied) {
  const options = [];
  for (let y = 0; y <= 4 - h; y++) {
    for (let x = 0; x <= 4 - w; x++) {
      const rect = { x, y, w, h };
      if (!occupied.some((item) => rectsOverlap(rect, item))) options.push(rect);
    }
  }
  const picked = randomOf(options) || { x: 0, y: 0, w, h };
  occupied.push(picked);
  return picked;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function bossEnemyType(level) {
  return { 5: "wolf", 10: "scorpion", 15: "slime", 20: "machine" }[level] || ["wolf", "scorpion", "slime", "raider", "machine"][Math.floor((level - 1) / 4) % 5];
}

function enemyTypeName(type) {
  return { wolf: "砂狼", scorpion: "毒蠍", slime: "腐光史萊姆", raider: "荒路殘兵", machine: "砂原機兵" }[type];
}

function enemyBasicMoveLabel(enemy) {
  return { wolf: "撕咬", scorpion: "毒刺", slime: "腐蝕", raider: "劈砍", machine: "射擊" }[enemy?.type] || "攻擊";
}

function makeEnemy(name, level, type, x, y, w, h, options = {}) {
  const boss = w > 1 || h > 1;
  const eventRuinsBoss = boss && !!options.eventRuinsBoss;
  const maxHp = Math.round(enemyMaxHp(level, boss) * (eventRuinsBoss ? 1.12 : 1));
  const drops = enemyDrops(type, level, boss);
  return {
    id: cryptoRandomId(),
    name,
    type,
    level,
    x,
    y,
    w,
    h,
    hp: maxHp,
    maxHp,
    action: Math.random() * 20,
    stats: {
      output: 4 + Math.floor(level / 2) + (boss ? 5 : 0),
      reaction: 4 + (type === "wolf" ? 4 : 0) + Math.floor(level / 6),
      armor: 3 + (type === "machine" ? 6 : type === "slime" ? 3 : 0) + Math.floor(level / 8),
      precision: 4 + (type === "scorpion" ? 3 : 0),
    },
    marked: false,
    poisoned: 0,
    miasma: 0,
    bleed: 0,
    poisons: {},
    armorDown: 0,
    castFx: 0,
    hitFx: 0,
    healFx: 0,
    reloadFx: 0,
    speechFx: 0,
    speechText: "",
    floatFx: 0,
    floatText: "",
    floatKind: "",
    floatStack: [],
    drops,
    eventRuinsBoss,
  };
}

function createEventFactionCharacter(level, classId = randomOf(Object.keys(CLASS_DATA))) {
  const targetLevel = Math.min(MAX_LEVEL, Math.max(1, safeNumber(level, 1, 1)));
  const member = createCharacter(classId, null, null);
  member.level = 1;
  member.exp = 0;
  member.equipment = normalizeEquipment();
  member.meridians = normalizeMeridians();
  for (let next = 2; next <= targetLevel; next += 1) {
    member.level = next;
    growStats(member);
  }
  autoEquip(member);
  member.equippedActive = knownSkills(member, "active")
    .filter(isTurnSkill)
    .sort((a, b) => a.level - b.level || a.id.localeCompare(b.id))
    .map((skillData) => skillData.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, ACTIVE_SKILL_SLOT_COUNT);
  const passive = knownSkills(member, "passive")[0];
  member.equippedPassive = passive ? passive.id : null;
  return member;
}

function createDuelOpponentEnemy(level, eventContext = null, x = 0, y = 0) {
  const npc = eventContext?.npc || createEventFactionCharacter(level, eventContext?.classId);
  const combatant = cloneCombatant(npc);
  const tunedMaxHp = Math.round(combatant.maxHp * 1.1);
  return {
    ...combatant,
    id: cryptoRandomId(),
    sourceId: "",
    duelOpponent: true,
    faction: CLASS_DATA[npc.classId]?.name || "門派",
    name: npc.name,
    level,
    type: "duel",
    x,
    y,
    w: 1,
    h: 1,
    hp: tunedMaxHp,
    maxHp: tunedMaxHp,
    stats: Object.fromEntries(Object.entries(combatant.stats || {}).map(([key, value]) => [key, Math.max(1, Math.round(value * 1.06))])),
    front: false,
    marked: false,
    poisoned: 0,
    miasma: 0,
    bleed: 0,
    poisons: {},
    armorDown: 0,
    drops: { money: 0, material: 0, energy: 0, items: [] },
  };
}

function enemyDrops(type, level, boss) {
  const profile = ENEMY_DROP_PROFILE[type] || ENEMY_DROP_PROFILE.raider;
  const levelScale = 1 + level * 0.11;
  const bossScale = boss ? 5.2 : 1;
  const commonCount = boss ? randomAmount(2, 4) : randomAmount(1, 2);
  const rareChance = boss ? 0.42 : 0.12;
  const items = [{ id: profile.common, count: commonCount }];
  if (Math.random() < rareChance) items.push({ id: profile.rare, count: boss ? 2 : 1 });
  return {
    money: Math.round(profile.money * levelScale * bossScale),
    material: Math.round(profile.material * levelScale * bossScale),
    energy: Math.round(profile.energy * levelScale * bossScale),
    items,
  };
}

function enemyMaxHp(level, boss = false) {
  const normalizedLevel = Math.max(1, Number(level) || 1);
  return boss
    ? bossTargetMaxHp(normalizedLevel)
    : Math.round(70 + normalizedLevel * 18);
}

function bossTargetMaxHp(level) {
  const normalizedLevel = Math.max(1, Number(level) || 1);
  if (normalizedLevel <= 5) return Math.round(120 + normalizedLevel * 28);
  const highLevelExtra = Math.max(0, normalizedLevel - 10) * 22;
  return Math.round(360 + normalizedLevel * 142 + highLevelExtra);
}

function isTutorialBossEnemy(enemy) {
  return !!enemy && (enemy.w > 1 || enemy.h > 1) && Number(enemy.level) <= 5;
}

function highLevelBalanceStep(level) {
  return Math.max(0, Math.min(10, (Number(level) || 1) - 10));
}

function highLevelEnemyDamagePressure(enemy) {
  const step = highLevelBalanceStep(enemy?.level);
  if (!step) return 1;
  const boss = enemy && (enemy.w > 1 || enemy.h > 1);
  return boss
    ? 1.04 + step * 0.012
    : 1.58 + step * 0.04;
}

function highLevelBossHeavyStrikeBonus(enemy, target) {
  if (!enemy || !target || !(enemy.w > 1 || enemy.h > 1)) return 0;
  const step = highLevelBalanceStep(enemy.level);
  if (!step) return 0;
  return target.maxHp * (0.018 + step * 0.0014);
}

function randomAmount(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function battleTemplate() {
  const battle = state.battle;
  return `
    <section class="screen battle speed-${state.battleSpeed}">
      <section class="panel combat-side">
        <div class="battle-title">
          <span>黑水砂原 Lv${battle.level}</span>
          <b>${battle.title || battleStageName(battle.level)}</b>
        </div>
        <div class="panel-title"><span>我方隊伍</span></div>
        ${battle.allies.map(allyCard).join("")}
      </section>
      <section class="panel enemy-board-wrap">
        <div class="board-meta">
          <div class="tag">士氣 ${battle.morale}</div>
        </div>
        <div class="enemy-board">
          ${boardCells(battle.enemies)}
        </div>
        <div class="battle-actions">
          <button class="speed-toggle ${state.battleSpeed === 2 ? "is-active" : ""}" data-speed-toggle>${state.battleSpeed === 2 ? "恢復 1倍速" : "2倍速演出"}</button>
        </div>
      </section>
      ${battleSensePanel(battle)}
      <button class="back-button battle-back" data-retreat>撤回</button>
    </section>
  `;
}

function battleSensePanel(battle) {
  return `
    <aside class="panel combat-sense-panel">
      <div class="panel-title"><span>戰鬥數據</span></div>
      ${battlePartyStats(battle)}
      <section class="battle-log-panel">
        <div class="battle-log-title">戰況紀錄</div>
        <div class="feed">${battle.feed.map((f) => `<div class="feed-chip ${f.kind}">${formatFeedText(f.text)}</div>`).join("")}</div>
      </section>
    </aside>
  `;
}

function battlePartyStats(battle) {
  const maxValues = battleStatMaxValues(battle.allies);
  return `
    <div class="battle-party-stats">
      <div class="battle-party-stats-head">
        <span>成員</span>
        <b>傷害</b>
        <b>治療</b>
        <b>承傷</b>
      </div>
      ${battle.allies.map((ally) => battlePartyStatRow(ally, maxValues)).join("")}
    </div>
  `;
}

function battleStatMaxValues(allies) {
  return allies.reduce((max, ally) => {
    const stats = ally.contribution || {};
    max.damage = Math.max(max.damage, stats.damage || 0);
    max.heal = Math.max(max.heal, stats.heal || 0);
    max.taken = Math.max(max.taken, stats.taken || 0);
    return max;
  }, { damage: 1, heal: 1, taken: 1 });
}

function battlePartyStatRow(ally, maxValues) {
  const stats = ally.contribution || {};
  return `
    <div class="battle-party-stat-row ${roleToneClass(ally.classId)}">
      <span>${ally.name}</span>
      ${battlePartyStatBar("damage", stats.damage || 0, maxValues.damage)}
      ${battlePartyStatBar("heal", stats.heal || 0, maxValues.heal)}
      ${battlePartyStatBar("taken", stats.taken || 0, maxValues.taken)}
    </div>
  `;
}

function battlePartyStatBar(type, value, maxValue) {
  const pct = Math.max(3, Math.min(100, (value / Math.max(1, maxValue)) * 100));
  return `
    <b class="battle-stat-bar stat-${type}">
      <i style="width:${pct}%"></i>
      <em>${Math.floor(value)}</em>
    </b>
  `;
}

function latestBattleActionLabel(text) {
  const skillMatch = String(text).match(/(?:施展|以)([^，。]+?)(?:命中|，|。)/);
  if (skillMatch) return skillMatch[1];
  const enemyMoveMatch = String(text).match(/^[^，。]+?\s+(撕咬|爪擊|毒刺|腐蝕|劈砍|射擊)\s+/);
  if (enemyMoveMatch) return enemyMoveMatch[1];
  return "交戰中";
}

function allyStatusTags(ally) {
  const tags = [];
  classResourceStatusTags(ally).forEach((tag) => {
    tags.push(combatStatusTagHtml(tag));
  });
  const shield = Math.floor(ally.shield || 0);
  const guard = Math.floor(ally.guard || 0);
  const evade = Math.ceil(ally.evade || 0);
  const heat = ally.heat || 0;
  if (shield > 0) tags.push(combatStatusTagHtml({ tone: "shield", text: `護盾 ${shield}` }));
  if (guard > 0) tags.push(combatStatusTagHtml({ tone: "shield", text: `護身 ${guard}` }));
  if (guard < 0) tags.push(combatStatusTagHtml({ tone: "heat", text: `失衡 ${Math.abs(guard)}` }));
  if (evade > 0) tags.push(combatStatusTagHtml({ tone: "shield", text: `迴避 ${evade}` }));
  if (ally.wangBianStepActive) tags.push(combatStatusTagHtml({ tone: "shield", text: "彼岸 1" }));
  if (ally.wangSoulEvadeTurns > 0) tags.push(combatStatusTagHtml({ tone: "shield", text: `銷魂 ${Math.ceil(ally.wangSoulEvadeTurns)}` }));
  if (ally.flowActive) tags.push(combatStatusTagHtml({ tone: "shield", text: `流光勢 ${Math.max(1, Math.ceil(ally.flowTurns || evade || 1))}` }));
  if (ally.charged) tags.push(combatStatusTagHtml({ tone: "shield", text: "蓄勢 1" }));
  if (ally.vajraReflectReady) tags.push(combatStatusTagHtml({ tone: "shield", text: "金剛反 1" }));
  if ((ally.resource || 0) <= 0 && ally.reloadTurns > 0) tags.push(combatStatusTagHtml({ tone: "shield", text: `裝填 ${Math.ceil(ally.reloadTurns)}` }));
  if (heat > 0) tags.push(combatStatusTagHtml({ tone: "heat", text: `過熱 ${Math.floor(heat)}` }));
  return tags.length ? `<div class="combat-status-row">${tags.join("")}</div>` : "";
}

function allyCard(ally) {
  return `
    <div class="ally-card ${ally.front ? "front" : ""} ${ally.hp <= 0 ? "dead" : ""} ${fxClass(ally)}"${fxStyle(ally)}>
      ${combatFloat(ally)}
      ${allyRowToggle(ally)}
      ${combatPortraitStage(ally)}
      <div class="ally-card-info">
        ${combatIdentity(ally)}
        ${combatBar("hp", ally.hp, ally.maxHp)}
        ${combatBar("resource", ally.resource, ally.maxResource)}
        ${combatBar("act", ally.action, 100)}
        ${allyStatusTags(ally)}
      </div>
    </div>
  `;
}

function allyRowToggle(ally) {
  const isFront = !!ally.front;
  return `
    <button
      class="ally-row-toggle ${isFront ? "is-front" : "is-back"}"
      data-toggle-front="${escapeHtml(ally.sourceId)}"
      ${ally.hp <= 0 ? "disabled" : ""}
    >${isFront ? "前排" : "後排"}</button>
  `;
}

function combatPortraitStage(ally) {
  if (!ally.portrait) {
    return `
      <div class="combat-portrait-stage ${roleToneClass(ally.classId)}">
        <i>${ally.name.slice(0, 1)}</i>
      </div>
    `;
  }
  return `
    <div class="combat-portrait-stage ${roleToneClass(ally.classId)} has-portrait">
      <img src="${escapeHtml(ally.portrait)}" alt="">
    </div>
  `;
}

function combatFloat(unit) {
  const stack = Array.isArray(unit.floatStack) ? unit.floatStack : [];
  const legacy = !stack.length && unit.floatFx && unit.floatText
    ? [{ text: unit.floatText, kind: unit.floatKind || "damage", ttl: unit.floatFx, maxTtl: unit.floatFx, x: 0, y: 0, drift: 0, scale: 1 }]
    : [];
  return [...stack, ...legacy].map((item) => {
    const maxTtl = Math.max(1, item.maxTtl || item.ttl || 1);
    const life = Math.max(0, Math.min(1, 1 - (item.ttl || 0) / maxTtl));
    const fadeIn = Math.min(1, life / 0.12);
    const fadeOut = life > 0.72 ? Math.max(0, (1 - life) / 0.28) : 1;
    const opacity = Math.max(0, Math.min(1, fadeIn * fadeOut));
    const rise = Math.round((item.y || 0) - life * 34);
    const sway = Math.round((item.x || 0) + Math.sin(life * Math.PI) * (item.drift || 0));
    const scale = ((item.scale || 1) + Math.sin(Math.min(1, life * 2) * Math.PI) * 0.12).toFixed(2);
    const style = `--float-x:${sway}px;--float-y:${rise}px;--float-opacity:${opacity.toFixed(2)};--float-scale:${scale};`;
    return `<div class="combat-float ${item.kind || "damage"}" style="${style}">${escapeHtml(item.text)}</div>`;
  }).join("");
}

function combatBar(type, value, max) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<div class="bar"><div class="bar-fill ${type}" style="width:${pct}%"></div></div>`;
}

function boardCells(enemies) {
  let html = "";
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const front = x === 0 ? "front-edge" : "";
      const flow = x === 0 ? ` ${frontEdgeFlowStyle(y)}` : "";
      html += `<div class="cell ${front}" data-cell="${x}-${y}" style="grid-column:${x + 1}; grid-row:${y + 1};${flow}"></div>`;
    }
  }
  return html + enemies.filter((e) => e.hp > 0).map(enemyToken).join("");
}

function frontEdgeFlowStyle(row) {
  const t = (((state.battle?.flowClock || 0) * BATTLE_TICK_MS / 1050) + row * 0.09) % 1;
  const a = arrowFlowState(t);
  const b = arrowFlowState((t + 0.52) % 1);
  return `--arrow-a-x:${a.x}px;--arrow-a-opacity:${a.opacity};--arrow-b-x:${b.x}px;--arrow-b-opacity:${b.opacity};`;
}

function arrowFlowState(t) {
  const x = Math.round(18 - 52 * t);
  const opacity = t < 0.22 ? t / 0.22 * 0.9 : Math.max(0, (1 - t) / 0.78 * 0.9);
  return { x, opacity: opacity.toFixed(2) };
}

function enemyToken(enemy) {
  const classes = `enemy-token ${enemy.marked ? "marked" : ""} ${fxClass(enemy)}`;
  const poisonFlags = activePoisonEntries(enemy)
    .slice(0, 3)
    .map((poison) => `<span class="feed-word poison">${escapeHtml(poison.key)}${Math.ceil(poison.duration)}</span>`);
  const flags = [
    enemy.marked ? `<span class="feed-word mark">標定</span>` : "",
    ...poisonFlags,
    sealCount(enemy) ? `<span class="feed-word mark">印${sealCount(enemy)}</span>` : "",
    enemy.armorDown ? `<span class="feed-word mark">破甲</span>` : "",
  ].filter(Boolean).join(" ");
  const hpNow = Math.max(0, Math.ceil(enemy.hp));
  const hpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)).toFixed(1);
  return `
    <div class="${classes}" style="grid-column:${enemy.x + 1} / span ${enemy.w}; grid-row:${enemy.y + 1} / span ${enemy.h}; ${fxStyleVars(enemy)}">
      ${combatFloat(enemy)}
      <div class="enemy-token-inner">
        <div class="enemy-title"><b>${enemy.name}</b><span>Lv${enemy.level || state.battle.level}</span></div>
        <div class="enemy-hp-text">${hpNow}<span>/ ${enemy.maxHp}</span></div>
        <div class="enemy-hp-bar"><i style="width:${hpPct}%"></i></div>
        <div class="enemy-flags">${flags || "&nbsp;"}</div>
      </div>
    </div>
  `;
}

function tickBattle() {
  const battle = state.battle;
  if (!battle || battle.over) return;
  const speedScale = battleSpeedScale();
  if (battle.endQueued) {
    tickFx();
    return;
  }
  const hadActiveVisuals = hasActiveBattleVisuals(battle);
  if (battle.actionLockUntil && Date.now() < battle.actionLockUntil) {
    tickFx();
    if (hadActiveVisuals || hasActiveBattleVisuals(battle)) renderBattleFrame();
    return;
  }
  const pendingAllyAction = battle.pendingAllyActionSourceId
    ? battle.allies.find((ally) => ally.sourceId === battle.pendingAllyActionSourceId && ally.hp > 0)
    : null;
  if (pendingAllyAction) {
    const feedCountBefore = battle.feed.length;
    battle.pendingAllyActionSourceId = "";
    allyAct(pendingAllyAction, { skipTurnStartResource: true });
    applyBattleEventReadLock(battle, "ally", feedCountBefore);
    cleanupDead();
    if (battle.enemies.every((e) => e.hp <= 0)) return queueBattleEnd(true);
    if (battle.allies.every((a) => a.hp <= 0)) return queueBattleEnd(false);
    renderBattleFrame();
    return;
  }
  if (battle.pendingAllyActionSourceId && !pendingAllyAction) battle.pendingAllyActionSourceId = "";
  const insertResult = tryUseInsertSkill(battle);
  if (insertResult) {
    applyBattleEventReadLock(battle, insertResult.side, insertResult.feedCountBefore);
    cleanupDead();
    if (battle.enemies.every((e) => e.hp <= 0)) return queueBattleEnd(true);
    if (battle.allies.every((a) => a.hp <= 0)) return queueBattleEnd(false);
    renderBattleFrame();
    return;
  }
  battle.flowClock = (battle.flowClock || 0) + speedScale;
  tickFx();
  for (const enemy of battle.enemies.filter((e) => e.hp > 0)) {
    if (enemy.armorDown > 0 && Math.random() < 0.02) enemy.armorDown -= 1;
    if (enemy.vulnerableTurns > 0 && Math.random() < 0.02) enemy.vulnerableTurns -= 1;
    if (enemy.slow > 0 && Math.random() < 0.02) enemy.slow -= 1;
  }
  for (const ally of battle.allies.filter((a) => a.hp > 0)) {
    ally.action += (2.1 + ally.stats.reaction * 0.18) * (1 + Math.max(0, ally.combatBonuses?.speedPct || 0) / 100) * BATTLE_TICK_SCALE * speedScale * BATTLE_ACTION_GAIN_MULT;
    tickClassResource(ally, speedScale);
    tickCooldowns(ally, speedScale);
  }
  for (const enemy of battle.enemies.filter((e) => e.hp > 0)) {
    const slowFactor = enemy.slow > 0 ? 0.68 : 1;
    enemy.action += (1.8 + enemy.stats.reaction * 0.16) * BATTLE_TICK_SCALE * speedScale * slowFactor * BATTLE_ACTION_GAIN_MULT;
  }
  const readyActors = [
    ...battle.allies.filter((a) => a.hp > 0 && a.action >= 100).map((unit) => ({ side: "ally", unit, action: unit.action })),
    ...battle.enemies.filter((e) => e.hp > 0 && e.action >= 100).map((unit) => ({ side: "enemy", unit, action: unit.action })),
  ].sort((a, b) => b.action - a.action);
  const actor = readyActors[0];
  let acted = false;
  let actingSide = "";
  const feedCountBefore = battle.feed.length;
  if (actor?.side === "ally") {
    acted = true;
    actingSide = "ally";
    actor.unit.action = 0;
    allyAct(actor.unit);
  } else if (actor?.side === "enemy") {
    acted = true;
    actingSide = "enemy";
    const enemy = actor.unit;
      enemy.action = 0;
      enemyAct(enemy);
  }
  if (acted) applyBattleEventReadLock(battle, actingSide, feedCountBefore);
  cleanupDead();
  if (battle.enemies.every((e) => e.hp <= 0)) return queueBattleEnd(true);
  if (battle.allies.every((a) => a.hp <= 0)) return queueBattleEnd(false);
  if (acted || hadActiveVisuals || hasActiveBattleVisuals(battle)) renderBattleFrame();
}

function applyBattleEventReadLock(battle, side, feedCountBefore) {
  if (!battle) return;
  const feedDelta = Math.max(1, (battle.feed?.length || 0) - feedCountBefore);
  const floatCount = countActiveBattleFloats(battle);
  const speedDivisor = state.battleSpeed === 2 ? 1.55 : 1;
  const rawMs = BATTLE_EVENT_READ_MS
    + feedDelta * BATTLE_EVENT_FEED_READ_MS
    + floatCount * BATTLE_EVENT_FLOAT_READ_MS
    + (side === "enemy" ? 80 : 0);
  const ms = Math.round(Math.min(BATTLE_EVENT_READ_MAX_MS, rawMs) / speedDivisor);
  battle.actionLockUntil = Date.now() + ms;
  battle.lastActionBeat = { side, feedDelta, floatCount, ms };
}

function countActiveBattleFloats(battle) {
  const units = [...(battle?.allies || []), ...(battle?.enemies || [])];
  return units.reduce((sum, unit) => {
    if (!unit) return sum;
    const stackCount = Array.isArray(unit.floatStack)
      ? unit.floatStack.filter((item) => (item.ttl || 0) > 0).length
      : 0;
    return sum + stackCount + ((unit.floatFx || 0) > 0 && stackCount === 0 ? 1 : 0);
  }, 0);
}

function tryUseInsertSkill(battle) {
  if (!battle) return null;
  for (const ally of battle.allies.filter((unit) => unit.hp > 0)) {
    const triggerSkill = ally.activeSkillIds
      .map(findSkill)
      .filter(isTriggerSkill)
      .find((skillData) => canUseSkill(ally, skillData) && insertConditionMet(ally, skillData, battle));
    if (!triggerSkill) continue;
    const feedCountBefore = battle.feed.length;
    useSkill(ally, triggerSkill.id);
    showTriggerSkillBanner(battle, ally, triggerSkill);
    markTriggerSkillUsed(ally, triggerSkill);
    setSkillCooldown(ally, triggerSkill.id, 12);
    return { side: "ally-trigger", ally, skillData: triggerSkill, feedCountBefore };
  }
  return null;
}

function showTriggerSkillBanner(battle, ally, skillData) {
  if (!battle || !skillData) return;
  const maxTtl = 34;
  const startedAt = Date.now();
  battle.triggerBanner = {
    label: skillData.name || "觸發技",
    side: ally?.side === "enemy" ? "enemy" : "player",
    ttl: maxTtl,
    maxTtl,
    startedAt,
    expiresAt: startedAt + 3000,
  };
}

function insertConditionMet(ally, skillData, battle) {
  if (!isTriggerSkill(skillData)) return false;
  if (skillData.oncePerBattle && ally.triggeredSkillIds?.[skillData.id]) return false;
  const condition = skillData.triggerCondition || "";
  if (!condition) return false;
  if (condition === "battle_start") return true;
  if (condition === "resource_at_50") {
    if (skillData.id === "chanlin_vajra_reflect" && ally.vajraReflectReady) return false;
    return (ally.resource || 0) >= 50;
  }
  if (condition === "resource_at_100") {
    if (skillData.id === "chanlin_vajra_reflect" && ally.vajraReflectReady) return false;
    return (ally.resource || 0) >= 100;
  }
  if (condition === "ally_hp_below_30") return (ally.hp || 0) / Math.max(1, ally.maxHp || 1) <= 0.3;
  if (condition === "enemy_hp_below_15") return livingEnemies().some((enemy) => enemy.hp > 0 && enemy.hp / Math.max(1, enemy.maxHp || 1) <= 0.15);
  if (condition === "ammo_empty") return ally.classId === "leishi" && (ally.resource || 0) <= 0;
  if (condition === "new_poison_type") return (battle.poisonEventSeq || 0) > (ally.lastPoisonTriggerSeq || 0);
  if (condition === "after_evade") return !!ally.evadedSinceLastTrigger;
  if (condition === "resource_gain_chance_20") return !!ally.pendingResourceTrigger;
  return false;
}

function triggerSkillReadyForUi(ally, skillData, battle) {
  if (!ally || !skillData || !battle || battle.over || !isTriggerSkill(skillData)) return false;
  if (skillData.id === "chanlin_vajra_reflect" && ally.vajraReflectReady) return true;
  return canUseSkill(ally, skillData) && insertConditionMet(ally, skillData, battle);
}

function markTriggerSkillUsed(ally, skillData) {
  if (!ally || !skillData) return;
  ally.triggeredSkillIds = ally.triggeredSkillIds || {};
  if (skillData.oncePerBattle) ally.triggeredSkillIds[skillData.id] = true;
  if (skillData.triggerCondition === "new_poison_type") ally.lastPoisonTriggerSeq = state.battle?.poisonEventSeq || 0;
  if (skillData.triggerCondition === "after_evade") ally.evadedSinceLastTrigger = false;
  if (skillData.triggerCondition === "resource_gain_chance_20") ally.pendingResourceTrigger = false;
}

function hasActiveBattleVisuals(battle) {
  if (!battle) return false;
  if (v009ActiveActionBanner(battle)) return true;
  if (battle.triggerBanner && (battle.triggerBanner.ttl || 0) > 0 && (!battle.triggerBanner.expiresAt || Date.now() < battle.triggerBanner.expiresAt)) return true;
  if (battle.stageFx || v009PersistentBattleFxActive()) return true;
  const units = [...(battle.allies || []), ...(battle.enemies || [])];
  return units.some((unit) => {
    if (!unit) return false;
    if ((unit.castFx || 0) > 0 || (unit.hitFx || 0) > 0 || (unit.healFx || 0) > 0 || (unit.reloadFx || 0) > 0 || (unit.floatFx || 0) > 0) return true;
    return Array.isArray(unit.floatStack) && unit.floatStack.some((item) => (item.ttl || 0) > 0);
  });
}

function queueBattleEnd(victory) {
  const battle = state.battle;
  if (!battle || battle.over || battle.endQueued) return;
  battle.endQueued = true;
  if (!victory) battle.defeatFlash = true;
  renderBattleFrame();
  setTimeout(() => {
    if (state.battle === battle && !battle.over) endBattle(victory);
  }, victory ? 640 : 920);
}

function renderBattleFrame() {
  if (queuedBattleRenderRaf) return;
  queuedBattleRenderRaf = requestAnimationFrame(() => {
    queuedBattleRenderRaf = 0;
    renderBattleFrameNow();
  });
}

function renderBattleFrameNow() {
  if (state.overlayView === "fullBattleLog" || state.overlayView === "itemLog") return;
  const now = Date.now();
  const visualUrgent = !!state.battle && hasActiveBattleVisuals(state.battle);
  const interactionWait = visualUrgent ? 0 : uiInteractionLockUntil - now;
  const renderWait = BATTLE_RENDER_MIN_MS - (now - lastBattleRenderAt);
  const wait = Math.max(interactionWait, renderWait);
  if (wait > 0) {
    if (deferredBattleRenderTimer) return;
    deferredBattleRenderTimer = setTimeout(() => {
      deferredBattleRenderTimer = null;
      if (state.battle && !state.battle.over) renderBattleFrame();
    }, wait + 16);
    return;
  }
  lastBattleRenderAt = now;
  if (renderV009BattleFrame()) return;
  render();
}

function renderV009BattleFrame() {
  if (!state.battle || state.battle.over || state.overlayView) return false;
  if (!["town", "battle"].includes(state.view)) return false;
  const root = document.querySelector(".v009-blueprint-home");
  if (!root) return false;
  const arena = root.querySelector(".v009-combat-arena");
  const feed = root.querySelector(".v009-battle-feed");
  if (!arena || !feed) return false;

  const cockpit = townBattleCockpitModel(null);
  const template = document.createElement("template");
  template.innerHTML = v009HomeCombatArena(cockpit).trim();
  const nextArena = template.content.firstElementChild;
  if (!nextArena) return false;

  const feedScrollTop = feed.scrollTop;
  const userScrolledFeed = feedScrollTop > 8;
  arena.replaceWith(nextArena);
  feed.innerHTML = homeBattleFeedItems(cockpit);
  feed.scrollTop = userScrolledFeed ? feedScrollTop : 0;
  return true;
}

function tickAllyTurnStartStatuses(ally) {
  if (!ally) return;
  if (ally.wangSoulEvadeTurns > 0) {
    ally.wangSoulEvadeTurns = Math.max(0, ally.wangSoulEvadeTurns - 1);
  }
}

function allyAct(ally, options = {}) {
  tickAllyTurnStartStatuses(ally);
  if (!options.skipTurnStartResource) recoverClassResourceOnTurn(ally);
  if (state.battle?.stats) state.battle.stats.playerTurns = (state.battle.stats.playerTurns || 0) + 1;
  tickEnemyPoisons(ally);
  if (!livingEnemies().length) return;
  if (ally.pendingBlastCoeff) {
    damageOne(ally, "朝陽引爆", coefficientScale(ally.pendingBlastCoeff), { preferMarked: true });
    ally.pendingBlastCoeff = 0;
  }
  const activeSkills = ally.activeSkillIds.map(findSkill).filter(isTurnSkill);
  const skillToUse = chooseSkillToUse(ally, activeSkills);
  if (!skillToUse) return basicAttack(ally);
  return useSkill(ally, skillToUse.id);
}

function chooseSkillToUse(ally, activeSkills) {
  const ordered = activeSkills.filter(Boolean);
  if (!ordered.length) return null;
  const start = Math.max(0, ally.turnSkillCursor || 0) % ordered.length;
  for (let offset = 0; offset < ordered.length; offset += 1) {
    const index = (start + offset) % ordered.length;
    const skillData = ordered[index];
    if (!canUseSkill(ally, skillData)) continue;
    ally.turnSkillCursor = (index + 1) % ordered.length;
    return skillData;
  }
  return null;
}

function canUseSkill(ally, skillData) {
  if (!skillData) return false;
  const cooldown = ally.cooldowns?.[skillData.id] || 0;
  if (cooldown > 0) return false;
  if (skillData.oncePerBattle && ally.triggeredSkillIds?.[skillData.id]) return false;
  if (ally.classId === "leishi" && isTurnSkill(skillData) && (ally.resource || 0) <= 0) return false;
  if (skillData.resourceCost && (ally.resource || 0) < skillData.resourceCost) return false;
  if (skillData.condition && !skillConditionMet(ally, skillData)) return false;
  return true;
}

function skillConditionMet(ally, skillData) {
  const condition = skillData.condition || "";
  if (!condition) return true;
  const resource = ally.resource || 0;
  if (condition === "resource_at_1") return resource >= 1;
  if (condition === "resource_at_10") return resource >= 10;
  if (condition === "resource_at_20") return resource >= 20;
  if (condition === "resource_at_25") return resource >= 25;
  if (condition === "resource_at_50") return resource >= 50;
  if (condition === "resource_at_100") return resource >= 100;
  return true;
}

function shouldPreferSkill(ally, skillId) {
  if (ally.classId === "leishi" && ally.resource <= 0 && skillId === "lei_reload_now") return true;
  if (ally.classId === "wangchuan" && skillId === "wang_yellow_spring" && livingEnemies().some((enemy) => enemy.hp > 0 && enemy.hp / Math.max(1, enemy.maxHp || 1) <= 0.15)) return true;
  return false;
}

function spendSkillCost(ally, skillData) {
  return true;
}

function gainResource(ally, amount, label = classResourceLabel(ally.classId)) {
  if (!ally || amount <= 0) return;
  amount *= 1 + Math.max(0, ally.combatBonuses?.resourceGain || 0) / 100;
  const before = ally.resource || 0;
  ally.resource = Math.min(ally.maxResource, before + amount);
  const gained = Math.floor(ally.resource - before);
  if (gained > 0) {
    if (ally.classId === "furnace" && Math.random() < 0.2) ally.pendingResourceTrigger = true;
    triggerFloat(ally, `${label} ${Math.floor(ally.resource || 0)}`, "shield");
  }
}

function recoverClassResourceOnTurn(ally) {
  if (!ally || ally.classId !== "emei") return false;
  const amount = 20 + Math.max(0, ally.emeiFlowRegenBonus || 0);
  const before = ally.resource || 0;
  ally.resource = Math.min(ally.maxResource || 100, before + amount);
  const gained = Math.floor(ally.resource - before);
  if (gained <= 0) return false;
  triggerFloat(ally, `流光 ${Math.floor(ally.resource || 0)}`, "shield");
  return true;
}

function tickClassResource(ally, speedScale) {
  if (!ally || speedScale <= 0) return;
}

function tickCooldowns(ally, speedScale) {
  if (!ally.cooldowns) return;
  for (const key of Object.keys(ally.cooldowns)) {
    ally.cooldowns[key] = Math.max(0, ally.cooldowns[key] - speedScale);
  }
}

function setSkillCooldown(ally, skillId, value) {
  ally.cooldowns = ally.cooldowns || {};
  ally.cooldowns[skillId] = Math.max(0, value);
}

function findSkill(skillId) {
  for (const cls of Object.values(CLASS_DATA)) {
    const found = cls.skills.find((s) => s.id === skillId);
    if (found) return found;
  }
  return null;
}

function livingEnemies() {
  return state.battle.enemies.filter((e) => e.hp > 0);
}

function livingAllies() {
  return state.battle.allies.filter((a) => a.hp > 0);
}

function ensurePoisonState(enemy) {
  if (!enemy) return {};
  enemy.poisons = enemy.poisons || {};
  syncPoisonAliases(enemy);
  return enemy.poisons;
}

function syncPoisonAliases(enemy) {
  if (!enemy) return;
  const values = Object.values(enemy.poisons || {}).filter((poison) => poison && poison.duration > 0);
  enemy.poisoned = values[0] ? Math.ceil(values[0].duration) : 0;
  enemy.miasma = values[1] ? Math.ceil(values[1].duration) : 0;
  enemy.bleed = values[2] ? Math.ceil(values[2].duration) : 0;
}

function activePoisonEntries(enemy) {
  const poisons = enemy?.poisons || {};
  return Object.entries(poisons)
    .filter(([, poison]) => poison && poison.duration > 0 && poison.damage > 0)
    .map(([key, poison]) => ({ key, ...poison }));
}

function poisonCount(enemy) {
  return activePoisonEntries(enemy).length;
}

function poisonValue(enemy) {
  return activePoisonEntries(enemy).reduce((sum, poison) => sum + poison.damage * poison.duration, 0);
}

function applyPoison(enemy, actor, key, duration, damage) {
  if (!enemy || !key) return false;
  const poisons = ensurePoisonState(enemy);
  const current = poisons[key] || {};
  const isNewType = !(current.duration > 0);
  poisons[key] = {
    key,
    duration: Math.max(1, duration),
    damage: Math.max(current.damage || 0, Math.floor(Number(damage) || 0)),
    sourceId: actor?.sourceId || current.sourceId || "",
  };
  if (isNewType && state.battle) {
    state.battle.poisonEventSeq = (state.battle.poisonEventSeq || 0) + 1;
    state.battle.latestPoisonEnemyId = enemy.id;
  }
  syncPoisonAliases(enemy);
  return isNewType;
}

function copyPoisonToTarget(source, target, actor) {
  for (const poison of activePoisonEntries(source)) {
    applyPoison(target, actor, poison.key, poison.duration, poison.damage);
  }
}

function extendPoisons(enemy, ticks = 1, maxDuration = 6) {
  const poisons = ensurePoisonState(enemy);
  for (const poison of activePoisonEntries(enemy)) {
    poisons[poison.key].duration = Math.min(maxDuration, poison.duration + ticks);
  }
  syncPoisonAliases(enemy);
}

function clearPoisons(enemy) {
  if (!enemy) return;
  enemy.poisons = {};
  syncPoisonAliases(enemy);
}

function tickEnemyPoisons(actor) {
  for (const enemy of livingEnemies()) {
    const poisons = ensurePoisonState(enemy);
    for (const poison of activePoisonEntries(enemy)) {
      if (enemy.hp <= 0) break;
      dealPoisonDamage(enemy, poison.damage, actor, poison.key);
      if (poisons[poison.key]) {
        poisons[poison.key].duration = Math.max(0, poison.duration - 1);
        if (poisons[poison.key].duration <= 0) delete poisons[poison.key];
      }
    }
    syncPoisonAliases(enemy);
  }
}

function chooseEnemy(preferMarked = true) {
  const enemies = livingEnemies();
  if (!enemies.length) return null;
  if (preferMarked) {
    const marked = enemies.find((e) => e.marked);
    if (marked) return marked;
  }
  return enemies.slice().sort((a, b) => a.hp - b.hp)[0];
}

function chooseAllyLowHp() {
  return livingAllies().slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
}

function basicAttack(ally) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  if (ally.classId === "leishi" && ally.resource <= 0) {
    ally.reloadTurns = Math.max(0, ally.reloadTurns === undefined ? 1 : ally.reloadTurns - 1);
    triggerReloadFx(ally);
    triggerSpeech(ally, "裝填");
    if (ally.reloadTurns <= 0) {
      ally.resource = ally.maxResource;
      ally.reloadTurns = 1;
      addFeed(`${ally.name} 裝填完成，彈藥回滿。`, "good");
    } else {
      addFeed(`${ally.name} 彈藥耗盡，裝填中（${ally.reloadTurns}）。`, "good");
    }
    return;
  }
  triggerCastFx(ally, basicAttackMotion(ally));
  triggerSpeech(ally, "普攻");
  const damage = computeDamage(ally, enemy, 0.78);
  dealDamage(enemy, damage, ally, "普攻");
  gainBasicAttackResource(ally, enemy);
}

function gainBasicAttackResource(ally, enemy) {
  switch (ally.classId) {
    case "xinhuo":
      return gainResource(ally, 12, "怒氣");
    case "chanlin":
      return gainResource(ally, 6, "不動心");
    case "tianshu":
      return gainResource(ally, 10, "解析");
    case "emei":
      return;
    case "furnace":
      return gainResource(ally, 1, "紫氣");
    case "wangchuan":
      return addEnemySeal(enemy, "body", 1, ally);
    case "tang":
      return;
    default:
      return;
  }
}

function useSkill(ally, id) {
  const skillData = findSkill(id);
  triggerCastFx(ally, skillAttackMotion(id, ally));
  triggerSpeech(ally, skillData ? skillData.name : "技能");
  queueBattleInfoRender();
  switch (id) {
    case "tianshu_three": return tianshuMultiStrike(ally, "三點參直", 3, 3, 12);
    case "tianshu_region": return tianshuStrike(ally, "尺前化區", coefficientScale(4 + skillComboBonusCoefficient(ally, "tianshu_region")), 12);
    case "tianshu_body": return tianshuStrike(ally, "規矩成體", coefficientScale(5 + skillComboBonusCoefficient(ally, "tianshu_body")), 14);
    case "tianshu_one": return damageOne(ally, "奇零歸一", coefficientScale(7) + (ally.resource || 0) / 220, { preferMarked: true });
    case "tianshu_array": return tianshuGouguArray(ally);
    case "tianshu_nine": return tianshuMultiStrike(ally, "九九歸一", 9, 5, 18);
    case "tang_bee": return tangPoisonSkill(ally, skillData);
    case "tang_soul": return tangPoisonSkill(ally, skillData);
    case "tang_bone": return tangBoneBurst(ally);
    case "tang_rain": return tangRain(ally);
    case "tang_heart": return tangHeartBurn(ally);
    case "tang_king": return tangPoisonSkill(ally, skillData);
    case "chanlin_luohan": return chanlinStrike(ally, "羅漢拳", coefficientScale(3), 10);
    case "chanlin_tiger": return chanlinStrike(ally, "伏虎掌", coefficientScale(4 + skillComboBonusCoefficient(ally, "chanlin_tiger")), 10);
    case "chanlin_vajra_reflect": return chanlinVajraReflect(ally);
    case "chanlin_immovable": return chanlinImmovable(ally);
    case "chanlin_stone_heart": return chanlinStoneHeart(ally);
    case "chanlin_mingwang": return chanlinStrike(ally, "明王拳", coefficientScale(5), 10);
    case "lei_lianzhu": return leishiBurstShots(ally, "連珠銃", 5, 3, 1);
    case "lei_crack": return leishiCrackShot(ally);
    case "lei_fullshot": return leishiFullShot(ally);
    case "lei_aim": return leishiAim(ally);
    case "lei_quick_reload": return leiReloadNow(ally);
    case "lei_lianzhu_plus": return leishiBurstShots(ally, "強化連珠銃", 5, 5, 1);
    case "xinhuo_first": return xinhuoGainPunch(ally, "總之先揍", 3, 14);
    case "xinhuo_heavy": return xinhuoSpendPunch(ally, "使勁猛揍", 5 + skillComboBonusCoefficient(ally, "xinhuo_heavy"), 20);
    case "xinhuo_voice": return xinhuoVoice(ally);
    case "xinhuo_death": return xinhuoGainPunch(ally, "往死裡揍", 4, 14);
    case "xinhuo_life_first": return xinhuoLifeFirst(ally);
    case "xinhuo_star_combo": return xinhuoCombo(ally);
    case "wang_body": return wangSealStrike(ally, "body", "破體錐", coefficientScale(3));
    case "wang_soul": return wangSealStrike(ally, "soul", "斷魂釘", coefficientScale(4));
    case "wang_life_death": return wangLifeDeathSeal(ally);
    case "wang_spirit": return wangEvadeStab(ally);
    case "wang_step": return wangBianStep(ally);
    case "wang_yellow_spring": return wangYellowSpring(ally);
    case "wang_body_plus": return wangSealStrike(ally, "body", "破體無形", coefficientScale(5));
    case "emei_meteor": return emeiMultiStrike(ally, "流星踏", 3, 3, 40);
    case "emei_shadow": return emeiSpendStrike(ally, "碎影腳", 4, 40);
    case "emei_fall_star": return emeiSpendStrike(ally, "落星步", 3 + skillComboBonusCoefficient(ally, "emei_fall_star"), 40);
    case "emei_turning": return emeiTurning(ally);
    case "emei_chase_shadow": return emeiChaseShadow(ally);
    case "emei_crash_star": return emeiMultiStrike(ally, "崩星踏", 3, 5, 40);
    case "furnace_long": return furnaceZiqiStrike(ally, "氣貫長虹", 3, 1);
    case "furnace_dawn": return furnaceDawn(ally);
    case "furnace_ziqi_end": return furnaceZiqiEnd(ally);
    case "furnace_east": return furnaceEast(ally);
    case "furnace_zidian": return furnaceZidian(ally);
    case "furnace_sky": return furnaceZiqiStrike(ally, "氣貫長空", 5, 1);
    default: return basicAttack(ally);
  }
}

function queueBattleInfoRender() {
  const battle = state.battle;
  if (!battle || battle.over || battle.infoRenderQueued) return;
  battle.infoRenderQueued = true;
  setTimeout(() => {
    if (!state.battle || state.battle.over) return;
    state.battle.infoRenderQueued = false;
    render();
  }, 0);
}

function coefficientScale(coefficient) {
  return Math.max(0, Number(coefficient) || 0) * 0.24;
}

function spendClassResource(ally, amount) {
  amount = Math.max(0, Number(amount) || 0);
  if (!amount) return true;
  if ((ally.resource || 0) < amount) return false;
  ally.resource = Math.max(0, (ally.resource || 0) - amount);
  return true;
}

function consumeAmmo(ally, amount) {
  if (ally.classId !== "leishi") return true;
  const current = Math.floor(ally.resource || 0);
  const cost = amount === "all" ? current : Math.max(1, Number(amount) || 1);
  if (current < cost || cost <= 0) return false;
  ally.resource = Math.max(0, current - cost);
  if (ally.resource <= 0) ally.reloadTurns = 1;
  return true;
}

function tianshuMultiStrike(ally, label, hits, coefficient, depthGain) {
  const enemy = chooseEnemy(true);
  if (!enemy) return;
  dealSplitDamage(enemy, computeDamage(ally, enemy, coefficientScale(coefficient)), ally, label, hits);
  gainResource(ally, depthGain, "解析");
}

function tianshuGouguArray(ally) {
  ally.tianshuArray = true;
  triggerFloat(ally, "勾股交陣", "shield");
  addFeed(`${ally.name} 展開勾股交陣，解析越深，後續攻擊威力越高。`, "gold");
}

function tangPoisonSkill(ally, skillData) {
  const enemy = chooseEnemy();
  if (!enemy || !skillData) return;
  dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(skillData.coefficient)), ally, skillData.name);
  applyPoison(enemy, ally, skillData.poisonKey, skillData.poisonDuration, computeDamage(ally, enemy, coefficientScale(skillData.poisonCoefficient)));
  state.battle.stats.poison += 1;
}

function tangBoneBurst(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => poisonValue(b) - poisonValue(a))[0] || chooseEnemy();
  if (!enemy) return;
  dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(3)), ally, "腐骨錐");
  const burst = activePoisonEntries(enemy).reduce((sum, poison) => sum + poison.damage * poison.duration, 0);
  if (burst > 0) {
    dealDamage(enemy, burst, ally, "腐骨引爆");
    clearPoisons(enemy);
  }
}

function tangRain(ally) {
  const targets = livingEnemies();
  if (!targets.length) return;
  targets.forEach((enemy, index) => {
    dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(index === 0 ? 3 : 2)), ally, "暴雨針");
  });
}

function tangHeartBurn(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => poisonCount(b) - poisonCount(a))[0] || chooseEnemy();
  if (!enemy) return;
  dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(3)), ally, "萬毒焚心");
}

function chanlinStrike(ally, label, scale, resourceGain) {
  ally.front = true;
  damageOne(ally, label, scale, { preferMarked: false });
  gainResource(ally, resourceGain, "不動心");
}

function chanlinVajraReflect(ally) {
  if (!spendClassResource(ally, 100)) return;
  ally.front = true;
  ally.vajraReflectReady = true;
  triggerFloat(ally, "金剛反", "shield");
  v009StartStageFxLoop();
  addFeed(`${ally.name} 不動心沉入金剛反，下一次受擊將反彈重傷。`, "good");
}

function chanlinImmovable(ally) {
  ally.front = true;
  ally.negateNextHit = true;
  damageOne(ally, "不動禪", coefficientScale(4), { preferMarked: false });
  gainResource(ally, 24, "不動心");
}

function chanlinStoneHeart(ally) {
  const shield = ally.maxHp * 0.3;
  ally.shield += shield;
  triggerHealFx(ally);
  triggerFloat(ally, `盾 ${Math.floor(shield)}`, "shield");
  addFeed(`${ally.name} 立石心，護盾優先吸收傷害。`, "good");
}

function leishiBurstShots(ally, label, hits, coefficient, ammoCost) {
  if (!consumeAmmo(ally, ammoCost)) return basicAttack(ally);
  const enemy = chooseEnemy(true);
  if (!enemy) return;
  dealSplitDamage(enemy, computeDamage(ally, enemy, coefficientScale(coefficient)), ally, label, hits);
}

function leishiCrackShot(ally) {
  if (!consumeAmmo(ally, 1)) return basicAttack(ally);
  const enemy = chooseEnemy(true);
  if (!enemy) return;
  dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(3)), ally, "裂甲彈");
  enemy.vulnerableTurns = Math.max(enemy.vulnerableTurns || 0, 3);
}

function leishiFullShot(ally) {
  const ammoSpent = Math.floor(ally.resource || 0);
  if (!consumeAmmo(ally, "all")) return basicAttack(ally);
  const enemy = chooseEnemy(true);
  if (!enemy) return;
  const hits = Math.max(1, ammoSpent);
  const totalDamage = computeDamage(ally, enemy, coefficientScale(2 * hits));
  dealSplitDamage(enemy, totalDamage, ally, "全彈射擊", hits, {
    labelForHit: (index, count) => `全彈射擊 ${index}/${count}`,
  });
}

function leishiAim(ally) {
  setCritRateBonusSource(ally, "lei_aim", 10);
  ally.accuracyBonus = Math.max(ally.accuracyBonus || 0, 5);
  triggerFloat(ally, "準星校正", "shield");
  addFeed(`${ally.name} 校正準星，命中與爆擊提高。`, "good");
}

function setCritRateBonusSource(ally, sourceId, value) {
  if (!ally || !sourceId) return;
  ally.critRateBonusSources = {
    ...(ally.critRateBonusSources || {}),
    [sourceId]: Math.max(0, value || 0),
  };
  ally.critRateBonus = Object.values(ally.critRateBonusSources).reduce((sum, item) => sum + Math.max(0, item || 0), 0);
}

function xinhuoVoice(ally) {
  triggerCombatStageAttackFx("self-crit-red", "player", "先聲奪人", 1);
  gainResource(ally, 20, "怒氣");
}

function xinhuoGainPunch(ally, label, coefficient, resourceGain) {
  ally.front = true;
  damageOne(ally, label, coefficientScale(coefficient), { preferMarked: false });
  gainResource(ally, resourceGain, "怒氣");
}

function xinhuoSpendPunch(ally, label, coefficient, cost) {
  if (!spendClassResource(ally, cost)) return xinhuoGainPunch(ally, "總之先揍", 3, 14);
  ally.front = true;
  damageOne(ally, label, coefficientScale(coefficient), { preferMarked: false });
}

function xinhuoLifeFirst(ally) {
  const healed = applyHealing(ally, ally.maxHp * 0.2, ally);
  gainResource(ally, 10, "怒氣");
  triggerHealFx(ally);
  triggerFloat(ally, `+${Math.floor(healed)}`, "heal");
}

function xinhuoCombo(ally) {
  ally.front = true;
  const enemy = chooseEnemy(false);
  if (!enemy) return;
  dealSplitDamage(enemy, computeDamage(ally, enemy, coefficientScale(5)), ally, "星火連拳", 3);
  gainResource(ally, 14, "怒氣");
}

function wangLifeDeathSeal(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => sealCount(b) - sealCount(a))[0] || chooseEnemy();
  if (!enemy) return;
  const count = sealCount(enemy);
  if (count <= 0) return wangSealStrike(ally, "body", "破體錐", coefficientScale(3));
  enemy.seals = { body: 0, soul: 0, spirit: 0 };
  ally.resource = 0;
  ally.wangSeals = { ...enemy.seals };
  if (count === 1) {
    dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(3)), ally, "一印追命");
    applyPoison(enemy, ally, "一印追命", 10, computeDamage(ally, enemy, coefficientScale(3)));
  } else if (count === 2) {
    dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(4)), ally, "二印銷魂");
    ally.wangSoulEvadeTurns = Math.max(ally.wangSoulEvadeTurns || 0, 2);
    triggerFloat(ally, "銷魂 2", "shield");
  } else {
    dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(8)), ally, "三印渡川");
  }
}

function wangEvadeStab(ally) {
  ally.evadedSinceLastTrigger = false;
  wangSealStrike(ally, "spirit", "裂魄刺", coefficientScale(2));
}

function wangBianStep(ally) {
  ally.wangBianStepActive = true;
  ally.evadeRateBonus = Math.max(ally.evadeRateBonus || 0, 30);
  triggerFloat(ally, "彼岸步伐", "shield");
  addFeed(`${ally.name} 踏入彼岸步伐，閃避率持續提高。`, "good");
}

function wangYellowSpring(ally) {
  const enemy = livingEnemies()
    .filter((target) => target.hp > 0 && target.hp / Math.max(1, target.maxHp || 1) <= 0.15)
    .sort((a, b) => a.hp - b.hp)[0] || chooseEnemy();
  if (!enemy) return;
  dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(6)), ally, "黃泉引渡");
}

function furnaceZiqiStrike(ally, label, coefficient, gain) {
  damageOne(ally, label, coefficientScale(coefficient), { preferMarked: true });
  gainResource(ally, gain, "紫氣");
}

function furnaceDawn(ally) {
  furnaceZiqiStrike(ally, "朝陽破曉", 1.5, 1);
  ally.pendingBlastCoeff = 3;
}

function furnaceZiqiEnd(ally) {
  const count = Math.max(1, Math.floor(ally.resource || 0));
  damageOne(ally, "紫氣寂滅", coefficientScale(3 * count), { preferMarked: true });
  if (ally.ziqiEast) damageOne(ally, "紫氣東來引爆", coefficientScale(2 * count), { preferMarked: true });
  ally.resource = 0;
}

function furnaceEast(ally) {
  ally.ziqiEast = true;
  triggerFloat(ally, "紫氣東來", "shield");
  addFeed(`${ally.name} 啟動紫氣東來，消耗紫氣時追加引爆。`, "gold");
}

function furnaceZidian(ally) {
  damageOne(ally, "紫電穿雲", coefficientScale(2), { preferMarked: true });
}

function tianshuStrike(ally, label, scale, depthGain) {
  damageOne(ally, label, scale + ally.resource / 220, { preferMarked: true });
  gainResource(ally, depthGain, "解析");
}

function tianshuArray(ally) {
  damageOne(ally, "立陣推演", 0.96 + ally.resource / 210, { armorDown: 2, preferMarked: true });
  gainResource(ally, 10, "解析");
}

function tianshuShift(ally) {
  ally.shield += 10 + ally.stats.supply * 0.8 + ally.stats.precision * 0.4;
  ally.guard = Math.max(ally.guard || 0, 2);
  gainResource(ally, 10, "解析");
  triggerHealFx(ally);
  triggerFloat(ally, "移星", "shield");
  addFeed(`${ally.name} 以移星步重排劍路，解析提高。`, "good");
}

function tianshuLock(ally) {
  const enemy = chooseEnemy(false);
  if (!enemy) return;
  enemy.marked = true;
  dealDamage(enemy, computeDamage(ally, enemy, 0.58 + ally.resource / 240), ally, "樞機鎖");
  gainResource(ally, 8, "解析");
  state.battle.stats.marks += 1;
}

function tianshuBreak(ally) {
  damageOne(ally, "七星破局", 2.1 + ally.resource / 140, { armorDown: 3, preferMarked: true });
  ally.resource = 0;
  setSkillCooldown(ally, "tianshu_break", 140);
}

function tangMiasma(ally) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  applyPoison(enemy, ally, "蛛絡散", 3, computeDamage(ally, enemy, 0.26));
  dealDamage(enemy, computeDamage(ally, enemy, 0.48), ally, "蛛絡散");
}

function tangBleed(ally) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  applyPoison(enemy, ally, "透骨針", 3, computeDamage(ally, enemy, 0.28));
  dealDamage(enemy, computeDamage(ally, enemy, 0.66), ally, "透骨針");
}

function tangSpread(ally) {
  const source = livingEnemies().slice().sort((a, b) => poisonValue(b) - poisonValue(a))[0] || chooseEnemy();
  if (!source || !poisonCount(source)) return tangPoison(ally);
  const targets = livingEnemies().filter((enemy) => enemy.id !== source.id).slice(0, 2);
  for (const enemy of targets) {
    copyPoisonToTarget(source, enemy, ally);
    triggerHitFx(enemy);
  }
  dealDamage(source, computeDamage(ally, source, 0.52), ally, "走脈毒");
  addFeed(`${ally.name} 以走脈毒擴散毒性，牽連 ${targets.length} 名敵人。`, "bad");
}

function tangSlow(ally) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  enemy.slow = Math.max(enemy.slow || 0, 3);
  applyPoison(enemy, ally, "麻沸霧", 3, computeDamage(ally, enemy, 0.2));
  dealDamage(enemy, computeDamage(ally, enemy, 0.5), ally, "麻沸霧");
}

function tangDeepen(ally) {
  const affected = livingEnemies().filter((enemy) => dotStacks(enemy) > 0);
  for (const enemy of affected) {
    extendPoisons(enemy, 1, 6);
    triggerHitFx(enemy);
  }
  if (!affected.length) return tangPoison(ally);
  addFeed(`${ally.name} 以入髓針壓深所有持續傷害。`, "bad");
}

function tangDetonate(ally, label, scale = 1) {
  const targets = livingEnemies().filter((enemy) => dotStacks(enemy) > 0);
  if (!targets.length) return tangPoison(ally);
  for (const enemy of targets) {
    const burst = activePoisonEntries(enemy).reduce((sum, poison) => sum + poison.damage * (1 + poison.duration * 0.35), 0);
    dealDamage(enemy, burst * scale, ally, label);
    clearPoisons(enemy);
  }
}

function dotStacks(enemy) {
  return poisonCount(enemy);
}

function chanlinJab(ally) {
  ally.front = true;
  damageOne(ally, "羅漢短拳", 0.72, { preferMarked: false });
  gainResource(ally, 10, "不動心");
}

function chanlinCounter(ally) {
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, 2);
  damageOne(ally, "空門反震", 0.96 + Math.min(60, ally.contribution?.taken || 0) / 180, { preferMarked: false });
  gainResource(ally, 8, "不動心");
}

function chanlinPalm(ally) {
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, 2);
  damageOne(ally, "伏虎沉掌", 1.0, { preferMarked: false });
}

function chanlinBreath(ally) {
  ally.front = true;
  const healed = applyHealing(ally, 16 + ally.stats.supply * 1.5, ally);
  ally.shield += 10 + ally.stats.armor;
  triggerHealFx(ally);
  triggerFloat(ally, `+${Math.floor(healed)}`, "heal");
  addFeed(`${ally.name} 調息不動，穩住傷勢並建立護盾。`, "good");
}

function chanlinStep(ally) {
  ally.front = true;
  ally.evade = Math.max(ally.evade || 0, 2);
  ally.guard = Math.max(ally.guard || 0, 3);
  triggerHealFx(ally);
  triggerFloat(ally, "金剛移步", "shield");
}

function chanlinReturn(ally) {
  damageOne(ally, "苦海回拳", 1.1 + Math.min(90, ally.contribution?.taken || 0) / 210, { preferMarked: false });
  ally.guard = Math.max(ally.guard || 0, 2);
}

function chanlinBell(ally) {
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, 5);
  ally.shield += 22 + ally.stats.armor * 1.6;
  damageOne(ally, "金剛沉鐘", 0.86, { preferMarked: false });
  triggerHealFx(ally);
  addFeed(`${ally.name} 沉鐘定身，以不動心換取長時間抗傷。`, "good");
}

function leiFocus(ally) {
  const enemy = chooseEnemy(false);
  if (!enemy) return;
  enemy.marked = true;
  dealDamage(enemy, computeDamage(ally, enemy, 0.55), ally, "定星瞄");
  state.battle.stats.marks += 1;
}

function leiReloadNow(ally) {
  ally.resource = ally.maxResource;
  ally.reloadProgress = 0;
  triggerHealFx(ally);
  triggerFloat(ally, "裝填", "shield");
  addFeed(`${ally.name} 手動裝填，彈藥回滿。`, "good");
}

function leiShock(ally) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  enemy.armorDown = Math.max(enemy.armorDown || 0, 3);
  enemy.slow = Math.max(enemy.slow || 0, 3);
  dealDamage(enemy, computeDamage(ally, enemy, 1.08), ally, "震雷彈");
}

function leiFullburst(ally) {
  const targets = livingEnemies();
  if (!targets.length) return;
  setSkillCooldown(ally, "lei_fullburst", 240);
  for (let i = 0; i < 6; i++) {
    const enemy = targets[i % targets.length];
    if (enemy.hp > 0) dealDamage(enemy, computeDamage(ally, enemy, 0.58), ally, "雷火齊發");
  }
  ally.resource = 0;
}

function xinhuoJab(ally) {
  ally.front = true;
  damageOne(ally, "火巷短打", 0.78, { preferMarked: false });
  gainResource(ally, 14, "怒氣");
}

function xinhuoGuard(ally) {
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, 3);
  ally.shield += 12 + ally.stats.armor * 1.2;
  damageOne(ally, "破釜護身", 0.58, { preferMarked: false });
}

function xinhuoRush(ally) {
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, 1);
  damageOne(ally, "煙巷搶身", 0.92, { preferMarked: false });
  gainResource(ally, 8, "怒氣");
}

function xinhuoIronshirt(ally) {
  ally.front = true;
  ally.shield += 22 + ally.stats.armor * 1.4;
  ally.guard = Math.max(ally.guard || 0, 3);
  triggerHealFx(ally);
  triggerFloat(ally, "爛蓑護體", "shield");
}

function wangSealStrike(ally, sealKey, label, scale) {
  const enemy = chooseEnemy();
  if (!enemy) return;
  addEnemySeal(enemy, sealKey, 1, ally);
  dealDamage(enemy, computeDamage(ally, enemy, scale), ally, label);
}

function addEnemySeal(enemy, sealKey, amount, ally) {
  if (!enemy) return;
  enemy.seals = enemy.seals || { body: 0, soul: 0, spirit: 0 };
  const before = Math.floor(enemy.seals[sealKey] || 0);
  enemy.seals[sealKey] = Math.min(1, before + amount);
  const sealAdded = enemy.seals[sealKey] > before;
  if (ally) {
    ally.resource = Math.min(ally.maxResource, sealCount(enemy));
    ally.wangSeals = { ...enemy.seals };
    if (sealAdded) {
      const label = WANG_SEAL_STATUS_LABELS[sealKey] || "生死印";
      triggerFloat(ally, `${label} ${Math.floor(enemy.seals[sealKey])}`, "shield");
      setTimeout(() => {
        if (state.battle && !state.battle.over) render();
      }, 0);
    }
  }
  triggerHitFx(enemy);
}

function sealCount(enemy) {
  const seals = enemy?.seals || {};
  return ["body", "soul", "spirit"].reduce((sum, key) => sum + Math.min(1, seals[key] || 0), 0);
}

function wangConsumeSeals(ally, count, label, scale = 1) {
  const enemy = livingEnemies().slice().sort((a, b) => sealCount(b) - sealCount(a))[0] || chooseEnemy();
  if (!enemy || sealCount(enemy) < count) return wangSealStrike(ally, "body", "破體針", 0.76);
  const available = ["body", "soul", "spirit"].filter((key) => enemy.seals?.[key] > 0).slice(0, count);
  available.forEach((key) => { enemy.seals[key] = 0; });
  ally.resource = Math.max(0, sealCount(enemy));
  ally.wangSeals = { ...(enemy.seals || {}) };
  const lowHpBonus = ally.hp / ally.maxHp < 0.45 ? 1.22 : 1;
  dealDamage(enemy, computeDamage(ally, enemy, (0.9 + count * 0.44) * lowHpBonus * scale), ally, label);
}

function emeiSpendStrike(ally, label, coefficient, cost) {
  if (!spendClassResource(ally, cost)) return basicAttack(ally);
  damageOne(ally, label, coefficientScale(coefficient), { preferMarked: false });
}

function emeiMultiStrike(ally, label, hits, coefficient, cost) {
  if (!spendClassResource(ally, cost)) return basicAttack(ally);
  const enemy = chooseEnemy(true);
  if (!enemy) return;
  dealSplitDamage(enemy, computeDamage(ally, enemy, coefficientScale(coefficient)), ally, label, hits);
}

function emeiTurning(ally) {
  ally.emeiFlowRegenBonus = Math.max(ally.emeiFlowRegenBonus || 0, 5);
  triggerFloat(ally, "流光回復+5", "shield");
  addFeed(`${ally.name} 展開斗轉步法，每回合流光恢復提高。`, "gold");
}

function emeiChaseShadow(ally) {
  ally.emeiChaseEnabled = true;
  triggerFloat(ally, "追影", "shield");
  addFeed(`${ally.name} 進入追影節奏，命中後有機會連續追擊並回收流光。`, "gold");
}

function startEmeiFlow(ally, label = "流光勢") {
  ally.flowActive = true;
  ally.flowTurns = 1;
  ally.evade = Math.max(ally.evade || 0, 3);
  ally.resource = ally.maxResource;
  triggerHealFx(ally);
  triggerFloat(ally, label, "shield");
  addFeed(`${ally.name} 進入流光勢，一回合內閃避與追擊提高。`, "good");
}

function maybeTriggerEmeiFlow(ally, chance) {
  if (Math.random() < chance) startEmeiFlow(ally, "流光");
}

function emeiKick(ally) {
  damageOne(ally, "流光踏", 0.78, { preferMarked: false });
  maybeTriggerEmeiFlow(ally, 0.32);
}

function emeiSword(ally) {
  damageOne(ally, "回身劍", ally.flowActive ? 1.22 : 0.94, { preferMarked: false });
  maybeTriggerEmeiFlow(ally, 0.18);
}

function emeiFeint(ally) {
  ally.evade = Math.max(ally.evade || 0, 2);
  damageOne(ally, "拂袖錯步", 0.64, { preferMarked: false });
  maybeTriggerEmeiFlow(ally, 0.55);
}

function emeiRipple(ally) {
  damageOne(ally, "水月足", ally.flowActive ? 1.16 : 0.86, { preferMarked: false });
}

function emeiGuard(ally) {
  ally.shield += 12 + ally.stats.reaction * 0.8;
  ally.evade = Math.max(ally.evade || 0, 3);
  ally.flowActive = false;
  ally.resource = 0;
  triggerHealFx(ally);
  triggerFloat(ally, "避影", "shield");
}

function emeiChain(ally) {
  damageOne(ally, "連環追影", ally.flowActive ? 1.42 : 0.86, { preferMarked: false });
}

function emeiChase(ally) {
  damageOne(ally, "霜橋追影", ally.flowActive ? 1.82 : 1.02, { preferMarked: false });
  ally.flowActive = false;
  ally.resource = 0;
  setSkillCooldown(ally, "emei_chase", 160);
}

function furnacePlum(ally, label, scale, markGain) {
  damageOne(ally, label, scale, { preferMarked: true });
  gainResource(ally, markGain, "梅光印");
}

function furnaceGuard(ally) {
  ally.shield += 14 + ally.stats.armor * 1.2;
  ally.guard = Math.max(ally.guard || 0, 2);
  triggerHealFx(ally);
  triggerFloat(ally, "寒梅護式", "shield");
}

function tianshuMark(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => b.maxHp - a.maxHp)[0];
  if (!enemy) return;
  enemy.marked = true;
  applyTianshuGuard(ally, 10 + ally.stats.supply * 1.2 + ally.stats.precision * 0.5, 2, "守勢");
  triggerHitFx(enemy);
  state.battle.stats.marks += 1;
  addFeed(`${ally.name} 施展觀局印，將 ${enemy.name} 標定為集火目標，自己同步進入守勢。`, "gold");
  passiveTianshu(ally, enemy);
}

function tianshuSuppress(ally) {
  damageOne(ally, "玄機壓制", 0.82, { armorDown: 2, preferMarked: true });
  applyTianshuGuard(ally, 8 + ally.stats.supply * 0.9 + ally.stats.precision * 0.35, 1, "防壁");
}

function tianshuBarrier(ally) {
  const amount = 24 + ally.stats.supply * 1.8 + ally.stats.precision * 0.45;
  shieldAll(ally, "定勢防壁", amount);
  applyTianshuGuard(ally, 12 + ally.stats.armor, 3, "定勢");
}

function applyTianshuGuard(ally, amount, guardLayers, label) {
  const shield = Math.max(1, amount);
  ally.front = true;
  ally.guard = Math.max(ally.guard || 0, guardLayers);
  ally.shield += shield;
  triggerHealFx(ally);
  triggerFloat(ally, `${label} ${Math.floor(shield)}`, "shield");
}

function tangPoison(ally) {
  const enemy = livingEnemies().find((e) => !ensurePoisonState(e)["淬毒針"]) || chooseEnemy();
  if (!enemy) return;
  const damage = computeDamage(ally, enemy, 0.55);
  applyPoison(enemy, ally, "淬毒針", 3, computeDamage(ally, enemy, 0.25));
  state.battle.stats.poison += 1;
  dealDamage(enemy, damage, ally, "淬毒針");
  addFeed(`${enemy.name} 毒性入脈。`, "bad");
}

function tangConvert(ally) {
  let poisonPower = 0;
  const affectedCells = [];
  for (const enemy of livingEnemies()) {
    const poisons = activePoisonEntries(enemy);
    if (poisons.length) {
      poisonPower += poisons.reduce((sum, poison) => sum + poison.damage * poison.duration, 0);
      affectedCells.push(...enemyCells(enemy));
      dealDamage(enemy, poisons.reduce((sum, poison) => sum + poison.damage, 0), ally, "逆方成藥");
      clearPoisons(enemy);
    }
  }
  const heal = 8 + poisonPower * 0.45;
  for (const friend of livingAllies()) {
    const healed = applyHealing(friend, heal, ally);
    triggerHealFx(friend);
    triggerFloat(friend, `+${Math.floor(healed)}`, "heal");
  }
  addFeed(`${ally.name} 施展逆方成藥，將敵方毒性轉為藥力，全隊獲得回復。`, "good");
}

function chanlinGuard(ally) {
  ally.front = true;
  ally.guard = 3;
  ally.shield += 12 + ally.stats.armor * 1.5;
  triggerHealFx(ally);
  triggerFloat(ally, "防護", "shield");
  addFeed(`${ally.name} 架起不動身，轉入防護姿態並提高承傷能力。`, "good");
}

function cleanseAll(ally) {
  for (const friend of livingAllies()) {
    friend.shield += 12 + ally.stats.supply;
    triggerHealFx(friend);
    triggerFloat(friend, `盾 ${Math.floor(12 + ally.stats.supply)}`, "shield");
  }
  addFeed(`${ally.name} 展開明王淨界，全隊獲得護盾。`, "good");
}

function rowAttack(ally) {
  const rows = [0, 1, 2, 3].map((y) => ({
    y,
    enemies: livingEnemies().filter((e) => y >= e.y && y < e.y + e.h),
  })).sort((a, b) => b.enemies.length - a.enemies.length);
  const row = rows[0];
  if (!row || !row.enemies.length) return basicAttack(ally);
  for (const enemy of row.enemies) {
    dealDamage(enemy, computeDamage(ally, enemy, 0.72), ally, "橫列掃射");
  }
  addFeed(`${ally.name} 以橫列掃射壓過第 ${row.y + 1} 橫列敵人。`, "gold");
}

function xinhuoPunch(ally) {
  ally.front = true;
  ally.guard = 2;
  damageOne(ally, "打狗開路", 0.72, { preferMarked: false });
}

function xinhuoCover(ally) {
  const target = livingAllies().filter((a) => a.sourceId !== ally.sourceId).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (!target) return xinhuoPunch(ally);
  ally.front = true;
  target.cover = ally.sourceId;
  ally.shield += 8 + ally.stats.armor;
  triggerHealFx(ally);
  triggerFloat(ally, "護援", "shield");
  addFeed(`${ally.name} 破蓑擋刀，替 ${target.name} 承接下一波攻擊。`, "good");
}

function wangStab(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  if (!enemy) return;
  const low = enemy.hp / enemy.maxHp < 0.45;
  dealDamage(enemy, computeDamage(ally, enemy, low ? 1.35 : 0.95), ally, "渡影刺");
}

function wangVanish(ally) {
  ally.evade = 3;
  ally.front = false;
  triggerHealFx(ally);
  triggerFloat(ally, "迴避", "shield");
  addFeed(`${ally.name} 步入陰影，降低被鎖定的機率。`, "good");
}

function wangMark(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => b.stats.output - a.stats.output)[0];
  if (!enemy) return;
  enemy.marked = true;
  dealDamage(enemy, computeDamage(ally, enemy, 0.45), ally, "陰差索命");
  addFeed(`${ally.name} 以陰差索命鎖住 ${enemy.name}，全隊更容易集中攻勢。`, "gold");
}

function emeiReposition(ally) {
  const target = chooseAllyLowHp();
  if (!target) return;
  target.front = target.hp / target.maxHp > 0.55;
  target.evade = 2;
  triggerHealFx(target);
  triggerFloat(target, "校位", "shield");
  addFeed(`${ally.name} 牽絲校位，替 ${target.name} 調整站位並提高迴避。`, "good");
}

function emeiStabilize(ally) {
  for (const friend of livingAllies()) {
    const heal = 10 + ally.stats.supply;
    const healed = applyHealing(friend, heal, ally);
    if (friend.stats.armor < 8) friend.shield += 8 + ally.stats.supply;
    triggerHealFx(friend);
    triggerFloat(friend, `+${Math.floor(healed)}`, "heal");
  }
  addFeed(`${ally.name} 接入義體穩態，修復全隊並補上護盾。`, "good");
}

function furnaceHit(ally) {
  const enemy = livingEnemies().slice().sort((a, b) => (b.w * b.h) - (a.w * a.h))[0] || chooseEnemy();
  if (!enemy) return;
  const large = enemy.w * enemy.h > 1;
  dealDamage(enemy, computeDamage(ally, enemy, large ? 1.3 : 1.0), ally, "梅光震擊");
}

function furnaceCharge(ally) {
  ally.charged = true;
  ally.guard = Math.min(ally.guard, -2);
  triggerHealFx(ally);
  triggerFloat(ally, "充能", "shield");
  addFeed(`${ally.name} 啟動梅芯充能，下一次能量爆發會獲得增幅。`, "gold");
}

function damageOne(ally, label, scale, options = {}) {
  const enemy = chooseEnemy(options.preferMarked !== false);
  if (!enemy) return;
  dealDamage(enemy, computeDamage(ally, enemy, scale), ally, label);
  if (options.armorDown) enemy.armorDown = Math.max(enemy.armorDown, options.armorDown);
}

function areaAttack(ally, label, scale, armorDown = false, consumeCharge = false) {
  const main = chooseEnemy();
  if (!main) return;
  const affected = livingEnemies().filter((e) => Math.abs(e.x - main.x) <= 1 && Math.abs(e.y - main.y) <= 1).slice(0, 4);
  for (const enemy of affected) {
    dealDamage(enemy, computeDamage(ally, enemy, scale), ally, label);
    if (armorDown) enemy.armorDown = Math.max(enemy.armorDown, 2);
  }
  if (consumeCharge) ally.charged = false;
  addFeed(`${ally.name} 施展${label}，範圍覆蓋 ${affected.length} 名敵人。`, "gold");
}

function healOne(ally, label, amount, cleanse = false, frontArmor = false) {
  const target = chooseAllyLowHp();
  if (!target) return;
  let heal = amount;
  if (target.front && frontArmor) {
    target.shield += 8 + ally.stats.supply;
  }
  const healed = applyHealing(target, heal, ally);
  triggerHealFx(target);
  triggerFloat(target, `+${Math.floor(healed)}`, "heal");
  if (cleanse) {
    target.shield += 6 + ally.stats.supply * 0.4;
    if (hasPassive(ally, "tang_reflux")) target.shield += 6;
  }
  addFeed(`${ally.name} 施展${label}，使 ${target.name} 回復 ${Math.floor(healed)} 點生命。`, "good");
}

function applyHealing(target, amount, source) {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + amount);
  const healed = Math.max(0, target.hp - before);
  addContribution(source, "heal", healed);
  return healed;
}

function addContribution(ally, key, amount) {
  if (!ally || !["damage", "heal", "taken"].includes(key)) return;
  ally.contribution = ally.contribution || { damage: 0, heal: 0, taken: 0 };
  ally.contribution[key] += Math.max(0, amount || 0);
}

function shieldAll(ally, label, amount, morale = false) {
  for (const friend of livingAllies()) {
    friend.shield += amount;
    triggerHealFx(friend);
    triggerFloat(friend, `盾 ${Math.floor(amount)}`, "shield");
  }
  state.battle.stats.shields += 1;
  if (morale) state.battle.morale += 5;
  addFeed(`${ally.name} 施展${label}，為全隊建立護盾。`, "good");
}

function averageCombatStat(stats, keys) {
  const normalized = normalizeStats(stats);
  const usable = (keys || []).filter((key) => STAT_KEYS.includes(key));
  if (!usable.length) return 0;
  return usable.reduce((sum, key) => sum + normalized[key], 0) / usable.length;
}

function classDamageStatScore(classId, stats) {
  const cls = CLASS_DATA[classId] || null;
  const mainKeys = cls?.main?.length ? cls.main : ["output"];
  const secondaryKeys = cls?.secondary?.length ? cls.secondary : ["precision"];
  const main = averageCombatStat(stats, mainKeys);
  const secondary = averageCombatStat(stats, secondaryKeys);
  return main * 3.15 + secondary * 0.85;
}

function damageResult(amount, critical = false) {
  const value = new Number(Math.max(3, Number(amount) || 0));
  value.critical = !!critical;
  return value;
}

function damageCriticalFlag(amount) {
  return !!(amount && typeof amount === "object" && amount.critical);
}

function computeDamage(ally, enemy, scale) {
  let offense = classDamageStatScore(ally?.classId, ally?.stats);
  offense *= 1 + Math.max(0, ally.combatBonuses?.powerAmp || 0) / 100;
  offense *= 1 + Math.max(0, ally.combatBonuses?.classBoost || 0) / 100;
  if (!ally.front) offense *= 1.16;
  if (ally.charged) offense *= 1.45;
  if (ally.tianshuArray) offense *= 1 + Math.min(0.5, (ally.resource || 0) / 200);
  if (hasPassive(ally, "lei_recoil") && !ally.front) offense *= 1.12;
  if (hasPassive(ally, "furnace_heat")) offense *= 1 + Math.min(ally.heat, 4) * 0.05;
  let defense = enemy.stats.armor * (enemy.armorDown ? 0.58 : 0.86);
  let damage = (offense - defense) * scale;
  if (enemy.marked) damage *= 1.16;
  if (enemy.vulnerableTurns > 0) damage *= 1.15;
  if (enemy.seals?.body) damage *= 1.05;
  damage *= classBattleDamageMultiplier(ally);
  damage *= 0.92 + Math.random() * 0.18;
  const critRate = finalCritRatePercent(ally, enemy) / 100;
  let critical = false;
  if (Math.random() < critRate) {
    critical = true;
    damage *= 1.5 + (Math.max(0, ally.combatBonuses?.critDamage || 0) + (enemy.seals?.spirit ? 10 : 0)) / 100;
  }
  return damageResult(damage, critical);
}

function finalCritRatePercent(ally, enemy = null) {
  return Math.max(0,
    Math.max(0, ally?.combatBonuses?.critRate || 0) +
    battleCritRateBonusPercent(ally) +
    (enemy?.seals?.soul ? 5 : 0)
  );
}

function classBattleDamageMultiplier(ally) {
  return Math.max(0.1, CLASS_BATTLE_DAMAGE_MULTIPLIER[ally?.classId] || 1);
}

function trackPlayerDamage(actor, dealt) {
  if (state.battle?.stats && actor && state.battle.allies?.some((ally) => ally.sourceId === actor.sourceId)) {
    state.battle.stats.playerDamageTotal = (state.battle.stats.playerDamageTotal || 0) + dealt;
    state.battle.stats.maxSingleDamage = Math.max(state.battle.stats.maxSingleDamage || 0, dealt);
  }
}

function dealPoisonDamage(enemy, amount, actor, label) {
  const before = enemy.hp;
  enemy.hp -= amount;
  const dealt = Math.max(0, Math.min(before, amount));
  trackPlayerDamage(actor, dealt);
  addContribution(actor, "damage", dealt);
  triggerHitFx(enemy);
  triggerFloat(enemy, `-${Math.floor(amount)}`, "damage");
  addFeed(`${enemy.name} 承受 ${label} ${Math.floor(amount)} 點傷害。`, "bad");
}

function dealSplitDamage(enemy, totalAmount, actor, label, hits = 1, options = {}) {
  const count = Math.max(1, Math.floor(hits) || 1);
  let remaining = Math.max(0, Number(totalAmount) || 0);
  const critical = options.critical ?? damageCriticalFlag(totalAmount);
  const fxKind = triggerPlayerAttackFx(actor, enemy, label, count);
  const impactDelay = v009AttackImpactDelayMs(fxKind);
  for (let i = 0; i < count && enemy.hp > 0 && remaining > 0; i += 1) {
    const partsLeft = count - i;
    const amount = i === count - 1 ? remaining : remaining / partsLeft;
    const hitLabel = typeof options.labelForHit === "function" ? options.labelForHit(i + 1, count) : label;
    dealDamage(enemy, amount, actor, hitLabel, { suppressAttackFx: true, impactDelayMs: impactDelay + i * 86, critical });
    remaining -= amount;
  }
}

function dealDamage(enemy, amount, actor, label, options = {}) {
  const numericAmount = Math.max(0, Number(amount) || 0);
  const before = enemy.hp;
  enemy.hp = Math.max(0, enemy.hp - numericAmount);
  const dealt = Math.max(0, Math.min(before, numericAmount));
  trackPlayerDamage(actor, dealt);
  addContribution(actor, "damage", dealt);
  const fxKind = options.suppressAttackFx ? "" : triggerPlayerAttackFx(actor, enemy, label, 1);
  const impactDelay = Number.isFinite(options.impactDelayMs) ? Math.max(0, options.impactDelayMs) : v009AttackImpactDelayMs(fxKind);
  const critical = options.critical ?? damageCriticalFlag(amount);
  scheduleCombatHitFeedback(enemy, `-${Math.floor(numericAmount)}`, critical ? "critical" : "damage", impactDelay);
  addFeed(`${actor.name} 以${label}命中 ${enemy.name}，造成 ${Math.floor(numericAmount)} 點傷害。`, critical ? "gold" : "");
  if (enemy.marked) triggerTianshuCalibrate(actor);
  if (poisonCount(enemy) && hasPassive(actor, "tang_reflux")) gainResource(actor, 4, classResourceLabel(actor.classId));
  if (hasPassive(actor, "furnace_heat")) {
    actor.heat += numericAmount > 22 ? 1 : 0;
    if (actor.heat >= 4) {
      actor.heat = 0;
      actor.guard = Math.min(actor.guard, -2);
      addFeed(`${actor.name} 爐壓過熱，耐久短暫下降。`, "bad");
    }
  }
  triggerEmeiChaseFollowUp(actor, enemy);
}

function triggerEmeiChaseFollowUp(actor, enemy) {
  if (!state.battle || !actor || actor.classId !== "emei" || !actor.emeiChaseEnabled) return;
  if (!enemy || enemy.hp <= 0) return;
  const depth = Math.max(0, actor.emeiChaseDepth || 0);
  if (depth >= 12 || Math.random() >= 0.3) return;
  actor.emeiChaseDepth = depth + 1;
  gainResource(actor, 5, "流光");
  dealDamage(enemy, computeDamage(actor, enemy, coefficientScale(2)), actor, "追影");
  actor.emeiChaseDepth = depth;
}

function hasPassive(ally, passiveId) {
  return ally.passiveId === passiveId;
}

function passiveTianshu(ally) {
  if (hasPassive(ally, "tianshu_calibrate")) gainResource(ally, 6, classResourceLabel(ally.classId));
}

function triggerTianshuCalibrate(actor) {
  const tianshuAllies = livingAllies().filter((ally) => hasPassive(ally, "tianshu_calibrate"));
  for (const tactician of tianshuAllies) {
    const sameActor = tactician.sourceId === actor.sourceId;
    gainResource(tactician, sameActor ? 7 : 3, classResourceLabel(tactician.classId));
    const shield = 5 + tactician.stats.supply * 0.45;
    tactician.shield += shield;
    triggerHealFx(tactician);
    triggerFloat(tactician, `盾 ${Math.floor(shield)}`, "shield");
    if (!sameActor) {
      const allyShield = Math.max(2, shield * 0.35);
      actor.shield += allyShield;
      triggerFloat(actor, `盾 ${Math.floor(allyShield)}`, "shield");
    }
  }
}

function enemyAct(enemy) {
  if (enemy?.duelOpponent) return duelOpponentAct(enemy);
  const target = chooseEnemyTarget();
  if (!target) return;
  const boss = enemy && (enemy.w > 1 || enemy.h > 1);
  enemy.actionCount = (enemy.actionCount || 0) + 1;
  const heavyStrike = boss && highLevelBalanceStep(enemy.level) > 0 && enemy.actionCount % 3 === 0;
  const moveLabel = heavyStrike ? "王級重擊" : enemyBasicMoveLabel(enemy);
  triggerCastFx(enemy, enemyAttackMotion(enemy));
  const fxKind = triggerEnemyAttackFx(enemy, target, moveLabel, 1);
  const impactDelay = v009AttackImpactDelayMs(fxKind);
  const canEvade = (target.evade || 0) > 0 || target.flowActive || target.wangSoulEvadeTurns > 0 || target.wangBianStepActive;
  const evadeChance = Math.min(0.82, (target.flowActive ? 0.72 : 0.45) + (Math.max(0, target.combatBonuses?.evadeRate || 0) + activeEvadeRateBonus(target)) / 100);
  if (canEvade && Math.random() < evadeChance) {
    if ((target.evade || 0) > 0) target.evade -= 1;
    target.evadedSinceLastTrigger = true;
    addFeed(`${target.name} 避開了 ${enemy.name} 的攻擊。`, "good");
    if (target.wangBianStepActive) {
      const spiritSkill = findSkill("wang_spirit");
      if (spiritSkill) showTriggerSkillBanner(state.battle, target, spiritSkill);
      triggerCastFx(target, skillAttackMotion("wang_spirit", target));
      wangEvadeStab(target);
    }
    triggerEmeiCompensate();
    return;
  }
  let damage = enemy.stats.output * enemyDamageScale(enemy) + Math.random() * enemyDamageVariance(enemy);
  if (heavyStrike) damage += highLevelBossHeavyStrikeBonus(enemy, target);
  if (target.guard > 0) damage *= Math.max(0.35, 0.68 - Math.max(0, target.combatBonuses?.guardBoost || 0) / 200);
  if (target.guard < 0) damage *= 1.22;
  const sourceMember = getMember(target.sourceId);
  if (sourceMember && !target.front) damage *= 1.08;
  if (target.cover) {
      const cover = state.battle.allies.find((a) => a.sourceId === target.cover && a.hp > 0);
      if (cover) {
        const covered = damage * 0.55;
        applyDamage(cover, covered, enemy.name, moveLabel, { impactDelayMs: impactDelay });
        damage *= 0.45;
        if (hasPassive(cover, "xinhuo_comrade")) {
        gainResource(cover, 8, classResourceLabel(cover.classId));
        state.battle.morale += 2;
      }
    }
    target.cover = null;
  }
  applyDamage(target, damage, enemy.name, moveLabel, { impactDelayMs: impactDelay });
}

function duelOpponentAct(enemy) {
  const target = chooseEnemyTarget();
  if (!target) return;
  recoverClassResourceOnTurn(enemy);
  const activeSkills = (enemy.activeSkillIds || []).map(findSkill).filter(isTurnSkill);
  const skillData = chooseSkillToUse(enemy, activeSkills);
  if (!skillData) return duelOpponentBasicAttack(enemy, target);
  if (!spendDuelSkillCost(enemy, skillData)) return duelOpponentBasicAttack(enemy, target);
  const hits = duelSkillHits(skillData.id);
  const coefficient = Math.max(1, Number(skillData.coefficient) || 3);
  const moveLabel = skillData.name || "切磋技";
  triggerCastFx(enemy, skillAttackMotion(skillData.id, enemy));
  triggerSpeech(enemy, moveLabel);
  const fxKind = triggerDuelOpponentAttackFx(enemy, moveLabel, hits);
  const damage = computeDuelDamage(enemy, target, coefficientScale(coefficient));
  applyDamage(target, damage, enemy.name, moveLabel, { impactDelayMs: v009AttackImpactDelayMs(fxKind) });
  gainDuelResource(enemy, skillData);
}

function duelOpponentBasicAttack(enemy, target) {
  if (enemy.classId === "leishi" && (enemy.resource || 0) <= 0) {
    enemy.reloadTurns = Math.max(0, enemy.reloadTurns === undefined ? 1 : enemy.reloadTurns - 1);
    triggerReloadFx(enemy);
    triggerSpeech(enemy, "裝填");
    if (enemy.reloadTurns <= 0) {
      enemy.resource = enemy.maxResource;
      enemy.reloadTurns = 1;
      addFeed(`${enemy.name} 裝填完成。`, "good");
    } else {
      addFeed(`${enemy.name} 彈藥耗盡，裝填中（${enemy.reloadTurns}）。`, "good");
    }
    return;
  }
  triggerCastFx(enemy, basicAttackMotion(enemy));
  triggerSpeech(enemy, "普攻");
  const fxKind = triggerDuelOpponentAttackFx(enemy, "普攻", 1);
  applyDamage(target, computeDuelDamage(enemy, target, 0.78), enemy.name, "普攻", { impactDelayMs: v009AttackImpactDelayMs(fxKind) });
  gainDuelResource(enemy, null);
}

function computeDuelDamage(enemy, target, scale) {
  const fakeTarget = {
    stats: target.stats || {},
    armorDown: target.guard < 0 ? 1 : 0,
    marked: false,
    vulnerableTurns: 0,
    seals: {},
  };
  return computeDamage(enemy, fakeTarget, scale);
}

function spendDuelSkillCost(enemy, skillData) {
  if (enemy.classId === "leishi" && skillData.ammoCost) {
    const current = Math.floor(enemy.resource || 0);
    const cost = skillData.ammoCost === "all" ? current : Math.max(1, Number(skillData.ammoCost) || 1);
    if (cost <= 0 || current < cost) return false;
    enemy.resource = Math.max(0, current - cost);
    if (enemy.resource <= 0) enemy.reloadTurns = 1;
    return true;
  }
  if (skillData.resourceCost) return spendClassResource(enemy, skillData.resourceCost);
  return true;
}

function gainDuelResource(enemy, skillData) {
  if (!enemy) return;
  if (enemy.classId === "leishi" && (enemy.resource || 0) <= 0) {
    enemy.reloadTurns = Math.max(0, enemy.reloadTurns === undefined ? 1 : enemy.reloadTurns - 1);
    triggerReloadFx(enemy);
    if (enemy.reloadTurns <= 0) {
      enemy.resource = enemy.maxResource;
      enemy.reloadTurns = 1;
    }
    return;
  }
  if (enemy.classId === "emei") return;
  if (enemy.classId === "tianshu") return gainResource(enemy, 8, "解析");
  if (enemy.classId === "chanlin") return gainResource(enemy, 8, "不動心");
  if (enemy.classId === "xinhuo") return gainResource(enemy, 10, "怒氣");
  if (enemy.classId === "furnace") return gainResource(enemy, 1, "紫氣");
  if (enemy.classId === "wangchuan" && skillData?.sealKey) {
    enemy.resource = Math.min(enemy.maxResource || 3, (enemy.resource || 0) + 1);
    triggerFloat(enemy, `${classResourceLabel(enemy.classId)} ${Math.floor(enemy.resource || 0)}`, "shield");
  }
}

function duelSkillHits(skillId) {
  if (["tianshu_nine"].includes(skillId)) return 6;
  if (["tianshu_three", "emei_meteor", "emei_crash_star", "xinhuo_star_combo"].includes(skillId)) return 3;
  if (["lei_lianzhu", "lei_lianzhu_plus"].includes(skillId)) return 5;
  return 1;
}

function triggerDuelOpponentAttackFx(enemy, label = "", hits = 1) {
  let kind = V009_PLAYER_ATTACK_FX_BY_CLASS[enemy.classId] || "punch-gold";
  if (enemy.classId === "wangchuan" && isWangLifeDeathSealFxLabel(label)) kind = "life-death-seal-impact";
  if (enemy.classId === "wangchuan" && isWangYellowSpringFxLabel(label)) kind = "needle-darkgreen-triple";
  triggerCombatStageAttackFx(kind, "enemy", label, hits);
  return kind;
}

function enemyDamageScale(enemy) {
  const boss = enemy && (enemy.w > 1 || enemy.h > 1);
  if (isTutorialBossEnemy(enemy)) return 1.42;
  return (boss ? 2.42 : 3.75) * highLevelEnemyDamagePressure(enemy) * (enemy?.eventRuinsBoss ? 1.08 : 1);
}

function enemyDamageVariance(enemy) {
  const boss = enemy && (enemy.w > 1 || enemy.h > 1);
  if (isTutorialBossEnemy(enemy)) return 0.8;
  return (boss ? 1.5 : 5) * highLevelEnemyDamagePressure(enemy) * (enemy?.eventRuinsBoss ? 1.08 : 1);
}

function chooseEnemyTarget() {
  const allies = livingAllies();
  const weighted = [];
  for (const ally of allies) {
    const weight = ally.front ? 5 : 2;
    for (let i = 0; i < weight; i++) weighted.push(ally);
  }
  return randomOf(weighted);
}

function applyDamage(ally, amount, sourceName, moveLabel = "攻擊", options = {}) {
  amount *= 1 - Math.min(0.6, Math.max(0, ally.combatBonuses?.damageReduce || 0) / 100);
  if (ally.negateNextHit) {
    ally.negateNextHit = false;
    triggerFloat(ally, "無效", "shield");
    addFeed(`${ally.name} 以不動禪無效了 ${sourceName} 的${moveLabel}。`, "good");
    const enemy = livingEnemies().find((item) => item.name === sourceName) || chooseEnemy(false);
    if (enemy) dealDamage(enemy, computeDamage(ally, enemy, coefficientScale(4)), ally, "不動禪反擊");
    return;
  }
  addContribution(ally, "taken", amount);
  if (ally.classId === "xinhuo") gainResource(ally, Math.max(8, Math.floor(amount * 0.32)), "怒氣");
  if (ally.classId === "chanlin") gainResource(ally, Math.max(10, Math.floor(amount * 0.36)), "不動心");
  let remaining = amount;
  if (ally.shield > 0) {
    const absorbed = Math.min(ally.shield, remaining);
    ally.shield -= absorbed;
    remaining -= absorbed;
    triggerEmeiCompensate();
  }
  ally.hp = Math.max(0, ally.hp - remaining);
  if (remaining > 0) scheduleCombatHitFeedback(ally, `-${Math.floor(remaining)}`, "damage", options.impactDelayMs);
  if (remaining > 0 && ally.vajraReflectReady) {
    ally.vajraReflectReady = false;
    const enemy = livingEnemies().find((item) => item.name === sourceName) || chooseEnemy(false);
    if (enemy) {
      triggerCombatStageAttackFx("vajra-reflect-gold", "player", "金剛反", 1);
      dealDamage(enemy, ally.maxHp * 0.5, ally, "金剛反", { suppressAttackFx: true, impactDelayMs: v009AttackImpactDelayMs("vajra-reflect-gold") });
    }
  }
  if (hasPassive(ally, "chanlin_bone")) ally.shield += Math.max(0, remaining) * 0.12;
  if (remaining > 0) {
    state.battle.morale += livingAllies().some((a) => hasPassive(a, "xinhuo_comrade")) ? 1 : 0;
    addFeed(`${sourceName} ${moveLabel} ${ally.name}，造成 ${Math.floor(remaining)} 點傷害。`, "bad");
  }
}

function triggerEmeiCompensate() {
  for (const ally of livingAllies()) {
    if (hasPassive(ally, "emei_compensate")) {
      gainResource(ally, 3, classResourceLabel(ally.classId));
    }
  }
}

function cleanupDead() {
  for (const enemy of state.battle.enemies) {
    if (enemy.hp <= 0 && !enemy.deadLogged) {
      enemy.deadLogged = true;
      enemy.deathFx = true;
      state.battle.stats.kills += 1;
      triggerKillPassives(enemy);
    }
  }
}

function triggerKillPassives(enemy) {
  for (const ally of livingAllies()) {
    if (hasPassive(ally, "wang_receipt")) {
      gainResource(ally, 8, classResourceLabel(ally.classId));
      const target = chooseEnemy();
      if (target) {
        const damage = computeDamage(ally, target, enemy.marked ? 0.42 : 0.3);
        dealDamage(target, damage, ally, "無聲收件");
      }
    }
  }
}

function addFeed(text, kind = "") {
  if (state.battle && isFormationStatusFeed(text)) return;
  const item = { text, kind };
  if (state.battle) {
    state.battle.feed.unshift(item);
    state.battle.feed = state.battle.feed.slice(0, 90);
    showActionBannerFromFeed(state.battle, text);
  }
  state.battleLogArchive.unshift(item);
  state.battleLogArchive = state.battleLogArchive.slice(0, 200);
}

function showActionBannerFromFeed(battle, text) {
  if (!battle) return;
  const label = latestBattleActionLabel(text);
  if (!label || label === "交戰中") return;
  const source = battleActionSourceFromText(battle, text);
  battle.actionBanner = {
    label,
    side: source?.side || "",
    id: source?.id || "",
    name: source?.name || "",
    expiresAt: Date.now() + 3000,
  };
}

function battleActionSourceFromText(battle, text) {
  const source = String(text || "");
  const ally = (battle.allies || []).find((item) => item?.name && source.startsWith(item.name));
  if (ally) return { side: "player", id: ally.id || ally.sourceId || "", name: ally.name };
  const enemy = (battle.enemies || []).find((item) => item?.name && source.startsWith(item.name));
  if (enemy) return { side: "enemy", id: enemy.id || "", name: enemy.name };
  return null;
}

function isFormationStatusFeed(text) {
  return /(布陣|前排|後排|轉入.+排|陣線)/.test(String(text || ""));
}

function toggleBattleFront(sourceId) {
  if (!state.battle) return;
  const ally = state.battle.allies.find((item) => item.sourceId === sourceId && item.hp > 0);
  if (!ally) return;
  ally.front = !ally.front;
  const member = getMember(sourceId);
  if (member) member.front = ally.front;
  saveGame();
  render();
}

function fxClass(unit) {
  return [
    unit.castFx > 0 ? "fx-cast" : "",
    unit.castFx > 0 && unit.castMotion ? `fx-${unit.castMotion}` : "",
    unit.hitFx > 0 ? "fx-hit" : "",
    unit.healFx > 0 ? "fx-heal" : "",
    unit.reloadFx > 0 ? "fx-reload" : "",
    unit.deathFx ? "fx-defeated" : "",
  ].filter(Boolean).join(" ");
}

function fxStyle(unit) {
  const vars = fxStyleVars(unit);
  return vars ? ` style="${vars}"` : "";
}

function fxStyleVars(unit) {
  if (!unit) return "";
  const now = Date.now();
  const vars = [];
  if ((unit.castFx || 0) > 0 && unit.castFxStartedAt) vars.push(`--fx-cast-age:${Math.max(0, now - unit.castFxStartedAt)}ms`);
  if ((unit.hitFx || 0) > 0 && unit.hitFxStartedAt) vars.push(`--fx-hit-age:${Math.max(0, now - unit.hitFxStartedAt)}ms`);
  if ((unit.healFx || 0) > 0 && unit.healFxStartedAt) vars.push(`--fx-heal-age:${Math.max(0, now - unit.healFxStartedAt)}ms`);
  if ((unit.reloadFx || 0) > 0 && unit.reloadFxStartedAt) vars.push(`--fx-reload-age:${Math.max(0, now - unit.reloadFxStartedAt)}ms`);
  return vars.join("; ");
}

function triggerCastFx(unit, motion = "ranged") {
  if (!unit) return;
  unit.castFx = 10;
  unit.castFxStartedAt = Date.now();
  unit.castMotion = motion;
}

function triggerPlayerAttackFx(actor, target, label = "", hits = 1) {
  if (!actor || !target) return "";
  let kind = V009_PLAYER_ATTACK_FX_BY_CLASS[actor.classId] || "punch-gold";
  if (actor.classId === "wangchuan" && isWangLifeDeathSealFxLabel(label)) kind = "life-death-seal-impact";
  if (actor.classId === "wangchuan" && isWangYellowSpringFxLabel(label)) kind = "needle-darkgreen-triple";
  triggerCombatStageAttackFx(kind, "player", label, hits);
  return kind;
}

function isWangLifeDeathSealFxLabel(label) {
  return ["一印追命", "二印銷魂", "三印渡川"].includes(String(label || ""));
}

function isWangYellowSpringFxLabel(label) {
  return String(label || "") === "黃泉引渡";
}

function triggerEnemyAttackFx(enemy, target, label = "", hits = 1) {
  if (!enemy || !target) return "";
  const kind = V009_ENEMY_ATTACK_FX_BY_TYPE[enemy.type] || "bite-darkred";
  triggerCombatStageAttackFx(kind, "enemy", label, hits);
  return kind;
}

function v009AttackImpactDelayMs(kind) {
  const config = V009_ATTACK_FX_CONFIG[kind];
  if (!config) return 0;
  const delays = {
    punch: 285,
    vajraReflect: 260,
    directSword: 333,
    slash: 155,
    needle: 400,
    needleTriple: 400,
    gun: 185,
    beam: 350,
    lifeDeathSeal: 260,
    energy: 520,
    bite: 245,
    crescent: 145,
  };
  return delays[config.family] || 0;
}

function triggerCombatStageAttackFx(kind, side, label = "", hits = 1) {
  if (!state.battle || !V009_ATTACK_FX_CONFIG[kind]) return;
  const maxTtl = 32;
  const normalizedSide = side === "enemy" ? "enemy" : "player";
  const nextHits = Math.max(1, Math.min(6, Math.floor(hits || 1)));
  const startedAt = Date.now();
  const existing = state.battle.stageFx;
  if (existing && existing.kind === kind && existing.side === normalizedSide && !v009StageFxExpired(existing) && existing.ttl > maxTtl - 4) {
    existing.hits = Math.max(1, Math.min(6, (existing.hits || 1) + nextHits));
    existing.label = label || existing.label;
    existing.ttl = maxTtl;
    existing.maxTtl = maxTtl;
    existing.expiresAt = (existing.startedAt || startedAt) + v009StageFxDurationMs(existing.hits);
    emitV009StageCanvasFx(kind, normalizedSide, nextHits);
    return;
  }
  state.battle.stageFx = {
    kind,
    side: normalizedSide,
    label,
    hits: nextHits,
    ttl: maxTtl,
    maxTtl,
    startedAt,
    expiresAt: startedAt + v009StageFxDurationMs(nextHits),
  };
  emitV009StageCanvasFx(kind, normalizedSide, nextHits);
}

function enemyCells(enemy) {
  const cells = [];
  for (let y = enemy.y; y < enemy.y + enemy.h; y++) {
    for (let x = enemy.x; x < enemy.x + enemy.w; x++) {
      cells.push({ x, y });
    }
  }
  return cells;
}

function rowCells(y) {
  return [0, 1, 2, 3].map((x) => ({ x, y }));
}

function areaCellsAround(enemy) {
  const cells = [];
  const minX = Math.max(0, enemy.x - 1);
  const maxX = Math.min(3, enemy.x + enemy.w);
  const minY = Math.max(0, enemy.y - 1);
  const maxY = Math.min(3, enemy.y + enemy.h);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) cells.push({ x, y });
  }
  return cells;
}

function uniqueCells(cells) {
  const seen = new Set();
  const result = [];
  for (const cell of cells || []) {
    const x = Number(cell.x);
    const y = Number(cell.y);
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 3 || y < 0 || y > 3) continue;
    const key = `${x}-${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ x, y });
  }
  return result;
}

function basicAttackMotion(ally) {
  return ["chanlin", "xinhuo", "wangchuan", "emei", "furnace"].includes(ally.classId) ? "melee" : "ranged";
}

function skillAttackMotion(skillId, ally) {
  if (["chanlin_guard", "chanlin_breath", "chanlin_step", "furnace_guard", "wang_vanish", "emei_flash", "emei_guard", "emei_turning", "emei_chase_shadow", "lei_reload_now", "tianshu_shift", "tianshu_array", "chanlin_vajra_reflect", "chanlin_stone_heart", "lei_aim", "lei_quick_reload", "xinhuo_voice", "xinhuo_life_first", "wang_step", "furnace_east"].includes(skillId)) return "support";
  return basicAttackMotion(ally);
}

function enemyAttackMotion(enemy) {
  return ["wolf", "slime"].includes(enemy.type) ? "melee" : "ranged";
}

function triggerHitFx(unit) {
  if (!unit) return;
  unit.hitFx = 8;
  unit.hitFxStartedAt = Date.now();
}

function scheduleCombatHitFeedback(unit, floatText, floatKind = "damage", delayMs = 0) {
  if (!unit) return;
  const delay = Math.max(0, Math.floor(Number(delayMs) || 0));
  if (delay <= 0) {
    triggerHitFx(unit);
    triggerFloat(unit, floatText, floatKind);
    return;
  }
  const battle = state.battle;
  setTimeout(() => {
    if (!state.battle || state.battle !== battle || state.battle.over) return;
    triggerHitFx(unit);
    triggerFloat(unit, floatText, floatKind);
    renderBattleFrame();
  }, delay);
}

function triggerHealFx(unit) {
  if (!unit) return;
  unit.healFx = 6;
  unit.healFxStartedAt = Date.now();
}

function triggerReloadFx(unit) {
  if (!unit) return;
  unit.reloadFx = 12;
  unit.reloadFxStartedAt = Date.now();
}

function triggerFloat(unit, text, kind = "damage") {
  if (!unit) return;
  const displayText = kind === "critical" && !String(text).includes("!")
    ? `${text}!`
    : text;
  const maxTtl = state.battleSpeed === 2 ? 28 : 40;
  const index = Array.isArray(unit.floatStack) ? unit.floatStack.length : 0;
  const side = index % 2 === 0 ? -1 : 1;
  const spread = 10 + Math.random() * 34;
  const item = {
    text: displayText,
    kind,
    ttl: maxTtl,
    maxTtl,
    x: Math.round(side * spread + (Math.random() * 18 - 9)),
    y: Math.round(8 + Math.random() * 8),
    drift: Math.round((Math.random() * 18 + 8) * -side),
    scale: kind === "critical" ? 1.22 : kind === "damage" ? 1.08 : 1,
  };
  unit.floatStack = [...(Array.isArray(unit.floatStack) ? unit.floatStack : []), item].slice(-6);
  unit.floatText = text;
  unit.floatKind = kind;
  unit.floatFx = maxTtl;
}

function triggerSpeech(unit, text) {
  return;
}

function tickFx() {
  const speedScale = battleSpeedScale();
  for (const unit of [...state.battle.allies, ...state.battle.enemies]) {
    unit.castFx = Math.max(0, (unit.castFx || 0) - speedScale);
    unit.hitFx = Math.max(0, (unit.hitFx || 0) - speedScale);
    unit.healFx = Math.max(0, (unit.healFx || 0) - speedScale);
    unit.reloadFx = Math.max(0, (unit.reloadFx || 0) - speedScale);
    unit.speechFx = Math.max(0, (unit.speechFx || 0) - speedScale);
    unit.floatFx = Math.max(0, (unit.floatFx || 0) - speedScale);
    if (Array.isArray(unit.floatStack)) {
      unit.floatStack = unit.floatStack
        .map((item) => ({ ...item, ttl: Math.max(0, (item.ttl || 0) - speedScale) }))
        .filter((item) => item.ttl > 0);
    }
    if (unit.castFx === 0) unit.castMotion = "";
    if (unit.hitFx === 0) unit.hitFxStartedAt = 0;
    if (unit.reloadFx === 0) unit.reloadFxStartedAt = 0;
    if (unit.speechFx === 0) unit.speechText = "";
    if (unit.floatFx === 0 && (!unit.floatStack || !unit.floatStack.length)) unit.floatText = "";
  }
  if (state.battle.stageFx) {
    state.battle.stageFx.ttl = Math.max(0, state.battle.stageFx.ttl - speedScale);
    if (state.battle.stageFx.ttl <= 0 || v009StageFxExpired(state.battle.stageFx)) state.battle.stageFx = null;
  }
  if (state.battle.triggerBanner) {
    state.battle.triggerBanner.ttl = Math.max(0, state.battle.triggerBanner.ttl - speedScale);
    if (state.battle.triggerBanner.ttl <= 0 || (state.battle.triggerBanner.expiresAt && Date.now() >= state.battle.triggerBanner.expiresAt)) {
      state.battle.triggerBanner = null;
    }
  }
  if (state.battle.actionBanner?.expiresAt && Date.now() >= state.battle.actionBanner.expiresAt) {
    state.battle.actionBanner = null;
  }
}

function battleSpeedScale() {
  return state.battleSpeed === 2 ? 2 : 1;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectFeedNames(html) {
  const names = Array.from(new Set((state.battle?.enemies || [])
    .map((enemy) => enemy.name)
    .filter(Boolean)))
    .sort((a, b) => b.length - a.length);
  const tokens = [];
  let protectedHtml = html;
  names.forEach((name, index) => {
    const escapedName = escapeHtml(name);
    const token = `__FEED_ENEMY_NAME_${index}__`;
    protectedHtml = protectedHtml.replace(new RegExp(escapeRegExp(escapedName), "g"), token);
    tokens.push({ token, html: `<span class="feed-name enemy">${escapedName}</span>` });
  });
  return { html: protectedHtml, tokens };
}

function formatFeedText(text) {
  let html = escapeHtml(text);
  const protectedNames = protectFeedNames(html);
  html = protectedNames.html;
  html = html.replace(/(施展)([^，。]+?)(?=，|。)/g, '$1<span class="feed-skill">$2</span>');
  html = html.replace(/(以)([^，。]+?)(命中)/g, '$1<span class="feed-skill">$2</span>$3');
  html = html.replace(/(造成\s*)(\d+)(\s*點傷害)/g, '$1<span class="feed-num damage">$2</span>$3');
  html = html.replace(/(回復\s*)(\d+)/g, '$1<span class="feed-num heal">$2</span>');
  html = html.replace(/(Lv)(\d+)/g, '$1<span class="feed-num level">$2</span>');
  html = html.replace(/(荒幣|資材|能源)\s*(\d+)/g, '$1 <span class="feed-num resource">$2</span>');
  html = html.replace(/(標定|點名|破甲)/g, '<span class="feed-word mark">$1</span>');
  html = html.replace(/(護盾|防壁)/g, '<span class="feed-word shield">$1</span>');
  html = html.replace(/(中毒|上毒|毒性|毒\d+)/g, '<span class="feed-word poison">$1</span>');
  for (const item of protectedNames.tokens) {
    html = html.split(item.token).join(item.html);
  }
  return html;
}

function emptyReward() {
  return { money: 0, material: 0, energy: 0, items: [], gear: [] };
}

function shouldTriggerRandomEventAfterBattle(battle, victory) {
  return !!victory
    && battle?.kind === "mob"
    && !battle.eventContext
    && battle.level > 10
    && Math.random() < 0.3;
}

function rollRandomPostBattleEvent(level) {
  const roll = Math.random();
  const type = roll < 0.5 ? "rescue" : roll < 0.85 ? "duel" : "ruins";
  const classId = randomOf(Object.keys(CLASS_DATA));
  const playerLevel = playerCombatMember()?.level || level;
  const eventLevel = type === "duel" ? playerLevel : level;
  const npc = type === "ruins" ? null : createEventFactionCharacter(eventLevel, classId);
  return {
    id: cryptoRandomId(),
    type,
    level: Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, safeNumber(eventLevel, 1, 1))),
    classId,
    faction: CLASS_DATA[classId]?.name || "門派",
    name: npc?.name || "",
    npc,
  };
}

function eventPromptMessage(event) {
  if (event.type === "rescue") return `${event.faction} 門人遭受魔物圍攻，受傷不輕，是否要上前協助？`;
  if (event.type === "duel") return `${event.faction} 的 ${event.name} 相當欣賞你的身手，希望能和你切磋一番。`;
  return "你發現了一個尚未被探索過的遺跡洞穴，是否要深入？（高難度戰鬥警告）";
}

function showRandomEventPrompt(event) {
  if (!event) return;
  if (event.type === "duel") {
    return showRandomEventDialogue("荒野事件", eventPromptMessage(event), [
      { label: "開始切磋", primary: true, action: () => startBattle(event.level, false, "event_duel", { eventContext: { ...event, skipStandardRewards: true }, standardRewards: false }) },
    ]);
  }
  if (event.type === "ruins") {
    return showRandomEventDialogue("荒野事件", eventPromptMessage(event), [
      {
        label: "是",
        primary: true,
        action: () => showRandomEventDialogue("深入險地", "盤據在遺跡中的危險生物向你襲來！", [
          { label: "迎戰", primary: true, action: () => {
            const bossLevel = Math.min(BLACKWATER_MAX_LEVEL, Math.max(1, playerCombatMember()?.level || event.level));
            startBattle(bossLevel, false, "event_ruins", { eventContext: { ...event, bossLevel }, standardRewards: true });
          } },
        ]),
      },
      { label: "否", action: () => {} },
    ]);
  }
  return showRandomEventDialogue("荒野事件", eventPromptMessage(event), [
    { label: "是", primary: true, action: () => startBattle(event.level, false, "event_rescue", { eventContext: event, standardRewards: true }) },
    { label: "否", action: () => {} },
  ]);
}

function showRandomEventDialogue(title, message, actions = []) {
  document.querySelectorAll(".random-event-modal").forEach((node) => node.remove());
  const modal = document.createElement("div");
  modal.className = "result-modal random-event-modal";
  modal.innerHTML = `
    <div class="result-card random-event-card">
      <div class="result-heading">
        <span>EVENT</span>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <p>${escapeHtml(message)}</p>
      <div class="result-actions">
        ${actions.map((action, index) => `<button class="${action.primary ? "primary" : ""}" data-random-event-action="${index}">${escapeHtml(action.label)}</button>`).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  actions.forEach((action, index) => {
    const button = modal.querySelector(`[data-random-event-action="${index}"]`);
    if (!button) return;
    button.onclick = () => {
      modal.remove();
      if (typeof action.action === "function") action.action();
    };
  });
}

function eventMaterialPoolForLevel(level) {
  const ids = new Set(BLACKWATER_REGION_DROPS.map((drop) => drop.id));
  encounterTypes(level, 4).forEach((type) => {
    const profile = ENEMY_DROP_PROFILE[type];
    if (!profile) return;
    ids.add(profile.common);
    ids.add(profile.rare);
  });
  return Array.from(ids).filter((id) => ITEM_DATA[id] && (ITEM_UNLOCK_LEVEL[id] || 1) <= level);
}

function randomEventMaterialReward(level) {
  const id = randomOf(eventMaterialPoolForLevel(level)) || "black_sand";
  const value = itemValue(id);
  const count = value >= 300 ? 1 : value >= 150 ? randomAmount(1, 2) : value >= 80 ? randomAmount(2, 3) : randomAmount(4, 7);
  return { id, count };
}

function grantFixedExperiencePercent(percent) {
  const member = playerCombatMember();
  if (!member || member.level >= MAX_LEVEL) return null;
  return grantMemberExperience(member, Math.round(xpForNextLevel(member.level) * percent));
}

function applyRandomEventOutcome(eventContext, victory, reward) {
  if (!eventContext) return null;
  if (eventContext.type === "rescue") {
    if (!victory) return { message: "你沒能救下被圍攻的門派門人，只能暫時撤離。" };
    const item = randomEventMaterialReward(eventContext.level);
    mergeRewardItems(reward.items, [item]);
    addInventoryItems([item]);
    return { message: `${eventContext.faction} 的 ${eventContext.name} 十分感激你的幫助，提供 ${itemName(item.id)} x${item.count} 以表感激之情。` };
  }
  if (eventContext.type === "duel") {
    const expResult = grantFixedExperiencePercent(victory ? 0.3 : 0.15);
    return {
      expResult,
      message: victory
        ? `你技高一籌令 ${eventContext.faction} 的 ${eventContext.name} 十分佩服，這場切磋令你獲益良多。`
        : `你稍遜一籌，${eventContext.faction} 的 ${eventContext.name} 表示承讓，這場切磋有值得反省之處。`,
    };
  }
  if (eventContext.type === "ruins") {
    if (!victory) return { message: "遺跡中的危險生物逼退了你，洞穴深處的寶物暫時無法取得。" };
    const extra = {
      money: randomAmount(420, 620) + eventContext.level * 34,
      material: randomAmount(120, 190) + eventContext.level * 9,
      energy: 0,
      items: Array.from({ length: randomAmount(2, 4) }, () => randomEventMaterialReward(eventContext.level)),
      gear: [],
    };
    mergeRewardItems(extra.items, [{ id: BODY_FRAGMENT_ITEM_ID, count: 5 }]);
    reward.money += extra.money;
    reward.material += extra.material;
    mergeRewardItems(reward.items, extra.items);
    state.money += extra.money;
    state.material += extra.material;
    addInventoryItems(extra.items);
    return { message: "你成功擊倒了強敵，從遺跡中搜刮到大量寶物。" };
  }
  return null;
}

function endBattle(victory) {
  const battle = state.battle;
  if (!battle || battle.over) return;
  const alreadyCleared = battle.level <= state.maxClearedLevel;
  const eventContext = battle.eventContext || null;
  const progressBattle = !eventContext;
  const bossBattle = progressBattle && battle.kind === "boss";
  const autoBattle = !!battle.autoRepeat && !!state.autoRepeat && progressBattle;
  battle.over = true;
  clearInterval(state.battleTimer);
  state.battleTimer = null;
  refreshTownTalkers();
  if (victory) {
    const reward = battle.standardRewards ? calculateBattleDrops(battle) : emptyReward();
    if (autoBattle) applyAutoRepeatRewardDiscount(reward);
    let expResult = battle.standardRewards ? grantBattleExperience(battle, autoBattle ? AUTO_REPEAT_REWARD_RATE : 1) : null;
    const completedCommissions = progressBattle ? resolveBattleCommissions() : [];
    state.money += reward.money;
    state.material += reward.material;
    addInventoryItems(reward.items);
    addGearItems(reward.gear);
    const eventOutcome = applyRandomEventOutcome(eventContext, true, reward);
    if (eventOutcome?.expResult) expResult = eventOutcome.expResult;
    if (progressBattle && battle.level === state.maxClearedLevel + 1) {
      state.maxClearedLevel = Math.min(BLACKWATER_MAX_LEVEL, battle.level);
      state.idleProgress = 0;
    }
    const blueprintRewards = bossBattle ? unlockBattleBlueprints(battle.level) : [];
    syncProgressUnlocks();
    if (progressBattle) {
      rotateTianyaNews({ victory: true, level: battle.level, alreadyCleared });
      state.refreshCounter += 1;
      if (state.refreshCounter >= 3) {
        state.refreshCounter = 0;
        refreshMarketStock();
        refreshFortune();
      }
      const queuedStoryEvent =
        queueWolfWorkshopIntroAfterBattle(battle, alreadyCleared) ||
        queueBodyManagementIntroAfterBattle(battle, alreadyCleared);
      if (queuedStoryEvent) battle.storyEventQueued = true;
    }
    const nextEvent = !autoBattle && !battle.storyEventQueued && shouldTriggerRandomEventAfterBattle(battle, true) ? rollRandomPostBattleEvent(battle.level) : null;
    battle.autoRepeatStopAfterResult = !!battle.storyEventQueued || !!nextEvent;
    if (autoBattle) recordAutoRepeatStats(reward, expResult);
    saveGame();
    showResult(true, reward, completedCommissions, blueprintRewards, expResult);
    if (eventOutcome?.message) setTimeout(() => showRandomEventDialogue("事件結果", eventOutcome.message, [{ label: "確認", primary: true, action: () => {} }]), 160);
    else if (nextEvent) setTimeout(() => showRandomEventPrompt(nextEvent), 180);
  } else {
    const reward = eventContext ? emptyReward() : { money: 30, material: 8, energy: 0, items: [], gear: [] };
    let expResult = null;
    const eventOutcome = applyRandomEventOutcome(eventContext, false, reward);
    if (eventOutcome?.expResult) expResult = eventOutcome.expResult;
    state.money += reward.money;
    state.material += reward.material;
    state.autoRepeat = false;
    state.autoRepeatStats = null;
    if (bossBattle && battle.level === currentIdleLevel()) state.idleProgress = 0;
    if (progressBattle) rotateTianyaNews({ victory: false, level: battle.level, alreadyCleared });
    state.v009DefeatFlashUntil = Date.now() + 900;
    saveGame();
    showResult(false, reward, [], [], expResult);
    if (eventOutcome?.message) setTimeout(() => showRandomEventDialogue("事件結果", eventOutcome.message, [{ label: "確認", primary: true, action: () => {} }]), 160);
  }
}

function unlockBattleBlueprints(level) {
  const rewardsByLevel = {
    5: ["wolf_king_gear", "wolf_pack_chip", "prototype_chip_1"],
    10: ["steel_scorpion_gear"],
  };
  return (rewardsByLevel[level] || [])
    .filter(unlockBlueprint)
    .map((key) => BLUEPRINT_DATA[key].name);
}

function scheduleAutoRepeat(level, kind = "mob") {
  if (state.autoRepeatTimer) clearTimeout(state.autoRepeatTimer);
  state.autoRepeatTimer = null;
  if (kind !== "boss") state.pendingBossLevel = null;
  const repeatSeq = (state.autoRepeatSeq || 0) + 1;
  state.autoRepeatSeq = repeatSeq;
  state.autoRepeatTimer = setTimeout(() => {
    if (state.autoRepeatSeq !== repeatSeq) return;
    if (!state.autoRepeat) return;
    state.battle = null;
    startBattle(level, true, kind);
  }, AUTO_REPEAT_INTERVAL_MS);
  render();
}

function battleClearRating(battle) {
  if (!battle) return null;
  const elapsedSeconds = Math.max(1, Math.round(((battle.flowClock || 0) * BATTLE_TICK_MS) / 1000));
  const actor = battle.allies.find((ally) => ally.hp > 0) || battle.allies[0];
  const hpRatio = actor?.maxHp > 0 ? Math.max(0, actor.hp) / actor.maxHp : 0;
  const enemyCount = Math.max(1, battle.enemies?.length || 1);
  const expectedSeconds = (battle.kind === "boss" ? 70 : 34) + enemyCount * 10;
  let index = 0;
  if (hpRatio >= 0.9) index = 4;
  else if (hpRatio >= 0.72) index = 3;
  else if (hpRatio >= 0.48) index = 2;
  else if (hpRatio >= 0.24) index = 1;

  if (elapsedSeconds <= expectedSeconds * 0.72 && hpRatio >= 0.55) index = Math.min(4, index + 1);
  if (elapsedSeconds > expectedSeconds * 1.35) index = Math.max(0, index - 1);
  if (battle.kind === "boss" && hpRatio >= 0.35) index = Math.min(4, index + 1);
  if (hpRatio < 0.18) index = 0;

  const ratings = [
    { label: "險勝", tone: "clutch" },
    { label: "苦戰取勝", tone: "hard" },
    { label: "穩定取勝", tone: "even" },
    { label: "俐落破敵", tone: "easy" },
    { label: "壓制勝利", tone: "overwhelming" },
  ];
  return { ...ratings[index], elapsedSeconds, hpRatio, enemyCount };
}

function cancelAutoRepeat() {
  if (!state.autoRepeat) return;
  state.autoRepeat = false;
  if (state.battle && !state.battle.over) state.battle.autoRepeat = false;
  if (state.autoRepeatTimer) clearTimeout(state.autoRepeatTimer);
  state.autoRepeatTimer = null;
  document.querySelectorAll(".auto-repeat-float").forEach((el) => el.remove());
  saveGame();
}

function resolveBattleCommissions() {
  const completed = [];
  ensureDefaultCommissions();
  Object.entries(COMMISSION_DATA).forEach(([id, data]) => {
    const commission = state.commissions[id];
    if (commission?.accepted && !commission.completed) {
      commission.progress = Math.min(data.target, commission.progress + 1);
      if (commission.progress >= data.target) {
        commission.completed = true;
        completed.push(data);
      }
    }
  });
  return completed;
}

function calculateBattleDrops(battle) {
  const base = battle.enemies.reduce((sum, enemy) => {
    sum.money += enemy.drops?.money || 0;
    sum.material += enemy.drops?.material || 0;
    mergeRewardItems(sum.items, enemy.drops?.items || []);
    if (Math.random() <= BODY_FRAGMENT_DROP_CHANCE) mergeRewardItems(sum.items, [{ id: BODY_FRAGMENT_ITEM_ID, count: 1 }]);
    return sum;
  }, { money: 0, material: 0, energy: 0, items: [] });
  if (battle.level % 5 === 0) {
    base.money += 80 + battle.level * 8;
    base.material += 20 + battle.level * 3;
  }
  if (battle.kind === "boss" && battle.level === 5) {
    mergeRewardItems(base.items, [{ id: "wolf_king_core", count: 2 }]);
  }
  if (battle.kind === "boss" && battle.level === 10) {
    mergeRewardItems(base.items, [{ id: "steel_scorpion_core", count: 2 }]);
  }
  mergeRewardItems(base.items, rollDropTable(BLACKWATER_REGION_DROPS));
  mergeRewardItems(base.items, rollDropTable(GLOBAL_DROPS));
  base.gear = [];
  return base;
}

function rollDropTable(table) {
  return table.reduce((items, drop) => {
    if (Math.random() <= drop.chance) items.push({ id: drop.id, count: randomAmount(drop.amount[0], drop.amount[1]) });
    return items;
  }, []);
}

function mergeRewardItems(target, items) {
  for (const item of items || []) {
    const existing = target.find((entry) => entry.id === item.id);
    if (existing) existing.count += item.count;
    else target.push({ id: item.id, count: item.count });
  }
}

function discountedAutoRepeatAmount(amount) {
  const scaled = Math.max(0, Number(amount) || 0) * AUTO_REPEAT_REWARD_RATE;
  const whole = Math.floor(scaled);
  return whole + (Math.random() < scaled - whole ? 1 : 0);
}

function applyAutoRepeatRewardDiscount(reward) {
  if (!reward) return reward;
  reward.money = discountedAutoRepeatAmount(reward.money);
  reward.material = discountedAutoRepeatAmount(reward.material);
  reward.energy = discountedAutoRepeatAmount(reward.energy);
  reward.items = (reward.items || [])
    .map((item) => ({ ...item, count: discountedAutoRepeatAmount(item.count) }))
    .filter((item) => item.count > 0);
  reward.gear = (reward.gear || []).filter(() => Math.random() < AUTO_REPEAT_REWARD_RATE);
  return reward;
}

function recordAutoRepeatStats(reward, expResult) {
  if (!state.autoRepeatStats) return;
  const stats = state.autoRepeatStats;
  stats.battles += 1;
  stats.exp += Math.max(0, Math.floor(expResult?.gained || 0));
  stats.money += Math.max(0, Math.floor(reward?.money || 0));
  stats.material += Math.max(0, Math.floor(reward?.material || 0));
  stats.energy += Math.max(0, Math.floor(reward?.energy || 0));
  stats.gear += Math.max(0, (reward?.gear || []).length);
  for (const item of reward?.items || []) {
    stats.items[item.id] = (stats.items[item.id] || 0) + Math.max(0, Math.floor(item.count || 0));
  }
}

function xpForNextLevel(level) {
  level = Math.min(MAX_LEVEL - 1, Math.max(1, Number(level) || 1));
  const base = 60 + level * 20 + Math.pow(level, 2) * 10;
  if (level < 7) return Math.round(base);
  const lateStep = level - 6;
  const postTenStep = Math.max(0, level - 10);
  const multiplier = 1 + lateStep * 0.16 + postTenStep * 0.11;
  return Math.round(base * multiplier);
}

function battleExperienceAmount(member, battle) {
  if (!member || !battle) return 0;
  const diff = battle.level - member.level;
  if (diff <= -10) return 0;
  let base = Math.round(100 + battle.level * 26 + Math.pow(battle.level, 1.2) * 5);
  if (battle.kind === "boss") base += 90 + battle.level * 8;
  if (diff <= -5) base *= 0.22;
  else if (diff < 0) base *= 0.58 + diff * 0.06;
  else if (diff >= 5) base *= 1.18;
  return Math.max(0, Math.round(base));
}

function experienceProgressResult(member, gained, levelUps = 0, unlockedSkills = []) {
  const nextExp = member.level >= MAX_LEVEL ? 0 : xpForNextLevel(member.level);
  return {
    memberName: member.name,
    gained,
    level: member.level,
    levelUps,
    unlockedSkills: unlockedSkills.map((skillData) => skillData.name),
    currentExp: safeNumber(member.exp, 0, 0),
    nextExp,
    progressPct: nextExp ? Math.max(0, Math.min(100, (safeNumber(member.exp, 0, 0) / nextExp) * 100)) : 100,
  };
}

function grantMemberExperience(member, gained) {
  if (!member) return null;
  gained = Math.max(0, Math.round(Number(gained) || 0));
  if (gained <= 0) {
    return experienceProgressResult(member, 0, 0, []);
  }
  const startLevel = member.level;
  member.exp = safeNumber(member.exp, 0, 0) + gained;
  let levelUps = 0;
  while (member.level < MAX_LEVEL && member.exp >= xpForNextLevel(member.level)) {
    member.exp -= xpForNextLevel(member.level);
    member.level += 1;
    levelUps += 1;
    growStats(member);
  }
  member.equippedActive = normalizeEquippedActives(member);
  member.equippedPassive = normalizeEquippedPassive(member);
  const unlockedSkills = levelUps ? newlyUnlockedSkills(member, startLevel, member.level) : [];
  autoEquipUnlockedSkills(member, unlockedSkills);
  queueSkillOrderTutorial(member, startLevel, member.level, unlockedSkills);
  recordUnlockedSkills(member, unlockedSkills);
  return experienceProgressResult(member, gained, levelUps, unlockedSkills);
}

function grantBattleExperience(battle, multiplier = 1) {
  const actor = battle?.allies?.[0];
  const member = actor ? getMember(actor.sourceId) : playerCombatMember();
  if (!member) return null;
  return grantMemberExperience(member, Math.max(0, Math.round(battleExperienceAmount(member, battle) * multiplier)));
}

function commissionExperienceAmount(data, member = playerCombatMember()) {
  if (!data || !member) return 0;
  return battleExperienceAmount(member, { level: currentIdleLevel(), kind: "mob" });
}

function grantCommissionExperience(data) {
  const member = playerCombatMember();
  return grantMemberExperience(member, commissionExperienceAmount(data, member));
}

function showResult(victory, reward, completedCommissions = [], blueprintRewards = [], expResult = null) {
  const battle = state.battle;
  const clearRating = victory ? battleClearRating(battle) : null;
  const continueAutoRepeat = !!victory
    && !!state.autoRepeat
    && !!battle?.autoRepeat
    && !battle.autoRepeatStopAfterResult
    && !battle?.eventContext;
  const lines = [];
  if (victory) {
    lines.push({ text: `戰鬥勝利${clearRating?.label ? `：${clearRating.label}` : ""}`, kind: "gold" });
  } else {
    lines.push({ text: "撤退歸來", kind: "bad" });
  }
  if (expResult) {
    const progressText = expResult.nextExp
      ? `距離下一級還有 ${Math.max(0, expResult.nextExp - Math.floor(expResult.currentExp))}/${expResult.nextExp}。`
      : "已達最高等級。";
    lines.push({
      text: expResult.levelUps
        ? `經驗值 +${expResult.gained}，${expResult.memberName} 升至 Lv${expResult.level}，${progressText}`
        : `經驗值 +${expResult.gained}，${expResult.memberName} Lv${expResult.level}，${progressText}`,
      kind: "good",
    });
    if (expResult.unlockedSkills?.length) {
      lines.push({
        text: `學會 ${expResult.unlockedSkills.join("、")}。`,
        kind: "skill-unlock",
      });
    }
  }
  const resources = [
    reward.money ? `荒幣 ${reward.money}` : "",
    reward.material ? `資材 ${reward.material}` : "",
    reward.energy ? `能源 ${reward.energy}` : "",
  ].filter(Boolean);
  const itemRewards = (reward.items || []).map((item) => `${itemName(item.id)} ${item.count}`);
  const gearRewards = (reward.gear || []).map((gear) => `${gearDisplayName(gear)}（${gearSlotLabel(gear.slot)}）`);
  const lootRewards = [...resources, ...itemRewards, ...gearRewards];
  if (lootRewards.length) lines.push({ text: `戰利品：${lootRewards.join("、")}。`, kind: "gold" });
  blueprintRewards.forEach((name) => {
    lines.push({ text: `解鎖藍圖：${name}。`, kind: "gold" });
  });
  completedCommissions.forEach((item) => {
    lines.push({ text: `委託完成：${item.name}。`, kind: "good" });
  });
  if (victory && lines.length === 1) lines.push({ text: "戰利品：無額外取得。", kind: "gold" });
  lines.slice().reverse().forEach((line) => addFeed(line.text, line.kind));
  state.battle = null;
  state.view = "town";
  state.homePrimaryMenu = "map";
  state.homeSecondaryMenu = "stages";
  state.autoRepeat = continueAutoRepeat;
  if (!continueAutoRepeat) state.autoRepeatStats = null;
  saveGame();
  render();
  if (continueAutoRepeat) scheduleAutoRepeat(battle.level, battle.kind);
}

function showBossClearResult(battleLevel) {
  render();
  const modal = document.createElement("div");
  modal.className = "result-modal";
  const nextLevel = Math.min(BLACKWATER_MAX_LEVEL, battleLevel + 1);
  const unlockedLevel = battleLevel < BLACKWATER_MAX_LEVEL ? nextLevel : battleLevel;
  modal.innerHTML = `
    <div class="result-card boss-clear-card">
      <div class="result-heading">
        <span>BOSS CLEAR</span>
        <h2>Lv${unlockedLevel} 已解放</h2>
      </div>
      <div class="boss-clear-info">
        <b>進度解放</b>
        <p>${battleLevel < BLACKWATER_MAX_LEVEL ? `黑水砂原已可進入 Lv${nextLevel}。` : "黑水砂原最終等級已解放。"}</p>
      </div>
      <div class="boss-clear-info">
        <b>頭目挑戰開放</b>
        <p>Lv${battleLevel} ${bossName(battleLevel)} 已加入「頭目挑戰」，可重複挑戰。</p>
      </div>
      <div class="result-actions single">
        <button id="resultNext">下一關</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("resultNext").onclick = () => {
    modal.remove();
    state.battle = null;
    state.autoRepeat = false;
    state.autoRepeatStats = null;
    state.view = "town";
    state.homePrimaryMenu = "map";
    state.homeSecondaryMenu = "stages";
    startBattle(nextLevel, false, "mob");
  };
}

function battleMvp(battle) {
  const allies = battle?.allies || [];
  if (!allies.length) return null;
  return allies
    .map((ally) => {
      const contribution = ally.contribution || {};
      const damage = Math.floor(contribution.damage || 0);
      const heal = Math.floor(contribution.heal || 0);
      const taken = Math.floor(contribution.taken || 0);
      return {
        name: ally.name,
        classId: ally.classId,
        level: ally.level,
        fullPortrait: ally.fullPortrait || ally.portrait || "",
        damage,
        heal,
        taken,
        score: damage + heal * 1.1 + taken * 0.65,
      };
    })
    .sort((a, b) => b.score - a.score || b.damage - a.damage || b.heal - a.heal || b.taken - a.taken)[0];
}

function resultMvpHtml(mvp) {
  if (!mvp) return "";
  const role = ROLE_LABELS[CLASS_ROLE_TONES[mvp.classId]] || CLASS_DATA[mvp.classId]?.role || "";
  const portrait = mvp.fullPortrait ? `<div class="result-mvp-portrait"><img src="${escapeHtml(mvp.fullPortrait)}" alt=""></div>` : "";
  return `
    <div class="result-mvp ${roleToneClass(mvp.classId)}">
      ${portrait}
      <div class="result-mvp-info">
        <span>MVP</span>
        <div class="result-mvp-main">
          <b>${mvp.name}</b>
          <i>Lv${mvp.level} ${role}</i>
        </div>
        <div class="result-mvp-values">
          <span><em>傷害</em><strong>${mvp.damage}</strong></span>
          <span><em>治療</em><strong>${mvp.heal}</strong></span>
          <span><em>承傷</em><strong>${mvp.taken}</strong></span>
        </div>
      </div>
    </div>
  `;
}

function showSkillUnlockModal(member, unlockedSkills) {
  if (!unlockedSkills.length) return;
  if (state.pendingSkillOrderTutorial && !state.tutorials.firstSkillUnlock) return;
  const modal = document.createElement("div");
  modal.className = "result-modal skill-unlock-modal";
  modal.innerHTML = `
    <div class="result-card skill-unlock-card">
      <div class="eyebrow">技能解鎖</div>
      <h2>${member.name} 學會新技能</h2>
      <div class="unlock-list">
        ${unlockedSkills.map((skillData) => {
          const detail = skillDetail(skillData, member);
          return `
            <div class="unlock-skill">
              <span class="unlock-type">${skillData.type === "active" ? "主動" : "被動"}</span>
              <div>
                <div class="skill-name-with-tag">
                  <b>${skillData.name}</b>
                  ${skillTimingTag(skillData)}
                </div>
                <p>${detail.function}</p>
                ${skillEffectLineHtml(detail)}
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="result-actions">
        <button id="skillUnlockClose">確認</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("skillUnlockClose").onclick = () => modal.remove();
}

function newlyUnlockedSkills(member, oldLevel, newLevel) {
  const raw = CLASS_DATA[member.classId].skills.filter((skillData) => (
    skillData.level > oldLevel && skillData.level <= newLevel
  ));
  const visibleIds = new Set(knownSkills(member).map((skillData) => skillData.id));
  const replacedIds = new Set();
  for (const skillData of raw) {
    const upgradedId = upgradedSkillIdForMember(member, skillData.id);
    if (upgradedId !== skillData.id) replacedIds.add(skillData.id);
  }
  return raw
    .filter((skillData) => visibleIds.has(skillData.id) && !replacedIds.has(skillData.id))
    .sort((a, b) => a.level - b.level);
}

function recordUnlockedSkills(member, unlockedSkills) {
  (unlockedSkills || []).forEach((skillData) => {
    addFeed(`${member.name} 學會 ${skillData.name}。`, "skill-unlock");
  });
}

function autoEquipUnlockedSkills(member, unlockedSkills) {
  if (!member || !Array.isArray(unlockedSkills) || !unlockedSkills.length) return;
  cleanEquippedActiveList(member);
  replaceUpgradedEquippedSkills(member);
  unlockedSkills
    .filter((skillData) => skillData.type === "active")
    .forEach((skillData) => equipUnlockedSkillToTimingSlot(member, skillData));
  cleanEquippedActiveList(member);
}

function replaceUpgradedEquippedSkills(member) {
  if (!member || !Array.isArray(member.equippedActive)) return;
  const knownActiveIds = new Set(knownSkills(member, "active").map((skillData) => skillData.id));
  member.equippedActive = member.equippedActive.map((id) => {
    const upgradedId = upgradedSkillIdForMember(member, id);
    return knownActiveIds.has(upgradedId) ? upgradedId : id;
  });
}

function equipUnlockedSkillToTimingSlot(member, skillData) {
  const timing = normalizeSkillTiming(skillData.timing);
  const slots = equippedSkillIdsByTiming(member, timing);
  if (slots.includes(skillData.id)) return;
  const openSlot = slots.findIndex((id) => !id);
  const targetSlot = openSlot >= 0 ? openSlot : slots.length - 1;
  slots[targetSlot] = skillData.id;
  setEquippedSkillsByTiming(member, timing, slots);
}

function bindEvents() {
  document.querySelectorAll("[data-start-game]").forEach((el) => {
    el.addEventListener("click", () => {
      state.showTitle = false;
      render();
    });
  });
  document.querySelectorAll("[data-event-dialogue-next]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      advanceEventDialogue();
    });
  });
  document.querySelectorAll("[data-creator-class]").forEach((el) => {
    el.addEventListener("click", () => {
      updateCreatorDraft({ classId: el.dataset.creatorClass });
      render();
    });
  });
  document.querySelectorAll("[data-creator-gender]").forEach((el) => {
    el.addEventListener("click", () => {
      updateCreatorDraft({ gender: el.dataset.creatorGender });
      render();
    });
  });
  document.querySelectorAll("[data-creator-portrait]").forEach((el) => {
    el.addEventListener("click", () => {
      const draft = creatorDraft();
      const pool = creatorPortraitPool(draft.classId, draft.gender);
      const count = Math.max(1, pool.length);
      const delta = Number(el.dataset.creatorPortrait) || 0;
      updateCreatorDraft({ portraitIndex: (draft.portraitIndex + delta + count) % count });
      render();
    });
  });
  document.querySelectorAll("[data-creator-name]").forEach((el) => {
    el.addEventListener("input", () => {
      updateCreatorDraft({ name: sanitizeCreatorName(el.value) });
      el.value = state.creatorDraft.name;
    });
  });
  document.querySelectorAll("[data-creator-random-name]").forEach((el) => {
    el.addEventListener("click", () => {
      const draft = creatorDraft();
      updateCreatorDraft({ name: randomName(CLASS_DATA[draft.classId], usedNameParts(), draft.gender) });
      render();
    });
  });
  document.querySelectorAll("[data-creator-random]").forEach((el) => {
    el.addEventListener("click", () => {
      if (randomizeCreatorDraft()) render();
    });
  });
  document.querySelectorAll("[data-creator-complete]").forEach((el) => {
    el.addEventListener("click", () => completeCreator());
  });
  document.querySelectorAll("[data-body-select-class]").forEach((el) => {
    el.addEventListener("click", () => {
      updateBodySelectionDraft({ classId: el.dataset.bodySelectClass });
      render();
    });
  });
  document.querySelectorAll("[data-body-select-gender]").forEach((el) => {
    el.addEventListener("click", () => {
      updateBodySelectionDraft({ gender: el.dataset.bodySelectGender });
      render();
    });
  });
  document.querySelectorAll("[data-body-select-portrait]").forEach((el) => {
    el.addEventListener("click", () => {
      const draft = bodySelectionDraft();
      const pool = creatorPortraitPool(draft.classId, draft.gender);
      const count = Math.max(1, pool.length);
      const delta = Number(el.dataset.bodySelectPortrait) || 0;
      updateBodySelectionDraft({ portraitIndex: (draft.portraitIndex + delta + count) % count });
      render();
    });
  });
  document.querySelectorAll("[data-body-select-cancel]").forEach((el) => {
    el.addEventListener("click", () => {
      state.bodySelection = null;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-body-select-confirm]").forEach((el) => {
    el.addEventListener("click", () => confirmBodySelection());
  });
  document.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.closest(".subui-panel")) {
        if (el.dataset.view === "town") state.overlayView = null;
        else state.overlayView = el.dataset.view;
        render();
        return;
      }
      state.view = el.dataset.view;
      state.overlayView = null;
      render();
    });
  });
  document.querySelectorAll("[data-home-primary]").forEach((el) => {
    el.addEventListener("click", () => {
      state.homePrimaryMenu = normalizeHomePrimaryMenu(el.dataset.homePrimary);
      state.homeSecondaryMenu = normalizeHomeSecondaryMenu(state.homePrimaryMenu, "");
      render();
    });
  });
  document.querySelectorAll("[data-home-secondary]").forEach((el) => {
    el.addEventListener("click", () => {
      const activeMenu = normalizeHomePrimaryMenu(state.homePrimaryMenu);
      const currentSecondary = normalizeHomeSecondaryMenu(activeMenu, state.homeSecondaryMenu);
      const targetSecondary = normalizeHomeSecondaryMenu(activeMenu, el.dataset.homeSecondary);
      state.homeSecondaryMenu = targetSecondary;
      if (activeMenu === "codex" && targetSecondary === "factions") {
        state.codexFactionOpen = currentSecondary === targetSecondary ? state.codexFactionOpen === false : true;
      }
      render();
    });
  });
  document.querySelectorAll("[data-codex-category-toggle]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const category = el.dataset.codexCategoryToggle;
      if (category === "factions") state.codexFactionOpen = state.codexFactionOpen === false;
      if (category === "geography") state.codexGeographyOpen = state.codexGeographyOpen === false;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-body-upgrade-mode]").forEach((el) => {
    el.addEventListener("click", () => {
      const mode = el.dataset.bodyUpgradeMode;
      if (mode === "switch" && !bodyManagementUnlocked()) return;
      state.bodyUpgradeMode = ["switch", "meridian"].includes(mode) ? mode : "meridian";
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-body-slot]").forEach((el) => {
    el.addEventListener("click", () => {
      handleBodySlotClick(Number(el.dataset.bodySlot));
    });
  });
  document.querySelectorAll("[data-v009-task-link]").forEach((el) => {
    el.addEventListener("click", () => {
      const link = el.dataset.v009TaskLink;
      if (link === "commission") {
        state.homePrimaryMenu = "commission";
        state.homeSecondaryMenu = "board";
        state.focusedCommissionId = el.dataset.v009TaskCommission || "";
      } else {
        state.homePrimaryMenu = "map";
        state.homeSecondaryMenu = "stages";
        state.focusedCommissionId = "";
      }
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-v009-open-commission-list]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-v009-task-link]")) return;
      state.homePrimaryMenu = "commission";
      state.homeSecondaryMenu = "board";
      state.focusedCommissionId = "";
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-close-subui]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target !== el && el.classList.contains("subui-backdrop")) return;
      state.overlayView = null;
      render();
    });
  });
  document.querySelectorAll("[data-tactics-formation]").forEach((el) => {
    el.addEventListener("click", () => {
      state.activeTacticsFormation = normalizeFormationIndex(el.dataset.tacticsFormation);
      render();
    });
  });
  document.querySelectorAll("[data-clear-formation]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      clearFormation(Number(el.dataset.clearFormation));
    });
  });
  document.querySelectorAll("[data-unequip-formation-chips]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      unequipFormationChips(Number(el.dataset.unequipFormationChips));
    });
  });
  document.querySelectorAll("[data-auto-equip-formation-chips]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      autoEquipFormationChips(Number(el.dataset.autoEquipFormationChips));
    });
  });
  document.querySelectorAll("[data-workshop-talk]").forEach((el) => {
    el.addEventListener("click", () => {
      state.workshopTalkEntry = randomYaoDialogue();
      render();
    });
  });
  document.querySelectorAll("[data-console-party-talk]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const member = getMember(el.dataset.consolePartyTalk);
      if (!member) return;
      state.activePartyTalkMemberId = member.id;
      state.activePartyTalkText = partyTalkLine(member);
      render();
    });
  });
  document.querySelectorAll("[data-town-talk]").forEach((el) => {
    el.addEventListener("click", () => {
      const talker = state.townTalkers.find((item) => item.id === el.dataset.townTalk);
      if (!talker) return;
      if (state.activeTownTalkerId === talker.id) {
        talker.lineIndex = ((talker.lineIndex || 0) + 1) % Math.max(1, talker.lines?.length || 1);
      } else {
        state.activeTownTalkerId = talker.id;
        talker.lineIndex = 0;
      }
      render();
    });
  });
  document.querySelectorAll("[data-recruit-talk]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const index = Number(el.dataset.recruitTalk);
      const candidate = state.candidates[index];
      if (!candidate) return;
      state.activeRecruitTalkIndex = index;
      state.activeRecruitTalkText = recruitTalkLine(candidate);
      render();
    });
  });
  document.querySelectorAll("[data-member-id]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      openMemberDetail(el.dataset.memberId, memberDetailTabFromClick(ev.target));
      render();
    });
    el.addEventListener("dblclick", (ev) => {
      ev.preventDefault();
      state.selectedMemberId = el.dataset.memberId;
      addMemberToFirstOpenPartySlot(el.dataset.memberId);
      render();
    });
    el.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.setData("text/plain", el.dataset.memberId);
      ev.dataTransfer.setData("source-slot", "");
    });
  });
  document.querySelectorAll("[data-slot]").forEach((el) => {
    el.addEventListener("dragover", (ev) => ev.preventDefault());
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const memberId = ev.dataTransfer.getData("text/plain");
      const sourceSlotRaw = ev.dataTransfer.getData("source-slot");
      const slot = Number(el.dataset.slot);
      movePartyMember(memberId, slot, sourceSlotRaw);
      render();
    });
  });
  document.querySelectorAll("[data-party-drag]").forEach((el) => {
    el.addEventListener("dragstart", (ev) => {
      const slot = Number(el.dataset.partyDrag);
      ev.dataTransfer.setData("text/plain", state.party[slot] || "");
      ev.dataTransfer.setData("source-slot", String(slot));
    });
  });
  document.querySelectorAll("[data-roster-drop]").forEach((el) => {
    el.addEventListener("dragover", (ev) => ev.preventDefault());
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const sourceSlotRaw = ev.dataTransfer.getData("source-slot");
      if (sourceSlotRaw === "") return;
      const sourceSlot = Number(sourceSlotRaw);
      if (Number.isFinite(sourceSlot)) state.party[sourceSlot] = null;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-remove-slot]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      state.party[Number(el.dataset.removeSlot)] = null;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-party-member-id]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      openMemberDetail(el.dataset.partyMemberId, memberDetailTabFromClick(ev.target));
      render();
    });
  });
  document.querySelectorAll("[data-tactics-name-camp]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      state.selectedMemberId = el.dataset.tacticsNameCamp;
      state.detailMemberId = null;
      state.view = "camp";
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-tavern-talk]").forEach((el) => {
    el.addEventListener("click", () => {
      const talker = tavernRegulars().find((item) => item.id === el.dataset.tavernTalk);
      if (!talker) return;
      state.tavernTalkerLineIndexes = state.tavernTalkerLineIndexes || {};
      if (state.activeTavernTalkerId === talker.id) {
        state.tavernTalkerLineIndexes[talker.id] = ((talker.lineIndex || 0) + 1) % Math.max(1, talker.lines?.length || 1);
      } else {
        state.activeTavernTalkerId = talker.id;
        state.tavernTalkerLineIndexes[talker.id] = 0;
      }
      render();
    });
  });
  document.querySelectorAll("[data-close-member-detail]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target !== el && el.classList.contains("member-detail-backdrop")) return;
      state.detailMemberId = null;
      state.detailCandidateIndex = null;
      state.statDetailMemberId = null;
      state.statDetailCandidateIndex = null;
      render();
    });
  });
  document.querySelectorAll("[data-open-member-stats]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      state.statDetailMemberId = el.dataset.openMemberStats;
      state.statDetailCandidateIndex = null;
      render();
    });
  });
  document.querySelectorAll("[data-open-candidate-stats]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      state.statDetailCandidateIndex = Number(el.dataset.openCandidateStats);
      state.statDetailMemberId = null;
      render();
    });
  });
  document.querySelectorAll("[data-close-stat-detail]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target !== el && el.classList.contains("stat-detail-backdrop")) return;
      state.statDetailMemberId = null;
      state.statDetailCandidateIndex = null;
      render();
    });
  });
  document.querySelectorAll("[data-open-news]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      state.activeNewsId = el.dataset.openNews;
      render();
    });
  });
  document.querySelectorAll("[data-news-step]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      const step = Number(el.dataset.newsStep);
      const total = TIANYA_NEWS_DATA.length;
      state.newsIndex = (normalizeNewsIndex(state.newsIndex) + step + total) % total;
      state.activeNewsId = null;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-draw-fortune]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      drawFortune();
    });
  });
  document.querySelectorAll("[data-close-news]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target !== el && el.classList.contains("news-backdrop")) return;
      state.activeNewsId = null;
      render();
    });
  });
  document.querySelectorAll("[data-skill-tab]").forEach((el) => {
    el.addEventListener("click", () => {
      state.skillTab = el.dataset.skillTab;
      const pager = el.closest("[data-skill-pager]");
      if (!pager) return;
      pager.querySelectorAll("[data-skill-tab]").forEach((button) => {
        button.classList.toggle("active", button.dataset.skillTab === state.skillTab);
      });
      pager.querySelectorAll("[data-skill-page]").forEach((page) => {
        page.classList.toggle("active", page.dataset.skillPage === state.skillTab);
      });
    });
  });
  document.querySelectorAll("[data-member-skill]").forEach((el) => {
    el.addEventListener("click", () => equipSkill(el.dataset.memberSkill, el.dataset.skillId));
    el.addEventListener("dragstart", (ev) => {
      const member = getMember(el.dataset.memberSkill);
      if (!isUnlockedActiveSkill(member, el.dataset.skillId)) return;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("skill-member", el.dataset.memberSkill);
      ev.dataTransfer.setData("skill-id", el.dataset.skillId);
      ev.dataTransfer.setData("skill-source-slot", "");
    });
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      unequipSkill(el.dataset.memberSkill, el.dataset.skillId);
    });
  });
  document.querySelectorAll("[data-equip-slot]").forEach((el) => {
    el.addEventListener("dblclick", (ev) => {
      if (!el.dataset.equipSkill) return;
      ev.preventDefault();
      ev.stopPropagation();
      removeEquippedActiveAtSlot(el.dataset.equipMember, el.dataset.equipSlot);
    });
    el.addEventListener("dragstart", (ev) => {
      if (!el.dataset.equipSkill) return;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("skill-member", el.dataset.equipMember);
      ev.dataTransfer.setData("skill-id", el.dataset.equipSkill);
      ev.dataTransfer.setData("skill-source-slot", el.dataset.equipSlot);
    });
    el.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const sourceMember = ev.dataTransfer.getData("skill-member");
      const skillId = ev.dataTransfer.getData("skill-id");
      const sourceSlot = ev.dataTransfer.getData("skill-source-slot");
      if (!skillId || sourceMember !== el.dataset.equipMember) return;
      if (sourceSlot !== "") reorderEquippedActive(el.dataset.equipMember, sourceSlot, el.dataset.equipSlot);
      else equipSkillAtSlot(el.dataset.equipMember, skillId, el.dataset.equipSlot);
    });
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      removeEquippedActiveAtSlot(el.dataset.equipMember, el.dataset.equipSlot);
    });
  });
  document.querySelectorAll("[data-open-chip-drawer]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      state.chipDrawer = {
        memberId: el.dataset.openChipDrawer,
        slotKey: el.dataset.openChipKey,
      };
      render();
    });
  });
  document.querySelectorAll("[data-close-chip-drawer]").forEach((el) => {
    el.addEventListener("click", () => {
      state.chipDrawer = null;
      render();
    });
  });
  document.querySelectorAll("[data-equip-crafted-chip]").forEach((el) => {
    el.addEventListener("click", () => {
      equipCraftedChip(el.dataset.equipChipMember, el.dataset.equipChipKey, el.dataset.equipCraftedChip);
    });
  });
  document.querySelectorAll("[data-inventory-chip-id]").forEach((el) => {
    el.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("inventory-chip-id", el.dataset.inventoryChipId);
    });
  });
  document.querySelectorAll("[data-chip-key]").forEach((el) => {
    el.addEventListener("dragstart", (ev) => {
      if (!el.draggable) return;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("chip-member", el.dataset.chipMember);
      ev.dataTransfer.setData("chip-key", el.dataset.chipKey);
    });
    el.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const inventoryChipId = ev.dataTransfer.getData("inventory-chip-id");
      if (inventoryChipId) {
        equipCraftedChip(el.dataset.chipMember, el.dataset.chipKey, inventoryChipId);
        return;
      }
      moveEquipmentChip(
        ev.dataTransfer.getData("chip-member"),
        ev.dataTransfer.getData("chip-key"),
        el.dataset.chipMember,
        el.dataset.chipKey,
      );
    });
  });
  document.querySelectorAll("[data-recruit]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      recruitCandidate(Number(el.dataset.recruit));
    });
  });
  document.querySelectorAll("[data-refresh-recruits]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      paidRefreshCandidates();
    });
  });
  document.querySelectorAll("[data-recruit-detail]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-recruit], [data-lock-candidate]")) return;
      state.detailCandidateIndex = Number(el.dataset.recruitDetail);
      state.detailMemberId = null;
      render();
    });
  });
  document.querySelectorAll("[data-lock-candidate]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleCandidateLock(Number(el.dataset.lockCandidate));
    });
  });
  document.querySelectorAll("[data-commission]").forEach((el) => {
    el.addEventListener("click", () => acceptCommission(el.dataset.commission));
  });
  document.querySelectorAll("[data-claim-commission]").forEach((el) => {
    el.addEventListener("click", () => claimCommission(el.dataset.claimCommission));
  });
  document.querySelectorAll("[data-start-task]").forEach((el) => {
    el.addEventListener("click", () => startTimedTask(el.dataset.startTask));
  });
  document.querySelectorAll("[data-gather-location]").forEach((el) => {
    el.addEventListener("click", () => {
      const location = gatherLocation(el.dataset.gatherLocation);
      if (state.maxClearedLevel < location.unlockLevel) return;
      state.gather.locationId = location.id;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-gather-duration]").forEach((el) => {
    el.addEventListener("click", () => {
      const minutes = Number(el.dataset.gatherDuration);
      if (!GATHER_DURATIONS.includes(minutes)) return;
      state.gather.durationMinutes = minutes;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-gather-worker]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!availableGatherMembers().some((member) => member.id === el.dataset.gatherWorker)) return;
      state.gather.workerId = el.dataset.gatherWorker;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-start-gather]").forEach((el) => {
    el.addEventListener("click", () => startGatherTask());
  });
  document.querySelectorAll("[data-claim-task]").forEach((el) => {
    el.addEventListener("click", () => claimTimedTask(el.dataset.claimTask));
  });
  document.querySelectorAll("[data-item-sort]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!["order", "type", "value"].includes(el.dataset.itemSort)) return;
      state.itemSort = el.dataset.itemSort;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-item-filter]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!["all", "gear", "chip", "material", "quest"].includes(el.dataset.itemFilter)) return;
      state.itemFilter = el.dataset.itemFilter;
      state.focusedInventoryItem = null;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-v009-item-focus]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      focusInventoryItem(el.dataset.v009ItemFocus, el.dataset.v009ItemId, el.getBoundingClientRect());
    });
  });
  document.querySelectorAll("[data-v009-gear-quick-equip]").forEach((el) => {
    el.addEventListener("dblclick", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      equipGearToFocusedMember(el.dataset.v009GearQuickEquip);
    });
    el.addEventListener("dragstart", (ev) => {
      activeInventoryGearDragId = el.dataset.v009GearQuickEquip || "";
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("inventory-gear-id", activeInventoryGearDragId);
    });
    el.addEventListener("dragend", () => {
      activeInventoryGearDragId = "";
    });
  });
  document.querySelectorAll("[data-equipped-gear-slot]").forEach((el) => {
    el.addEventListener("dblclick", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      unequipGearToInventory(el.dataset.equippedGearMember || "", el.dataset.equippedGearSlot || "");
    });
    el.addEventListener("dragstart", (ev) => {
      activeEquippedGearDrag = {
        memberId: el.dataset.equippedGearMember || "",
        slotKey: el.dataset.equippedGearSlot || "",
      };
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("equipped-gear-member", activeEquippedGearDrag.memberId);
      ev.dataTransfer.setData("equipped-gear-slot", activeEquippedGearDrag.slotKey);
    });
    el.addEventListener("dragend", () => {
      activeEquippedGearDrag = null;
    });
  });
  document.querySelectorAll("[data-gear-inventory-drop]").forEach((el) => {
    el.addEventListener("dragover", (ev) => {
      const memberId = ev.dataTransfer.getData("equipped-gear-member") || activeEquippedGearDrag?.memberId || "";
      const slotKey = ev.dataTransfer.getData("equipped-gear-slot") || activeEquippedGearDrag?.slotKey || "";
      if (!memberId || !slotKey) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const memberId = ev.dataTransfer.getData("equipped-gear-member") || activeEquippedGearDrag?.memberId || "";
      const slotKey = ev.dataTransfer.getData("equipped-gear-slot") || activeEquippedGearDrag?.slotKey || "";
      activeEquippedGearDrag = null;
      if (!memberId || !slotKey) return;
      unequipGearToInventory(memberId, slotKey);
    });
  });
  document.querySelectorAll("[data-market-mode]").forEach((el) => {
    el.addEventListener("click", () => {
      state.marketMode = el.dataset.marketMode === "sell" ? "sell" : "buy";
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-buy-item]").forEach((el) => {
    el.addEventListener("click", () => buyMarketItem(el.dataset.buyItem));
  });
  document.querySelectorAll("[data-resource-exchange-from]").forEach((el) => {
    el.addEventListener("click", () => performResourceExchange(el.dataset.resourceExchangeFrom, el.dataset.resourceExchangeTo));
  });
  document.querySelectorAll("[data-sell-item]").forEach((el) => {
    el.addEventListener("click", () => sellInventoryItem(el.dataset.sellItem));
  });
  document.querySelectorAll("[data-v009-sell-focused]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      sellFocusedInventoryEntry();
    });
  });
  document.querySelectorAll("[data-v009-dismantle-focused]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      dismantleFocusedGear();
    });
  });
  document.querySelectorAll("[data-craft-chip]").forEach((el) => {
    el.addEventListener("click", () => craftChip(el.dataset.craftChip));
  });
  document.querySelectorAll("[data-craft-gear]").forEach((el) => {
    el.addEventListener("click", () => craftGear(el.dataset.craftGear));
  });
  document.querySelectorAll("[data-track-gear]").forEach((el) => {
    el.addEventListener("click", () => toggleGearTracking(el.dataset.trackGear));
  });
  document.querySelectorAll("[data-toggle-gear-set]").forEach((el) => {
    el.addEventListener("click", () => toggleGearCraftSet(el.dataset.toggleGearSet));
  });
  document.querySelectorAll("[data-equip-gear]").forEach((el) => {
    el.addEventListener("click", () => equipGearToFocusedMember(el.dataset.equipGear));
  });
  document.querySelectorAll("[data-gear-slot]").forEach((el) => {
    el.addEventListener("dragover", (ev) => {
      const gearId = ev.dataTransfer.getData("inventory-gear-id") || activeInventoryGearDragId;
      if (!gearId) return;
      const gear = normalizeGearInventory(state.gear).find((item) => item.id === gearId);
      if (!gear || gear.slot !== el.dataset.gearSlot) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const gearId = ev.dataTransfer.getData("inventory-gear-id") || activeInventoryGearDragId;
      activeInventoryGearDragId = "";
      if (!gearId) return;
      equipGearToMemberSlot(el.dataset.gearMember, el.dataset.gearSlot, gearId);
    });
  });
  document.querySelectorAll("[data-upgrade]").forEach((el) => {
    el.addEventListener("click", () => upgradeMember(el.dataset.upgrade, el.dataset.upgradeLevels || "1"));
  });
  document.querySelectorAll("[data-reset-save]").forEach((el) => {
    el.addEventListener("click", resetSavedGame);
  });
  document.querySelectorAll("[data-speed-toggle]").forEach((el) => {
    el.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      state.battleSpeed = state.battleSpeed === 2 ? 1 : 2;
      saveGame();
      render();
    });
  });
  document.querySelectorAll("[data-toggle-front]").forEach((el) => {
    el.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      toggleBattleFront(el.dataset.toggleFront);
    });
  });
  document.querySelectorAll("[data-v009-skill-open]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (ev.target.closest("[data-v009-skill-slot]")) return;
      state.v009SkillDrawerOpen = true;
      render();
    });
    el.addEventListener("dragover", (ev) => {
      const sourceSlot = ev.dataTransfer.getData("v009-skill-source-slot");
      const memberId = ev.dataTransfer.getData("v009-skill-member");
      if (sourceSlot === "" || !memberId || ev.target.closest("[data-v009-skill-slot]")) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      if (ev.target.closest("[data-v009-skill-slot]")) return;
      const sourceSlot = ev.dataTransfer.getData("v009-skill-source-slot");
      const memberId = ev.dataTransfer.getData("v009-skill-member");
      const skillType = ev.dataTransfer.getData("v009-skill-type");
      if (sourceSlot === "" || !memberId || !skillType) return;
      ev.preventDefault();
      ev.stopPropagation();
      removeEquippedTypedSkillAtSlot(memberId, skillType, sourceSlot);
    });
  });
  document.querySelectorAll("[data-v009-skill-close]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      state.v009SkillDrawerOpen = false;
      render();
    });
  });
  document.querySelectorAll("[data-v009-skill-choice]").forEach((el) => {
    el.addEventListener("click", () => equipSkillAtTypedSlot(
      el.dataset.v009SkillMember,
      el.dataset.v009SkillChoice,
      el.dataset.v009SkillChoiceType,
      ""
    ));
    el.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("v009-skill-member", el.dataset.v009SkillMember);
      ev.dataTransfer.setData("v009-skill-id", el.dataset.v009SkillChoice);
      ev.dataTransfer.setData("v009-skill-type", el.dataset.v009SkillChoiceType);
      ev.dataTransfer.setData("v009-skill-source-slot", "");
    });
  });
  document.querySelectorAll("[data-v009-skill-slot]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      state.v009SkillDrawerOpen = true;
      render();
    });
    el.addEventListener("dragstart", (ev) => {
      if (!el.dataset.v009SkillId) return;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("v009-skill-member", el.dataset.v009SkillMember);
      ev.dataTransfer.setData("v009-skill-id", el.dataset.v009SkillId);
      ev.dataTransfer.setData("v009-skill-type", el.dataset.v009SkillSlotType);
      ev.dataTransfer.setData("v009-skill-source-slot", el.dataset.v009SkillSlot);
    });
    el.addEventListener("dblclick", (ev) => {
      if (!el.dataset.v009SkillId) return;
      ev.preventDefault();
      ev.stopPropagation();
      removeEquippedTypedSkillAtSlot(el.dataset.v009SkillMember, el.dataset.v009SkillSlotType, el.dataset.v009SkillSlot);
    });
    el.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const memberId = ev.dataTransfer.getData("v009-skill-member") || ev.dataTransfer.getData("skill-member");
      const skillId = ev.dataTransfer.getData("v009-skill-id") || ev.dataTransfer.getData("skill-id");
      const skillType = ev.dataTransfer.getData("v009-skill-type") || el.dataset.v009SkillSlotType;
      const sourceSlot = ev.dataTransfer.getData("v009-skill-source-slot");
      if (!skillId || memberId !== el.dataset.v009SkillMember || skillType !== el.dataset.v009SkillSlotType) return;
      if (sourceSlot !== "") reorderEquippedTypedSkill(memberId, skillType, sourceSlot, el.dataset.v009SkillSlot);
      else equipSkillAtTypedSlot(memberId, skillId, skillType, el.dataset.v009SkillSlot);
    });
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      removeEquippedTypedSkillAtSlot(el.dataset.v009SkillMember, el.dataset.v009SkillSlotType, el.dataset.v009SkillSlot);
    });
  });
  document.querySelectorAll("[data-stage]").forEach((el) => {
    if (el.dataset.stage) el.addEventListener("click", () => {
      if (state.battle && !state.battle.over) return;
      const level = Number(el.dataset.stage);
      startBattle(level, false, stageBattleKind(level));
    });
  });
  document.querySelectorAll("[data-auto-repeat-stage]").forEach((el) => {
    if (el.dataset.autoRepeatStage) el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.battle && !state.battle.over) return;
      const level = Number(el.dataset.autoRepeatStage);
      requestAutoRepeatStart(level, stageBattleKind(level), el);
    });
  });
  document.querySelectorAll("[data-auto-repeat-boss]").forEach((el) => {
    if (el.dataset.autoRepeatBoss) el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.battle && !state.battle.over) return;
      const level = Number(el.dataset.autoRepeatBoss);
      if (!canChallengeBoss(level)) return;
      state.overlayView = null;
      requestAutoRepeatStart(level, "boss", el);
    });
  });
  document.querySelectorAll("[data-boss-stage]").forEach((el) => {
    if (el.dataset.bossStage) el.addEventListener("click", () => {
      const level = Number(el.dataset.bossStage);
      if (!canChallengeBoss(level)) return;
      state.overlayView = null;
      if (state.battle && !state.battle.over) return;
      startBattle(level, false, "boss");
    });
  });
  document.querySelector("[data-auto-repeat-stop]")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    cancelAutoRepeat();
    render();
  });
  document.querySelectorAll("[data-retreat]").forEach((el) => {
    el.addEventListener("click", () => {
      if (state.battleTimer) clearInterval(state.battleTimer);
      if (state.autoRepeatTimer) clearTimeout(state.autoRepeatTimer);
      state.battleTimer = null;
      state.autoRepeatTimer = null;
      state.battle = null;
      state.autoRepeat = false;
      state.autoRepeatStats = null;
      state.view = "town";
      saveGame();
      render();
    });
  });
}

function buyMarketItem(id) {
  const entry = marketBuyEntries().find((item) => item.id === id);
  if (!entry || state.money < entry.buyPrice) return;
  const stockItem = state.marketStock.find((item) => item.id === id);
  if (!stockItem || stockItem.stock <= 0) return;
  state.money -= entry.buyPrice;
  stockItem.stock -= 1;
  addInventoryItems([{ id, count: 1 }]);
  saveGame();
  render();
}

function updateMarketExchange(field, value) {
  state.marketExchange = normalizeMarketExchange(state.marketExchange);
  if (field === "amount") {
    state.marketExchange.amount = safeNumber(value, 1, 1);
  } else if (RESOURCE_EXCHANGE_VALUES[value]) {
    state.marketExchange[field] = value;
  }
  state.marketExchange = normalizeMarketExchange(state.marketExchange);
  saveGame();
  render();
}

function performResourceExchange(fromArg, toArg) {
  const from = RESOURCE_EXCHANGE_VALUES[fromArg] ? fromArg : state.marketExchange.from;
  const to = RESOURCE_EXCHANGE_VALUES[toArg] ? toArg : state.marketExchange.to;
  const amount = defaultResourceExchangeAmount(from);
  const output = calculateResourceExchange(from, to, amount);
  if (from === to || output <= 0 || resourceAmount(from) < amount) return;
  spendResource(from, amount);
  addResource(to, output);
  state.marketExchange = { from, to, amount };
  saveGame();
  render();
}

function sellInventoryItem(id) {
  state.inventory = normalizeInventory(state.inventory);
  if (!ITEM_DATA[id] || !state.inventory[id]) return;
  state.inventory[id] -= 1;
  state.money += itemValue(id);
  if (state.inventory[id] <= 0) delete state.inventory[id];
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  saveGame();
  render();
}

function focusedInventoryEntryForAction() {
  return v009FocusedInventoryEntry(v009SideInventoryEntries());
}

function focusedEntrySellValue(entry) {
  if (!entry) return 0;
  if (entry.category === "gear" && entry.gear) return gearSellValue(entry.gear);
  if (entry.category === "chip" && entry.chip) return chipSellValue(entry.chip);
  if (entry.category === "quest") return 0;
  return ITEM_DATA[entry.id] ? itemValue(entry.id) : 0;
}

function sellFocusedInventoryEntry() {
  const entry = focusedInventoryEntryForAction();
  const value = focusedEntrySellValue(entry);
  if (!entry || value <= 0) return;
  if (entry.category === "gear") {
    const removed = removeGearById(entry.id);
    if (!removed) return;
  } else if (entry.category === "chip") {
    state.chips = normalizeChipInventory(state.chips);
    const index = state.chips.findIndex((chip) => chip.id === entry.id);
    if (index < 0) return;
    state.chips.splice(index, 1);
  } else {
    state.inventory = normalizeInventory(state.inventory);
    if (!ITEM_DATA[entry.id] || !state.inventory[entry.id]) return;
    state.inventory[entry.id] -= 1;
    if (state.inventory[entry.id] <= 0) delete state.inventory[entry.id];
    state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  }
  state.money += value;
  addFeed(`販售 ${entry.name}，獲得荒幣 ${value}。`, "gold");
  clearFocusedInventoryItem(entry.id);
  saveGame();
  render();
}

function findGearLocationById(gearId) {
  if (!gearId) return null;
  state.gear = normalizeGearInventory(state.gear);
  const inventoryIndex = state.gear.findIndex((gear) => gear.id === gearId);
  if (inventoryIndex >= 0) return { type: "inventory", gear: state.gear[inventoryIndex], index: inventoryIndex };
  for (const member of state.recruits || []) {
    member.equipment = normalizeEquipment(member.equipment);
    for (const slot of EQUIPMENT_SLOTS) {
      const gear = member.equipment[slot.key];
      if (gear?.id === gearId) return { type: "equipped", gear, member, slotKey: slot.key };
    }
  }
  return null;
}

function removeGearById(gearId) {
  const location = findGearLocationById(gearId);
  if (!location) return null;
  if (location.type === "inventory") {
    state.gear.splice(location.index, 1);
  } else if (location.type === "equipped") {
    location.member.equipment[location.slotKey] = null;
    state.selectedMemberId = location.member.id;
  }
  return location.gear;
}

function randomRecoveredHalfCount(count) {
  const total = Math.max(0, Math.floor(safeNumber(count, 0, 0)));
  let recovered = 0;
  for (let index = 0; index < total; index += 1) {
    if (Math.random() < 0.5) recovered += 1;
  }
  return recovered;
}

function recoverCraftCost(cost, count) {
  if (!cost || count <= 0) return "";
  if (cost.resource === "money") return "";
  if (cost.resource) {
    addResource(cost.resource, count);
    return `${RESOURCE_DATA[cost.resource]?.name || cost.resource} x${count}`;
  }
  state.inventory = normalizeInventory(state.inventory);
  addInventoryItems([{ id: cost.id, count }]);
  return `${itemName(cost.id)} x${count}`;
}

function dismantleFocusedGear() {
  const entry = focusedInventoryEntryForAction();
  if (!entry || entry.category !== "gear" || !entry.gear) return;
  const gear = removeGearById(entry.id);
  if (!gear) return;
  const recipe = gearRecipeFor(gear);
  const recovered = [];
  if (recipe) {
    recipe.costs.forEach((cost) => {
      const count = randomRecoveredHalfCount(cost.count);
      const text = recoverCraftCost(cost, count);
      if (text) recovered.push(text);
    });
  }
  state.inventoryOrder = normalizeInventoryOrder(state.inventoryOrder, state.inventory);
  addFeed(`拆解 ${gearDisplayName(gear)}${recovered.length ? `，回收 ${recovered.join("、")}。` : "，未回收到素材。"}`, "gold");
  clearFocusedInventoryItem(entry.id);
  saveGame();
  render();
}

function movePartyMember(memberId, targetSlot, sourceSlotRaw = "") {
  if (!memberId || !getMember(memberId)) return;
  const sourceSlot = sourceSlotRaw === "" ? state.party.indexOf(memberId) : Number(sourceSlotRaw);
  const targetMemberId = state.party[targetSlot] || null;
  if (sourceSlot >= 0 && sourceSlot < state.party.length) {
    state.party[targetSlot] = memberId;
    state.party[sourceSlot] = targetSlot === sourceSlot ? memberId : targetMemberId;
    saveGame();
    return;
  }
  const existing = state.party.indexOf(memberId);
  if (existing >= 0) state.party[existing] = null;
  state.party[targetSlot] = memberId;
  saveGame();
}

function addMemberToFirstOpenPartySlot(memberId) {
  if (!memberId || !getMember(memberId) || state.party.includes(memberId)) return;
  const openSlot = state.party.findIndex((id) => !id);
  if (openSlot < 0) return;
  state.party[openSlot] = memberId;
  saveGame();
}

function isUnlockedActiveSkill(member, skillId) {
  if (!member || !skillId) return false;
  return knownSkills(member, "active").some((skillData) => skillData.id === skillId);
}

function cleanEquippedActiveList(member) {
  const knownActive = knownSkills(member, "active");
  const knownActiveIds = new Set(knownActive.map((skillData) => skillData.id));
  const timingById = Object.fromEntries(knownActive.map((skillData) => [skillData.id, normalizeSkillTiming(skillData.timing)]));
  const raw = Array.isArray(member.equippedActive)
    ? member.equippedActive.map((id) => upgradedSkillIdForMember(member, id))
    : [];
  const turnIds = Array(5).fill("");
  const triggerIds = Array(3).fill("");
  const seen = new Set();
  const fixedSlots = raw.some((id) => id === "") || raw.length > 5;
  const placeSkill = (id, preferredIndex = -1) => {
    if (!knownActiveIds.has(id) || seen.has(id)) return;
    const timing = timingById[id] || "turn";
    if (timing === "trigger") {
      const slot = preferredIndex >= 0 && preferredIndex < triggerIds.length && !triggerIds[preferredIndex]
        ? preferredIndex
        : triggerIds.findIndex((value) => !value);
      if (slot >= 0) {
        triggerIds[slot] = id;
        seen.add(id);
      }
    } else {
      const slot = preferredIndex >= 0 && preferredIndex < turnIds.length && !turnIds[preferredIndex]
        ? preferredIndex
        : turnIds.findIndex((value) => !value);
      if (slot >= 0) {
        turnIds[slot] = id;
        seen.add(id);
      }
    }
  };
  if (fixedSlots) {
    raw.slice(0, 5).forEach((id, index) => placeSkill(id, index));
    raw.slice(5, 8).forEach((id, index) => placeSkill(id, index));
    raw.slice(8).forEach((id) => placeSkill(id));
  } else {
    raw.forEach((id) => placeSkill(id));
  }
  member.equippedActive = [...turnIds, ...triggerIds];
}

function equippedSkillIdsByTiming(member, timing) {
  if (!member) return [];
  cleanEquippedActiveList(member);
  const normalized = normalizeSkillTiming(timing);
  return normalized === "trigger" ? member.equippedActive.slice(5, 8) : member.equippedActive.slice(0, 5);
}

function setEquippedSkillsByTiming(member, timing, ids) {
  if (!member) return;
  cleanEquippedActiveList(member);
  const normalized = normalizeSkillTiming(timing);
  const limit = normalized === "trigger" ? 3 : 5;
  const nextTyped = Array(limit).fill("");
  const seen = new Set();
  for (let index = 0; index < limit; index += 1) {
    const id = (ids || [])[index] || "";
    const skillData = findSkill(id);
    if (!skillData || normalizeSkillTiming(skillData.timing) !== normalized) continue;
    if (!seen.has(id)) {
      nextTyped[index] = id;
      seen.add(id);
    }
  }
  const other = equippedSkillIdsByTiming(member, normalized === "trigger" ? "turn" : "trigger");
  member.equippedActive = normalized === "turn" ? [...nextTyped, ...other] : [...other, ...nextTyped];
}

function battleSkillOrder(member) {
  cleanEquippedActiveList(member);
  return [...member.equippedActive];
}

function equipSkillAtSlot(memberId, skillId, targetSlotRaw = "") {
  const member = getMember(memberId);
  const skillData = findSkill(skillId);
  if (!isUnlockedActiveSkill(member, skillId) || !skillData) return;
  const timing = normalizeSkillTiming(skillData.timing);
  const targetSlot = targetSlotRaw === "" ? -1 : Number(targetSlotRaw);
  const typedSlot = timing === "trigger" && targetSlotRaw !== "" ? Math.max(0, targetSlot - 5) : targetSlot;
  equipSkillAtTypedSlot(memberId, skillId, timing, typedSlot);
}

function equipSkillAtTypedSlot(memberId, skillId, timing, targetSlotRaw = "") {
  const member = getMember(memberId);
  const skillData = findSkill(skillId);
  const normalized = normalizeSkillTiming(timing);
  if (!member || !skillData || normalizeSkillTiming(skillData.timing) !== normalized || !isUnlockedActiveSkill(member, skillId)) return;
  const targetSlot = targetSlotRaw === "" ? -1 : Number(targetSlotRaw);
  const limit = normalized === "trigger" ? 3 : 5;
  const typed = equippedSkillIdsByTiming(member, normalized).map((id) => id === skillId ? "" : id);
  if (targetSlot >= 0 && targetSlot < limit) {
    typed[targetSlot] = skillId;
  } else {
    const openSlot = typed.findIndex((id) => !id);
    typed[openSlot >= 0 ? openSlot : limit - 1] = skillId;
  }
  setEquippedSkillsByTiming(member, normalized, typed);
  saveGame();
  render();
}

function reorderEquippedActive(memberId, sourceSlotRaw, targetSlotRaw) {
  const member = getMember(memberId);
  if (!member) return;
  cleanEquippedActiveList(member);
  const sourceSlot = Number(sourceSlotRaw);
  const targetSlot = Number(targetSlotRaw);
  if (!Number.isInteger(sourceSlot) || !Number.isInteger(targetSlot)) return;
  if (sourceSlot < 0 || sourceSlot >= member.equippedActive.length) return;
  if (targetSlot < 0 || targetSlot >= ACTIVE_SKILL_SLOT_COUNT) return;
  const [skillId] = member.equippedActive.splice(sourceSlot, 1);
  member.equippedActive.splice(targetSlot, 0, skillId);
  member.equippedActive = member.equippedActive.slice(0, ACTIVE_SKILL_SLOT_COUNT);
  saveGame();
  render();
}

function reorderEquippedTypedSkill(memberId, timing, sourceSlotRaw, targetSlotRaw) {
  const member = getMember(memberId);
  if (!member) return;
  const normalized = normalizeSkillTiming(timing);
  const sourceSlot = Number(sourceSlotRaw);
  const targetSlot = Number(targetSlotRaw);
  const limit = normalized === "trigger" ? 3 : 5;
  if (!Number.isInteger(sourceSlot) || !Number.isInteger(targetSlot)) return;
  if (sourceSlot < 0 || sourceSlot >= limit || targetSlot < 0 || targetSlot >= limit) return;
  const typed = equippedSkillIdsByTiming(member, normalized);
  if (!typed[sourceSlot]) return;
  const sourceSkillId = typed[sourceSlot];
  typed[sourceSlot] = typed[targetSlot] || "";
  typed[targetSlot] = sourceSkillId;
  setEquippedSkillsByTiming(member, normalized, typed);
  saveGame();
  render();
}

function removeEquippedActiveAtSlot(memberId, slotRaw) {
  const member = getMember(memberId);
  if (!member) return;
  cleanEquippedActiveList(member);
  const slot = Number(slotRaw);
  if (!Number.isInteger(slot) || slot < 0 || slot >= ACTIVE_SKILL_SLOT_COUNT) return;
  if (!member.equippedActive[slot]) return;
  member.equippedActive.splice(slot, 1);
  saveGame();
  render();
}

function removeEquippedTypedSkillAtSlot(memberId, timing, slotRaw) {
  const member = getMember(memberId);
  if (!member) return;
  const normalized = normalizeSkillTiming(timing);
  const slot = Number(slotRaw);
  const limit = normalized === "trigger" ? 3 : 5;
  if (!Number.isInteger(slot) || slot < 0 || slot >= limit) return;
  const typed = equippedSkillIdsByTiming(member, normalized);
  if (!typed[slot]) return;
  typed[slot] = "";
  setEquippedSkillsByTiming(member, normalized, typed);
  saveGame();
  render();
}

function moveEquipmentChip(sourceMemberId, sourceKey, targetMemberId, targetKey) {
  const source = getMember(sourceMemberId);
  const target = getMember(targetMemberId);
  const validKeys = new Set(EQUIPMENT_CHIP_SLOTS.map((slot) => slot.key));
  if (!source || !target || !validKeys.has(sourceKey) || !validKeys.has(targetKey)) return;
  if (source.id === target.id && sourceKey === targetKey) return;
  source.meridians = normalizeMeridians(source.meridians || source.equipment);
  target.meridians = normalizeMeridians(target.meridians || target.equipment);
  const sourceChip = source.meridians[sourceKey] || null;
  const targetChip = target.meridians[targetKey] || null;
  source.meridians[sourceKey] = targetChip;
  target.meridians[targetKey] = sourceChip;
  saveGame();
  render();
}

function equipCraftedChip(targetMemberId, targetKey, chipId) {
  const target = getMember(targetMemberId);
  const validKeys = new Set(EQUIPMENT_CHIP_SLOTS.map((slot) => slot.key));
  if (!target || !validKeys.has(targetKey) || !chipId) return;
  state.chips = normalizeChipInventory(state.chips);
  const chip = state.chips.find((item) => item.id === chipId);
  if (!chip || equippedChipIds().has(chip.id)) return;
  target.meridians = normalizeMeridians(target.meridians || target.equipment);
  target.meridians[targetKey] = chip;
  state.chipDrawer = null;
  saveGame();
  render();
}

function equipGearToFocusedMember(gearId) {
  const member = state.selectedMemberId ? getMember(state.selectedMemberId) : playerCombatMember();
  if (!member || !gearId) return;
  equipGearToMemberSlot(member.id, "", gearId);
}

function equipGearToMemberSlot(memberId, slotKey, gearId) {
  const member = getMember(memberId);
  if (!member || !gearId) return;
  state.gear = normalizeGearInventory(state.gear);
  const index = state.gear.findIndex((item) => item.id === gearId);
  if (index < 0) return;
  const gear = state.gear[index];
  if (slotKey && gear.slot !== slotKey) return;
  member.equipment = normalizeEquipment(member.equipment);
  const current = member.equipment[gear.slot];
  member.equipment[gear.slot] = gear;
  state.gear.splice(index, 1);
  if (current) state.gear.push(current);
  state.selectedMemberId = member.id;
  clearFocusedInventoryItem(gearId);
  saveGame();
  render();
}

function unequipGearToInventory(memberId, slotKey) {
  const member = getMember(memberId);
  const validSlots = new Set(EQUIPMENT_SLOTS.map((slot) => slot.key));
  if (!member || !validSlots.has(slotKey)) return;
  member.equipment = normalizeEquipment(member.equipment);
  const gear = member.equipment[slotKey];
  if (!gear) return;
  state.gear = normalizeGearInventory(state.gear);
  state.gear.push(gear);
  member.equipment[slotKey] = null;
  state.selectedMemberId = member.id;
  saveGame();
  render();
}

function clearFormation(index) {
  const formation = normalizeFormationIndex(index);
  if (formation !== 0) return;
  state.party = [null, null, null, null];
  saveGame();
  render();
}

function unequipFormationChips(index) {
  const members = tacticsFormationMembers(normalizeFormationIndex(index)).filter(Boolean);
  members.forEach((member) => {
    member.meridians = normalizeMeridians();
  });
  saveGame();
  render();
}

function autoEquipFormationChips(index) {
  const members = tacticsFormationMembers(normalizeFormationIndex(index)).filter(Boolean);
  if (!members.length) return;
  const chips = prioritizedEquipmentChipPool(members.length * EQUIPMENT_CHIP_SLOTS.length);
  members.forEach((member) => {
    member.meridians = normalizeMeridians();
    EQUIPMENT_CHIP_SLOTS.forEach((slot) => {
      member.meridians[slot.key] = chips.shift() || null;
    });
  });
  saveGame();
  render();
}

function prioritizedEquipmentChipPool(requiredCount) {
  const equipped = state.recruits.flatMap((member) => {
    const meridians = normalizeMeridians(member.meridians || member.equipment);
    return EQUIPMENT_CHIP_SLOTS.map((slot) => meridians[slot.key]).filter(Boolean);
  });
  const equippedIds = new Set(equipped.filter((chip) => typeof chip === "object" && chip.id).map((chip) => chip.id));
  const crafted = normalizeChipInventory(state.chips).filter((chip) => !equippedIds.has(chip.id));
  const pool = [...crafted, ...equipped];
  while (pool.length < requiredCount) pool.push(...shuffled(TEST_EQUIPMENT_CHIPS));
  const groups = pool.reduce((map, chip) => {
    const setName = equipmentChipSetName(chip);
    if (!map.has(setName)) map.set(setName, []);
    map.get(setName).push(chip);
    return map;
  }, new Map());
  return Array.from(groups.values())
    .sort((a, b) => b.length - a.length)
    .flatMap((group) => shuffled(group))
    .slice(0, requiredCount);
}

function equipmentChipSetName(chip) {
  if (chip && typeof chip === "object") return chip.setId || "散件";
  return String(chip || "").split("?")[0] || "散件";
}

function equipSkill(memberId, skillId) {
  const member = getMember(memberId);
  const skillData = findSkill(skillId);
  if (!member || !skillData || member.level < skillData.level) return;
  if (skillData.type === "passive") {
    member.equippedPassive = skillId;
    saveGame();
    render();
    return;
  }
  if (member.equippedActive.includes(skillId)) return;
  equipSkillAtSlot(memberId, skillId);
}

function unequipSkill(memberId, skillId) {
  const member = getMember(memberId);
  const skillData = findSkill(skillId);
  if (!member || !skillData) return;
  if (skillData.type === "passive") member.equippedPassive = null;
  else member.equippedActive = member.equippedActive.filter((id) => id !== skillId);
  saveGame();
  render();
}

function recruitCandidate(index) {
  const candidate = state.candidates[index];
  if (!candidate || state.money < candidate.recruitCost) return;
  state.money -= candidate.recruitCost;
  candidate.locked = false;
  state.recruits.push(candidate);
  state.selectedMemberId = candidate.id;
  state.candidates[index] = null;
  state.detailCandidateIndex = null;
  render();
}

function toggleCandidateLock(index) {
  const candidate = state.candidates[index];
  if (!candidate) return;
  if (candidate.locked) {
    candidate.locked = false;
    render();
    return;
  }
  if (state.money < RECRUIT_LOCK_COST) return;
  if (!confirm(`是否花 ${RECRUIT_LOCK_COST} 荒幣留住這個人才？`)) return;
  state.money -= RECRUIT_LOCK_COST;
  candidate.locked = true;
  render();
}

function acceptCommission(id) {
  ensureDefaultCommissions();
  const commission = state.commissions[id];
  if (!commission || commission.accepted || commission.completed) return;
  commission.accepted = true;
  commission.progress = 0;
  render();
}

function claimCommission(id) {
  ensureDefaultCommissions();
  const commission = state.commissions[id];
  const data = COMMISSION_DATA[id];
  if (!commission?.completed || commission.claimed || !data) return;
  const expResult = grantCommissionExperience(data);
  state.money += data.reward.money;
  state.material += data.reward.material;
  state.energy += data.reward.energy || 0;
  commission.claimed = true;
  if (expResult) addFeed(`委託「${data.name}」回報，獲得經驗 ${expResult.gained}。`, "good");
  saveGame();
  render();
}

function updateTimedTasks() {
  const now = Date.now();
  ["gather", "expedition"].forEach((key) => {
    const task = state[key];
    if (task?.active && task.endsAt && now >= task.endsAt) {
      task.active = false;
      task.completed = true;
    }
  });
}

function scheduleTimedTaskRefresh() {
  if (state.uiRefreshTimer) {
    clearTimeout(state.uiRefreshTimer);
    state.uiRefreshTimer = null;
  }
  const needsRefresh = ["gather", "expedition"].some((key) => {
    const task = state[key];
    return task?.active && !task.completed;
  });
  if (needsRefresh && ["town", "gather", "expedition"].includes(state.view)) {
    state.uiRefreshTimer = setTimeout(render, 1000);
  }
}

function startTimedTask(key) {
  const task = state[key];
  if (!task?.unlocked || task.active || task.completed) return;
  if (key === "gather") return startGatherTask();
  task.active = true;
  task.completed = false;
  task.endsAt = Date.now() + (key === "gather" ? 120000 : 300000);
  task.workerName = key === "gather" ? partyMembers()[0]?.name || "成員" : "";
  saveGame();
  render();
}

function startGatherTask() {
  const task = state.gather;
  if (!task?.unlocked || task.active || task.completed) return;
  const member = selectedGatherMember();
  if (!member) return;
  const durationMinutes = GATHER_DURATIONS.includes(Number(task.durationMinutes)) ? Number(task.durationMinutes) : 10;
  const location = gatherLocation(task.locationId);
  if (state.maxClearedLevel < location.unlockLevel) return;
  task.active = true;
  task.completed = false;
  task.workerId = member.id;
  task.workerName = member.name;
  task.durationMinutes = durationMinutes;
  task.locationId = location.id;
  task.endsAt = Date.now() + durationMinutes * 60000;
  task.reward = calculateGatherReward(member, durationMinutes, location.id);
  saveGame();
  render();
}

function claimTimedTask(key) {
  const task = state[key];
  if (!task?.completed) return;
  if (key === "gather") {
    const reward = task.reward || { energy: 0, items: [] };
    state.energy += reward.energy || 0;
    addInventoryItems(reward.items || []);
  } else if (key === "expedition") {
    state.money += 80;
    state.material += 20;
  }
  task.active = false;
  task.completed = false;
  task.endsAt = 0;
  task.workerName = "";
  task.workerId = "";
  task.reward = null;
  saveGame();
  render();
}

function formatRemaining(endsAt) {
  const ms = Math.max(0, Number(endsAt || 0) - Date.now());
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function upgradeMember(memberId, levelsRaw = "1") {
  const member = getMember(memberId);
  if (!member || member.level >= MAX_LEVEL) return;
  const requestedLevels = levelsRaw === "max"
    ? maxAffordableUpgradeLevels(member)
    : Math.min(safeNumber(levelsRaw, 1, 1), MAX_LEVEL - member.level);
  if (requestedLevels <= 0) return;
  const levels = Math.min(requestedLevels, maxAffordableUpgradeLevels(member));
  if (levels <= 0) return;
  const startLevel = member.level;
  for (let i = 0; i < levels; i += 1) {
    const cost = upgradeCost(member);
    if (state.money < cost.money || state.material < cost.material || member.level >= MAX_LEVEL) break;
    state.money -= cost.money;
    state.material -= cost.material;
    member.level += 1;
    growStats(member);
    autoEquipIfEmpty(member);
  }
  state.lastUpgradeId = member.id;
  const unlockedSkills = newlyUnlockedSkills(member, startLevel, member.level);
  autoEquipUnlockedSkills(member, unlockedSkills);
  queueSkillOrderTutorial(member, startLevel, member.level, unlockedSkills);
  recordUnlockedSkills(member, unlockedSkills);
  saveGame();
  render();
  showSkillUnlockModal(member, unlockedSkills);
}

function growStats(member) {
  member.stats = fixedStatsForClassLevel(member.classId, member.level);
}

function v009LevelGrowthPoints(level) {
  const current = safeNumber(level, 1, 1);
  if (current >= 41) return 6;
  if (current >= 21) return 5;
  return 4;
}

function autoEquipIfEmpty(member) {
  if (member.equippedActive.length === 0) autoEquip(member);
  const passive = knownSkills(member, "passive")[0];
  if (passive && !member.equippedPassive) member.equippedPassive = passive.id;
}

init();


