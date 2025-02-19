declare const StorageController: {
    async: number;
    getItemAsync(path: string): Promise<string | null>;
    setItemAsync(path: string, value: string): Promise<void>;
    removeItemAsync(path: string): Promise<void>;
    getAllKeysAsync(): Promise<readonly string[]>;
    multiGet(keys: Array<string>): Promise<readonly [string, string | null][] | null>;
    multiRemove(keys: Array<string>): Promise<Array<string>>;
    clear(): Promise<void>;
};
export default StorageController;
