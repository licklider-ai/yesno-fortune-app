# ベースイメージとしてApache httpdの最新版を使用
FROM httpd:latest

# ローカルのindex.htmlをコンテナのドキュメントルートにコピー
COPY ./index.html /usr/local/apache2/htdocs/