/*
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

function hexOctet() {
  return Math.floor(
    (1 + Math.random()) * 0x10000
  ).toString(16).substring(1);
}

export default function uuid(): string {
  return (
    hexOctet() + hexOctet() + '-' +
    hexOctet() + '-' +
    hexOctet() + '-' +
    hexOctet() + '-' +
    hexOctet() + hexOctet() + hexOctet()
  );
}
