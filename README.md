# nnkp-zarigani-cat-simulator

**[なな子プロジェクト : ザリガニねこシミュレーター](https://nnkp.neos21.net/)**

---

- `./client/` : フロントエンド・Vue 製
- `./server/` : バックエンド・NestJS 製
- `./public/images/` : 画像ファイルの保管場所

```bash
# 先にフロントエンドの `./client/dist/` ディレクトリにビルドした資材を用意しておく
$ cd ./client/
$ npm run build

# 続いてバックエンドをビルドして、フロントエンド資材もまとめてサーバとして起動する
$ cd ../
$ cd ./server/
$ npm run build
$ npm start
```
