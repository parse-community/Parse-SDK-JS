let AES;
let ENC;

if (process.env.PARSE_BUILD === 'react-native') {
  const CryptoJS = require('react-native-crypto-js');
  AES = CryptoJS.AES;
  ENC = CryptoJS.enc.Utf8;
} else {
  AES = require('crypto-js/aes');
  ENC = require('crypto-js/enc-utf8');
}

const CryptoController = {
  encrypt(obj: any, secretKey: string): ?string {
    const encrypted = AES.encrypt(JSON.stringify(obj), secretKey);
    return encrypted.toString();
  },

  decrypt(encryptedText: string, secretKey: string): ?string {
    const decryptedStr = AES.decrypt(encryptedText, secretKey).toString(ENC);
    return decryptedStr;
  },
};

module.exports = CryptoController;
