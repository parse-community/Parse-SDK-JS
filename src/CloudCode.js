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
 * @param {Function} func The function to run after a delete. This function should take just one parameter, {@link Parse.Cloud.AfterDeleteRequest}.
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
 * @param {Function} func The function to run after a save. This function should take just one parameter, {@link Parse.Cloud.AfterDeleteRequest}.
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
 * @param {Function} func The function to run before a delete. This function should take two parameters a {@link Parse.Cloud.BeforeDeleteRequest} and a {@link Parse.Cloud.BeforeDeleteResponse}.
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
 * @param {Function} func The function to run before a save. This function should take two parameters a {@link Parse.Cloud.BeforeSaveRequest} and a {@link Parse.Cloud.BeforeSaveResponse}.
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
 * @return {Parse.Promise} A promise that will be resolved with a {@link Parse.Cloud.HTTPResponse} object when the request completes.
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
