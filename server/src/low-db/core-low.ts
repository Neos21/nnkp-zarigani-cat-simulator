// https://github.com/typicode/lowdb/blob/1b004c8228029161a15b557ba0bb638eaad3fd4b/src/core/Low.ts
export interface Adapter<T> {
  read: () => Promise<T | null>,
  write: (data: T) => Promise<void>
}

export interface SyncAdapter<T> {
  read: () => T | null,
  write: (data: T) => void
}

function checkArgs(adapter: unknown, defaultData: unknown) {
  if(adapter === undefined) throw new Error('lowdb: missing adapter');
  if(defaultData === undefined) throw new Error('lowdb: missing default data');
}

export class Low<T = unknown> {
  public adapter: Adapter<T>;
  public data: T;
  
  constructor(adapter: Adapter<T>, defaultData: T) {
    checkArgs(adapter, defaultData);
    this.adapter = adapter;
    this.data = defaultData;
  }
  
  public async read(): Promise<void> {
    const data = await this.adapter.read();
    if(data) this.data = data;
  }
  
  public async write(): Promise<void> {
    if(this.data) await this.adapter.write(this.data);
  }
  
  public async update(fn: (data: T) => unknown): Promise<void> {
    fn(this.data);
    await this.write();
  }
}

export class LowSync<T = unknown> {
  public adapter: SyncAdapter<T>;
  public data: T;
  
  constructor(adapter: SyncAdapter<T>, defaultData: T) {
    checkArgs(adapter, defaultData);
    this.adapter = adapter;
    this.data = defaultData;
  }
  
  public read(): void {
    const data = this.adapter.read();
    if(data) this.data = data;
  }
  
  public write(): void {
    if(this.data) this.adapter.write(this.data);
  }
  
  public update(fn: (data: T) => unknown): void {
    fn(this.data);
    this.write();
  }
}
