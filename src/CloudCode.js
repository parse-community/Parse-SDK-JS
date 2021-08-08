/**
 * Defines a Cloud Function.
 *
 * **Available in Cloud Code only.**
 *
 * @function define
 * @name Parse.Cloud.define
 * @template T extends ((param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] })  => any & (() => any))
 * @param {String} name The name of the Cloud Function
 * @param {Parse.Cloud.FunctionRequestFunc<T>} func The Cloud Function to register
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FunctionRequestFunc<T>} [validator] An optional function to help validating cloud code.
 */

/**
 * Registers an after delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.afterDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.afterDelete(Parse.User, (request) => {
 *   // code here
 * })
 *```
 *
 * @function afterDelete
 * @name Parse.Cloud.afterDelete
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the after delete function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run after a delete.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.TriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 *
 * Registers an after save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.afterSave('MyCustomClass', function(request) {
 *   // code here
 * })
 *
 * Parse.Cloud.afterSave(Parse.User, function(request) {
 *   // code here
 * })
 * ```
 *
 * @function afterSave
 * @name Parse.Cloud.afterSave
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run after a save.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.TriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 * Registers a before find function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeFind for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.beforeFind('MyCustomClass', async (request) => {
 *   // code here
 * }, (request) => {
 *   // validation code here
 * });
 *
 * Parse.Cloud.beforeFind(Parse.User, async (request) => {
 *   // code here
 * }, { ...validationObject });
 *```
 *
 * @function beforeFind
 * @name Parse.Cloud.beforeFind
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the before find function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.BeforeFindRequestFunc} func The function to run before a find.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.BeforeFindRequestFunc} [validator] An optional function to help validating cloud code.
 */

 /**
 * Registers an after find function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterFind for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.afterFind('MyCustomClass', async (request) => {
 *   // code here
 * }, (request) => {
 *   // validation code here
 * });
 *
 * Parse.Cloud.afterFind(Parse.User, async (request) => {
 *   // code here
 * }, { ...validationObject });
 *```
 *
 * @function afterFind
 * @name Parse.Cloud.afterFind
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the after find function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.AfterFindRequestFunc} func The function to run before a find.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.AfterFindRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 * Registers an before delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.beforeDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeDelete(Parse.User, (request) => {
 *   // code here
 * })
 *```
 *
 * @function beforeDelete
 * @name Parse.Cloud.beforeDelete
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the before delete function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run before a delete.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.TriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 *
 * Registers the before login function.
 *
 * **Available in Cloud Code only.**
 *
 * This function provides further control
 * in validating a login attempt. Specifically,
 * it is triggered after a user enters
 * correct credentials (or other valid authData),
 * but prior to a session being generated.
 *
 * ```
 * Parse.Cloud.beforeLogin((request) => {
 *   // code here
 * })
 *
 * ```
 *
 * @function beforeLogin
 * @name Parse.Cloud.beforeLogin
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run before a login.
 */

/**
 *
 * Registers the after login function.
 *
 * **Available in Cloud Code only.**
 *
 * This function is triggered after a user logs in successfully,
 * and after a _Session object has been created.
 *
 * ```
 * Parse.Cloud.afterLogin((request) => {
 *   // code here
 * });
 * ```
 *
 * @function afterLogin
 * @name Parse.Cloud.afterLogin
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run after a login.
 */

/**
 *
 * Registers the after logout function.
 *
 * **Available in Cloud Code only.**
 *
 * This function is triggered after a user logs out.
 *
 * ```
 * Parse.Cloud.afterLogout((request) => {
 *   // code here
 * });
 * ```
 *
 * @method afterLogout
 * @name Parse.Cloud.afterLogout
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run after a logout.
 */

