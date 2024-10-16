/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Interface declaration for Authentication Providers
 *
 * @interface AuthProvider
 */
export class AuthProvider {
  /**
   * Called when _linkWith isn't passed authData.
   * Handle your own authentication here.
   *
   * @param {object} options options.success(provider, authData) or options.error(provider, error) on completion
   */
  authenticate(options: any): void {}

  /**
   * (Optional) Called when service is unlinked.
   * Handle any cleanup here.
   */
  deauthenticate(): void {}

  /**
   * Unique identifier for this Auth Provider.
   *
   * @returns {string} identifier
   */
  getAuthType(): string {}

  /**
   * Called when auth data is syncronized.
   * Can be used to determine if authData is still valid
   *
   * @param {object} authData Data used when register provider
   * @returns {boolean} Indicate if service should continue to be linked
   */
  restoreAuthentication(authData: any): boolean {}
}
