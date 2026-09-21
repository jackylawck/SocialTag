# 🛡️ AI 治理、數據私隱與合規架構聲明
# AI Governance, Data Privacy & Regulatory Compliance Framework

**項目名稱 / Project Title**: Social Tag 到處留名 (Social Tag Icebreaker Game)  
**系統架構 / Technical Architecture**: 純前端無伺服器靜態架構 (Client-side Static Architecture / Serverless)  
**版本編號 / Version**: 1.0  
**生效日期 / Effective Date**: 2026-09-20  

---

## 繁體中文 (Traditional Chinese)

### 1. 系統架構與 AI 治理適用性說明 (AI Governance & Scope)

#### 1.1 系統架構本質
「Social Tag 到處留名」是一款基於純前端技術（HTML5, JavaScript, Web APIs）構建的互動式破冰工具，透過瀏覽器內建之本地通訊技術（如 `BroadcastChannel`）或靜態客戶端代碼運作。本系統不包含任何雲端資料庫、遠端後端伺服器或外部 API 數據收集端點。

#### 1.2 監管法規適用性判定
* **歐盟人工智能法案 (EU AI Act)**：**不適用**。本應用程式僅依賴預設之確定性邏輯（Deterministic Logic）與狀態機演算法（Finite State Machine）處理標籤記數與時間倒數，完全不包含機器學習、深度神經網絡、自主推論系統（Autonomous Inference）或高風險 AI 應用範疇。
* **國家互聯網信息辦公室（網信辦）法規**：**不適用**。本系統不提供大語言模型（LLM）、深度偽造（Deepfake）、算法推薦或生成式人工智能服務，因此豁免於《生成式人工智能服務管理暫行辦法》及相關算法備案規定。
* **ISO/IEC 42001 (人工智能管理體系 - AIMS)**：本項目實踐了 ISO/IEC 42001 中關於「系統範疇界定與透明度原則」，明示系統的非 AI 本質，防止使用者產生黑箱決策或自動化偏見的誤解。

---

### 2. 數據私隱與安全合規 (Data Protection & Privacy Policy)

本應用程式設計嚴格遵循「默認私隱（Privacy by Design & by Default）」及「最小化數據收集（Data Minimization）」原則，對標以下國際標準與法規：
* **香港法例第 486 章《個人資料（私隱）條例》(PDPO)**
* **歐盟《通用數據保障條例》(GDPR - EU 2016/679)**
* **ISO/IEC 27001 (資訊安全管理體系 - ISMS)**
* **ISO/IEC 27701 (隱私資訊管理體系 - PIMS)**

#### 2.1 數據收集與存儲實踐
* **零伺服器存儲（Zero Server-side Storage）**：本項目無任何後端伺服器託管使用者數據，開發者不會亦無法獲取任何使用者的連線日誌、IP 地址或設備指紋。
* **最小化使用者資料**：使用者僅輸入自選之顯示暱稱（Display Nickname）。強烈建議使用者切勿輸入身份證字號、真實全名、電話、電郵或任何具可識別個人身份之敏感資訊（PII）。
* **本地與臨時生命週期（Ephemeral & Local-only Storage）**：所有連線狀態、手上貼紙數量及收發記錄僅暫存於使用者裝置的瀏覽器易失性記憶體（In-Memory）及瀏覽器本地存儲空間（`localStorage`）。一旦使用者點擊「🚪 離開房間」或清除瀏覽器快取，相關資料即被徹底銷毀。

#### 2.2 資訊安全防護措施 (ISO/IEC 27001 參照)
* **內容安全策略 (CSP)**：網頁端配置嚴格的 `Content-Security-Policy`，禁止未授權之第三方腳本執行，杜絕跨站腳本攻擊（XSS）。
* **權限隔離 (Permissions Policy)**：完全關閉麥克風、相機、精確地理位置等高風險設備權限存取。
* **靜態託管傳輸加密**：全站強制採用 HTTPS/TLS 傳輸協議託管，確保靜態資源交付之完整性與防篡改性。

---

### 3. 免責聲明與法律條款 (Terms of Use & Disclaimer)