/**
 *
 * Registers an before save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.beforeSave('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeSave(Parse.User, (request) => {
 *   // code here
 * })
 * ```
 *
 * @function beforeSave
 * @name Parse.Cloud.beforeSave
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.TriggerRequestFunc} func The function to run before a save.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.TriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 *
 * Registers an before save file function. A new Parse.File can be returned to override the file that gets saved.
 * If you want to replace the rquesting Parse.File with a Parse.File that is already saved, simply return the already saved Parse.File.
 * You can also add metadata to the file that will be stored via whatever file storage solution you're using.
 *
 * **Available in Cloud Code only.**
 *
 * Example: Adding metadata and tags
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   file.addMetadata('foo', 'bar');
 *   file.addTag('createdBy', user.id);
 * });
 *
 * ```
 *
 * Example: replacing file with an already saved file
 *
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   return user.get('avatar');
 * });
 *
 * ```
 *
 * Example: replacing file with a different file
 *
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   const metadata = { foo: 'bar' };
 *   const tags = { createdBy: user.id };
 *   const newFile = new Parse.File(file.name(), <some other file data>, 'text/plain', metadata, tags);
 *   return newFile;
 * });
 *
 * ```
 *
 * @function beforeSaveFile
 * @name Parse.Cloud.beforeSaveFile
 * @param {Parse.Cloud.FileTriggerRequestFunc} func The function to run before saving a file.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FileTriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 *
 * Registers an after save file function.
 *
 * **Available in Cloud Code only.**
 *
 * Example: creating a new object that references this file in a separate collection
 * ```
 * Parse.Cloud.afterSaveFile(async ({ file, user }) => {
 *   const fileObject = new Parse.Object('FileObject');
 *   fileObject.set('metadata', file.metadata());
 *   fileObject.set('tags', file.tags());
 *   fileObject.set('name', file.name());
 *   fileObject.set('createdBy', user);
 *   await fileObject.save({ sessionToken: user.getSessionToken() });
 * });
 *
 * @function afterSaveFile
 * @name Parse.Cloud.afterSaveFile
 * @param {Parse.Cloud.FileTriggerRequestFunc} func The function to run after saving a file.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FileTriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 * Registers a before delete file function.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.beforeDeleteFile(async (request) => {
 *   // code here
 * }, (request) => {
 *   // validation code here
 * });
 *
 * Parse.Cloud.beforeDeleteFile(async (request) => {
 *   // code here
 * }, { ...validationObject });
 *```
 *
 * @method beforeDeleteFile
 * @name Parse.Cloud.beforeDeleteFile
 * @param {Parse.Cloud.FileTriggerRequestFunc} func The function to run before deleting a file.
 * @param {(Parse.Cloud.ValidatorObject|Parse.Cloud.FileTriggerRequestFunc)} [validator] An optional function to help validating cloud code.
 */

/**
 * Registers an after delete file function.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.afterDeleteFile(async (request) => {
 *   // code here
 * }, (request) => {
 *   // validation code here
 * });
 *
 * Parse.Cloud.afterDeleteFile(async (request) => {
 *   // code here
 * }, { ...validationObject });
 *```
 *
 * @method afterDeleteFile
 * @name Parse.Cloud.afterDeleteFile
 * @param {Parse.Cloud.FileTriggerRequestFunc} func The function to after before deleting a file.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FileTriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */

/**
 * @function beforeConnect
 * @name Parse.Cloud.beforeConnect
 * @param {Parse.Cloud.ConnectTriggerRequestFunc} func The function to before connection is made.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.ConnectTriggerRequestFunc} [validator] An optional function to help validating cloud code.
 */
/**
 *
 * Registers a before connect function.
 *
 * **Available in Cloud Code only.**
 *
 * Example: restrict LiveQueries to logged in users.
 * ```
 * Parse.Cloud.beforeConnect((request) => {
 *   if (!request.user) {
 *     throw "Please login before you attempt to connect."
 *   }
 * });
 * ```
 */

