window.LIYUAN_PROGRESSION_DATA = {
  commissions: {
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
},
  regions: [
  { id: "blackwater", name: "黑水砂原", status: "現在位置", open: true, tone: "gold" },
  { id: "hanging-sky-rainforest", name: "垂天雨林", status: "未開放", open: false, tone: "jade" },
  { id: "bone-wild-road", name: "裂骨荒路", status: "未開放", open: false, tone: "muted" },
  { id: "broken-tide-rockshore", name: "碎潮岩岸", status: "未開放", open: false, tone: "cyan" },
  { id: "red-rock-lava-valley", name: "赤岩熔谷", status: "未開放", open: false, tone: "hot" },
  { id: "mirror-lake-swamp", name: "鏡湖沼澤", status: "未開放", open: false, tone: "cyan" },
  { id: "frost-mist-plateau", name: "霜霧高原", status: "未開放", open: false, tone: "muted" },
  { id: "thunder-magnetic-wasteland", name: "雷磁荒原", status: "未開放", open: false, tone: "gold" },
],
  fortuneReadings: [
  { id: "clear", title: "小吉", text: "今日宜整備。先補缺口，再談遠征。" },
  { id: "sharp", title: "中吉", text: "利在前鋒。先手能成事，貪快會露破綻。" },
  { id: "still", title: "平", text: "風不動，旗也不動。動的是你的資源表。" },
  { id: "hidden", title: "末吉", text: "有財藏於暗格。別問哪格，先刮完。" },
  { id: "dust", title: "小凶", text: "路上有砂。少帶一句嘴，多帶一份資材。" },
  { id: "return", title: "吉", text: "回頭路未必壞。只是別在戰場上回頭。" },
  { id: "spark", title: "大吉", text: "火候正好。適合升級，也適合收手。" },
  { id: "quiet", title: "平吉", text: "無事是福。布告亭今日沒有新的壞消息。" },
],
  fortuneResourceRewards: [
  { resource: "money", min: 40, max: 90 },
  { resource: "material", min: 10, max: 24 },
  { resource: "energy", min: 8, max: 18 },
],
};
