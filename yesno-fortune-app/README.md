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

---

## クイックスタート

> **重要:** 以降のコマンドは、必ずこのリポジトリの直下（`docker-compose.yml` がある場所）で実行してください。  
> ここに居ないと `no configuration file provided: not found` というエラーになります。

### Linux / macOS / WSL

```bash
# まだ clone していない場合
git clone https://github.com/licklider-ai/yesno-fortune-app.git

# リポジトリへ移動（例: ホーム配下）
cd ~/yesno-fortune-app

# 起動
docker compose up -d --build
```

### Windows PowerShell

```powershell
# まだ clone していない場合
git clone https://github.com/licklider-ai/yesno-fortune-app.git

# リポジトリへ移動（例: ユーザーのホーム配下）
Set-Location $HOME\yesno-fortune-app

# 起動
docker compose up -d --build
```

### 起動確認

- API: http://localhost:8080/api/health → `{"ok": true}` が返ればOK  
- Web: http://localhost:5173

### 初回だけ（DBテーブル作成）
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
- GET  /api/health
- POST /api/logs             # body: {"quizId" or "quiz_id", "questionId" or "question_id", "answer":"YES"|"NO"}
- GET  /api/stats/summary

- フロントエンド: http://localhost:5173/  
- 統計ダッシュボード: http://localhost:5173/#/admin  

---

## 動作確認（API）

以下のコマンドで API が正常に動作しているかを確認できます。  
※ご利用の環境に応じて **Bash**（Linux/macOS/WSL など）か **PowerShell**（Windows）を選んでください。

### 1. ヘルスチェック

- **Bash**
```bash
curl -sS http://localhost:8080/api/health
# => {"ok":true}
```

- **PowerShell**
```powershell
irm http://localhost:8080/api/health
```

### 2. サンプルログ登録

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

### 3. 集計確認

- **Bash**
```bash
curl -sS http://localhost:8080/api/stats/quiz/planet
curl -sS http://localhost:8080/api/stats/question/planet
```

- **PowerShell**
```powershell
irm http://localhost:8080/api/stats/quiz/planet
irm http://localhost:8080/api/stats/question/planet
```

### 4. DB を直接確認（任意）

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

---

## トラブルシューティング（よくあるエラー）

- **`no configuration file provided`**  
  → `cd yesno-fortune-app` に移動してから `docker compose up` を実行してください。  

- **ポート競合エラー**  
  → 他のプロセスが 8080 や 5173 を使っていないか確認し、必要なら停止するか `docker-compose.yml` の `ports:` を変更してください。  

- **DB テーブルの二重作成エラー**  
  `CREATE TABLE` 実行時に  
  ```
  NOTICE: relation "log_entries" already exists, skipping
  ```  
  と表示される場合がありますが、これは「既にテーブルが存在しているためスキップした」という通知です。エラーではなく正常動作なので、そのまま続行して問題ありません。  

- **別ディレクトリで起動できない**  
  クローン先を変えて動かす場合、`Dockerfile` や `docker-compose.yml` のビルドコンテキストが正しく設定されていないとエラーになります。  
  → 必ずリポジトリ直下でコマンドを実行してください。もしカスタム構成にする場合は、`docker-compose.yml` の `build.context` を修正する必要があります。  

- **API が反応しない**  
  `curl http://localhost:8080/api/health` で確認して `{"ok":true}` が返らない場合、API コンテナが正しく起動していない可能性があります。  
  ```bash
  docker compose logs api
  ```  
  を実行してエラーメッセージを確認してください。  

---

## 運用メモ

- 初回起動時に DB テーブルを作成したら、以降は再度作成する必要はありません。  
- もしスキーマを変更したい場合は、`ALTER TABLE` で修正するか、DB を削除して `docker compose up -d --build` を再実行してください。  
- ほとんどのトラブルは **作業ディレクトリの位置** と **ポート競合** に起因します。困ったときはまずそこを確認してください。  
