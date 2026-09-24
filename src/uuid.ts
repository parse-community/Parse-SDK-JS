const uuid = (): string => {
  if (typeof crypto === 'undefined' || typeof crypto?.randomUUID !== 'function') {
    throw new Error(
      'crypto.randomUUID is not available in this environment. ' +
      'Use a UUID polyfill or environment-specific implementation (for example, in React Native you can import "react-native-random-uuid").'
    );
  }
  return crypto.randomUUID();
};

export default uuid;
