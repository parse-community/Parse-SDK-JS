/**
 * Check if a property name or path is potentially dangerous for prototype pollution
 * Dangerous keys include: __proto__, constructor, prototype
 * @param key - The property name or dotted path to check
 * @returns true if the key is dangerous, false otherwise
 */
export function isDangerousKey(key: string): boolean {
  const dangerousKeys = ["__proto__", "constructor", "prototype"];
  // Check if the key itself is dangerous
  if (dangerousKeys.includes(key)) {
    return true;
  }
  // Check if any part of a dotted path is dangerous
  if (key.includes(".")) {
    const parts = key.split(".");
    return parts.some((part) => dangerousKeys.includes(part));
  }
  return false;
}
