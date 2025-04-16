declare const StorageController: {
    async: number;
    getItem(path: string): string | null;
    setItem(path: string, value: string): void;
    removeItem(path: string): void;
    getAllKeys(): any;
    clear(): void;
};
export default StorageController;
