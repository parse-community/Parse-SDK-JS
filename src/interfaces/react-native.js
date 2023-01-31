/**
 * Interface declaration for React Native modules
 */
declare module 'react-native' {
  declare class AsyncStorage {
    static getItem(path: string, cb: (err: string, value: string) => void): void;
    static setItem(path: string, value: string, cb: (err: string, value: string) => void): void;
    static removeItem(path: string, cb: (err: string, value: string) => void): void;
    static getAllKeys(cb: (err: string, keys: Array<string>) => void): void;
    static clear(): void;
  }
}
