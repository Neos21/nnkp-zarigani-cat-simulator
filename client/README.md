# nnkp-zarigani-cat-simulator Client

[Vue](https://vitejs.dev/) 製のクライアントです。

```bash
# 依存モジュールをインストールする
$ npm install

# 開発用 Hot Reload サーバを起動する
$ npm run dev

  # バックエンドとの通信部分は `vite.config.ts` 設定でプロキシしてあるので、別途バックエンドの開発用サーバを起動しておく
  $ cd ../server/
  $ npm run dev

# 本番用に型チェック後ビルドする
$ npm run build

# 本番用にビルドした資材でプレビュー用サーバを起動する
$ npm start
```

ビルドした資材 `./client/dist/` は、サーバサイド側にて静的リソースとして配信されるので、フロントエンドのビルド後、バックエンドサーバを起動することで Vue サイトを確認できる。
