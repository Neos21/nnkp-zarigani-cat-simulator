/** API から取得してきた画像情報 */
export type ApiImage = {
  id: number,
  file_name: string,
  tags: Array<string>
};

/** 表示用 */
export type Image = {
  id: number,
  fileName: string,
  tags: Array<string>
};
