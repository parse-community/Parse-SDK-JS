/**
 * @flow
 */

import CoreManager from './CoreManager';
import ParseObject from './ParseObject';

import type { AttributeMap } from './ObjectStateMutations';

const DEVICE_TYPES = {
  IOS: 'ios',
  MACOS: 'macos',
  TVOS: 'tvos',
  FCM: 'fcm',
  ANDROID: 'android',
  WEB: 'web',
};

/**
 * Parse.Installation is a local representation of installation data that can be saved and retrieved from the Parse cloud.
 * This class is a subclass of a Parse.Object, and retains the same functionality of a Parse.Object, but also extends it with installation-specific features.
 *
 * <p>A valid Parse.Installation can only be instantiated via <code>Parse.Installation.currentInstallation()</code>
 *
 * Parse.Installation objects which have a valid <code>deviceToken</code> and are saved to the Parse cloud can be used to target push notifications.
 * </p>
 *
 * @alias Parse.Installation
 */
class ParseInstallation extends ParseObject {
  /**
   * @param {object} attributes The initial set of data to store in the object.
   */
  constructor(attributes: ?AttributeMap) {
    super('_Installation');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes)) {
        throw new Error("Can't create an invalid Installation");
      }
    }
  }

  /**
   * Gets the app identifier for this installation
   *
   * @property {string} appIdentifier
   * @returns {string}
   */
  get appIdentifier(): ?string {
    return this.get('appIdentifier');
  }

  /**
   * Gets the app version for this installation
   *
   * @property {string} appVersion
   * @returns {string}
   */
  get appVersion(): ?string {
    return this.get('appVersion');
  }

  /**
   * Gets the app name for this installation
   *
   * @property {string} appName
   * @returns {string}
   */
  get appName(): ?string {
    return this.get('appName');
  }

  /**
   * Gets the badge number for this installation
   *
   * @property {number} badge
   * @returns {number}
   */
  get badge(): ?number {
    return this.get('badge');
  }

  /**
   * Gets the array of channels for this installation
   *
   * @property {Array} channels
   * @returns {Array}
   */
  get channels(): ?Array<string> {
    return this.get('channels');
  }

  /**
   * Gets the device token for this installation
   *
   * @property {string} deviceToken
   * @returns {string}
   */
  get deviceToken(): ?string {
    return this.get('deviceToken');
  }

  /**
   * Gets the device type for this installation
   *
   * @property {string} deviceType
   * @returns {string}
   */
  get deviceType(): ?string {
    return this.get('deviceType');
  }

  /**
   * Gets the GCM sender identifier for this installation
   *
   * @property {string} GCMSenderId
   * @returns {string}
   */
  get GCMSenderId(): ?string {
    return this.get('GCMSenderId');
  }

  /**
   * Gets the installationId for this installation
   *
   * @property {string} installationId
   * @returns {string}
   */
  get installationId(): ?string {
    return this.get('installationId');
  }

  /**
   * Gets the local identifier for this installation
   *
   * @property {string} localeIdentifier
   * @returns {string}
   */
  get localeIdentifier(): ?string {
    return this.get('localeIdentifier');
  }

  /**
   * Gets the parse server version for this installation
   *
   * @property {string} parseVersion
   * @returns {string}
   */
  get parseVersion(): ?string {
    return this.get('parseVersion');
  }

  /**
   * Gets the push type for this installation
   *
   * @property {string} pushType
   * @returns {string}
   */
  get pushType(): ?string {
    return this.get('pushType');
  }

  /**
   * Gets the time zone for this installation
   *
   * @property {string} timeZone
   * @returns {string}
   */
  get timeZone(): ?string {
    return this.get('timeZone');
  }

  /**
   * Returns the device types for used for Push Notifications.
   *
   * <pre>
   * Parse.Installation.DEVICE_TYPES.IOS
   * Parse.Installation.DEVICE_TYPES.MACOS
   * Parse.Installation.DEVICE_TYPES.TVOS
   * Parse.Installation.DEVICE_TYPES.FCM
   * Parse.Installation.DEVICE_TYPES.ANDROID
   * Parse.Installation.DEVICE_TYPES.WEB
   * </pre
   *
   * @property {string} DEVICE_TYPES
   * @returns {string}
   */
  static get DEVICE_TYPES(): ?string {
    return DEVICE_TYPES;
  }

  /**
   * Wrap the default save behavior with functionality to save to local storage.
   *
   * @param {...any} args
   * @returns {Promise}
   */
  async save(...args: Array<any>): Promise<ParseInstallation> {
    await super.save.apply(this, args);
    await CoreManager.getInstallationController().updateInstallationOnDisk(this);
    return this;
  }

  /**
   * Get the current Parse.Installation from disk. If doesn't exists, create an new installation.
   *
   * <pre>
   * const installation = await Parse.Installation.currentInstallation();
   * installation.set('deviceToken', '123');
   * await installation.save();
   * </pre>
   *
   * @returns {Promise} A promise that resolves to the local installation object.
   */
  static currentInstallation(): Promise<ParseInstallation> {
    return CoreManager.getInstallationController().currentInstallation();
  }
}

ParseObject.registerSubclass('_Installation', ParseInstallation);

module.exports = ParseInstallation;
export default ParseInstallation;
