import ParseUser from './ParseUser';

/**
 * Provides utility functions for working with Anonymously logged-in users. Anonymous users have
 * some unique characteristics:
 * <ul>
 * <li>Anonymous users don't need a user name or password.</li>
 * <li>Once logged out, an anonymous user cannot be recovered.</li>
 * <li>When the current user is anonymous, the following methods can be used to switch to a
 * different user or convert the anonymous user into a regular one:
 * <ul>
 * <li>signUp converts an anonymous user to a standard user with the given username and password.
 * Data associated with the anonymous user is retained.</li>
 * <li>logIn switches users without converting the anonymous user. Data associated with the
 * anonymous user will be lost.</li>
 * <li>Service logIn (e.g. Facebook, Twitter) will attempt to convert the anonymous user into a
 * standard user by linking it to the service. If a user already exists that is linked to the
 * service, it will instead switch to the existing user.</li>
 * <li>Service linking (e.g. Facebook, Twitter) will convert the anonymous user into a standard user
 * by linking it to the service.</li>
 * </ul>
 * </ul>
 */
class AnonymousUtils {

  static AUTH_TYPE = 'anonymous';

  /**
   * Creates an anonymous user.
   *
   * @return A Promise that will be resolved when logging in is completed.
   */
  static logIn(): Promise {
    const user = new ParseUser();
    return user._linkWith(AnonymousUtils.AUTH_TYPE, AnonymousUtils.getAuthData());
  }

  /**
   * Whether the user is logged in anonymously.
   *
   * @param user User to check for anonymity. The user must be logged in on this device.
   * @return True if the user is anonymous. False if the user is not the current user or is not
   * anonymous.
   */
  static isLinked(user: ParseUser): boolean {
    return user._isLinked(AnonymousUtils.AUTH_TYPE);
  }

  /**
   * @return {string} UUID to be used as the authentication data for the anonymous user
   */
  static getAuthData() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    const uuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return {
      authData: {
        id: uuid
      }
    };
  }

}

export default AnonymousUtils;
