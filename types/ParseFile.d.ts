import type { FullOptions } from './RESTController';
interface Base64 {
    base64: string;
}
interface Uri {
    uri: string;
}
type FileData = number[] | Base64 | Blob | Uri;
export type FileSaveOptions = FullOptions & {
    metadata?: Record<string, any>;
    tags?: Record<string, any>;
    directory?: string;
    /**
     * Overrides the server's `maxUploadSize` for this file upload. Requires the
     * master key (`useMasterKey: true`). The value uses the same format as the
     * server option (e.g. `'50mb'`, `'1gb'`).
     *
     * Only supported for Buffer and Stream source types. Files created from
     * base64 strings, number arrays, Blobs, or URIs do not support this option.
     *
     * Requires Parse Server >= 9.5.0.
     */
    maxUploadSize?: string;
};
export type FileSource = {
    format: 'file';
    file: Blob;
    type: string | undefined;
} | {
    format: 'base64';
    base64: string;
    type: string | undefined;
} | {
    format: 'uri';
    uri: string;
    type: string | undefined;
} | {
    format: 'buffer';
    buffer: any;
    type: string | undefined;
} | {
    format: 'stream';
    stream: any;
    type: string | undefined;
};
export declare function b64Digit(number: number): string;
/**
 * A Parse.File is a local representation of a file that is saved to the Parse
 * cloud.
 *
 * @alias Parse.File
 */
