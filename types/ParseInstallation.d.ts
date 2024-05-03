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
     */
    get appIdentifier(): any;
    /**
     * The version string of the client application to which this installation belongs.
     *
     * @property {string} appVersion
     * @static
     */
    get appVersion(): any;
    /**
     * The display name of the client application to which this installation belongs.
     *
     * @property {string} appName
     * @static
     */
    get appName(): any;
    /**
     * The current value of the icon badge for iOS apps.
     * Changes to this value on the server will be used
     * for future badge-increment push notifications.
     *
     * @property {number} badge
     * @static
     */
    get badge(): any;
    /**
     * An array of the channels to which a device is currently subscribed.
     *
     * @property {string[]} channels
     * @static
     */
    get channels(): any;
    /**
     * Token used to deliver push notifications to the device.
     *
     * @property {string} deviceToken
     * @static
     */
    get deviceToken(): any;
    /**
     * The type of device, “ios”, “android”, “web”, etc.
     *
     * @property {string} deviceType
     * @static
     */
    get deviceType(): any;
    /**
     * Gets the GCM sender identifier for this installation
     *
     * @property {string} GCMSenderId
     * @static
     */
    get GCMSenderId(): any;
    /**
     * Universally Unique Identifier (UUID) for the device used by Parse. It must be unique across all of an app’s installations.
     *
     * @property {string} installationId
     * @static
     */
    get installationId(): any;
    /**
     * Gets the local identifier for this installation
     *
     * @property {string} localeIdentifier
     * @static
     */
    get localeIdentifier(): any;
    /**
     * Gets the parse server version for this installation
     *
     * @property {string} parseVersion
     * @static
     */
    get parseVersion(): any;
    /**
     * This field is reserved for directing Parse to the push delivery network to be used.
     *
     * @property {string} pushType
     * @static
     */
    get pushType(): any;
    /**
     * Gets the time zone for this installation
     *
     * @property {string} timeZone
     * @static
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
     * @property {Object} DEVICE_TYPES
     * @static
     */
    static get DEVICE_TYPES(): DeviceInterface;
    /**
     * Wrap the default save behavior with functionality to save to local storage.
     *
     * @param {...any} args
     * @returns {Promise}
     */
    save(...args: Array<any>): Promise<ParseInstallation>;
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
