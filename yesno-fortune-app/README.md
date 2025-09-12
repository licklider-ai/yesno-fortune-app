# YES/NO 占いアプリ

最短2〜3問の YES/NO で占い結果を表示するシンプルな Web アプリです。  
React + TypeScript + Vite で構成、Docker対応。

## ローカル実行（ターミナル）

```bash
# 1) 依存関係をインストール
npm ci  # package-lock が無い場合は npm i

# 2) 開発サーバ起動
npm run dev
# => http://localhost:5173 を開く
```

## Docker 実行

```bash
# イメージビルド
docker build -t yesno-fortune .

# 実行（ポート 5173）
docker run --rm -p 5173:5173 yesno-fortune
# or
docker compose up --build
```

## Git 運用（master / develop / feature）

初回セットアップ例：
```bash
git init
git add .
git commit -m "chore: initial commit"
git branch -M master
git checkout -b develop
git checkout -b feature/initial-ui
# リモート作成後：
git remote add origin <YOUR_REPO_URL>
git push -u origin master
git push -u origin develop
git push -u origin feature/initial-ui
```

フロー例：
- 開発は `feature/*` ブランチで行い、完了したら `develop` へ PR マージ  
- リリース時に `develop` → `master` へマージしタグ付け

## 構成

- `src/App.tsx` … 質問分岐と結果表示（データ駆動）
- `src/App.css` … シンプルなスタイル
- `Dockerfile` / `docker-compose.yml` … Dockerで実行
- `scripts/git-setup.sh` … ブランチ作成と初回プッシュ補助

## カスタマイズ

- 質問の分岐や結果は `NODES` を編集するだけで増減・文言変更できます。
- スタイルを Tailwind などに差し替える場合は `App.css` を変更してください。