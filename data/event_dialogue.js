window.LIYUAN_EVENT_DIALOGUE = {
  speakers: {
  yu_xiaosui: { name: "俞小穗", avatar: "穗", role: "森羅學會接引員", image: "./assets/v009_runtime_preview/dialogue/yu_xiaosui_dialogue_cute_128_preview_v004_clean.png" },
  yao_hengzhou: { name: "姚衡舟", avatar: "姚", role: "華山軍工劍宗鍛造宗師", image: "./assets/v009_runtime_preview/dialogue/yao_hengzhou_dialogue_cute_128_preview_v004_clean.png" },
},
  postCreatorClassLines: {
  xinhuo: "薪火幫……嗯，這裡勾選後勤支援，應該就可以了。",
  chanlin: "禪林寺……這邊有一欄備註說，如果不使用義體設備，要另外登記替代流程。",
  leishi: "雷氏火器……啊，這裡跳出火器管制提醒。我、我等一下照流程傳給你。",
  tianshu: "天樞派……身份驗證通過了。系統顯示可以放行。",
  emei: "峨眉派……這邊顯示已經完成高端義體登錄，可以直接通行。",
  furnace: "華山軍工……這裡備註說，工坊那邊有人可以接應你。",
  wangchuan: "忘川渡……啊，這一欄我沒有權限查看。總、總之登記已經完成了。",
  tang: "唐家生化……隔離容器和樣本封存權限……我看看，嗯，系統說已經開通了。",
},
  sequences: {
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
},
};
