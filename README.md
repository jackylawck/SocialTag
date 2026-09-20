# 🏷️ Social Tag 到處留名

[繁體中文](#繁體中文) | [English](#english)

---

## 繁體中文

### 📖 專案簡介
**Social Tag 到處留名** 是一款為企業培訓、團隊破冰（Icebreaker）及大型工作坊設計的輕量級互動遊戲。  
專案採用**零後端架構（Serverless）**，透過純靜態前端技術託管於 GitHub Pages。支援一鍵多房獨立運作、動態 QR Code 掃描秒速入場、雙語無縫切換（中／英），並設有單房防爆機制（上限 50 人），兼顧互動趣味與系統穩定度。

---

### 🕹️ 遊戲機制與流程

1. **大會入場（Lobby 階段）**：
   - 主持人打開投影或筆電大螢幕，系統即時生成專屬 6 位數字房號與 **QR Code**。
   - 學員使用手機鏡頭掃碼直入，只需輸入個人名字／暱稱即可完成連線報到。
   - 單房設有 **50 人上限防護**，防止人數超載影響流暢度（支援斷線重連）。
2. **社交貼名牌（5 分鐘 Active 階段）**：
   - 每位學員手上預設持有 **3 張名牌貼紙**。
   - 學員在現場相互認識交流，點選對方名字即可將貼紙貼給對方（**不可重複貼給同一人**）。
3. **中場結算（Halftime Recap 階段）**：
   - 倒數結束後大螢幕即時公佈榮譽榜：
     - 🏆 **人氣磁鐵獎**：身上累積最多標籤的學員。
     - ⚡ **閃電外交官**：最快將手頭貼紙全部送出的學員。
4. **物歸原主（Reclaim 階段）**：
   - 學員需根據身上收到的標籤，在現場尋找當初貼給自己的原主人，當面確認歸還。
   - 大螢幕即時顯示全場「物歸原主進度百分比（0% - 100%）」。

---

### 🌟 技術特點

- **純前端零伺服器（Serverless）**：無須資料庫或 Node.js 後端，完全託管於 GitHub Pages。
- **無限制多房間隔離**：各房間使用獨立的 6 位純數字代碼（`100000` - `999999`）與隔離通訊頻道，不同培訓組別完全互不干擾。
- **極速 QR Code 登入**：整合輕量 `qrcodejs`，掃描自動帶入房號，手機端配置純數字鍵盤模式（`inputmode="numeric"`）。
- **完整雙語體系（i18n）**：支援繁體中文／英文一鍵即時切換，狀態持久保存於 `localStorage`。
- **高韌性離線快照與安全離開**：具備定期 LocalStorage 水合儲存機制，並提供具備防呆提醒的「🚪 離開房間」按鈕。

---

### 📂 目錄架構

```text
├── index.html         # 主介面（包含 Host 投影區、Client 操作面板、雙語 Modal）
└── js/
    ├── i18n.js        # 雙語字典與即時語言切換核心
    ├── utils.js       # 安全隨機數、持久化 PeerID、Emoji 分配器、Toast 提示
    ├── game.js        # 狀態機核心、50 人防爆邏輯、庫存扣減與結算演算
    ├── net.js         # P2P 通訊傳輸抽象層（頻道隔離與權威回調）
    ├── ui.js          # 動態 DOM 雙語渲染、倒數計時器與排行榜渲染
    └── app.js         # 生命週期調度、QR Code 繪製與離開事件綁定

```

---

### 🚀 快速開始與部署

1. **本機預覽**：
直接使用瀏覽器打開 `index.html`，或使用 VS Code Live Server 預覽。
2. **部署至 GitHub Pages**：
* 將代碼 Push 至 GitHub 倉庫。
* 進入倉庫 `Settings` ➔ `Pages` ➔ Source 選擇 `main` 分支並保存。
* 即刻獲得線上網址：`https://<你的用戶名>.github.io/<專案名稱>/`。



---

## English

### 📖 Introduction

**Social Tag** is a lightweight, real-time icebreaker and networking web game designed for corporate workshops, team-building events, and trainings.

Built on a **Serverless static architecture**, the entire application runs directly on GitHub Pages without any backend database. It features independent multi-room isolation, instant mobile QR code onboarding, Traditional Chinese / English language switching, and a 50-player capacity guard for enterprise-grade stability.

---

### 🕹️ Game Rules & Flow

1. **Lobby Phase**:
* The host opens the app on a projector or laptop. The system generates a dedicated 6-digit room code and an on-screen **QR Code**.
* Participants scan the QR code with their mobile cameras, enter their nicknames, and join instantly.
* Built-in **50-player capacity guard** prevents connection overloading (supports automatic reconnection).


2. **Tagging Phase (5 Mins)**:
* Each player starts with **3 name stickers**.
* Players mingle face-to-face and tap participant cards on their phones to transfer stickers (**duplicate tagging to the same player is restricted**).


3. **Halftime Recap Phase**:
* Once the timer hits zero, the main screen reveals the awards:
* 🏆 **People's Magnet**: Participant who received the most tags.
* ⚡ **Flash Diplomat**: Participant(s) who cleared their sticker inventory fastest.




4. **Reclaim Phase**:
* Players check the stickers they received and find the original owners in person to hand them back.
* The big screen tracks and displays real-time overall reclaim progress (0% - 100%).



---

### 🌟 Key Features

* **Serverless & Zero-Backend**: Runs 100% on client browsers, free hosting via GitHub Pages.
* **Unlimited Room Isolation**: Generates 6-digit numeric room IDs (`100000` - `999999`) with isolated communication channels.
* **Instant Mobile Onboarding**: Powered by `qrcodejs` with mobile-optimized numeric keyboards (`inputmode="numeric"`).
* **Full Bilingual Support (i18n)**: Seamless English / Traditional Chinese toggling with persistent user preference in `localStorage`.
* **Fault-Tolerant Snapshots & Safe Exit**: Auto-saves game state to prevent accidental tab closing, complete with confirmation dialogs upon leaving.

---

### 📂 File Structure

```text
├── index.html         # Main layout (Host projection, client view, bilingual modal)
└── js/
    ├── i18n.js        # Bilingual dictionary and reactive translator
    ├── utils.js       # Crypto-safe UID, persistent PeerID, avatar mapper, toasts
    ├── game.js        # Core state machine, 50-player cap guard, inventory logic
    ├── net.js         # P2P transmission abstraction & channel isolation
    ├── ui.js          # Dynamic DOM rendering, countdown clocks, leaderboard
    └── app.js         # Lifecycle bootstrap, QR generator, room navigation

```

---

### 🚀 Quick Start & Deployment

1. **Local Preview**:
Simply open `index.html` in any modern web browser or serve via VS Code Live Server.
2. **Deploy to GitHub Pages**:
* Push your repository to GitHub.
* Go to **Settings** ➔ **Pages**, select branch `main` (root) as the source, and save.
* Access your live game at: `https://<your-username>.github.io/<repo-name>/`.



---

### 📄 License

MIT License. Feel free to use and customize for your corporate trainings and community events.
