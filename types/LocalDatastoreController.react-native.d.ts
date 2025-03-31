declare const LocalDatastoreController: {
    fromPinWithName(name: string): Promise<any[]>;
    pinWithName(name: string, value: any): Promise<void>;
    unPinWithName(name: string): Promise<void>;
    getAllContents(): Promise<any>;
    getRawStorage(): Promise<any>;
    clear(): Promise<void>;
};
export default LocalDatastoreController;
