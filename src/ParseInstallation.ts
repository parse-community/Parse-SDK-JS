import CoreManager from './CoreManager';
import ParseError from './ParseError';
import ParseObject from './ParseObject';

import type { AttributeMap } from './ObjectStateMutations';

type DeviceInterface = {
  IOS: string;
  MACOS: string;
  TVOS: string;
  FCM: string;
  ANDROID: string;
  WEB: string;
};

const DEVICE_TYPES: DeviceInterface = {
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
  constructor(attributes?: AttributeMap) {
    super('_Installation');
    if (attributes && typeof attributes === 'object') {
      try {
        this.set(attributes || {});
      } catch (_) {
        throw new Error("Can't create an invalid Installation");
      }
    }
  }

  /**
   * A unique identifier for this installation’s client application. In iOS, this is the Bundle Identifier.
   *
   * @property {string} appIdentifier
   * @static
   * @returns {string}
   */
  get appIdentifier() {
    return this.get('appIdentifier');
  }

  /**
   * The version string of the client application to which this installation belongs.
   *
   * @property {string} appVersion
   * @static
   * @returns {string}
   */
  get appVersion() {
    return this.get('appVersion');
  }

  /**
   * The display name of the client application to which this installation belongs.
   *
   * @property {string} appName
   * @static
   * @returns {string}
   */
  get appName() {
    return this.get('appName');
  }

  /**
   * The current value of the icon badge for iOS apps.
   * Changes to this value on the server will be used
   * for future badge-increment push notifications.
   *
   * @property {number} badge
   * @static
   * @returns {number}
   */
  get badge() {
    return this.get('badge');
  }

  /**
   * An array of the channels to which a device is currently subscribed.
   *
   * @property {string[]} channels
   * @static
   * @returns {string[]}
   */
  get channels() {
    return this.get('channels');
  }

  /**
   * Token used to deliver push notifications to the device.
   *
   * @property {string} deviceToken
   * @static
   * @returns {string}
   */
  get deviceToken() {
    return this.get('deviceToken');
  }

  /**
   * The type of device, “ios”, “android”, “web”, etc.
   *
   * @property {string} deviceType
   * @static
   * @returns {string}
   */
  get deviceType() {
    return this.get('deviceType');
  }

  /**
   * Gets the GCM sender identifier for this installation
   *
   * @property {string} GCMSenderId
   * @static
   * @returns {string}
   */
  get GCMSenderId() {
    return this.get('GCMSenderId');
  }

  /**
   * Universally Unique Identifier (UUID) for the device used by Parse. It must be unique across all of an app’s installations.
   *
   * @property {string} installationId
   * @static
   * @returns {string}
   */
  get installationId() {
    return this.get('installationId');
  }

  /**
   * Gets the local identifier for this installation
   *
   * @property {string} localeIdentifier
   * @static
   * @returns {string}
   */
  get localeIdentifier() {
    return this.get('localeIdentifier');
  }

  /**
   * Gets the parse server version for this installation
   *
   * @property {string} parseVersion
   * @static
   * @returns {string}
   */
  get parseVersion() {
    return this.get('parseVersion');
  }

  /**
   * This field is reserved for directing Parse to the push delivery network to be used.
   *
   * @property {string} pushType
   * @static
   * @returns {string}
   */
  get pushType() {
    return this.get('pushType');
  }

  /**
   * Gets the time zone for this installation
   *
   * @property {string} timeZone
   * @static
   * @returns {string}
   */
  get timeZone() {
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
   * @property {object} DEVICE_TYPES
   * @static
   * @returns {object}
   */
  static get DEVICE_TYPES(): DeviceInterface {
    return DEVICE_TYPES;
  }

  /**
   * Wrap the default fetch behavior with functionality to update local storage.
   * If the installation is deleted on the server, retry the fetch as a save operation.
   *
   * @param {...any} args
   * @returns {Promise}
   */
  async fetch(...args: Array<any>): Promise<ParseInstallation> {
    try {
      await super.fetch.apply(this, args);
    } catch (e) {
      if (e.code !== ParseError.OBJECT_NOT_FOUND) {
        throw e;
      }
      // The installation was deleted from the server.
      // We always want fetch to succeed.
      delete this.id;
      this._getId(); // Generate localId
      this._markAllFieldsDirty();
      await super.save.apply(this, args);
    }
    await CoreManager.getInstallationController().updateInstallationOnDisk(this);
    return this;
  }

  /**
   * Wrap the default save behavior with functionality to update the local storage.
   * If the installation is deleted on the server, retry saving a new installation.
   *
   * @param {...any} args
   * @returns {Promise}
   */
  async save(...args: Array<any>): Promise<this> {
    try {
      await super.save.apply(this, args);
    } catch (e) {
      if (e.code !== ParseError.OBJECT_NOT_FOUND) {
        throw e;
      }
      // The installation was deleted from the server.
      // We always want save to succeed.
      delete this.id;
      this._getId(); // Generate localId
      this._markAllFieldsDirty();
      await super.save.apply(this, args);
    }
    await CoreManager.getInstallationController().updateInstallationOnDisk(this);
    return this;
  }

  _markAllFieldsDirty() {
    for (const [key, value] of Object.entries(this.attributes)) {
      this.set(key, value);
    }
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
