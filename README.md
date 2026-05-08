<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Okinawa Explorer

React + Vite 版本的沖繩 7 天行程頁，資料來自 `trip.html`，並整合 Google Maps JavaScript API（Places + Directions + Geometry）。

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. 建立 `.env.local`（可由 `.env.example` 複製）並設定：
   - `VITE_GOOGLE_MAPS_API_KEY`（必填，提供地圖/路線/評分）
   - `GEMINI_API_KEY`（若你有其他 AI Studio 相關功能才需要）
3. 在 Google Cloud Console 啟用：
   - Maps JavaScript API
   - Places API
   - Directions/Routes 相關能力（供前端 route 計算）
4. 限制 API Key：
   - 建議加上 HTTP referrer 限制
   - 僅允許必要 API，避免濫用
5. 啟動：
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`：啟動開發伺服器
- `npm run build`：打包
- `npm run lint`：TypeScript 型別檢查（`tsc --noEmit`）