/**
 * Sends an email through the Parse Server mail adapter.
 *
 * **Available in Cloud Code only.**
 * **Requires a mail adapter to be configured for Parse Server.**
 *
 * ```
 * Parse.Cloud.sendEmail({
 *   from: 'Example <test@example.com>',
 *   to: 'contact@example.com',
 *   subject: 'Test email',
 *   text: 'This email is a test.'
 * });
 *```
 *
 * @method sendEmail
 * @name Parse.Cloud.sendEmail
 * @param {Object} data The object of the mail data to send.
 */

/**
 *
 * Registers a before subscribe function.
 *
 * **Available in Cloud Code only.**
 * Example: restrict subscriptions to MyObject to Admin accounts only.
 * ```
 *  Parse.Cloud.beforeSubscribe('MyObject', (request) => {
 *   if (!request.user.get('Admin')) {
 *       throw new Parse.Error(101, 'You are not authorized to subscribe to MyObject.');
 *   }
 *   let query = request.query; // the Parse.Query
 *   query.select("name","year")
 * });
 * ```
 *
 * @function beforeSubscribe
 * @name Parse.Cloud.beforeSubscribe
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the before subscription function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.TriggerRequest} func The function to run before a subscription.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.TriggerRequest} [validator] An optional function to help validating cloud code.
 *
 */

/**
 * Registers an after live query server event function.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.afterLiveQueryEvent('MyCustomClass', (request) => {
 *   // code here
 * }, (request) => {
 *   // validation code here
 * });
 *
 * Parse.Cloud.afterLiveQueryEvent('MyCustomClass', (request) => {
 *   // code here
 * }, { ...validationObject });
 *```
 *
 * @method afterLiveQueryEvent
 * @name Parse.Cloud.afterLiveQueryEvent
 * @param {(String|Parse.Object)} ParseClass The Parse.Object subclass to register the after live query event function for. This can instead be a String that is the className of the subclass.
 * @param {Parse.Cloud.LiveQueryEventTrigger} func The function to run after a live query event.
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.LiveQueryEventTrigger} [validator] An optional function to help validating cloud code.
 */

/**
 * Makes an HTTP Request.
 *
 * **Available in Cloud Code only.**
 *
 * By default, Parse.Cloud.httpRequest does not follow redirects caused by HTTP 3xx response codes. You can use the followRedirects option in the {@link Parse.Cloud.HTTPOptions} object to change this behavior.
 *
 * Sample request:
 * ```
 * Parse.Cloud.httpRequest({
 *   url: 'http://www.example.com/'
 * }).then(function(httpResponse) {
 *   // success
 *   console.log(httpResponse.text);
 * },function(httpResponse) {
 *   // error
 *   console.error('Request failed with response code ' + httpResponse.status);
 * });
 * ```
 *
 * @function httpRequest
 * @name Parse.Cloud.httpRequest
 * @param {Parse.Cloud.HTTPOptions} options The Parse.Cloud.HTTPOptions object that makes the request.
 * @returns {Promise<Parse.Cloud.HTTPResponse>} A promise that will be resolved with a {@link Parse.Cloud.HTTPResponse} object when the request completes.
 */

/**
 * Defines a Background Job.
 *
 * **Available in Cloud Code only.**
 *
 * @function job
 * @name Parse.Cloud.job
 * @param {string} name The name of the Background Job
 * @param {Parse.Cloud.JobRequestFunc} func The Background Job to register.
 *
 */

/**
 * @callback Parse.Cloud.TriggerRequestFunc
 * @param {Parse.Cloud.TriggerRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.TriggerRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.Object} object The object triggering the hook.
 * @property {String} ip The IP address of the client making the request.
 * @property {Object} headers The original HTTP headers for the request.
 * @property {String} triggerName The name of the trigger (`beforeSave`, `afterSave`, ...)
 * @property {Object} log The current logger inside Parse Server.
 * @property {Parse.Object} original If set, the object, as currently stored.
 * @property {Object.<string,Object>} context If set, the context of the request
 */

