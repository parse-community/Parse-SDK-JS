declare const CryptoController: {
    async: number;
    encrypt(json: any, parseSecret: any): Promise<string>;
    decrypt(encryptedJSON: string, parseSecret: any): Promise<string>;
};
export default CryptoController;
