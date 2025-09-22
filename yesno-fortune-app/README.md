# YES/NO 占いアプリ

3種類（**惑星 / 花 / 恋愛**）から選び、YES/NO で5問回答 → 診断結果を表示するシンプルな Web アプリ。  
**v0.2.0** から回答ログを **PostgreSQL** に保存し、アプリ内で **統計ダッシュボード** を閲覧できます。

---

## 新機能（v0.2.0）
- ✅ **DB ログ保存**：YES/NO を PostgreSQL に保存  
- ✅ **統計ダッシュボード**：クイズ別合計・設問別内訳を UI で確認（メニュー右上「📊 統計を見る」）  
- ✅ **API 追加**：`/api/logs`（保存）, `/api/stats/*`（集計）, `/api/health`（疎通）

---

## 使用ポート
- Web（Vite Preview）：**5173**  
- API（Express）：**8080**  
- DB（PostgreSQL）：**5432**

---

## 必要要件
- Docker Engine 24+
- Docker Compose v2

## クイックスタート（最短手順）

```bash
# Web / API / DB を一括で起動
docker compose up -d --build
```

### 初回だけ（DBテーブル作成）
docker compose exec -T db psql -U app -d yesno -c "
CREATE TABLE IF NOT EXISTS log_entries(
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('YES','NO')),
  created_at TIMESTAMPTZ DEFAULT now()
);"

## API エンドポイント
- GET  /api/health
- POST /api/logs             # body: {"quizId" or "quiz_id", "questionId" or "question_id", "answer":"YES"|"NO"}
- GET  /api/stats/summary

- フロントエンド: http://localhost:5173/  
- 統計ダッシュボード: http://localhost:5173/#/admin  

---

## 動作確認（API）

以下のコマンドで API が正常に動作しているかを確認できます。  
※ご利用の環境に応じて **Bash**（Linux/macOS/WSL など）か **PowerShell**（Windows）を選んでください。

---

### 1. ヘルスチェック

- **Bash**
```bash
curl -sS http://localhost:8080/api/health
# => {"ok":true}
```

- **PowerShell**
```powershell
# PowerShell の curl は iwr のエイリアスなので注意
irm http://localhost:8080/api/health
```

---

### 2. サンプルログ登録（例：planet/p1 に YES と回答）

- **Bash**
```bash
curl -sS -X POST http://localhost:8080/api/logs   -H 'Content-Type: application/json'   -d '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```

- **PowerShell**
```powershell
irm -Method Post -Uri http://localhost:8080/api/logs `
  -ContentType "application/json" `
  -Body '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```

---

### 3. 集計確認（クイズ別 / 設問別）

- **Bash**
```bash
# クイズ別 YES/NO 合計
curl -sS http://localhost:8080/api/stats/quiz/planet

# 設問別 YES/NO 内訳
curl -sS http://localhost:8080/api/stats/question/planet
```

- **PowerShell**
```powershell
irm http://localhost:8080/api/stats/quiz/planet
irm http://localhost:8080/api/stats/question/planet
```

---

### 4. DB を直接確認（任意）

PostgreSQL に保存されたログを直接確認することもできます。

```bash
docker compose exec -T db psql -U app -d yesno -c "SELECT id, quiz_id, question_id, answer, created_at FROM log_entries ORDER BY id DESC LIMIT 5;"
```

---

## 開発（ローカル）

```bash
# フロント
npm run dev

# サーバ
npm run server:dev
```