/**
 * @callback Parse.Cloud.FileTriggerRequestFunc
 * @param {Parse.Cloud.FileTriggerRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.FileTriggerRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.File} file The file that triggered the hook.
 * @property {number} fileSize The size of the file in bytes.
 * @property {number} contentLength The value from Content-Length header
 * @property {String} ip The IP address of the client making the request.
 * @property {Object} headers The original HTTP headers for the request.
 * @property {String} triggerName The name of the trigger (`beforeSaveFile`, `afterSaveFile`)
 * @property {Object} log The current logger inside Parse Server.
 */

/**
 * @callback Parse.Cloud.ConnectTriggerRequestFunc
 * @param {Parse.Cloud.ConnectTriggerRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.ConnectTriggerRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} useMasterKey If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {number} clients The number of clients connected.
 * @property {number} subscriptions The number of subscriptions connected.
 * @property {String} sessionToken If set, the session of the user that made the request.
 */

/**
 * @typedef Parse.Cloud.FunctionRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {object} params The params passed to the cloud function.
 */

/**
 * @callback Parse.Cloud.LiveQueryEventTriggerFunc
 * @param {Parse.Cloud.LiveQueryEventTrigger} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.LiveQueryEventTrigger
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} useMasterKey If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {String} sessionToken If set, the session of the user that made the request.
 * @property {String} event The live query event that triggered the request.
 * @property {Parse.Object} object The object triggering the hook.
 * @property {Parse.Object} original If set, the object, as currently stored.
 * @property {Integer} clients The number of clients connected.
 * @property {Integer} subscriptions The number of subscriptions connected.
 * @property {Boolean} sendEvent If the LiveQuery event should be sent to the client. Set to false to prevent LiveQuery from pushing to the client.
 */

/**
 * @callback Parse.Cloud.BeforeFindRequestFunc
 * @param {Parse.Cloud.BeforeFindRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.BeforeFindRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.Query} query The query triggering the hook.
 * @property {String} ip The IP address of the client making the request.
 * @property {Object} headers The original HTTP headers for the request.
 * @property {String} triggerName The name of the trigger (`beforeSave`, `afterSave`, ...)
 * @property {Object} log The current logger inside Parse Server.
 * @property {Boolean} isGet whether the query a `get` or a `find`
 * @property {Boolean} count whether the query a `get` or a `find`
 * @property {Parse.Cloud.ReadPreferenceOption} readPreference read preferences of the query
 */

/**
 * @static
 * @name Parse.Cloud.ReadPreferenceOption
 * @property {String} Primary Primary read preference option
 * @property {String} PrimaryPreferred Prefer primary
 * @property {String} Secondary Secondary read preference option
 * @property {String} SecondaryPreferred Prefer secondary
 * @property {String} Nearest Nearest read preference option
 */

/**
 * @callback Parse.Cloud.AfterFindRequestFunc
 * @param {Parse.Cloud.AfterFindRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.AfterFindRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.Query} query The query triggering the hook.
 * @property {Array<Parse.Object>} results The results the query yielded.
 * @property {String} ip The IP address of the client making the request.
 * @property {Object} headers The original HTTP headers for the request.
 * @property {String} triggerName The name of the trigger (`beforeSave`, `afterSave`, ...)
 * @property {Object} log The current logger inside Parse Server.
 */

/**
 * @callback Parse.Cloud.FunctionRequestFunc<T>
 * @param {Parse.Cloud.FunctionRequest} request The request object
 * @return {ReturnType<T>}
 */

/**
 * @typedef Parse.Cloud.FunctionRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Object.<string,Object>} params The params passed to the cloud function.
 * @property {Object} log The current logger inside Parse Server.
 */

/**
 * @callback Parse.Cloud.JobRequestFunc
 * @param {Parse.Cloud.JobRequest} request The request object
 * @return {Any}
 */

