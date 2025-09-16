# 作業した証跡（ログ・判断理由・参考URL）

最終更新: 2025-09-12 JST

## 1. 目的
- YES/NO だけで完結する軽量診断アプリの雛形を作成し、3診断（惑星/花/恋愛）を実装。
- Git 運用（master/develop/feature）と Docker 実行を前提に、セットアップからリリースまでの一連を整備。

## 2. 実施ログ（時系列ダイジェスト）
- zip 生成 → WSL 環境へコピー → `unzip` 展開
- `npm i` → `npm run dev` で Vite 起動（5173）
- 5問固定 & スコア加点方式へ変更
- 3診断（惑星/花/恋愛）を `QUIZZES` として追加、メニュー実装
- Git 初期化 → `master / develop / feature` 作成
- サブフォルダ状態のため、独立リポへ切り出し（`git subtree split`／clone方式）
- `feature/quiz-collection` を develop にPR → リリース `develop → master`、タグ `v0.1.0`
- Dockerfile / compose で本番プレビュー実行確認
- 警告対応：WSL の `credential-manager-core` メッセージは無害、必要なら helper を変更

## 3. 試行と判断理由
- **分岐方式**: 初期のツリー分岐型（2〜3問）→ 5問固定・加点式へ変更  
  - 理由: 診断の拡張（設問増加/重み付け/新タイプ追加）に強く、実装も簡潔。
- **同点時の決定**: `priority` によるタイブレーク  
  - 理由: 期待される代表タイプを安定して返せる。
- **Docker**: 2段階（build → preview）  
  - 理由: 開発/公開とも最小構成で完結できるため。
- **リポ切り出し**: `git subtree split` を採用  
  - 理由: サブフォルダのみの履歴を新リポに保ったまま移行可能。

## 4. 参考URL（一次情報）
- Vite（React）: https://vitejs.dev/guide/
- React: https://react.dev/
- Git subtree: https://git-scm.com/book/en/v2/Git-Tools-Subtree-Merging
- GitHub Personal Access Token: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
- Docker Compose: https://docs.docker.com/compose/
- WSL からブラウザを開く（wslview / wslu）: https://github.com/wslutilities/wslu

## 5. 次の改善候補
- CI（GitHub Actions）でビルド/型チェック/リンタ
- PWA 化（オフライン動作、ホーム追加）
- 結果ページの共有画像（OGP）自動生成
- 回答ログの保存（API or Firebase）
- I18N（多言語）
