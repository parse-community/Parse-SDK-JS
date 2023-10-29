/**
 * @flow
 */

export default function isRevocableSession(token: string): boolean {
  return token.indexOf('r:') > -1;
}
