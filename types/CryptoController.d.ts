declare const CryptoController: {
    encrypt(obj: any, secretKey: string): string;
    decrypt(encryptedText: string, secretKey: string): string;
};
export default CryptoController;