1. **服務形式（"AS-IS" 基礎）**：本項目按「現狀」提供，不包含任何明示或暗示的保證，包括但不限於系統適用性、零中斷運行或特定商業目的保證。
2. **使用者自負責任**：活動主持人（Host）與參與學員應合理使用本工具。因使用者自行輸入之不當暱稱、私人敏感訊息或活動現場爭端，開發者概不承擔任何法律、侵權或經濟賠償責任。
3. **智慧財產權**：本軟體之架構原始碼遵循 MIT 開源授權協議，使用者擁有合規使用權，但不得利用本項目從事任何違反所在地法律之行為。

---

## English

### 1. Technical Architecture & AI Governance Applicability

#### 1.1 Architectural Nature
"Social Tag" is an interactive icebreaker web application operating strictly on a client-side, serverless, static architecture (HTML5, JavaScript, Web APIs). Inter-device synchronization is handled via client-side broadcast primitives (e.g., `BroadcastChannel`) or client execution. The system contains no cloud databases, remote backend servers, or external telemetry/analytics endpoints.

#### 1.2 Regulatory Scope & Exemption Analysis
* **EU Artificial Intelligence Act (EU AI Act)**: **OUT OF SCOPE**. This application relies entirely on deterministic algorithms and finite state machines (FSM) to count sticker transactions and run countdown timers. It contains zero machine learning, deep neural networks, autonomous inference mechanisms, or high-risk AI profiles.
* **Cyberspace Administration of China (CAC) AI Regulations**: **OUT OF SCOPE**. The software does not provide generative AI, large language models (LLM), algorithmic recommendations, or deep synthesis services. Hence, algorithm registration and filing obligations are fully exempted.
* **ISO/IEC 42001 (Artificial Intelligence Management System - AIMS)**: In accordance with ISO/IEC 42001 principles of scope transparency and boundary definition, this document formally clarifies the non-AI nature of the application, eliminating any ambiguity regarding algorithmic bias, profiling, or automated decisions.

---

### 2. Data Protection, Privacy & Information Security Policy

The design strictly adheres to the principles of "Privacy by Design", "Privacy by Default", and "Data Minimization", aligning with international privacy frameworks:
* **Hong Kong Personal Data (Privacy) Ordinance (Cap. 486 - PDPO)**
* **EU General Data Protection Regulation (GDPR - Regulation (EU) 2016/679)**
* **ISO/IEC 27001 (Information Security Management System - ISMS)**
* **ISO/IEC 27701 (Privacy Information Management System - PIMS)**

#### 2.1 Data Collection & Storage Practices
* **Zero Server-Side Retention**: No external backend or database exists. The developer does not collect, log, or monitor user interactions, network traces, IP addresses, or device fingerprints.
* **Data Minimization**: Users only supply an arbitrary display nickname. Participants are explicitly advised NOT to submit Personally Identifiable Information (PII) such as real legal names, national identification numbers, phone numbers, or corporate confidential secrets.
* **Ephemeral In-Memory & Local Storage**: Session tokens, virtual sticker balances, and peer states are exclusively kept in client volatile memory and the user's browser `localStorage`. When a user clicks "🚪 Leave" or purges local browser storage, all associated data is permanently discarded.

#### 2.2 Technical Security Safeguards (Aligned with ISO/IEC 27001)
* **Content Security Policy (CSP)**: Robust CSP headers are implemented to restrict external script origins, mitigating Cross-Site Scripting (XSS) and data exfiltration vectors.
* **Permissions Policy**: Device sensor APIs (camera, microphone, geolocation, biometric identifiers) are systematically restricted.
* **Static Transport Security**: Fully served over encrypted HTTPS/TLS channels to ensure resource integrity and prevent tampering.

---

### 3. Terms of Use & Legal Disclaimer

1. **"AS-IS" Warranty**: The application is provided "as is" without warranty of any kind, express or implied, including but not limited to fitness for a particular purpose or non-infringement.
2. **User Responsibility**: Meeting hosts and participants assume full responsibility for their conduct. The developer shall not be held liable for any damages, personal disputes, or inappropriate nicknames entered by end-users.
3. **Intellectual Property**: Source code is licensed under the MIT License. Users may utilize the software provided compliance with local laws and regulations is maintained.
