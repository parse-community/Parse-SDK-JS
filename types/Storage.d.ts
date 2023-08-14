export default Storage;
declare namespace Storage {
    function async(): boolean;
    function getItem(path: string): string;
    function getItemAsync(path: string): Promise<string>;
    function setItem(path: string, value: string): void;
    function setItemAsync(path: string, value: string): Promise<void>;
    function removeItem(path: string): void;
    function removeItemAsync(path: string): Promise<void>;
    function getAllKeys(): string[];
    function getAllKeysAsync(): Promise<string[]>;
    function generatePath(path: string): string;
    function _clear(): void;
}
