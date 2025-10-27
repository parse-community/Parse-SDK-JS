/**
 * Check if a property name or path is potentially dangerous for prototype pollution
 * Dangerous keys include: __proto__, constructor, prototype
 * @param key - The property name or dotted path to check
 * @returns true if the key is dangerous, false otherwise
 */
export declare function isDangerousKey(key: string): boolean;
