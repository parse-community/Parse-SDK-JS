/* <types> */
/**
 * Typescript Generic variation of Parse.Cloud.run
 *
 * @function run
 * @variation 2
 * @name Parse.Cloud.run
 * @template T extends () => any
 * @param {string} name The function name.
 * @param {object} [data] The parameters to send to the cloud function.
 * @param {object} [options]
 * @returns {Promise<ReturnType<T>>} A promise that will be resolved with the result
 * of the function.
 */

/**
 * Typescript Generic variation of Parse.Cloud.run
 *
 * @function run
 * @variation 3
 * @name Parse.Cloud.run
 * @template T extends (param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] }) => any, Params = Parameters<T>[0]
 * @param {string} name The function name.
 * @param {Params} [data] The parameters to send to the cloud function.
 * @param {object} [options]
 * @returns {Promise<ReturnType<T>>} A promise that will be resolved with the result
 * of the function.
 */

/**
 * Typescript Generic variation of defining a Cloud Function
 *
 * @function define
 * @name Parse.Cloud.define
 * @variation 2
 * @template T extends () => any
 * @param {string} name The name of the Cloud Function
 * @param {Parse.Cloud.FunctionRequestFuncGeneric1<T>} func The Cloud Function to register
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FunctionRequestFunc} [validator] An optional function to help validating cloud code.
 * @returns {void}
 */

/**
 * Typescript Generic variation of defining a Cloud Function
 *
 * @function define
 * @name Parse.Cloud.define
 * @variation 3
 * @template T extends (param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] }) => any
 * @param {string} name The name of the Cloud Function
 * @param {Parse.Cloud.FunctionRequestFuncGeneric2<T>} func The Cloud Function to register
 * @param {Parse.Cloud.ValidatorObject|Parse.Cloud.FunctionRequestFunc} [validator] An optional function to help validating cloud code.
 * @returns {void}
 */

/**
 * @callback Parse.Cloud.FunctionRequestFuncGeneric1
 * @param {Parse.Cloud.FunctionRequest} request The request object
 * @template T extends (...args: any) => any
 * @returns {Promise<ReturnType<T>> | ReturnType<T>}
 */

/**
 * @callback Parse.Cloud.FunctionRequestFuncGeneric2
 * @param {Parse.Cloud.FunctionRequestGeneric<Params>} request The request object
 * @template T extends (...args: any) => any, Params = Parameters<T>[0]
 * @returns {Promise<ReturnType<T>> | ReturnType<T>}
 */

/**
 * @typedef Parse.Cloud.FunctionRequestGeneric
 * @template T
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {T} params The params passed to the cloud function.
 * @property {object} log The current logger inside Parse Server.
 */
/* </types> */
