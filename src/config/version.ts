// src/config/version.ts

// ✅ 當前系統顯示的版本號
export const APP_VERSION_CURRENT = "v2.0.2"; 

// ✅ 歷史版本紀錄 (供以後製作更新日誌 Modal 使用)
export const APP_VERSION_HISTORY = [
  { 
    version: "v2.0.2", date: "2026-03-09", desc: "架構優化：完成語言包分離，修正過濾器數據映射邏輯，修復語言配置文件語法錯誤。"},
  { version: "v2.0.1", date: "2026-03-08", desc: "核心架構重構：實現數據與 UI 徹底分離 (Component-Based)，優化 Intel 匹配算法，加入 Config 化語系管理。"},
  { version: "v2.0.0", date: "2026-03-08", desc: "V2.0 大改版：數據與 UI 徹底分離 (Hooks/Components)，新增收藏最愛功能" },
  { version: "v1.1.0", date: "2026-03-07", desc: "優化顯示介面、修復排版重疊與日夜切換卡頓問題" },
  { version: "v1.0.0", date: "2024-03-11", desc: "全新 UI 設計，現代化界面" },
  { version: "v0.7.0", date: "2024-03-11", desc: "修正 MORE 按鈕可收回功能，修復分頁點擊事件，套用論壇風格" },
  { version: "v0.6.0", date: "2024-03-10", desc: "修正統計數字，MORE按鈕移到產品建議區" },
  { version: "v0.5.0", date: "2024-03-09", desc: "零件清單加入 MORE 按鈕、優化零件排序" },
  { version: "v0.4.0", date: "2024-03-08", desc: "改良產品建議顯示：加入分類、摺疊、搜尋、摘要功能" },
  { version: "v0.3.0", date: "2024-03-06", desc: "抽起圖片數據，只保留產品主數據和價格數據" },
  { version: "v0.2.0", date: "2024-03-06", desc: "改用兩個JSON數據源，加入價格顯示" },
  { version: "v0.1.0", date: "2024-01-15", desc: "初始版本，基本查詢功能" }
];