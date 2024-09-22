# nnkp-zarigani-cat-simulator Server

[NestJS](https://nestjs.com/) 製のサーバです。

```bash
# 依存モジュールをインストールする
$ npm install

# 開発用 Hot Reload サーバを起動する
$ npm run dev

# 本番用にビルドする
$ npm run build

# 本番用にビルドした資材でサーバを起動する
$ npm start

# バックグラウンドで起動する
$ nohup node ./dist/main.js &
# バックグラウンド起動したプロセスを探して終了させる
$ ps aux | grep node  # プロセス ID を確認する
$ kill 【PID】        # 確認したプロセス ID を指定して終了する
```


## 開発用メモ

```bash
# 画像ファイルのアップロード : ローカルの `source.png` ファイルが `example.png` としてサーバサイドに保存される
$ curl -X POST http://localhost:5000/api/images \
  -F 'credential=CHANGE-THIS' \
  -F 'file_name=example.png' \
  -F "file=@./source.png;type=image/png"

# 画像ファイルの削除
$ curl -X DELETE http://localhost:5000/api/images \
  -H 'Content-TYpe: application/json' \
  -d '{ "credential": "CHANGE-THIS", "file_name": "test.png" }'
```