declare class ParseFile {
    _name: string;
    _url?: string;
    _source: FileSource;
    _previousSave?: Promise<ParseFile>;
    _data?: string;
    _requestTask?: any;
    _metadata?: Record<string, any>;
    _tags?: Record<string, any>;
    _directory?: string;
    /**
     * @param name {String} The file's name. This will be prefixed by a unique
     *     value once the file has finished saving. The file name must begin with
     *     an alphanumeric character, and consist of alphanumeric characters,
     *     periods, spaces, underscores, or dashes.
     * @param data {Array} The data for the file, as either:
     *     1. an Array of byte value Numbers or Uint8Array.
     *     2. an Object like { base64: "..." } with a base64-encoded String.
     *     3. an Object like { uri: "..." } with a uri String.
     *     4. a File object selected with a file upload control.
     *     5. (Node.js only) a Buffer. Uploaded as raw binary data instead of
     *        base64-encoding, reducing memory usage. Falls back to base64
     *        JSON encoding if metadata or tags are set.
     *     6. (Node.js only) a Readable stream, or a Web ReadableStream.
     *        Streamed as raw binary data directly into the upload request.
     *        Supports metadata, tags, and directory when Parse Server >= 9.5.0.
     *        For example:
     * <pre>
     * var fileUploadControl = $("#profilePhotoFileUpload")[0];
     * if (fileUploadControl.files.length > 0) {
     *   var file = fileUploadControl.files[0];
     *   var name = "photo.jpg";
     *   var parseFile = new Parse.File(name, file);
     *   parseFile.save().then(function() {
     *     // The file has been saved to Parse.
     *   }, function(error) {
     *     // The file either could not be read, or could not be saved to Parse.
     *   });
     * }</pre>
     * @param type {String} Optional Content-Type header to use for the file. If
     *     this is omitted, the content type will be inferred from the name's
     *     extension.
     * @param metadata {object} Optional key value pairs to be stored with file object
     * @param tags {object} Optional key value pairs to be stored with file object
     */
    constructor(name: string, data?: FileData, type?: string, metadata?: object, tags?: object);
    /**
     * Return the data for the file, downloading it if not already present.
     * Data is present if initialized with Byte Array, Base64 or Saved with Uri.
     * Data is cleared if saved with File object selected with a file upload control
     *
     * @param {object} options
     * @param {function} [options.progress] callback for download progress
     * <pre>
     * const parseFile = new Parse.File(name, file);
     * parseFile.getData({
     *   progress: (progressValue, loaded, total) => {
     *     if (progressValue !== null) {
     *       // Update the UI using progressValue
     *     }
     *   }
     * });
     * </pre>
     * @returns {Promise} Promise that is resolve with base64 data
     */
    getData(options?: {
        progress?: () => void;
    }): Promise<string>;
    /**
     * Gets the name of the file. Before save is called, this is the filename
     * given by the user. After save is called, that name gets prefixed with a
     * unique identifier.
     *
     * @returns {string}
     */
    name(): string;
    /**
     * Gets the url of the file. It is only available after you save the file or
     * after you get the file from a Parse.Object.
     *
     * @param {object} options An object to specify url options
     * @param {boolean} [options.forceSecure] force the url to be secure
     * @returns {string | undefined}
     */
    url(options?: {
        forceSecure?: boolean;
    }): string | undefined;
    /**
     * Gets the metadata of the file.
     *
     * @returns {object}
     */
    metadata(): Record<string, any>;
    /**
     * Gets the tags of the file.
     *
     * @returns {object}
     */
    tags(): Record<string, any>;
    /**
     * Gets the directory of the file.
     * Requires Parse Server >= 9.4.0.
     *
     * @returns {string | undefined}
     */
    directory(): string | undefined;
    /**
     * Saves the file to the Parse cloud.
     *
     * In Node.js, files created with Buffer or ReadableStream are uploaded as
     * raw binary data, avoiding base64 encoding overhead. If metadata
     * or tags are set on a Buffer-backed file, the upload falls back to base64
     * JSON encoding. Stream-backed files support metadata, tags, and directory
     * when Parse Server >= 9.5.0.
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *     behalf of a specific user.
     *   <li>progress: callback for upload progress. For example:
     * <pre>
     * let parseFile = new Parse.File(name, file);
     * parseFile.save({
     *   progress: (progressValue, loaded, total) => {
     *     if (progressValue !== null) {
     *       // Update the UI using progressValue
     *     }
     *   }
     * });
     * </pre>
     *   <li>maxUploadSize: Overrides the server's maxUploadSize for this upload.
     *     Requires the master key. Only supported for Buffer and Stream source
     *     types; files created from base64 strings, number arrays, Blobs, or URIs
     *     do not support this option. Requires Parse Server >= 9.5.0.
     * </ul>
     * @returns {Promise | undefined} Promise that is resolved when the save finishes.
     */
    save(options?: FileSaveOptions & {
        requestTask?: any;
    }): Promise<ParseFile> | undefined;
    /**
     * Aborts the request if it has already been sent.
     */
    cancel(): void;
    /**
     * Deletes the file from the Parse cloud.
     * In Cloud Code and Node only with Master Key.
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     * <pre>
     * @returns {Promise} Promise that is resolved when the delete finishes.
     */
    destroy(options?: FullOptions): Promise<this>;
    toJSON(): {
        __type: 'File';
        name?: string;
        url?: string;
    };
    equals(other: any): boolean;
    /**
     * Sets metadata to be saved with file object. Overwrites existing metadata.
     * When used with a stream-based file, requires Parse Server >= 9.5.0.
     *
     * @param {object} metadata Key value pairs to be stored with file object
     */
    setMetadata(metadata: Record<string, any>): void;
    /**
     * Sets metadata to be saved with file object. Adds to existing metadata.
     * When used with a stream-based file, requires Parse Server >= 9.5.0.
     *
     * @param {string} key key to store the metadata
     * @param {*} value metadata
     */
    addMetadata(key: string, value: any): void;
    /**
     * Sets tags to be saved with file object. Overwrites existing tags.
     * When used with a stream-based file, requires Parse Server >= 9.5.0.
     *
     * @param {object} tags Key value pairs to be stored with file object
     */
    setTags(tags: Record<string, any>): void;
    /**
     * Sets tags to be saved with file object. Adds to existing tags.
     * When used with a stream-based file, requires Parse Server >= 9.5.0.
     *
     * @param {string} key key to store tags
     * @param {*} value tag
     */
    addTag(key: string, value: string): void;
    /**
     * Sets the directory where the file will be stored.
     * Requires the Master Key when saving.
     * Requires Parse Server >= 9.4.0; when used with a stream-based file, requires Parse Server >= 9.5.0.
     *
     * @param {string} directory the directory path
     */
    setDirectory(directory: string): void;
    static fromJSON(obj: any): ParseFile;
    static encodeBase64(bytes: number[] | Uint8Array): string;
}
export default ParseFile;
