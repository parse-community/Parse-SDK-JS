/**
 * Defines a Cloud Function.
 *
 * **Available in Cloud Code only.**
 *
 * @method define
 * @name Parse.Cloud.define
 * @param {String} name The name of the Cloud Function
 * @param {Function} data The Cloud Function to register. This function should take two parameters a {@link Parse.Cloud.FunctionRequest} and a {@link Parse.Cloud.FunctionResponse}
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
 * @method afterDelete
 * @name Parse.Cloud.afterDelete
 * @param {(String|Parse.Object)} arg1 The Parse.Object subclass to register the after delete function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run after a delete. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
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
 * @method afterSave
 * @name Parse.Cloud.afterSave
 * @param {(String|Parse.Object)} arg1 The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run after a save. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
 */

/**
 * Registers an before delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.beforeDelete('MyCustomClass', (request, response) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeDelete(Parse.User, (request, response) => {
 *   // code here
 * })
 *```
 *
 * @method beforeDelete
 * @name Parse.Cloud.beforeDelete
 * @param {(String|Parse.Object)} arg1 The Parse.Object subclass to register the before delete function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run before a delete. This function should take two parameters a {@link Parse.Cloud.TriggerRequest} and a {@link Parse.Cloud.BeforeDeleteResponse}.
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
 * Parse.Cloud.beforeSave('MyCustomClass', (request, response) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeSave(Parse.User, (request, response) => {
 *   // code here
 * })
 * ```
 *
 * @method beforeSave
 * @name Parse.Cloud.beforeSave
 * @param {(String|Parse.Object)} arg1 The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run before a save. This function should take two parameters a {@link Parse.Cloud.TriggerRequest} and a {@link Parse.Cloud.BeforeSaveResponse}.
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
 *   url: 'http://www.parse.com/'
 * }).then(function(httpResponse) {
 *   // success
 *   console.log(httpResponse.text);
 * },function(httpResponse) {
 *   // error
 *   console.error('Request failed with response code ' + httpResponse.status);
 * });
 * ```
 *
 * @method httpRequest
 * @name Parse.Cloud.httpRequest
 * @param {Parse.Cloud.HTTPOptions} options The Parse.Cloud.HTTPOptions object that makes the request.
 * @return {Promise<Parse.Cloud.HTTPResponse>} A promise that will be resolved with a {@link Parse.Cloud.HTTPResponse} object when the request completes.
 */

/**
 * Defines a Background Job.
 *
 * **Available in Cloud Code only.**
 *
 * @method job
 * @name Parse.Cloud.job
 * @param {String} name The name of the Background Job
 * @param {Function} func The Background Job to register. This function should take two parameters a {@link Parse.Cloud.JobRequest} and a {@link Parse.Cloud.JobStatus}
 *
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
 */

/**
 * @typedef Parse.Cloud.FunctionRequest
 * @property {String} installationId If set, the installationId triggering the request.
 * @property {Boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Object} params The params passed to the cloud function.
 */

/**
 * @typedef Parse.Cloud.JobRequest
 * @property {Object} params The params passed to the background job.
 */

/**
 * @typedef Parse.Cloud.JobStatus
 * @property {function} error If error is called, will end the job unsuccessfully with an optional completion message to be stored in the job status.
 * @property {function} message If message is called with a string argument, will update the current message to be stored in the job status.
 * @property {function} success If success is called, will end the job successfullly with the optional completion message to be stored in the job status.
 */

/**
 * @typedef Parse.Cloud.BeforeSaveResponse
 * @property {function} success If called, will allow the save to happen. If a Parse.Object is passed in, then the passed in object will be saved instead.
 * @property {function} error If called, will reject the save. An optional error message may be passed in.
 */

/**
 * @typedef Parse.Cloud.BeforeDeleteResponse
 * @property {function} success If called, will allow the delete to happen.
 * @property {function} error If called, will reject the save. An optional error message may be passed in.
 */

/**
 * @typedef Parse.Cloud.FunctionResponse
 * @property {function} success If success is called, will return a successful response with the optional argument to the caller.
 * @property {function} error If error is called, will return an error response with an optionally passed message.
 */

/**
 * @typedef Parse.Cloud.HTTPOptions
 * @property {String|Object} body The body of the request. If it is a JSON object, then the Content-Type set in the headers must be application/x-www-form-urlencoded or application/json. You can also set this to a {@link Buffer} object to send raw bytes. If you use a Buffer, you should also set the Content-Type header explicitly to describe what these bytes represent.
 * @property {function} error The function that is called when the request fails. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {Boolean} followRedirects Whether to follow redirects caused by HTTP 3xx responses. Defaults to false.
 * @property {Object} headers The headers for the request.
 * @property {String} method The method of the request. GET, POST, PUT, DELETE, HEAD, and OPTIONS are supported. Will default to GET if not specified.
 * @property {String|Object} params The query portion of the url. You can pass a JSON object of key value pairs like params: {q : 'Sean Plott'} or a raw string like params:q=Sean Plott.
 * @property {function} success The function that is called when the request successfully completes. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {string} url The url to send the request to.
 */

/**
 * @typedef Parse.Cloud.HTTPResponse
 * @property {Buffer} buffer The raw byte representation of the response body. Use this to receive binary data. See Buffer for more details.
 * @property {Object} cookies The cookies sent by the server. The keys in this object are the names of the cookies. The values are Parse.Cloud.Cookie objects.
 * @property {Object} data The parsed response body as a JavaScript object. This is only available when the response Content-Type is application/x-www-form-urlencoded or application/json.
 * @property {Object} headers The headers sent by the server. The keys in this object are the names of the headers. We do not support multiple response headers with the same name. In the common case of Set-Cookie headers, please use the cookies field instead.
 * @property {Number} status The status code.
 * @property {String} text The raw text representation of the response body.
 */
"use strict";