/**
 * @typedef Parse.Cloud.JobRequest
 * @property {Object.<string,Object>} params The params passed to the background job.
 * @property {Function} [error] If error is called, will end the job unsuccessfully with an optional completion message to be stored in the job status.
 * @property {Function} [message] If message is called with a string argument, will update the current message to be stored in the job status.
 * @property {Function} [success] If success is called, will end the job successfullly with the optional completion message to be stored in the job status.
 */

/**
 * @callback Parse.Cloud.JobRequestMessage
 * @param {string} message The request object
 */

/**
 * @typedef Parse.Cloud.ValidatorObject
 * @property {Boolean} requireUser whether the cloud trigger requires a user.
 * @property {Boolean} requireMaster whether the cloud trigger requires a master key.
 * @property {Boolean} validateMasterKey whether the validator should run if masterKey is provided. Defaults to false.
 * @property {Boolean} skipWithMasterKey whether the cloud code function should be ignored using a masterKey.
 * @property {Array<String>|function}requireAnyUserRoles If set, request.user has to be part of at least one roles name to make the request. If set to a function, function must return role names.
 * @property {Array<String>|function}requireAllUserRoles If set, request.user has to be part all roles name to make the request. If set to a function, function must return role names.
 * @property {Object.<string, Parse.Cloud.ValidatorObjectFieldOptions>|Array<String>} requireUserKeys If set, keys required on request.user to make the request.
 * @property {Object.<string, Parse.Cloud.ValidatorObjectFieldOptions>|Array<String>} fields if an array of strings, validator will look for keys in request.params, and throw if not provided. If Object, fields to validate. If the trigger is a cloud function, `request.params` will be validated, otherwise `request.object`.
 */

/**
 * @typedef Parse.Cloud.ValidatorObjectFieldOptions
 * @property {Any} type expected type of data for field.
 * @property {Boolean} constant whether the field can be modified on the object.
 * @property {Any} default default value if field is `null`, or initial value `constant` is `true`.
 * @property {Array|function|Any} options array of options that the field can be, function to validate field, or single value. Throw an error if value is invalid.
 * @property {String} error custom error message if field is invalid.
 */

/**
 * @typedef Parse.Cloud.HTTPOptions
 * @property {string | object} body The body of the request. If it is a JSON object, then the Content-Type set in the headers must be application/x-www-form-urlencoded or application/json. You can also set this to a {@link Buffer} object to send raw bytes. If you use a Buffer, you should also set the Content-Type header explicitly to describe what these bytes represent.
 * @property {Function} error The function that is called when the request fails. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {boolean} followRedirects Whether to follow redirects caused by HTTP 3xx responses. Defaults to false.
 * @property {object} headers The headers for the request.
 * @property {string} method The method of the request. GET, POST, PUT, DELETE, HEAD, and OPTIONS are supported. Will default to GET if not specified.
 * @property {string | object} params The query portion of the url. You can pass a JSON object of key value pairs like params: {q : 'Sean Plott'} or a raw string like params:q=Sean Plott.
 * @property {Function} success The function that is called when the request successfully completes. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {string} url The url to send the request to.
 */

/**
 * @typedef Parse.Cloud.HTTPResponse
 * @property {Buffer} buffer The raw byte representation of the response body. Use this to receive binary data. See Buffer for more details.
 * @property {object} cookies The cookies sent by the server. The keys in this object are the names of the cookies. The values are Parse.Cloud.Cookie objects.
 * @property {object} data The parsed response body as a JavaScript object. This is only available when the response Content-Type is application/x-www-form-urlencoded or application/json.
 * @property {object} headers The headers sent by the server. The keys in this object are the names of the headers. We do not support multiple response headers with the same name. In the common case of Set-Cookie headers, please use the cookies field instead.
 * @property {number} status The status code.
 * @property {string} text The raw text representation of the response body.
 */
