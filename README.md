# nnkp-zarigani-cat-simulator

**[なな子プロジェクト : ザリガニねこシミュレーター](https://nnkp.neos21.net/)**

---

- `./client/` : フロントエンド・Vue 製
- `./server/` : バックエンド・NestJS 製
- `./db/` : 画像ファイルとメタデータを管理する JSON DB の格納場所
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

---

## Special Thanks

- [でもでも (@taiki0915takaga@vivaldi.net) 様](https://social.vivaldi.net/@taiki0915takaga) … 画像提供 `2024-09-30-21-36-58.png`
