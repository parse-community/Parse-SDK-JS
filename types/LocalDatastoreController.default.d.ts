declare const LocalDatastoreController: {
  fromPinWithName(name: string): Promise<Array<any>>;
  pinWithName(name: string, value: any): any;
  unPinWithName(name: string): any;
  getAllContents(): Promise<any>;
  getRawStorage(): Promise<any>;
  clear(): Promise<any>;
};
export default LocalDatastoreController;
