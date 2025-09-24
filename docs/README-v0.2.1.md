# YES/NO 占いアプリ

3種類（**惑星 / 花 / 恋愛**）から選び、YES/NO で5問回答 → 診断結果を表示するシンプルな Web アプリ。  
**v0.2.0** から回答ログを **PostgreSQL** に保存し、アプリ内で **統計ダッシュボード** を閲覧できます。

---

## 新機能
- **v0.2.1**: 統計 UI を**管理ページ**に分離（`/#/admin`）
- **v0.2.0**:
  - ✅ **DB ログ保存**：YES/NO を PostgreSQL に保存  
  - ✅ **統計ダッシュボード**：クイズ別合計・設問別内訳を UI で確認  
  - ✅ **API 追加**：`/api/logs`（保存）, `/api/stats/*`（集計）, `/api/health`（疎通）

### 使用ポート
- Web（Vite Preview）：**5173**  
- API（Express）：**8080**  
- DB（PostgreSQL）：**5432**

---

## クイックスタート（Docker）

```bash
# 1) 起動（Web / API / DB）
docker compose up -d --build

# 2) ブラウザで開く
# フロント: http://localhost:5173/
# 管理(統計): http://localhost:5173/#/admin
```

---

## 動作確認（API）

> 任意の確認手順です。OS によってコマンドが異なるため  
> **Bash（Linux/Mac, WSL, Git Bash など）** と **PowerShell（Windows）** を併記しています。

### 1) ヘルスチェック

**Bash**
```bash
curl -sS http://localhost:8080/api/health
# => {"ok":true}
```

**PowerShell（Windows）**
```powershell
# PowerShell の "curl" は iwr のエイリアスなので、curl.exe を明示すると確実です
curl.exe -sS http://localhost:8080/api/health
# もしくは Invoke-RestMethod
irm http://localhost:8080/api/health
```

### 2) 集計確認（クイズ別・設問別）

> 初回はデータが無いので、必要に応じて**サンプルログを1件登録（任意）**してから集計を見ると分かりやすいです。

**（任意）サンプルログ登録：planet/p1 を YES と回答したと仮定**

**Bash**
```bash
curl -sS -X POST http://localhost:8080/api/logs \
  -H 'Content-Type: application/json' \
  -d '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```

**PowerShell**
```powershell
curl.exe -sS -X POST http://localhost:8080/api/logs `
  -H "Content-Type: application/json" `
  -d '{"quizId":"planet","questionId":"p1","answer":"YES"}'
# もしくは
irm -Method Post -Uri http://localhost:8080/api/logs `
  -ContentType "application/json" `
  -Body '{"quizId":"planet","questionId":"p1","answer":"YES"}'
```

**集計（クイズ別 / 設問別）**

**Bash**
```bash
# クイズ別 YES/NO 合計（planet）
curl -sS http://localhost:8080/api/stats/quiz/planet

# 設問別の内訳（planet）
curl -sS http://localhost:8080/api/stats/question/planet
```

**PowerShell**
```powershell
curl.exe -sS http://localhost:8080/api/stats/quiz/planet
curl.exe -sS http://localhost:8080/api/stats/question/planet
```

**参考：DB を直接見たい場合（任意）**
```bash
docker compose exec -T db psql -U app -d yesno -c \
"SELECT id, quiz_id, question_id, answer, created_at FROM log_entries ORDER BY id DESC LIMIT 5;"
```

---

## 反映コマンド（例）

```bash
git switch -c docs/readme-0.2.1
git add docs/README-v0.2.1.md
git commit -m "docs: add standalone README for v0.2.1 (quickstart & API checks)"
git push -u origin docs/readme-0.2.1
```
