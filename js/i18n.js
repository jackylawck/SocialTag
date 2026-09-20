/**
 * 🌐 js/i18n.js - 雙語字典與切換器
 */
const I18n = {
  lang: localStorage.getItem('social_tag_lang') || 'zh',

  dict: {
    zh: {
      app_title: "🏷️ Social Tag 到處留名",
      entry_subtitle: "請選擇你的身份以進入房間",
      room_label: "房間號碼",
      room_placeholder: "例如: 839201",
      room_placeholder_auto: "留空將自動生成 6 位數字房號",
      btn_random_room: "🎲 隨機新房",
      name_label: "學員名字",
      name_placeholder: "你的名字或暱稱",
      btn_enter: "進入",
      or_divider: "或者",
      btn_host: "🖥️ 我是主持人（開房／投影）",
      role_host: "HOST (筆電大螢幕)",
      role_client_prefix: "學員: ",
      status_label: "當前階段：",
      stickers_left: "手上剩餘：",
      stickers_unit: " 張",
      time_left: "倒數時間：",
      btn_start: "開始活動 (5分鐘)",
      btn_reclaim: "提早進入物歸原主",
      btn_reset: "🔄 重設房間（重新開局）",
      btn_leave: "🚪 離開",
      confirm_leave_host: "確定要離開房間並返回首頁？\n\n⚠️ 提醒：主持人離開將會中斷房間連線！",
      confirm_leave_client: "確定要離開房間並返回首頁？\n\n⚠️ 提醒：離開後你的進度將會清除並斷開連線！",
      qr_title: "📷 手機掃描 QR Code 即刻入場",
      qr_desc: "掃完直接打名即刻玩，無須輸入網址",
      host_invite_code: "房間代碼：",
      list_friends: "在場朋友 (點擊貼標籤)",
      list_received: "我身上收到的標籤 (物歸原主用)",
      empty_stickers: "身上暫時未有標籤",
      btn_tag: "貼標籤 ➔",
      btn_tagged: "已結識",
      btn_return: "當面還佢",
      btn_returned: "已物歸原主",
      received_from: "收到來自 {name} 的名牌",
      lb_popular: "🏆 人氣磁鐵獎（標籤最多）",
      lb_fastest: "⚡ 閃電外交官（最快送完）",
      lb_empty: "從缺",
      lb_count: "（累積 {n} 張）",
      reclaim_progress: "物歸原主進度",
      game_ended_title: "中場結算",
      game_reclaim_title: "物歸原主中",
      missed_start: "已錯過開場",
      missed_desc: "活動已經開始，請直接於大螢幕觀戰！",
      room_full_title: "房間已滿",
      room_full_desc: "本房間人數已達上限（{max} 人），請聯絡培訓主持人或加入其他組別！",
      toast_timeout: "⚠️ 貼紙逾時，已同步最新狀態",
      toast_duplicate: "你已經貼過呢位朋友，請認識下一位！",
      toast_rejected: "貼標籤被拒絕"
    },
    en: {
      app_title: "🏷️ Social Tag - Name Sticker Game",
      entry_subtitle: "Select your role to join the room",
      room_label: "Room ID",
      room_placeholder: "eg. 839201",
      room_placeholder_auto: "Leave empty to generate 6-digit code",
      btn_random_room: "🎲 Random Room",
      name_label: "Your Name",
      name_placeholder: "Your name or nickname",
      btn_enter: "Join",
      or_divider: "OR",
      btn_host: "🖥️ I am Host (Big Screen)",
      role_host: "HOST (Main Screen)",
      role_client_prefix: "Player: ",
      status_label: "Stage: ",
      stickers_left: "Stickers left: ",
      stickers_unit: "",
      time_left: "Time remaining: ",
      btn_start: "Start Activity (5 Mins)",
      btn_reclaim: "Early Reclaim Phase",
      btn_reset: "🔄 Reset Room (Restart)",
      btn_leave: "🚪 Leave",
      confirm_leave_host: "Are you sure you want to leave and return to home?\n\n⚠️ Warning: Leaving as Host will disconnect the room!",
      confirm_leave_client: "Are you sure you want to leave and return to home?\n\n⚠️ Warning: Leaving will clear your stickers and disconnect you!",
      qr_title: "📷 Scan QR Code to Join Instantly",
      qr_desc: "Scan and enter your name to play directly",
      host_invite_code: "Room Code: ",
      list_friends: "Participants (Tap to Tag)",
      list_received: "Stickers I Received (For Reclaim)",
      empty_stickers: "No stickers received yet",
      btn_tag: "Tag ➔",
      btn_tagged: "Tagged",
      btn_return: "Return Back",
      btn_returned: "Returned",
      received_from: "Received sticker from {name}",
      lb_popular: "🏆 People's Magnet (Most Tags)",
      lb_fastest: "⚡ Flash Diplomat (First to Clear)",
      lb_empty: "None",
      lb_count: " ({n} stickers)",
      reclaim_progress: "Reclaim Progress",
      game_ended_title: "Halftime Recap",
      game_reclaim_title: "Reclaiming...",
      missed_start: "Session in Progress",
      missed_desc: "Game has already started. Please watch on screen!",
      room_full_title: "Room Full",
      room_full_desc: "This room has reached its capacity ({max} players). Please contact host or join another room!",
      toast_timeout: "⚠️ Tagging timed out, refreshed status",
      toast_duplicate: "You have already tagged this person!",
      toast_rejected: "Tag transfer was rejected"
    }
  },

  t(key, params = {}) {
    let str = (this.dict[this.lang] && this.dict[this.lang][key]) || this.dict['zh'][key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  },

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('social_tag_lang', lang);
    if (typeof UI !== 'undefined' && UI.renderStaticTexts) {
      UI.renderStaticTexts();
      UI.render();
    }
  }
};

window.I18n = I18n;
