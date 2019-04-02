/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Interface declaration for React Native modules
 */
declare module "react-native" {
  declare class AsyncStorage {
    static getItem(path: string, cb: (err: string, value: string) => void): void;
    static setItem(path: string, value: string, cb: (err: string, value: string) => void): void;
    static removeItem(path: string, cb: (err: string, value: string) => void): void;
    static getAllKeys(cb: (err: string, keys: Array<string>) => void): void;
    static clear(): void;
  }
}
