declare const LocalDatastoreController: {
    fromPinWithName(name: string): Promise<Array<any>>;
    pinWithName(name: string, value: any): Promise<void>;
    unPinWithName(name: string): Promise<void>;
    getAllContents(): Promise<any>;
    getRawStorage(): Promise<any>;
    clear(): Promise<any>;
};
export default LocalDatastoreController;
