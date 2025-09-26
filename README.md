# YES/NO 占いアプリ

3種類（**惑星 / 花 / 恋愛**）から選び、YES/NO で5問回答 → 診断結果を表示するシンプルな Web アプリ。  
**v0.2.x** 系から回答ログを **PostgreSQL** に保存し、アプリ内で **統計ダッシュボード** を閲覧できます。

---

## 新機能（v0.2.x）
- ✅ **DB ログ保存**：YES/NO を PostgreSQL に保存  
- ✅ **統計ダッシュボード**：クイズ別合計・設問別内訳を UI で確認（メニュー右上「📊 統計を見る」）  
- ✅ **API 追加**：`/api/logs`（保存）, `/api/stats/summary`（集計）, `/api/health`（疎通）  
- ✅ **構成整理**：`web/` 配下にフロント・`api/` 配下にサーバ、Dockerfile を分離  
- ✅ **DB healthcheck** を追加、API は DB が起動完了まで待機

---

## 使用ポート
- Web（Vite）：**5173**  
- API（Express）：**8080**  
- DB（PostgreSQL）：**5432**

---

## 必要要件
- Docker Engine 24+  
- Docker Compose v2

---

## クイックスタート

> **重要:** 以降のコマンドは、必ず `web/` ディレクトリで実行してください。  

### Linux / macOS / WSL
```bash
git clone https://github.com/licklider-ai/yesno-fortune-app.git
cd yesno-fortune-app/web
docker compose up -d --build
```

### Windows PowerShell
```powershell
git clone https://github.com/licklider-ai/yesno-fortune-app.git
Set-Location $HOME\yesno-fortune-app\web
docker compose up -d --build
```

起動後、ブラウザでアクセスしてください：

- フロントエンド: http://localhost:5173/  
- 統計ダッシュボード: http://localhost:5173/#/admin  
---

### 起動確認
- API: http://localhost:8080/api/health → `{"ok":true}`  
- Web: http://localhost:5173

### 初回のみ（DBテーブル作成）
```bash
docker compose exec -T db psql -U app -d yesno -c "
CREATE TABLE IF NOT EXISTS log_entries(
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('YES','NO')),
  created_at TIMESTAMPTZ DEFAULT now()
);"
docker compose restart api
```

DB データは **Docker Volume** に保存されるため、`docker compose down -v` を行うと削除されます。その場合は再度テーブル作成が必要です。

---

## API エンドポイント
- `GET  /api/health`  
- `POST /api/logs`  
  - body: `{"quizId"|"quiz_id", "questionId"|"question_id", "answer":"YES"|"NO"}`  
- `GET  /api/stats/summary`

### `/api/stats/summary` レスポンス例
```json
{
  "quizzes": { "planet": 2, "flower": 1 },
  "questions": {
    "p1": { "yes": 1, "no": 0 },
    "p2": { "yes": 0, "no": 1 }
  }
}
```

---

## 開発（ローカル）
> Docker ではなく、ローカルでホットリロード開発する場合

```bash
# フロント（Vite）
cd web
npm install
npm run dev    # http://localhost:5173

# サーバ（Express）
cd api
npm install
npm run dev    # http://localhost:8081 （開発時は8081を使用）
```

**補足:**  
- ローカルAPIは `PORT=8081` / `DATABASE_URL=postgres://app:app@localhost:5432/yesno` を想定。  
- Dockerで API を動かす時は `http://localhost:8080`。  
- フロントの API 先は `.env` で切替推奨：  
  - `web/.env.development` → `VITE_API_BASE=http://localhost:8081`  
  - `web/.env.production`  → `VITE_API_BASE=http://localhost:8080`

---

## トラブルシューティング
- **`no configuration file provided`**  
  → `web/` ディレクトリで実行しているか確認。

- **ポート競合（EADDRINUSE）**  
  → 8080/5173 を使う他プロセスを停止。  
  → 開発時は API を 8081 に。

- **`relation "log_entries" does not exist`**  
  → DBテーブル未作成 or volume 初期化。  
  → 上記「初回のみ（DBテーブル作成）」を実行。

- **APIが応答しない**  
  ```bash
  docker compose logs api
  ```
  でエラーを確認。

---

## 運用メモ
- テーブル作成は `IF NOT EXISTS` のため **繰り返し実行しても安全**。  
- スキーマ変更は `ALTER TABLE` 推奨。  
- 多くのトラブルは **作業ディレクトリの誤り** と **ポート競合** が原因です。

