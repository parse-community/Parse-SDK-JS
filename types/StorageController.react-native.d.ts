declare const StorageController: {
    async: number;
    getItemAsync(path: string): Promise<string | null>;
    setItemAsync(path: string, value: string): Promise<void>;
    removeItemAsync(path: string): Promise<void>;
    getAllKeysAsync(): Promise<readonly string[]>;
    multiGet(keys: string[]): Promise<readonly [string, string | null][] | null>;
    multiRemove(keys: string[]): Promise<string[]>;
    clear(): Promise<void>;
};
export default StorageController;
