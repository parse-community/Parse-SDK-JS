let webcrypto;
let encoder;
let decoder;
if (typeof window !== 'undefined' && window.crypto && process.env.PARSE_BUILD !== 'node') {
  webcrypto = window.crypto;
  encoder = new TextEncoder();
  decoder = new TextDecoder();
} else {
  const { TextEncoder, TextDecoder } = require('util');
  webcrypto = require('crypto').webcrypto;
  encoder = new TextEncoder();
  decoder = new TextDecoder();
}

const bufferToBase64 = buff => {
  if (typeof window !== 'undefined') {
    return btoa(String.fromCharCode(...new Uint8Array(buff)));
  } else {
    return Buffer.from(buff).toString('base64');
  }
};
const base64ToBuffer = b64 => {
  if (typeof window !== 'undefined') {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  } else {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
};

const importKey = async key =>
  webcrypto.subtle.importKey('raw', encoder.encode(key), 'PBKDF2', false, ['deriveKey']);

const deriveKey = (key, salt, keyUsage) =>
  webcrypto.subtle.deriveKey(
    {
      salt,
      name: 'PBKDF2',
      iterations: 250000,
      hash: 'SHA-256',
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsage
  );

const CryptoController = {
  async: 1,
  async encrypt(json: any, parseSecret: any): Promise<string> {
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const key = await importKey(parseSecret);
    const aesKey = await deriveKey(key, salt, ['encrypt']);
    const encodedData = encoder.encode(JSON.stringify(json));
    const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encodedData);
    const encryptedArray = new Uint8Array(encrypted);
    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedArray.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(encryptedArray, salt.byteLength + iv.byteLength);
    const base64Buffer = bufferToBase64(buffer);
    return base64Buffer;
  },

  async decrypt(encryptedJSON: string, parseSecret: any): Promise<string> {
    try {
      const buffer = base64ToBuffer(encryptedJSON);
      if (buffer.length < 28) { // minimum: 16 salt + 12 IV
        throw new Error('Invalid encrypted data format');
      }
      const salt = buffer.slice(0, 16);
      const iv = buffer.slice(16, 16 + 12);
      const data = buffer.slice(16 + 12);
      const key = await importKey(parseSecret);
      const aesKey = await deriveKey(key, salt, ['decrypt']);
      const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, data);
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  },
};

export default CryptoController;
