/*
 * @flow
 */

const encoded = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '/': '&#x2F;',
  "'": '&#x27;',
  '"': '&quot;',
};

export default function escape(str: string): string {
  return str.replace(/[&<>\/'"]/g, function (char) {
    return encoded[char];
  });
}
