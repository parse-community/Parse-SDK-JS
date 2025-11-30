let uuid: () => string;

if (process.env.PARSE_BUILD === 'weapp') {
  uuid = function () {
    const s: string[] = [];
    const hexDigits = '0123456789abcdef';

    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }

    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((Number(s[19]) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
  };
} else if (process.env.PARSE_BUILD === 'node' || process.env.PARSE_BUILD === 'react-native') {
  // Use Node.js built-in crypto.randomUUID() for Node and React Native builds
  // React Native tests run in Node.js environment, and uuid v13 is ESM-only
  uuid = require('crypto').randomUUID;
} else {
  // Use uuid package for browser builds
  uuid = require('uuid').v4;
}

export default uuid;
