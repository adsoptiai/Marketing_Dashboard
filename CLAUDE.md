# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

醫美短影音市場情報系統 — 本地部署的 Streamlit Web 應用，自動抓取 YouTube Shorts 數據（醫美關鍵字）、透過 LLM Agent 生成分析報告，並推播至 LINE。

規格書：`gemini-code-1781682142602.md`

## 目標架構

```
app.py                 # Streamlit 主介面（分頁 A~D + APScheduler 排程）
youtube_service.py     # YouTube Data API v3 兩階段撈取、Shorts 篩選（<=60s, 過去N天）
llm_agent.py           # DataFrame → Prompt → OpenRouter LLM 分析報告（支援串流）
line_service.py        # LINE Messaging API Push Message（含 5000 字分段）
keywords.csv           # 監控關鍵字清單（app 讀此檔做 multiselect）
requirements.txt       # 套件清單（純 ASCII）
.env                   # API Keys（不入版控）
```

四個模組皆已實作並用真實資料驗證通過（抓取→報告 已串接；LINE 待填憑證後可測）。

## 開發指令

> 本機的 `python` 指向 Microsoft Store stub（執行腳本會靜默失敗 / 跳出商店），**一律用 `py` 啟動器**。

```powershell
# 安裝套件
py -m pip install -r requirements.txt

# 啟動應用
py -m streamlit run app.py

# 單模組測試（內建 __main__ 測試區，需先設定 .env 的 YOUTUBE_API_KEY）
py youtube_service.py
py llm_agent.py
```

> `requirements.txt` 須保持純 ASCII（不可有中文註解）：pip 在本機以 cp950 解碼，遇到 UTF-8 中文會 `UnicodeDecodeError`。

## 核心設計決策

**YouTube 抓取兩階段邏輯**：先用 `search.list` 抓影片 ID，再用 `videos.list` 拿詳細數據（觀看數、時長）；時長需 ISO 8601 解析後過濾 ≤60 秒的 Shorts。API quota 請求間加 `time.sleep`。

**Streamlit Session State**：抓取結果存在 `st.session_state["df_results"]`，供 AI 分析頁直接讀取，避免重複抓取。

**APScheduler**：`BackgroundScheduler` 在 `app.py` 啟動時初始化一次（用 `st.cache_resource` 或全域變數避免 Streamlit re-run 重複建立），排程任務封裝為單一函數執行完整流程。

**LLM 統一走 OpenRouter**：用 `openai` SDK，將 `base_url` 設為 `OPENROUTER_BASE_URL`、`api_key` 設為 `OPENROUTER_API_KEY`，模型由 `OPENROUTER_MODEL` 指定（如 `anthropic/claude-sonnet-4.5`）。不需各家原生 SDK。

## 環境變數（`.env`）

```
YOUTUBE_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
LINE_CHANNEL_ACCESS_TOKEN=
LINE_USER_ID=
```

## 技術棧

- Python + Streamlit（UI）
- `google-api-python-client`（YouTube Data API v3）
- `pandas` + `plotly`（數據處理與視覺化）
- `apscheduler`（背景排程）
- `line-bot-sdk`（LINE 推播）
- SQLite 或 CSV 本地落地（選擇 CSV 優先簡化）
