export interface IHashProvider {
  hash(value: string): Promise<string>;
  compare(value: string, hash: string): Promise<boolean>;
}

export const IHashProvider = Symbol('IHashProvider');
