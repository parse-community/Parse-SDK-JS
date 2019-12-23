/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8';

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
