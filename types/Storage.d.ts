declare const Storage: {
    async(): boolean;
    getItem(path: string): string | null;
    getItemAsync(path: string): Promise<string | null>;
    setItem(path: string, value: string): void;
    setItemAsync(path: string, value: string): Promise<void>;
    removeItem(path: string): void;
    removeItemAsync(path: string): Promise<void>;
    getAllKeys(): string[];
    getAllKeysAsync(): Promise<string[]>;
    generatePath(path: string): string;
    _clear(): void;
};
export default Storage;
