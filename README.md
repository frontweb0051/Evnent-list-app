# event-app

イベント告知・参加管理サービス(React + 素のPHP + PostgreSQL)。

## 起動

```bash
cp .env.example .env      # パスワードを変更しておく
docker compose up -d --build
```

- API: http://localhost:8080/api/events
- Adminer(DB確認): http://localhost:8081
  - システム: PostgreSQL / サーバ: db / ユーザー・パスワード・DB名は `.env` の値

初期データ(`docker/db/init.sql`)は **DBボリュームが空の初回起動時のみ** 投入されます。
作り直したいときは `docker compose down -v` でボリュームごと削除してください。

## 動作確認

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/events
curl "http://localhost:8080/api/events?q=PHP"
curl "http://localhost:8080/api/events?from=2026-12-01"
curl -i "http://localhost:8080/api/events?from=abc"   # 422
curl -i http://localhost:8080/api/unknown             # 404
```

期待する結果: 下書きのイベントは返らない / 「満員のイベント」の remaining は 0 /
「Reactもくもく会」の remaining は 7(定員10 − 申込3名)。

## 構成

```
backend/public/index.php    入口(オートローダー・例外ハンドラ・ルート定義)
backend/src/Router.php      メソッド+パスの振り分け
backend/src/Database.php    PDO接続(env から設定を読む)
backend/src/Response.php    JSON/エラー形式の統一
backend/src/Controller/     入力検証とレスポンス
backend/src/Repository/     SQLはここに集約
docker/db/init.sql          テーブル定義とサンプルデータ
```
