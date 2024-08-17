/* Providers */

/** ロール定義 */
export type Role = 'assistant' | 'user';

/** メッセージ定義 */
export type Message = { role: Role; content: string; };
