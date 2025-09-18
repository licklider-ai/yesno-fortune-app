# YES/NO 占いアプリ

3種類（**惑星 / 花 / 恋愛**）から選び、YES/NO で5問回答 → 診断結果を表示するシンプルな Web アプリ。  
**v0.2.0** から回答ログを **PostgreSQL** に保存し、アプリ内で **統計ダッシュボード** を閲覧できます。

---

## 新機能（v0.2.0）
- ✅ **DB ログ保存**：YES/NO を PostgreSQL に保存  
- ✅ **統計ダッシュボード**：クイズ別合計・設問別内訳を UI で確認  
- ✅ **API 追加**：`/api/logs`（保存）, `/api/stats/*`（集計）, `/api/health`（疎通）

---

## 使用ポート
- Web（Vite Preview）：**5173**  
- API（Express）：**8080**  
- DB（PostgreSQL）：**5432**

---

## クイックスタート（Docker：起動〜動作確認まで一括）

下を **そのまま1回コピペ** すれば、起動→疎通→サンプルログ保存→集計→DB確認まで完了します。

### Bash（Linux / macOS / WSL / Git Bash など）
```bash
# 1) 起動（Web/API/DBを一括）
docker compose up -d --build

# 2) API ヘルス待機
until curl -sf http://localhost:8080/api/health >/dev/null; do
  echo "waiting API..."; sleep 1
done
echo "API OK: http://localhost:8080/api/health"

# 3) サンプルログ投入（planet/p1 を YES）
curl -sS -X POST http://localhost:8080/api/logs \
  -H 'Content-Type: application/json' \
  -d '{"quizId":"planet","questionId":"p1","answer":"YES"}'

# 4) 集計確認（クイズ別 / 設問別）
curl -sS http://localhost:8080/api/stats/quiz/planet
curl -sS http://localhost:8080/api/stats/question/planet

# 5) DB 確認（直近 5 件）
docker compose exec -T db psql -U app -d yesno -c \
"SELECT id, quiz_id, question_id, answer, created_at FROM log_entries ORDER BY id DESC LIMIT 5;"

# 6) Web を開く（統計はメニュー右上の「📊 統計を見る」）
echo "Open Web: http://localhost:5173"
