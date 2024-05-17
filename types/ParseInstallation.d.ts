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
declare class ParseInstallation extends ParseObject {
    /**
     * @param {object} attributes The initial set of data to store in the object.
     */
    constructor(attributes?: AttributeMap);
    /**
     * A unique identifier for this installation’s client application. In iOS, this is the Bundle Identifier.
     *
     * @property {string} appIdentifier
     * @static
     * @returns {string}
     */
    get appIdentifier(): any;
    /**
     * The version string of the client application to which this installation belongs.
     *
     * @property {string} appVersion
     * @static
     * @returns {string}
     */
    get appVersion(): any;
    /**
     * The display name of the client application to which this installation belongs.
     *
     * @property {string} appName
     * @static
     * @returns {string}
     */
    get appName(): any;
    /**
     * The current value of the icon badge for iOS apps.
     * Changes to this value on the server will be used
     * for future badge-increment push notifications.
     *
     * @property {number} badge
     * @static
     * @returns {number}
     */
    get badge(): any;
    /**
     * An array of the channels to which a device is currently subscribed.
     *
     * @property {string[]} channels
     * @static
     * @returns {string[]}
     */
    get channels(): any;
    /**
     * Token used to deliver push notifications to the device.
     *
     * @property {string} deviceToken
     * @static
     * @returns {string}
     */
    get deviceToken(): any;
    /**
     * The type of device, “ios”, “android”, “web”, etc.
     *
     * @property {string} deviceType
     * @static
     * @returns {string}
     */
    get deviceType(): any;
    /**
     * Gets the GCM sender identifier for this installation
     *
     * @property {string} GCMSenderId
     * @static
     * @returns {string}
     */
    get GCMSenderId(): any;
    /**
     * Universally Unique Identifier (UUID) for the device used by Parse. It must be unique across all of an app’s installations.
     *
     * @property {string} installationId
     * @static
     * @returns {string}
     */
    get installationId(): any;
    /**
     * Gets the local identifier for this installation
     *
     * @property {string} localeIdentifier
     * @static
     * @returns {string}
     */
    get localeIdentifier(): any;
    /**
     * Gets the parse server version for this installation
     *
     * @property {string} parseVersion
     * @static
     * @returns {string}
     */
    get parseVersion(): any;
    /**
     * This field is reserved for directing Parse to the push delivery network to be used.
     *
     * @property {string} pushType
     * @static
     * @returns {string}
     */
    get pushType(): any;
    /**
     * Gets the time zone for this installation
     *
     * @property {string} timeZone
     * @static
     * @returns {string}
     */
    get timeZone(): any;
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
    static get DEVICE_TYPES(): DeviceInterface;
    /**
     * Wrap the default fetch behavior with functionality to update local storage.
     * If the installation is deleted on the server, retry the fetch as a save operation.
     *
     * @param {...any} args
     * @returns {Promise}
     */
    fetch(...args: Array<any>): Promise<ParseInstallation>;
    /**
     * Wrap the default save behavior with functionality to update the local storage.
     * If the installation is deleted on the server, retry saving a new installation.
     *
     * @param {...any} args
     * @returns {Promise}
     */
    save(...args: Array<any>): Promise<this>;
    _markAllFieldsDirty(): void;
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
    static currentInstallation(): Promise<ParseInstallation>;
}
export default ParseInstallation;
