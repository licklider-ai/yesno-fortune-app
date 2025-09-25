# YES/NO 占いアプリ

3種類（**惑星 / 花 / 恋愛**）から選び、YES/NO で5問回答 → 診断結果を表示するシンプルな Web アプリ。  
**v0.2.0** から回答ログを **PostgreSQL** に保存し、アプリ内で **統計ダッシュボード** を閲覧できます。

---

## 新機能（v0.2.0）
- ✅ **DB ログ保存**：YES/NO を PostgreSQL に保存  
- ✅ **統計ダッシュボード**：クイズ別合計・設問別内訳を UI で確認（メニュー右上「📊 統計を見る」）  
- ✅ **API 追加**：`/api/logs`（保存）, `/api/stats/summary`（集計）, `/api/health`（疎通）

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

> **重要:** 以降のコマンドは、必ずリポジトリ直下（`docker-compose.yml` がある場所）で実行してください。  
> ここに居ないと `no configuration file provided: not found` のエラーになります。

### Linux / macOS / WSL
```bash
git clone https://github.com/licklider-ai/yesno-fortune-app.git
cd yesno-fortune-app
docker compose up -d --build
```

### Windows PowerShell
```powershell
git clone https://github.com/licklider-ai/yesno-fortune-app.git
Set-Location $HOME\yesno-fortune-app
docker compose up -d --build
```

### 起動確認
- API: http://localhost:8080/api/health → `{"ok":true}` が返ればOK  
- Web: http://localhost:5173

### DBテーブル作成（必要に応じていつでも安全に実行可）
```bash
docker compose exec -T db psql -U app -d yesno -c "
CREATE TABLE IF NOT EXISTS log_entries(
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('YES','NO')),
  created_at TIMESTAMPTZ DEFAULT now()
);"
```

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

- フロントエンド: http://localhost:5173/  
- 統計ダッシュボード: http://localhost:5173/#/admin

---

## 動作確認（API）
### 1. ヘルスチェック
```bash
# Bash
curl -sS http://localhost:8080/api/health
# => {"ok":true}
```
```powershell
# PowerShell
irm http://localhost:8080/api/health
```

### 2. サンプルログ登録
```bash
# Bash
curl -sS -X POST http://localhost:8080/api/logs \\
  -H 'Content-Type: application/json' \\
  -d '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```
```powershell
# PowerShell
irm -Method Post -Uri http://localhost:8080/api/logs `
  -ContentType "application/json" `
  -Body '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```

### 3. 集計取得
```bash
# Bash
curl -sS http://localhost:8080/api/stats/summary | jq .
```
```powershell
# PowerShell
irm http://localhost:8080/api/stats/summary
```

### 4. DB 直接確認（任意）
```bash
docker compose exec -T db psql -U app -d yesno -c \\
"SELECT id, quiz_id, question_id, answer, created_at
 FROM log_entries ORDER BY id DESC LIMIT 5;"
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
  → リポジトリ直下で `docker compose up` を実行。

- **ポート競合（EADDRINUSE）**  
  → 8080/5173 を使う他プロセスを停止。  
  → 開発時は API を 8081 に（`npm run dev`）。

- **`relation "log_entries" does not exist`**  
  → DBテーブル未作成 or 接続先DB/スキーマ違い。  
  → 上記「DBテーブル作成」を実行し、APIの `DATABASE_URL` が正しいか確認。

- **APIが応答しない**  
  ```bash
  docker compose logs api
  ```
  でエラーを確認。

---

## 運用メモ
- テーブル作成は `IF NOT EXISTS` のため **繰り返し実行しても安全**。  
- スキーマ変更は `ALTER TABLE` 推奨。  
- 多くのトラブルは **作業ディレクトリ** と **ポート競合** が原因です。
