# nnkp-zarigani-cat-simulator Client

[Vue](https://vitejs.dev/) 製のクライアントです。

```bash
# 依存モジュールをインストールする
$ npm install

# 開発用 Hot Reload サーバを起動する
$ npm run dev

# 本番用に型チェック後ビルドする
$ npm run build

# 本番用にビルドした資材でプレビュー用サーバを起動する
$ npm start
```

ビルドした資材 `./client/dist/` は、サーバサイド側にて静的リソースとして配信されるので、フロントエンドのビルド後、バックエンドサーバを起動することで Vue サイトを確認できる。
