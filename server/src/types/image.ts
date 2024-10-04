/** JSON DB の1要素の型 */
export type ImageDbItem = {
  id: number,
  file_name: string,
  tags: Array<string>
};

/** JSON DB の型 */
export type ImageDbData = Array<ImageDbItem>;
