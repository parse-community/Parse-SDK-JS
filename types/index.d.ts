declare namespace Parse {
    /**
     * <p>Parse.Analytics provides an interface to Parse's logging and analytics
     * backend.</p>
     */
    class Analytics {
        /**
         * <p>Tracks the occurrence of a custom event with additional dimensions.
         * Parse will store a data point at the time of invocation with the given
         * event name.</p>
         * <p>Dimensions will allow segmentation of the occurrences of this custom
         * event. Keys and values should be {@code String}s, and will throw
         * otherwise.</p>
         * <p>To track a user signup along with additional metadata, consider the
         * following:</p>
         * <pre>
         * var dimensions = {
         *  gender: 'm',
         *  source: 'web',
         *  dayType: 'weekend'
         * };
         * Parse.Analytics.track('signup', dimensions);
         * </pre>
         * <p>There is a default limit of 8 dimensions per event tracked.</p>
         * @param name - <p>The name of the custom event to report to Parse as
         * having happened.</p>
         * @param dimensions - <p>The dictionary of information by which to
         * segment this event.</p>
         * @returns <p>A promise that is resolved when the round-trip
         * to the server completes.</p>
         */
        static track(name: string, dimensions: any): Promise<any>;
    }
    /**
     * <p>Provides utility functions for working with Anonymously logged-in users. <br />
     * Anonymous users have some unique characteristics:</p>
     * <ul>
     *  <li>Anonymous users don't need a user name or password.</li>
     *  <ul>
     *    <li>Once logged out, an anonymous user cannot be recovered.</li>
     *  </ul>
     *  <li>signUp converts an anonymous user to a standard user with the given username and password.</li>
     *  <ul>
     *    <li>Data associated with the anonymous user is retained.</li>
     *  </ul>
     *  <li>logIn switches users without converting the anonymous user.</li>
     *  <ul>
     *    <li>Data associated with the anonymous user will be lost.</li>
     *  </ul>
     *  <li>Service logIn (e.g. Facebook, Twitter) will attempt to convert
     *  the anonymous user into a standard user by linking it to the service.</li>
     *  <ul>
     *    <li>If a user already exists that is linked to the service, it will instead switch to the existing user.</li>
     *  </ul>
     *  <li>Service linking (e.g. Facebook, Twitter) will convert the anonymous user
     *  into a standard user by linking it to the service.</li>
     * </ul>
     */
    class AnonymousUtils {
        /**
         * <p>Gets whether the user has their account linked to anonymous user.</p>
         * @param user - <p>User to check for.
         * The user must be logged in on this device.</p>
         * @returns <p><code>true</code> if the user has their account
         * linked to an anonymous user.</p>
         */
        static isLinked(user: Parse.User): boolean;
        /**
         * <p>Logs in a user Anonymously.</p>
         * @param options - <p>MasterKey / SessionToken.</p>
         * @returns <p>Logged in user</p>
         */
        static logIn(options: any): Promise<Parse.User>;
        /**
         * <p>Links Anonymous User to an existing PFUser.</p>
         * @param user - <p>User to link. This must be the current user.</p>
         * @param options - <p>MasterKey / SessionToken.</p>
         * @returns <p>Linked with User</p>
         */
        static link(user: Parse.User, options: any): Promise<Parse.User>;
        /**
         * <p>Returns true if Authentication Provider has been registered for use.</p>
         */
        static isRegistered(): boolean;
    }
    /**
     * <p>Contains functions for calling and declaring
     * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.</p>
     * <p><strong><em>
     *   Some functions are only available from Cloud Code.
     * </em></strong></p>
     */
    class Cloud {
        /**
         * <p>Makes a call to a cloud function.</p>
         * @param name - <p>The function name.</p>
         * @param [data] - <p>The parameters to send to the cloud function.</p>
         * @returns <p>A promise that will be resolved with the result
         * of the function.</p>
         */
        static run(name: string, data?: any, options?: any): Promise<any>;
        /**
         * <p>Gets data for the current set of cloud jobs.</p>
         * @returns <p>A promise that will be resolved with the result
         * of the function.</p>
         */
        static getJobsData(): Promise<object>;
        /**
         * <p>Starts a given cloud job, which will process asynchronously.</p>
         * @param name - <p>The function name.</p>
         * @param data - <p>The parameters to send to the cloud function.</p>
         * @returns <p>A promise that will be resolved with the jobStatusId
         * of the job.</p>
         */
        static startJob(name: string, data: any): Promise<string>;
        /**
         * <p>Gets job status by Id</p>
         * @param jobStatusId - <p>The Id of Job Status.</p>
         * @returns <p>Status of Job.</p>
         */
        static getJobStatus(jobStatusId: string): Promise<Parse.Object>;
        /**
         * <p>Defines a Cloud Function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * @param name - <p>The name of the Cloud Function</p>
         * @param func - <p>The Cloud Function to register</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static define(name: string, func: Parse.Cloud.FunctionRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FunctionRequestFunc): void;
        /**
         * <p>Registers an after delete function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use afterDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterDelete('MyCustomClass', (request) => {
         *   // code here
         * })
         *
         * Parse.Cloud.afterDelete(Parse.User, (request) => {
         *   // code here
         * })
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the after delete function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run after a delete.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterDelete(ParseClass: string | Parse.Object, func: Parse.Cloud.TriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers an after save function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use afterSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterSave('MyCustomClass', function(request) {
         *   // code here
         * })
         *
         * Parse.Cloud.afterSave(Parse.User, function(request) {
         *   // code here
         * })
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run after a save.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterSave(ParseClass: string | Parse.Object, func: Parse.Cloud.TriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers a before find function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use beforeFind for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeFind('MyCustomClass', async (request) => {
         *   // code here
         * }, (request) => {
         *   // validation code here
         * });
         *
         * Parse.Cloud.beforeFind(Parse.User, async (request) => {
         *   // code here
         * }, { ...validationObject });
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the before find function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run before a find.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeFind(ParseClass: string | Parse.Object, func: Parse.Cloud.BeforeFindRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.BeforeFindRequestFunc): void;
        /**
         * <p>Registers an after find function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use afterFind for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterFind('MyCustomClass', async (request) => {
         *   // code here
         * }, (request) => {
         *   // validation code here
         * });
         *
         * Parse.Cloud.afterFind(Parse.User, async (request) => {
         *   // code here
         * }, { ...validationObject });
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the after find function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run before a find.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterFind(ParseClass: string | Parse.Object, func: Parse.Cloud.AfterFindRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.AfterFindRequestFunc): void;
        /**
         * <p>Registers an before delete function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use beforeDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeDelete('MyCustomClass', (request) => {
         *   // code here
         * })
         *
         * Parse.Cloud.beforeDelete(Parse.User, (request) => {
         *   // code here
         * })
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the before delete function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run before a delete.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeDelete(ParseClass: string | Parse.Object, func: Parse.Cloud.TriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers the before login function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>This function provides further control
         * in validating a login attempt. Specifically,
         * it is triggered after a user enters
         * correct credentials (or other valid authData),
         * but prior to a session being generated.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeLogin((request) => {
         *   // code here
         * })
         *
         * </code></pre>
         * @param func - <p>The function to run before a login.</p>
         */
        static beforeLogin(func: Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers the after login function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>This function is triggered after a user logs in successfully,
         * and after a _Session object has been created.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterLogin((request) => {
         *   // code here
         * });
         * </code></pre>
         * @param func - <p>The function to run after a login.</p>
         */
        static afterLogin(func: Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers the after logout function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>This function is triggered after a user logs out.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterLogout((request) => {
         *   // code here
         * });
         * </code></pre>
         * @param func - <p>The function to run after a logout.</p>
         */
        static afterLogout(func: Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers an before save function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>If you want to use beforeSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeSave('MyCustomClass', (request) => {
         *   // code here
         * })
         *
         * Parse.Cloud.beforeSave(Parse.User, (request) => {
         *   // code here
         * })
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run before a save.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeSave(ParseClass: string | Parse.Object, func: Parse.Cloud.TriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers an before save file function. A new Parse.File can be returned to override the file that gets saved.
         * If you want to replace the rquesting Parse.File with a Parse.File that is already saved, simply return the already saved Parse.File.
         * You can also add metadata to the file that will be stored via whatever file storage solution you're using.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>Example: Adding metadata and tags</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeSaveFile(({ file, user }) => {
         *   file.addMetadata('foo', 'bar');
         *   file.addTag('createdBy', user.id);
         * });
         *
         * </code></pre>
         * <p>Example: replacing file with an already saved file</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeSaveFile(({ file, user }) => {
         *   return user.get('avatar');
         * });
         *
         * </code></pre>
         * <p>Example: replacing file with a different file</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeSaveFile(({ file, user }) => {
         *   const metadata = { foo: 'bar' };
         *   const tags = { createdBy: user.id };
         *   const newFile = new Parse.File(file.name(), &lt;some other file data>, 'text/plain', metadata, tags);
         *   return newFile;
         * });
         *
         * </code></pre>
         * @param func - <p>The function to run before saving a file.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeSaveFile(func: Parse.Cloud.FileTriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FileTriggerRequestFunc): void;
        /**
         * <p>Registers an after save file function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>Example: creating a new object that references this file in a separate collection</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterSaveFile(async ({ file, user }) => {
         *   const fileObject = new Parse.Object('FileObject');
         *   fileObject.set('metadata', file.metadata());
         *   fileObject.set('tags', file.tags());
         *   fileObject.set('name', file.name());
         *   fileObject.set('createdBy', user);
         *   await fileObject.save({ sessionToken: user.getSessionToken() });
         * });</code></pre>
         * @param func - <p>The function to run after saving a file.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterSaveFile(func: Parse.Cloud.FileTriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FileTriggerRequestFunc): void;
        /**
         * <p>Registers a before delete file function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <pre class="prettyprint source"><code>Parse.Cloud.beforeDeleteFile(async (request) => {
         *   // code here
         * }, (request) => {
         *   // validation code here
         * });
         *
         * Parse.Cloud.beforeDeleteFile(async (request) => {
         *   // code here
         * }, { ...validationObject });
         * </code></pre>
         * @param func - <p>The function to run before deleting a file.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeDeleteFile(func: Parse.Cloud.FileTriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FileTriggerRequestFunc): void;
        /**
         * <p>Registers an after delete file function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterDeleteFile(async (request) => {
         *   // code here
         * }, (request) => {
         *   // validation code here
         * });
         *
         * Parse.Cloud.afterDeleteFile(async (request) => {
         *   // code here
         * }, { ...validationObject });
         * </code></pre>
         * @param func - <p>The function to after before deleting a file.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterDeleteFile(func: Parse.Cloud.FileTriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FileTriggerRequestFunc): void;
        /**
         * @param func - <p>The function to before connection is made.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeConnect(func: Parse.Cloud.ConnectTriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.ConnectTriggerRequestFunc): void;
        /**
         * <p>Sends an email through the Parse Server mail adapter.</p>
         * <p><strong>Available in Cloud Code only.</strong>
         * <strong>Requires a mail adapter to be configured for Parse Server.</strong></p>
         * <pre class="prettyprint source"><code>Parse.Cloud.sendEmail({
         *   from: 'Example &lt;test@example.com>',
         *   to: 'contact@example.com',
         *   subject: 'Test email',
         *   text: 'This email is a test.'
         * });
         * </code></pre>
         * @param data - <p>The object of the mail data to send.</p>
         */
        static sendEmail(data: any): void;
        /**
         * <p>Registers a before subscribe function.</p>
         * <p><strong>Available in Cloud Code only.</strong>
         * Example: restrict subscriptions to MyObject to Admin accounts only.</p>
         * <pre class="prettyprint source"><code> Parse.Cloud.beforeSubscribe('MyObject', (request) => {
         *   if (!request.user.get('Admin')) {
         *       throw new Parse.Error(101, 'You are not authorized to subscribe to MyObject.');
         *   }
         *   let query = request.query; // the Parse.Query
         *   query.select(&quot;name&quot;,&quot;year&quot;)
         * });
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the before subscription function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run before a subscription.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static beforeSubscribe(ParseClass: string | Parse.Object, func: Parse.Cloud.TriggerRequestFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.TriggerRequestFunc): void;
        /**
         * <p>Registers an after live query server event function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <pre class="prettyprint source"><code>Parse.Cloud.afterLiveQueryEvent('MyCustomClass', (request) => {
         *   // code here
         * }, (request) => {
         *   // validation code here
         * });
         *
         * Parse.Cloud.afterLiveQueryEvent('MyCustomClass', (request) => {
         *   // code here
         * }, { ...validationObject });
         * </code></pre>
         * @param ParseClass - <p>The Parse.Object subclass to register the after live query event function for. This can instead be a String that is the className of the subclass.</p>
         * @param func - <p>The function to run after a live query event.</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static afterLiveQueryEvent(ParseClass: string | Parse.Object, func: Parse.Cloud.LiveQueryEventTriggerFunc, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.LiveQueryEventTriggerFunc): void;
        /**
         * <p>Registers an on live query server event function.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <pre class="prettyprint source"><code>Parse.Cloud.onLiveQueryEvent((event) => {
         *   // code here
         * });
         *
         * </code></pre>
         * @param func - <p>The function to run on a live query event.</p>
         */
        static onLiveQueryEvent(func: Parse.Cloud.LiveQueryEventTriggerFunc): void;
        /**
         * <p>Makes an HTTP Request.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * <p>By default, Parse.Cloud.httpRequest does not follow redirects caused by HTTP 3xx response codes. You can use the followRedirects option in the {@link Parse.Cloud.HTTPOptions} object to change this behavior.</p>
         * <p>Sample request:</p>
         * <pre class="prettyprint source"><code>Parse.Cloud.httpRequest({
         *   url: 'http://www.example.com/'
         * }).then(function(httpResponse) {
         *   // success
         *   console.log(httpResponse.text);
         * },function(httpResponse) {
         *   // error
         *   console.error('Request failed with response code ' + httpResponse.status);
         * });
         * </code></pre>
         * @param options - <p>The Parse.Cloud.HTTPOptions object that makes the request.</p>
         * @returns <p>A promise that will be resolved with a {@link Parse.Cloud.HTTPResponse} object when the request completes.</p>
         */
        static httpRequest(options: Parse.Cloud.HTTPOptions): Promise<Parse.Cloud.HTTPResponse>;
        /**
         * <p>Defines a Background Job.</p>
         * <p><strong>Available in Cloud Code only.</strong></p>
         * @param name - <p>The name of the Background Job</p>
         * @param func - <p>The Background Job to register.</p>
         */
        static job(name: string, func: Parse.Cloud.JobRequestFunc): void;
        /**
         * @property Primary - <p>Primary read preference option</p>
         * @property PrimaryPreferred - <p>Prefer primary</p>
         * @property Secondary - <p>Secondary read preference option</p>
         * @property SecondaryPreferred - <p>Prefer secondary</p>
         * @property Nearest - <p>Nearest read preference option</p>
         */
        static ReadPreferenceOption: {
            Primary: string;
            PrimaryPreferred: string;
            Secondary: string;
            SecondaryPreferred: string;
            Nearest: string;
        };
        /**
         * <p>Typescript Generic variation of Parse.Cloud.run</p>
         * @param name - <p>The function name.</p>
         * @param [data] - <p>The parameters to send to the cloud function.</p>
         * @returns <p>A promise that will be resolved with the result
         * of the function.</p>
         */
        static run<T extends () => any>(name: string, data?: any, options?: any): Promise<ReturnType<T>>;
        /**
         * <p>Typescript Generic variation of Parse.Cloud.run</p>
         * @param name - <p>The function name.</p>
         * @param [data] - <p>The parameters to send to the cloud function.</p>
         * @returns <p>A promise that will be resolved with the result
         * of the function.</p>
         */
        static run<T extends (param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] }) => any, Params = Parameters<T>[0]>(name: string, data?: Params, options?: any): Promise<ReturnType<T>>;
        /**
         * <p>Typescript Generic variation of defining a Cloud Function</p>
         * @param name - <p>The name of the Cloud Function</p>
         * @param func - <p>The Cloud Function to register</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static define<T extends () => any>(name: string, func: Parse.Cloud.FunctionRequestFuncGeneric1<T>, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FunctionRequestFunc): void;
        /**
         * <p>Typescript Generic variation of defining a Cloud Function</p>
         * @param name - <p>The name of the Cloud Function</p>
         * @param func - <p>The Cloud Function to register</p>
         * @param [validator] - <p>An optional function to help validating cloud code.</p>
         */
        static define<T extends (param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] }) => any>(name: string, func: Parse.Cloud.FunctionRequestFuncGeneric2<T>, validator?: Parse.Cloud.ValidatorObject | Parse.Cloud.FunctionRequestFunc): void;
    }
    namespace Cloud {
        /**
         * @param request - <p>The request object</p>
         */
        type TriggerRequestFunc = (request: Parse.Cloud.TriggerRequest) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property object - <p>The object triggering the hook.</p>
         * @property ip - <p>The IP address of the client making the request.</p>
         * @property headers - <p>The original HTTP headers for the request.</p>
         * @property triggerName - <p>The name of the trigger (<code>beforeSave</code>, <code>afterSave</code>, ...)</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         * @property original - <p>If set, the object, as currently stored.</p>
         * @property context - <p>If set, the context of the request</p>
         */
        type TriggerRequest = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            object: Parse.Object;
            ip: string;
            headers: any;
            triggerName: string;
            log: any;
            original: Parse.Object;
            context: {
                [key: string]: object;
            };
        };
        /**
         * @param request - <p>The request object</p>
         */
        type FileTriggerRequestFunc = (request: Parse.Cloud.FileTriggerRequest) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property file - <p>The file that triggered the hook.</p>
         * @property fileSize - <p>The size of the file in bytes.</p>
         * @property contentLength - <p>The value from Content-Length header</p>
         * @property ip - <p>The IP address of the client making the request.</p>
         * @property headers - <p>The original HTTP headers for the request.</p>
         * @property triggerName - <p>The name of the trigger (<code>beforeSaveFile</code>, <code>afterSaveFile</code>)</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         */
        type FileTriggerRequest = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            file: Parse.File;
            fileSize: number;
            contentLength: number;
            ip: string;
            headers: any;
            triggerName: string;
            log: any;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type ConnectTriggerRequestFunc = (request: Parse.Cloud.ConnectTriggerRequest) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property useMasterKey - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property clients - <p>The number of clients connected.</p>
         * @property subscriptions - <p>The number of subscriptions connected.</p>
         * @property sessionToken - <p>If set, the session of the user that made the request.</p>
         */
        type ConnectTriggerRequest = {
            installationId: string;
            useMasterKey: boolean;
            user: Parse.User;
            clients: number;
            subscriptions: number;
            sessionToken: string;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type LiveQueryEventTriggerFunc = (request: Parse.Cloud.LiveQueryEventTrigger) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property useMasterKey - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property sessionToken - <p>If set, the session of the user that made the request.</p>
         * @property event - <p>The live query event that triggered the request.</p>
         * @property object - <p>The object triggering the hook.</p>
         * @property original - <p>If set, the object, as currently stored.</p>
         * @property clients - <p>The number of clients connected.</p>
         * @property subscriptions - <p>The number of subscriptions connected.</p>
         * @property sendEvent - <p>If the LiveQuery event should be sent to the client. Set to false to prevent LiveQuery from pushing to the client.</p>
         */
        type LiveQueryEventTrigger = {
            installationId: string;
            useMasterKey: boolean;
            user: Parse.User;
            sessionToken: string;
            event: string;
            object: Parse.Object;
            original: Parse.Object;
            clients: number;
            subscriptions: number;
            sendEvent: boolean;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type BeforeFindRequestFunc = (request: Parse.Cloud.BeforeFindRequest) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property query - <p>The query triggering the hook.</p>
         * @property ip - <p>The IP address of the client making the request.</p>
         * @property headers - <p>The original HTTP headers for the request.</p>
         * @property triggerName - <p>The name of the trigger (<code>beforeSave</code>, <code>afterSave</code>, ...)</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         * @property isGet - <p>whether the query a <code>get</code> or a <code>find</code></p>
         * @property count - <p>whether the query a <code>get</code> or a <code>find</code></p>
         * @property readPreference - <p>read preferences of the query</p>
         */
        type BeforeFindRequest = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            query: Parse.Query;
            ip: string;
            headers: any;
            triggerName: string;
            log: any;
            isGet: boolean;
            count: boolean;
            readPreference: Parse.Cloud.ReadPreferenceOption;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type AfterFindRequestFunc = (request: Parse.Cloud.AfterFindRequest) => any;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property query - <p>The query triggering the hook.</p>
         * @property results - <p>The results the query yielded.</p>
         * @property ip - <p>The IP address of the client making the request.</p>
         * @property headers - <p>The original HTTP headers for the request.</p>
         * @property triggerName - <p>The name of the trigger (<code>beforeSave</code>, <code>afterSave</code>, ...)</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         */
        type AfterFindRequest = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            query: Parse.Query;
            results: Parse.Object[];
            ip: string;
            headers: any;
            triggerName: string;
            log: any;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type FunctionRequestFunc = (request: Parse.Cloud.FunctionRequest) => Promise<any>;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property params - <p>The params passed to the cloud function.</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         */
        type FunctionRequest = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            params: {
                [key: string]: object;
            };
            log: any;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type JobRequestFunc = (request: Parse.Cloud.JobRequest) => void;
        /**
         * @property params - <p>The params passed to the background job.</p>
         * @property error - <p>If error is called, will end the job unsuccessfully with an optional completion message to be stored in the job status.</p>
         * @property message - <p>If message is called with a string argument, will update the current message to be stored in the job status.</p>
         * @property success - <p>If success is called, will end the job successfullly with the optional completion message to be stored in the job status.</p>
         */
        type JobRequest = {
            params: {
                [key: string]: object;
            };
            error: (...params: any[]) => any;
            message: (...params: any[]) => any;
            success: (...params: any[]) => any;
        };
        /**
         * @param message - <p>The request object</p>
         */
        type JobRequestMessage = (message: string) => void;
        /**
         * @property requireUser - <p>whether the cloud trigger requires a user.</p>
         * @property requireMaster - <p>whether the cloud trigger requires a master key.</p>
         * @property validateMasterKey - <p>whether the validator should run if masterKey is provided. Defaults to false.</p>
         * @property skipWithMasterKey - <p>whether the cloud code function should be ignored using a masterKey.</p>
         * @property requireAnyUserRoles - <p>If set, request.user has to be part of at least one roles name to make the request. If set to a function, function must return role names.</p>
         * @property requireAllUserRoles - <p>If set, request.user has to be part all roles name to make the request. If set to a function, function must return role names.</p>
         * @property requireUserKeys - <p>If set, keys required on request.user to make the request.</p>
         * @property fields - <p>if an array of strings, validator will look for keys in request.params, and throw if not provided. If Object, fields to validate. If the trigger is a cloud function, <code>request.params</code> will be validated, otherwise <code>request.object</code>.</p>
         */
        type ValidatorObject = {
            requireUser: boolean;
            requireMaster: boolean;
            validateMasterKey: boolean;
            skipWithMasterKey: boolean;
            requireAnyUserRoles: string[] | ((...params: any[]) => any);
            requireAllUserRoles: string[] | ((...params: any[]) => any);
            requireUserKeys: {
                [key: string]: Parse.Cloud.ValidatorObjectFieldOptions;
            } | string[];
            fields: {
                [key: string]: Parse.Cloud.ValidatorObjectFieldOptions;
            } | string[];
        };
        /**
         * @property type - <p>expected type of data for field.</p>
         * @property constant - <p>whether the field can be modified on the object.</p>
         * @property default - <p>default value if field is <code>null</code>, or initial value <code>constant</code> is <code>true</code>.</p>
         * @property options - <p>array of options that the field can be, function to validate field, or single value. Throw an error if value is invalid.</p>
         * @property error - <p>custom error message if field is invalid.</p>
         */
        type ValidatorObjectFieldOptions = {
            type: any;
            constant: boolean;
            default: any;
            options: any[] | ((...params: any[]) => any) | any;
            error: string;
        };
        /**
         * @property [body] - <p>The body of the request. If it is a JSON object, then the Content-Type set in the headers must be application/x-www-form-urlencoded or application/json. You can also set this to a {@link Buffer} object to send raw bytes. If you use a Buffer, you should also set the Content-Type header explicitly to describe what these bytes represent.</p>
         * @property [error] - <p>The function that is called when the request fails. It will be passed a Parse.Cloud.HTTPResponse object.</p>
         * @property [followRedirects] - <p>Whether to follow redirects caused by HTTP 3xx responses. Defaults to false.</p>
         * @property [headers] - <p>The headers for the request.</p>
         * @property [method] - <p>The method of the request. GET, POST, PUT, DELETE, HEAD, and OPTIONS are supported. Will default to GET if not specified.</p>
         * @property [params] - <p>The query portion of the url. You can pass a JSON object of key value pairs like params: {q : 'Sean Plott'} or a raw string like params:q=Sean Plott.</p>
         * @property url - <p>The url to send the request to.</p>
         */
        type HTTPOptions = {
            body?: string | any;
            error?: (...params: any[]) => any;
            followRedirects?: boolean;
            headers?: any;
            method?: string;
            params?: string | any;
            url: string;
        };
        /**
         * @property buffer - <p>The raw byte representation of the response body. Use this to receive binary data. See Buffer for more details.</p>
         * @property cookies - <p>The cookies sent by the server. The keys in this object are the names of the cookies. The values are Parse.Cloud.Cookie objects.</p>
         * @property data - <p>The parsed response body as a JavaScript object. This is only available when the response Content-Type is application/x-www-form-urlencoded or application/json.</p>
         * @property headers - <p>The headers sent by the server. The keys in this object are the names of the headers. We do not support multiple response headers with the same name. In the common case of Set-Cookie headers, please use the cookies field instead.</p>
         * @property status - <p>The status code.</p>
         * @property text - <p>The raw text representation of the response body.</p>
         */
        type HTTPResponse = {
            buffer: Buffer;
            cookies: any;
            data: any;
            headers: any;
            status: number;
            text: string;
        };
        /**
         * @param request - <p>The request object</p>
         */
        type FunctionRequestFuncGeneric1<T extends (...args: any) => any> = (request: Parse.Cloud.FunctionRequest) => Promise<ReturnType<T>> | ReturnType<T>;
        /**
         * @param request - <p>The request object</p>
         */
        type FunctionRequestFuncGeneric2<T extends (...args: any) => any, Params = Parameters<T>[0]> = (request: Parse.Cloud.FunctionRequestGeneric<Params>) => Promise<ReturnType<T>> | ReturnType<T>;
        /**
         * @property installationId - <p>If set, the installationId triggering the request.</p>
         * @property master - <p>If true, means the master key was used.</p>
         * @property user - <p>If set, the user that made the request.</p>
         * @property params - <p>The params passed to the cloud function.</p>
         * @property log - <p>The current logger inside Parse Server.</p>
         */
        type FunctionRequestGeneric<T> = {
            installationId: string;
            master: boolean;
            user: Parse.User;
            params: T;
            log: any;
        };
    }
    /**
     * <p>Provides utility functions to queue objects that will be
     * saved to the server at a later date.</p>
     */
    class EventuallyQueue {
        /**
         * <p>Add object to queue with save operation.</p>
         * @param object - <p>Parse.Object to be saved eventually</p>
         * @param [serverOptions] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html#save Parse.Object.save} options.</p>
         * @returns <p>A promise that is fulfilled if object is added to queue.</p>
         */
        static save(object: Parse.Object, serverOptions?: any): Promise<any>;
        /**
         * <p>Add object to queue with save operation.</p>
         * @param object - <p>Parse.Object to be destroyed eventually</p>
         * @param [serverOptions] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html#destroy Parse.Object.destroy} options</p>
         * @returns <p>A promise that is fulfilled if object is added to queue.</p>
         */
        static destroy(object: Parse.Object, serverOptions?: any): Promise<any>;
        /**
         * <p>Sets the in-memory queue from local storage and returns.</p>
         */
        static getQueue(): Promise<any[]>;
        /**
         * <p>Removes all objects from queue.</p>
         * @returns <p>A promise that is fulfilled when queue is cleared.</p>
         */
        static clear(): Promise<any>;
        /**
         * <p>Return the number of objects in the queue.</p>
         */
        static length(): number;
        /**
         * <p>Sends the queue to the server.</p>
         * @returns <p>Returns true if queue was sent successfully.</p>
         */
        static sendQueue(): Promise<boolean>;
        /**
         * <p>Start polling server for network connection.
         * Will send queue if connection is established.</p>
         * @param [ms] - <p>Milliseconds to ping the server. Default 2000ms</p>
         */
        static poll(ms?: any): void;
        /**
         * <p>Turns off polling.</p>
         */
        static stopPoll(): void;
        /**
         * <p>Return true if pinging the server.</p>
         */
        static isPolling(): boolean;
    }
    /**
     * <p>Provides a set of utilities for using Parse with Facebook.</p>
     */
    class FacebookUtils {
        /**
         * <p>Initializes Parse Facebook integration.  Call this function after you
         * have loaded the Facebook Javascript SDK with the same parameters
         * as you would pass to<code>
         * <a href=
         * "https://developers.facebook.com/docs/reference/javascript/FB.init/">
         * FB.init()</a></code>.  Parse.FacebookUtils will invoke FB.init() for you
         * with these arguments.</p>
         * @param options - <p>Facebook options argument as described here:
         * <a href=
         *   "https://developers.facebook.com/docs/reference/javascript/FB.init/">
         * FB.init()</a>. The status flag will be coerced to 'false' because it
         * interferes with Parse Facebook integration. Call FB.getLoginStatus()
         * explicitly if this behavior is required by your application.</p>
         */
        static init(options: any): void;
        /**
         * <p>Gets whether the user has their account linked to Facebook.</p>
         * @param user - <p>User to check for a facebook link.
         * The user must be logged in on this device.</p>
         * @returns <p><code>true</code> if the user has their account
         * linked to Facebook.</p>
         */
        static isLinked(user: Parse.User): boolean;
        /**
         * <p>Logs in a user using Facebook. This method delegates to the Facebook
         * SDK to authenticate the user, and then automatically logs in (or
         * creates, in the case where it is a new user) a Parse.User.</p>
         * <p>Standard API:</p>
         * <p><code>logIn(permission: string, authData: Object);</code></p>
         * <p>Advanced API: Used for handling your own oAuth tokens
         * {@link https://docs.parseplatform.org/rest/guide/#linking-users}</p>
         * <p><code>logIn(authData: Object, options?: Object);</code></p>
         * @param permissions - <p>The permissions required for Facebook
         * log in.  This is a comma-separated string of permissions.
         * Alternatively, supply a Facebook authData object as described in our
         * REST API docs if you want to handle getting facebook auth tokens
         * yourself.</p>
         * @param options - <p>MasterKey / SessionToken. Alternatively can be used for authData if permissions is a string</p>
         */
        static logIn(permissions: string | any, options: any): Promise<Parse.User>;
        /**
         * <p>Links Facebook to an existing PFUser. This method delegates to the
         * Facebook SDK to authenticate the user, and then automatically links
         * the account to the Parse.User.</p>
         * <p>Standard API:</p>
         * <p><code>link(user: Parse.User, permission: string, authData?: Object);</code></p>
         * <p>Advanced API: Used for handling your own oAuth tokens
         * {@link https://docs.parseplatform.org/rest/guide/#linking-users}</p>
         * <p><code>link(user: Parse.User, authData: Object, options?: FullOptions);</code></p>
         * @param user - <p>User to link to Facebook. This must be the
         * current user.</p>
         * @param permissions - <p>The permissions required for Facebook
         * log in.  This is a comma-separated string of permissions.
         * Alternatively, supply a Facebook authData object as described in our
         * REST API docs if you want to handle getting facebook auth tokens
         * yourself.</p>
         * @param options - <p>MasterKey / SessionToken. Alternatively can be used for authData if permissions is a string</p>
         */
        static link(user: Parse.User, permissions: string | any, options: any): Promise<Parse.User>;
        /**
         * <p>Unlinks the Parse.User from a Facebook account.</p>
         * @param user - <p>User to unlink from Facebook. This must be the
         * current user.</p>
         * @param options - <p>Standard options object with success and error
         * callbacks.</p>
         */
        static unlink(user: Parse.User, options: any): Promise<any>;
    }
    /**
     * <p>Creates a new LiveQueryClient.
     * Extends events.EventEmitter
     * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.</p>
     * <p>A wrapper of a standard WebSocket client. We add several useful methods to
     * help you connect/disconnect to LiveQueryServer, subscribe/unsubscribe a ParseQuery easily.</p>
     * <p>javascriptKey and masterKey are used for verifying the LiveQueryClient when it tries
     * to connect to the LiveQuery server</p>
     * <p>We expose three events to help you monitor the status of the LiveQueryClient.</p>
     * <pre>
     * let Parse = require('parse/node');
     * let LiveQueryClient = Parse.LiveQueryClient;
     * let client = new LiveQueryClient({
     *   applicationId: '',
     *   serverURL: '',
     *   javascriptKey: '',
     *   masterKey: ''
     *  });
     * </pre>
     * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.</p>
     * <pre>
     * client.on('open', () => {
     *
     * });</pre>
     * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.</p>
     * <pre>
     * client.on('close', () => {
     *
     * });</pre>
     * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.</p>
     * <pre>
     * client.on('error', (error) => {
     *
     * });</pre>
     * @param options.applicationId - <p>applicationId of your Parse app</p>
     * @param options.serverURL - <p><b>the URL of your LiveQuery server</b></p>
     * @param options.javascriptKey - <p>(optional)</p>
     * @param options.masterKey - <p>(optional) Your Parse Master Key. (Node.js only!)</p>
     * @param options.sessionToken - <p>(optional)</p>
     * @param options.installationId - <p>(optional)</p>
     */
    class LiveQueryClient {
        constructor(options: {
            applicationId: string;
            serverURL: string;
            javascriptKey: string;
            masterKey: string;
            sessionToken: string;
            installationId: string;
        });
        /**
         * <p>Subscribes to a ParseQuery</p>
         * <p>If you provide the sessionToken, when the LiveQuery server gets ParseObject's
         * updates from parse server, it'll try to check whether the sessionToken fulfills
         * the ParseObject's ACL. The LiveQuery server will only send updates to clients whose
         * sessionToken is fit for the ParseObject's ACL. You can check the LiveQuery protocol
         * <a href="https://github.com/parse-community/parse-server/wiki/Parse-LiveQuery-Protocol-Specification">here</a> for more details. The subscription you get is the same subscription you get
         * from our Standard API.</p>
         * @param query - <p>the ParseQuery you want to subscribe to</p>
         * @param sessionToken - <p>(optional)</p>
         * @returns <p>subscription</p>
         */
        subscribe(query: any, sessionToken: string): LiveQuerySubscription;
        /**
         * <p>After calling unsubscribe you'll stop receiving events from the subscription object.</p>
         * @param subscription - <p>subscription you would like to unsubscribe from.</p>
         */
        unsubscribe(subscription: any): void;
        /**
         * <p>After open is called, the LiveQueryClient will try to send a connect request
         * to the LiveQuery server.</p>
         */
        open(): void;
        /**
         * <p>This method will close the WebSocket connection to this LiveQueryClient,
         * cancel the auto reconnect and unsubscribe all subscriptions based on it.</p>
         */
        close(): void;
    }
    /**
     * <p>Creates a new LiveQuery Subscription.
     * Extends events.EventEmitter
     * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.</p>
     * <p>Response Object - Contains data from the client that made the request
     * <ul>
     * <li>clientId</li>
     * <li>installationId - requires Parse Server 4.0.0+</li>
     * </ul>
     * </p>
     * <p>Open Event - When you call query.subscribe(), we send a subscribe request to
     * the LiveQuery server, when we get the confirmation from the LiveQuery server,
     * this event will be emitted. When the client loses WebSocket connection to the
     * LiveQuery server, we will try to auto reconnect the LiveQuery server. If we
     * reconnect the LiveQuery server and successfully resubscribe the ParseQuery,
     * you'll also get this event.
     * <pre>
     * subscription.on('open', (response) => {
     *
     * });</pre></p>
     * <p>Create Event - When a new ParseObject is created and it fulfills the ParseQuery you subscribe,
     * you'll get this event. The object is the ParseObject which is created.
     * <pre>
     * subscription.on('create', (object, response) => {
     *
     * });</pre></p>
     * <p>Update Event - When an existing ParseObject (original) which fulfills the ParseQuery you subscribe
     * is updated (The ParseObject fulfills the ParseQuery before and after changes),
     * you'll get this event. The object is the ParseObject which is updated.
     * Its content is the latest value of the ParseObject.
     * <p>Parse-Server 3.1.3+ Required for original object parameter</p>
     * <pre>
     * subscription.on('update', (object, original, response) => {
     *
     * });</pre></p>
     * <p>Enter Event - When an existing ParseObject's (original) old value doesn't fulfill the ParseQuery
     * but its new value fulfills the ParseQuery, you'll get this event. The object is the
     * ParseObject which enters the ParseQuery. Its content is the latest value of the ParseObject.
     * <p>Parse-Server 3.1.3+ Required for original object parameter</p>
     * <pre>
     * subscription.on('enter', (object, original, response) => {
     *
     * });</pre></p>
     * <p>Update Event - When an existing ParseObject's old value fulfills the ParseQuery but its new value
     * doesn't fulfill the ParseQuery, you'll get this event. The object is the ParseObject
     * which leaves the ParseQuery. Its content is the latest value of the ParseObject.
     * <pre>
     * subscription.on('leave', (object, response) => {
     *
     * });</pre></p>
     * <p>Delete Event - When an existing ParseObject which fulfills the ParseQuery is deleted, you'll
     * get this event. The object is the ParseObject which is deleted.
     * <pre>
     * subscription.on('delete', (object, response) => {
     *
     * });</pre></p>
     * <p>Close Event - When the client loses the WebSocket connection to the LiveQuery
     * server and we stop receiving events, you'll get this event.
     * <pre>
     * subscription.on('close', () => {
     *
     * });</pre></p>
     * @param id - <p>subscription id</p>
     * @param query - <p>query to subscribe to</p>
     * @param sessionToken - <p>optional session token</p>
     */
    class LiveQuerySubscription {
        constructor(id: string, query: string, sessionToken: string);
        /**
         * <p>Close the subscription</p>
         */
        unsubscribe(): Promise<any>;
        on(event: string, callback: LiveQueryEventCallback): void;
    }
    /**
     * <p>Provides a local datastore which can be used to store and retrieve <code>Parse.Object</code>. <br />
     * To enable this functionality, call <code>Parse.enableLocalDatastore()</code>.</p>
     * <p>Pin object to add to local datastore</p>
     * <pre>await object.pin();</pre>
     * <pre>await object.pinWithName('pinName');</pre>
     * <p>Query pinned objects</p>
     * <pre>query.fromLocalDatastore();</pre>
     * <pre>query.fromPin();</pre>
     * <pre>query.fromPinWithName();</pre>
     * <pre>const localObjects = await query.find();</pre>
     */
    class LocalDatastore {
        /**
         * <p>Updates Local Datastore from Server</p>
         * <pre>
         * await Parse.LocalDatastore.updateFromServer();
         * </pre>
         */
        static updateFromServer(): void;
    }
    type AuthData = any;
    type AuthProvider = any;
    type Op = {
        Set: any;
        Unset: any;
        Increment: any;
        Add: any;
        Remove: any;
        AddUnique: any;
        Relation: any;
    };
    /**
     * <p>Creates a new ACL.
     * If no argument is given, the ACL has no permissions for anyone.
     * If the argument is a Parse.User, the ACL will have read and write
     * permission for only that user.
     * If the argument is any other JSON object, that object will be interpretted
     * as a serialized ACL created with toJSON().</p>
     * <p>An ACL, or Access Control List can be added to any
     * <code>Parse.Object</code> to restrict access to only a subset of users
     * of your application.</p>
     * @param [arg1] - <p>The user to initialize the ACL for</p>
     */
    class ACL {
        constructor(arg1?: Parse.User | any);
        /**
         * <p>Returns a JSON-encoded version of the ACL.</p>
         */
        toJSON(): any;
        /**
         * <p>Returns whether this ACL is equal to another object</p>
         * @param other - <p>The other object's ACL to compare to</p>
         */
        equals(other: Parse.ACL): boolean;
        /**
         * <p>Sets whether the given user is allowed to read this object.</p>
         * @param userId - <p>An instance of Parse.User or its objectId.</p>
         * @param allowed - <p>Whether that user should have read access.</p>
         */
        setReadAccess(userId: any, allowed: boolean): void;
        /**
         * <p>Get whether the given user id is <em>explicitly</em> allowed to read this object.
         * Even if this returns false, the user may still be able to access it if
         * getPublicReadAccess returns true or a role that the user belongs to has
         * write access.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role.</p>
         */
        getReadAccess(userId: any): boolean;
        /**
         * <p>Sets whether the given user id is allowed to write this object.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role..</p>
         * @param allowed - <p>Whether that user should have write access.</p>
         */
        setWriteAccess(userId: any, allowed: boolean): void;
        /**
         * <p>Gets whether the given user id is <em>explicitly</em> allowed to write this object.
         * Even if this returns false, the user may still be able to write it if
         * getPublicWriteAccess returns true or a role that the user belongs to has
         * write access.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role.</p>
         */
        getWriteAccess(userId: any): boolean;
        /**
         * <p>Sets whether the public is allowed to read this object.</p>
         */
        setPublicReadAccess(allowed: boolean): void;
        /**
         * <p>Gets whether the public is allowed to read this object.</p>
         */
        getPublicReadAccess(): boolean;
        /**
         * <p>Sets whether the public is allowed to write this object.</p>
         */
        setPublicWriteAccess(allowed: boolean): void;
        /**
         * <p>Gets whether the public is allowed to write this object.</p>
         */
        getPublicWriteAccess(): boolean;
        /**
         * <p>Gets whether users belonging to the given role are allowed
         * to read this object. Even if this returns false, the role may
         * still be able to write it if a parent role has read access.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @returns <p>true if the role has read access. false otherwise.</p>
         */
        getRoleReadAccess(role: any): boolean;
        /**
         * <p>Gets whether users belonging to the given role are allowed
         * to write this object. Even if this returns false, the role may
         * still be able to write it if a parent role has write access.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @returns <p>true if the role has write access. false otherwise.</p>
         */
        getRoleWriteAccess(role: any): boolean;
        /**
         * <p>Sets whether users belonging to the given role are allowed
         * to read this object.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @param allowed - <p>Whether the given role can read this object.</p>
         */
        setRoleReadAccess(role: any, allowed: boolean): void;
        /**
         * <p>Sets whether users belonging to the given role are allowed
         * to write this object.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @param allowed - <p>Whether the given role can write this object.</p>
         */
        setRoleWriteAccess(role: any, allowed: boolean): void;
    }
    /**
     * <p>Creates a new CLP.
     * If no argument is given, the CLP has no permissions for anyone.
     * If the argument is a Parse.User or Parse.Role, the CLP will have read and write
     * permission for only that user or role.
     * If the argument is any other JSON object, that object will be interpretted
     * as a serialized CLP created with toJSON().</p>
     * <p>A CLP, or Class Level Permissions can be added to any
     * <code>Parse.Schema</code> to restrict access to only a subset of users
     * of your application.</p>
     * <p>
     * For get/count/find/create/update/delete/addField using the following functions:
     * <p>Entity is type Parse.User or Parse.Role or string
     * Role is type Parse.Role or Name of Parse.Role</p>
     * <p>getGetRequiresAuthentication()
     * setGetRequiresAuthentication(allowed: boolean)
     * getGetPointerFields()
     * setGetPointerFields(pointerFields: string[])
     * getGetAccess(entity: Entity)
     * setGetAccess(entity: Entity, allowed: boolean)
     * getPublicGetAccess()
     * setPublicGetAccess(allowed: boolean)
     * getRoleGetAccess(role: Role)
     * setRoleGetAccess(role: Role, allowed: boolean)
     * getFindRequiresAuthentication()
     * setFindRequiresAuthentication(allowed: boolean)
     * getFindPointerFields()
     * setFindPointerFields(pointerFields: string[])
     * getFindAccess(entity: Entity)
     * setFindAccess(entity: Entity, allowed: boolean)
     * getPublicFindAccess()
     * setPublicFindAccess(allowed: boolean)
     * getRoleFindAccess(role: Role)
     * setRoleFindAccess(role: Role, allowed: boolean)
     * getCountRequiresAuthentication()
     * setCountRequiresAuthentication(allowed: boolean)
     * getCountPointerFields()
     * setCountPointerFields(pointerFields: string[])
     * getCountAccess(entity: Entity)
     * setCountAccess(entity: Entity, allowed: boolean)
     * getPublicCountAccess()
     * setPublicCountAccess(allowed: boolean)
     * getRoleCountAccess(role: Role)
     * setRoleCountAccess(role: Role, allowed: boolean)
     * getCreateRequiresAuthentication()
     * setCreateRequiresAuthentication(allowed: boolean)
     * getCreatePointerFields()
     * setCreatePointerFields(pointerFields: string[])
     * getCreateAccess(entity: Entity)
     * setCreateAccess(entity: Entity, allowed: boolean)
     * getPublicCreateAccess()
     * setPublicCreateAccess(allowed: Boolean)
     * getRoleCreateAccess(role: Role)
     * setRoleCreateAccess(role: Role, allowed: boolean)
     * getUpdateRequiresAuthentication()
     * setUpdateRequiresAuthentication(allowed: boolean)
     * getUpdatePointerFields()
     * setUpdatePointerFields(pointerFields: string[])
     * getUpdateAccess(entity: Entity)
     * setUpdateAccess(entity: Entity, allowed: boolean)
     * getPublicUpdateAccess()
     * setPublicUpdateAccess(allowed: boolean)
     * getRoleUpdateAccess(role: Role)
     * setRoleUpdateAccess(role: Role, allowed: boolean)
     * getDeleteRequiresAuthentication()
     * setDeleteRequiresAuthentication(allowed: boolean)
     * getDeletePointerFields()
     * setDeletePointerFields(pointerFields: string[])
     * getDeleteAccess(entity: Entity)
     * setDeleteAccess(entity: Entity, allowed: boolean)
     * getPublicDeleteAccess()
     * setPublicDeleteAccess(allowed: boolean)
     * getRoleDeleteAccess(role: Role)
     * setRoleDeleteAccess(role: Role, allowed: boolean)
     * getAddFieldRequiresAuthentication()
     * setAddFieldRequiresAuthentication(allowed: boolean)
     * getAddFieldPointerFields()
     * setAddFieldPointerFields(pointerFields: string[])
     * getAddFieldAccess(entity: Entity)
     * setAddFieldAccess(entity: Entity, allowed: boolean)
     * getPublicAddFieldAccess()
     * setPublicAddFieldAccess(allowed: boolean)
     * getRoleAddFieldAccess(role: Role)
     * setRoleAddFieldAccess(role: Role, allowed: boolean)</p>
     * </p>
     * @param userId - <p>The user to initialize the CLP for</p>
     */
    class CLP {
        constructor(userId: Parse.User | Parse.Role | any);
        /**
         * <p>Returns a JSON-encoded version of the CLP.</p>
         */
        toJSON(): any;
        /**
         * <p>Returns whether this CLP is equal to another object</p>
         * @param other - <p>The other object to compare to</p>
         */
        equals(other: any): boolean;
        /**
         * <p>Sets user pointer fields to allow permission for get/count/find operations.</p>
         * @param pointerFields - <p>User pointer fields</p>
         */
        setReadUserFields(pointerFields: string[]): void;
        /**
         * @returns <p>User pointer fields</p>
         */
        getReadUserFields(): string[];
        /**
         * <p>Sets user pointer fields to allow permission for create/delete/update/addField operations</p>
         * @param pointerFields - <p>User pointer fields</p>
         */
        setWriteUserFields(pointerFields: string[]): void;
        /**
         * @returns <p>User pointer fields</p>
         */
        getWriteUserFields(): string[];
        /**
         * <p>Sets whether the given user is allowed to retrieve fields from this class.</p>
         * @param userId - <p>An instance of Parse.User or its objectId.</p>
         * @param fields - <p>fields to be protected</p>
         */
        setProtectedFields(userId: any, fields: string[]): void;
        /**
         * <p>Returns array of fields are accessable to this user.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role.</p>
         */
        getProtectedFields(userId: any): string[];
        /**
         * <p>Sets whether the given user is allowed to read from this class.</p>
         * @param userId - <p>An instance of Parse.User or its objectId.</p>
         * @param allowed - <p>whether that user should have read access.</p>
         */
        setReadAccess(userId: any, allowed: boolean): void;
        /**
         * <p>Get whether the given user id is <em>explicitly</em> allowed to read from this class.
         * Even if this returns false, the user may still be able to access it if
         * getPublicReadAccess returns true or a role that the user belongs to has
         * write access.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role.</p>
         */
        getReadAccess(userId: any): boolean;
        /**
         * <p>Sets whether the given user id is allowed to write to this class.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role..</p>
         * @param allowed - <p>Whether that user should have write access.</p>
         */
        setWriteAccess(userId: any, allowed: boolean): void;
        /**
         * <p>Gets whether the given user id is <em>explicitly</em> allowed to write to this class.
         * Even if this returns false, the user may still be able to write it if
         * getPublicWriteAccess returns true or a role that the user belongs to has
         * write access.</p>
         * @param userId - <p>An instance of Parse.User or its objectId, or a Parse.Role.</p>
         */
        getWriteAccess(userId: any): boolean;
        /**
         * <p>Sets whether the public is allowed to read from this class.</p>
         */
        setPublicReadAccess(allowed: boolean): void;
        /**
         * <p>Gets whether the public is allowed to read from this class.</p>
         */
        getPublicReadAccess(): boolean;
        /**
         * <p>Sets whether the public is allowed to write to this class.</p>
         */
        setPublicWriteAccess(allowed: boolean): void;
        /**
         * <p>Gets whether the public is allowed to write to this class.</p>
         */
        getPublicWriteAccess(): boolean;
        /**
         * <p>Sets whether the public is allowed to protect fields in this class.</p>
         */
        setPublicProtectedFields(fields: string[]): void;
        /**
         * <p>Gets whether the public is allowed to read fields from this class.</p>
         */
        getPublicProtectedFields(): string[];
        /**
         * <p>Gets whether users belonging to the given role are allowed
         * to read from this class. Even if this returns false, the role may
         * still be able to write it if a parent role has read access.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @returns <p>true if the role has read access. false otherwise.</p>
         */
        getRoleReadAccess(role: any): boolean;
        /**
         * <p>Gets whether users belonging to the given role are allowed
         * to write to this user. Even if this returns false, the role may
         * still be able to write it if a parent role has write access.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @returns <p>true if the role has write access. false otherwise.</p>
         */
        getRoleWriteAccess(role: any): boolean;
        /**
         * <p>Sets whether users belonging to the given role are allowed
         * to read from this class.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @param allowed - <p>Whether the given role can read this object.</p>
         */
        setRoleReadAccess(role: any, allowed: boolean): void;
        /**
         * <p>Sets whether users belonging to the given role are allowed
         * to write to this class.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @param allowed - <p>Whether the given role can write this object.</p>
         */
        setRoleWriteAccess(role: any, allowed: boolean): void;
        /**
         * <p>Gets whether users belonging to the given role are allowed
         * to count to this user. Even if this returns false, the role may
         * still be able to count it if a parent role has count access.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         */
        getRoleProtectedFields(role: any): string[];
        /**
         * <p>Sets whether users belonging to the given role are allowed
         * to set access field in this class.</p>
         * @param role - <p>The name of the role, or a Parse.Role object.</p>
         * @param fields - <p>Fields to be protected by Role.</p>
         */
        setRoleProtectedFields(role: any, fields: string[]): void;
    }
    /**
     * <p>Parse.Config is a local representation of configuration data that
     * can be set from the Parse dashboard.</p>
     */
    class Config {
        /**
         * <p>Gets the value of an attribute.</p>
         * @param attr - <p>The name of an attribute.</p>
         */
        get(attr: string): any;
        /**
         * <p>Gets the HTML-escaped value of an attribute.</p>
         * @param attr - <p>The name of an attribute.</p>
         */
        escape(attr: string): string;
        /**
         * <p>Retrieves the most recently-fetched configuration object, either from
         * memory or from local storage if necessary.</p>
         * @returns <p>The most recently-fetched Parse.Config if it
         * exists, else an empty Parse.Config.</p>
         */
        static current(): Parse.Config;
        /**
         * <p>Gets a new configuration object from the server.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         * </ul>
         * @returns <p>A promise that is resolved with a newly-created
         * configuration object when the get completes.</p>
         */
        static get(options: any): Promise<Parse.Config>;
        /**
         * <p>Save value keys to the server.</p>
         * @param attrs - <p>The config parameters and values.</p>
         * @param masterKeyOnlyFlags - <p>The flags that define whether config parameters listed
         * in <code>attrs</code> should be retrievable only by using the master key.
         * For example: <code>param1: true</code> makes <code>param1</code> only retrievable by using the master key.
         * If a parameter is not provided or set to <code>false</code>, it can be retrieved without
         * using the master key.</p>
         * @returns <p>A promise that is resolved with a newly-created
         * configuration object or with the current with the update.</p>
         */
        static save(attrs: any, masterKeyOnlyFlags: any): Promise<Parse.Object>;
        /**
         * <p>Used for testing</p>
         */
        private static _clearCache(): void;
    }
    /**
     * <p>Constructs a new Parse.Error object with the given code and message.</p>
     * @param code - <p>An error code constant from <code>Parse.Error</code>.</p>
     * @param message - <p>A detailed description of the error.</p>
     */
    class Error {
        constructor(code: number, message: string);
        /**
         * <p>Error code indicating some error other than those enumerated here.</p>
         */
        static OTHER_CAUSE: number;
        /**
         * <p>Error code indicating that something has gone wrong with the server.</p>
         */
        static INTERNAL_SERVER_ERROR: number;
        /**
         * <p>Error code indicating the connection to the Parse servers failed.</p>
         */
        static CONNECTION_FAILED: number;
        /**
         * <p>Error code indicating the specified object doesn't exist.</p>
         */
        static OBJECT_NOT_FOUND: number;
        /**
         * <p>Error code indicating you tried to query with a datatype that doesn't
         * support it, like exact matching an array or object.</p>
         */
        static INVALID_QUERY: number;
        /**
         * <p>Error code indicating a missing or invalid classname. Classnames are
         * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
         * only valid characters.</p>
         */
        static INVALID_CLASS_NAME: number;
        /**
         * <p>Error code indicating an unspecified object id.</p>
         */
        static MISSING_OBJECT_ID: number;
        /**
         * <p>Error code indicating an invalid key name. Keys are case-sensitive. They
         * must start with a letter, and a-zA-Z0-9_ are the only valid characters.</p>
         */
        static INVALID_KEY_NAME: number;
        /**
         * <p>Error code indicating a malformed pointer. You should not see this unless
         * you have been mucking about changing internal Parse code.</p>
         */
        static INVALID_POINTER: number;
        /**
         * <p>Error code indicating that badly formed JSON was received upstream. This
         * either indicates you have done something unusual with modifying how
         * things encode to JSON, or the network is failing badly.</p>
         */
        static INVALID_JSON: number;
        /**
         * <p>Error code indicating that the feature you tried to access is only
         * available internally for testing purposes.</p>
         */
        static COMMAND_UNAVAILABLE: number;
        /**
         * <p>You must call Parse.initialize before using the Parse library.</p>
         */
        static NOT_INITIALIZED: number;
        /**
         * <p>Error code indicating that a field was set to an inconsistent type.</p>
         */
        static INCORRECT_TYPE: number;
        /**
         * <p>Error code indicating an invalid channel name. A channel name is either
         * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
         * characters and starts with a letter.</p>
         */
        static INVALID_CHANNEL_NAME: number;
        /**
         * <p>Error code indicating that push is misconfigured.</p>
         */
        static PUSH_MISCONFIGURED: number;
        /**
         * <p>Error code indicating that the object is too large.</p>
         */
        static OBJECT_TOO_LARGE: number;
        /**
         * <p>Error code indicating that the operation isn't allowed for clients.</p>
         */
        static OPERATION_FORBIDDEN: number;
        /**
         * <p>Error code indicating the result was not found in the cache.</p>
         */
        static CACHE_MISS: number;
        /**
         * <p>Error code indicating that an invalid key was used in a nested
         * JSONObject.</p>
         */
        static INVALID_NESTED_KEY: number;
        /**
         * <p>Error code indicating that an invalid filename was used for ParseFile.
         * A valid file name contains only a-zA-Z0-9_. characters and is between 1
         * and 128 characters.</p>
         */
        static INVALID_FILE_NAME: number;
        /**
         * <p>Error code indicating an invalid ACL was provided.</p>
         */
        static INVALID_ACL: number;
        /**
         * <p>Error code indicating that the request timed out on the server. Typically
         * this indicates that the request is too expensive to run.</p>
         */
        static TIMEOUT: number;
        /**
         * <p>Error code indicating that the email address was invalid.</p>
         */
        static INVALID_EMAIL_ADDRESS: number;
        /**
         * <p>Error code indicating a missing content type.</p>
         */
        static MISSING_CONTENT_TYPE: number;
        /**
         * <p>Error code indicating a missing content length.</p>
         */
        static MISSING_CONTENT_LENGTH: number;
        /**
         * <p>Error code indicating an invalid content length.</p>
         */
        static INVALID_CONTENT_LENGTH: number;
        /**
         * <p>Error code indicating a file that was too large.</p>
         */
        static FILE_TOO_LARGE: number;
        /**
         * <p>Error code indicating an error saving a file.</p>
         */
        static FILE_SAVE_ERROR: number;
        /**
         * <p>Error code indicating that a unique field was given a value that is
         * already taken.</p>
         */
        static DUPLICATE_VALUE: number;
        /**
         * <p>Error code indicating that a role's name is invalid.</p>
         */
        static INVALID_ROLE_NAME: number;
        /**
         * <p>Error code indicating that an application quota was exceeded.  Upgrade to
         * resolve.</p>
         */
        static EXCEEDED_QUOTA: number;
        /**
         * <p>Error code indicating that a Cloud Code script failed.</p>
         */
        static SCRIPT_FAILED: number;
        /**
         * <p>Error code indicating that a Cloud Code validation failed.</p>
         */
        static VALIDATION_ERROR: number;
        /**
         * <p>Error code indicating that invalid image data was provided.</p>
         */
        static INVALID_IMAGE_DATA: number;
        /**
         * <p>Error code indicating an unsaved file.</p>
         */
        static UNSAVED_FILE_ERROR: number;
        /**
         * <p>Error code indicating an invalid push time.</p>
         */
        static INVALID_PUSH_TIME_ERROR: number;
        /**
         * <p>Error code indicating an error deleting a file.</p>
         */
        static FILE_DELETE_ERROR: number;
        /**
         * <p>Error code indicating an error deleting an unnamed file.</p>
         */
        static FILE_DELETE_UNNAMED_ERROR: number;
        /**
         * <p>Error code indicating that the application has exceeded its request
         * limit.</p>
         */
        static REQUEST_LIMIT_EXCEEDED: number;
        /**
         * <p>Error code indicating that the request was a duplicate and has been discarded due to
         * idempotency rules.</p>
         */
        static DUPLICATE_REQUEST: number;
        /**
         * <p>Error code indicating an invalid event name.</p>
         */
        static INVALID_EVENT_NAME: number;
        /**
         * <p>Error code indicating that a field had an invalid value.</p>
         */
        static INVALID_VALUE: number;
        /**
         * <p>Error code indicating that the username is missing or empty.</p>
         */
        static USERNAME_MISSING: number;
        /**
         * <p>Error code indicating that the password is missing or empty.</p>
         */
        static PASSWORD_MISSING: number;
        /**
         * <p>Error code indicating that the username has already been taken.</p>
         */
        static USERNAME_TAKEN: number;
        /**
         * <p>Error code indicating that the email has already been taken.</p>
         */
        static EMAIL_TAKEN: number;
        /**
         * <p>Error code indicating that the email is missing, but must be specified.</p>
         */
        static EMAIL_MISSING: number;
        /**
         * <p>Error code indicating that a user with the specified email was not found.</p>
         */
        static EMAIL_NOT_FOUND: number;
        /**
         * <p>Error code indicating that a user object without a valid session could
         * not be altered.</p>
         */
        static SESSION_MISSING: number;
        /**
         * <p>Error code indicating that a user can only be created through signup.</p>
         */
        static MUST_CREATE_USER_THROUGH_SIGNUP: number;
        /**
         * <p>Error code indicating that an an account being linked is already linked
         * to another user.</p>
         */
        static ACCOUNT_ALREADY_LINKED: number;
        /**
         * <p>Error code indicating that the current session token is invalid.</p>
         */
        static INVALID_SESSION_TOKEN: number;
        /**
         * <p>Error code indicating an error enabling or verifying MFA</p>
         */
        static MFA_ERROR: number;
        /**
         * <p>Error code indicating that a valid MFA token must be provided</p>
         */
        static MFA_TOKEN_REQUIRED: number;
        /**
         * <p>Error code indicating that a user cannot be linked to an account because
         * that account's id could not be found.</p>
         */
        static LINKED_ID_MISSING: number;
        /**
         * <p>Error code indicating that a user with a linked (e.g. Facebook) account
         * has an invalid session.</p>
         */
        static INVALID_LINKED_SESSION: number;
        /**
         * <p>Error code indicating that a service being linked (e.g. Facebook or
         * Twitter) is unsupported.</p>
         */
        static UNSUPPORTED_SERVICE: number;
        /**
         * <p>Error code indicating an invalid operation occured on schema</p>
         */
        static INVALID_SCHEMA_OPERATION: number;
        /**
         * <p>Error code indicating that there were multiple errors. Aggregate errors
         * have an &quot;errors&quot; property, which is an array of error objects with more
         * detail about each error that occurred.</p>
         */
        static AGGREGATE_ERROR: number;
        /**
         * <p>Error code indicating the client was unable to read an input file.</p>
         */
        static FILE_READ_ERROR: number;
        /**
         * <p>Error code indicating a real error code is unavailable because
         * we had to use an XDomainRequest object to allow CORS requests in
         * Internet Explorer, which strips the body from HTTP responses that have
         * a non-2XX status code.</p>
         */
        static X_DOMAIN_REQUEST: number;
    }
    /**
     * <p>A Parse.File is a local representation of a file that is saved to the Parse
     * cloud.</p>
     * @param name - <p>The file's name. This will be prefixed by a unique
     * value once the file has finished saving. The file name must begin with
     * an alphanumeric character, and consist of alphanumeric characters,
     * periods, spaces, underscores, or dashes.</p>
     * @param data - <p>The data for the file, as either:
     * 1. an Array of byte value Numbers, or
     * 2. an Object like { base64: &quot;...&quot; } with a base64-encoded String.
     * 3. an Object like { uri: &quot;...&quot; } with a uri String.
     * 4. a File object selected with a file upload control. (3) only works
     * in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
     * For example:</p>
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
     * @param [type] - <p>Optional Content-Type header to use for the file. If
     * this is omitted, the content type will be inferred from the name's
     * extension.</p>
     * @param [metadata] - <p>Optional key value pairs to be stored with file object</p>
     * @param [tags] - <p>Optional key value pairs to be stored with file object</p>
     */
    class File {
        constructor(name: string, data: any[] | Blob | any, type?: string, metadata?: any, tags?: any);
        /**
         * <p>Return the data for the file, downloading it if not already present.
         * Data is present if initialized with Byte Array, Base64 or Saved with Uri.
         * Data is cleared if saved with File object selected with a file upload control</p>
         * @returns <p>Promise that is resolve with base64 data</p>
         */
        getData(): Promise<String>;
        /**
         * <p>Gets the name of the file. Before save is called, this is the filename
         * given by the user. After save is called, that name gets prefixed with a
         * unique identifier.</p>
         */
        name(): string;
        /**
         * <p>Gets the url of the file. It is only available after you save the file or
         * after you get the file from a Parse.Object.</p>
         * @param [options] - <p>An object to specify url options</p>
         */
        url(options?: any): string;
        /**
         * <p>Gets the metadata of the file.</p>
         */
        metadata(): any;
        /**
         * <p>Gets the tags of the file.</p>
         */
        tags(): any;
        /**
         * <p>Saves the file to the Parse cloud.</p>
         * @param [options] - <ul>
         * <li>Valid options are:<ul><li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *   be used for this request.
         * <li>sessionToken: A valid session token, used for making a request on
         *   behalf of a specific user.
         * <li>progress: In Browser only, callback for upload progress. For example:
         * </li>
         * </ul>
         * <pre>
         * let parseFile = new Parse.File(name, file);
         * parseFile.save({
         *   progress: (progressValue, loaded, total, { type }) => {
         *     if (type === "upload" && progressValue !== null) {
         *       // Update the UI using progressValue
         *     }
         *   }
         * });
         * </pre>
         * </ul>
         * @returns <p>Promise that is resolved when the save finishes.</p>
         */
        save(options?: any): Promise<Parse.File>;
        /**
         * <p>Aborts the request if it has already been sent.</p>
         */
        cancel(): void;
        /**
         * <p>Deletes the file from the Parse cloud.
         * In Cloud Code and Node only with Master Key.</p>
         * @param [options] - <ul>
         * <li>Valid options are:<ul><li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *   be used for this request.
         * </li>
         * </ul>
         * <pre>
         * @returns <p>Promise that is resolved when the delete finishes.</p>
         */
        destroy(options?: any): Promise<Parse.File>;
        /**
         * <p>Sets metadata to be saved with file object. Overwrites existing metadata</p>
         * @param metadata - <p>Key value pairs to be stored with file object</p>
         */
        setMetadata(metadata: any): void;
        /**
         * <p>Sets metadata to be saved with file object. Adds to existing metadata.</p>
         * @param key - <p>key to store the metadata</p>
         * @param value - <p>metadata</p>
         */
        addMetadata(key: string, value: any): void;
        /**
         * <p>Sets tags to be saved with file object. Overwrites existing tags</p>
         * @param tags - <p>Key value pairs to be stored with file object</p>
         */
        setTags(tags: any): void;
        /**
         * <p>Sets tags to be saved with file object. Adds to existing tags.</p>
         * @param key - <p>key to store tags</p>
         * @param value - <p>tag</p>
         */
        addTag(key: string, value: any): void;
    }
    /**
     * <p>Creates a new GeoPoint with any of the following forms:<br></p>
     *   <pre>
     *   new GeoPoint(otherGeoPoint)
     *   new GeoPoint(30, 30)
     *   new GeoPoint([30, 30])
     *   new GeoPoint({latitude: 30, longitude: 30})
     *   new GeoPoint()  // defaults to (0, 0)
     *   </pre>
     * <p>Represents a latitude / longitude point that may be associated
     * with a key in a ParseObject or used as a reference point for geo queries.
     * This allows proximity-based queries on the key.</p>
     * <p>Only one key in a class may contain a GeoPoint.</p>
     * <p>Example:<pre>
     *   var point = new Parse.GeoPoint(30.0, -20.0);
     *   var object = new Parse.Object("PlaceObject");
     *   object.set("location", point);
     *   object.save();</pre></p>
     * @param [arg1] - <p>Either a list of coordinate pairs, an object with <code>latitude</code>, <code>longitude</code>, or the latitude or the point.</p>
     * @param [arg2] - <p>The longitude of the GeoPoint</p>
     */
    class GeoPoint {
        constructor(arg1?: number[] | any | number, arg2?: number);
        /**
         * <p>North-south portion of the coordinate, in range [-90, 90].
         * Throws an exception if set out of range in a modern browser.</p>
         */
        latitude: {
            latitude: number;
        };
        /**
         * <p>East-west portion of the coordinate, in range [-180, 180].
         * Throws if set out of range in a modern browser.</p>
         */
        longitude: {
            longitude: number;
        };
        /**
         * <p>Returns a JSON representation of the GeoPoint, suitable for Parse.</p>
         */
        toJSON(): any;
        /**
         * <p>Returns the distance from this GeoPoint to another in radians.</p>
         * @param point - <p>the other Parse.GeoPoint.</p>
         */
        radiansTo(point: Parse.GeoPoint): number;
        /**
         * <p>Returns the distance from this GeoPoint to another in kilometers.</p>
         * @param point - <p>the other Parse.GeoPoint.</p>
         */
        kilometersTo(point: Parse.GeoPoint): number;
        /**
         * <p>Returns the distance from this GeoPoint to another in miles.</p>
         * @param point - <p>the other Parse.GeoPoint.</p>
         */
        milesTo(point: Parse.GeoPoint): number;
        /**
         * <p>Creates a GeoPoint with the user's current location, if available.</p>
         * @returns <p>User's current location</p>
         */
        static current(): Parse.GeoPoint;
    }
    /**
     * @param [attributes] - <p>The initial set of data to store in the installation.</p>
     */
    class Installation {
        constructor(attributes?: any);
    }
    /**
     * <p>We expose three events to help you monitor the status of the WebSocket connection:</p>
     * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
     * <pre>
     * Parse.LiveQuery.on('open', () => {
     *
     * });</pre></p>
     * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
     * <pre>
     * Parse.LiveQuery.on('close', () => {
     *
     * });</pre></p>
     * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.
     * <pre>
     * Parse.LiveQuery.on('error', (error) => {
     *
     * });</pre></p>
     */
    class LiveQuery {
        /**
         * <p>After open is called, the LiveQuery will try to send a connect request
         * to the LiveQuery server.</p>
         * @param func - <p>function to run on open</p>
         */
        static open(func: (...params: any[]) => any): void;
        /**
         * <p>When you're done using LiveQuery, you can call Parse.LiveQuery.close().
         * This function will close the WebSocket connection to the LiveQuery server,
         * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
         * If you call query.subscribe() after this, we'll create a new WebSocket
         * connection to the LiveQuery server.</p>
         * @param func - <p>function to run on close</p>
         */
        static close(func: (...params: any[]) => any): void;
    }
    type Pointer = {
        __type: string;
        className: string;
        objectId: string;
    };
    /**
     * <p>Creates a new model with defined attributes.</p>
     * <p>You won't normally call this method directly.  It is recommended that
     * you use a subclass of <code>Parse.Object</code> instead, created by calling
     * <code>extend</code>.</p>
     * <p>However, if you don't want to use a subclass, or aren't sure which
     * subclass is appropriate, you can use this form:<pre>
     *     var object = new Parse.Object("ClassName");
     * </pre>
     * That is basically equivalent to:<pre>
     *     var MyClass = Parse.Object.extend("ClassName");
     *     var object = new MyClass();
     * </pre></p>
     * @param [className] - <p>The class name for the object</p>
     * @param [attributes] - <p>The initial set of data to store in the object.</p>
     * @param [options] - <p>The options for this object instance.</p>
     */
    class Object<T extends Attributes = Attributes> {
        constructor(className?: string, attributes?: T, options?: any);
        /**
         * <p>Object attributes</p>
         */
        attributes: T;
        /**
         * <p>The first time this object was saved on the server.</p>
         */
        createdAt: Date;
        /**
         * <p>The last time this object was updated on the server.</p>
         */
        updatedAt: Date;
        /**
         * <p>Returns a local or server Id used uniquely identify this object</p>
         */
        _getId(): string;
        /**
         * <p>Returns a unique identifier used to pull data from the State Controller.</p>
         */
        _getStateIdentifier(): Parse.Object | any;
        /**
         * @param [keysToClear] - <p>if specified, only ops matching
         * these fields will be cleared</p>
         */
        _clearPendingOps(keysToClear?: string[]): void;
        /**
         * <p>Public methods</p>
         */
        initialize(): void;
        /**
         * <p>Returns a JSON version of the object suitable for saving to Parse.</p>
         */
        toJSON(seen?: any, offline?: any): any;
        /**
         * <p>Determines whether this ParseObject is equal to another ParseObject</p>
         * @param other - <p>An other object ot compare</p>
         */
        equals(other: any): boolean;
        /**
         * <p>Returns true if this object has been modified since its last
         * save/refresh.  If an attribute is specified, it returns true only if that
         * particular attribute has been modified since the last save/refresh.</p>
         * @param [attr] - <p>An attribute name (optional).</p>
         */
        dirty(attr?: string): boolean;
        /**
         * <p>Returns an array of keys that have been modified since last save/refresh</p>
         */
        dirtyKeys(): string[];
        /**
         * <p>Returns true if the object has been fetched.</p>
         */
        isDataAvailable(): boolean;
        /**
         * <p>Gets a Pointer referencing this Object.</p>
         */
        toPointer(): Pointer;
        /**
         * <p>Gets a Pointer referencing this Object.</p>
         */
        toOfflinePointer(): Pointer;
        /**
         * <p>Gets the value of an attribute.</p>
         * @param attr - <p>The string name of an attribute.</p>
         */
        get(attr: string): any;
        /**
         * <p>Gets a relation on the given class for the attribute.</p>
         * @param attr - <p>The attribute to get the relation for.</p>
         */
        relation(attr: string): Parse.Relation;
        /**
         * <p>Gets the HTML-escaped value of an attribute.</p>
         * @param attr - <p>The string name of an attribute.</p>
         */
        escape(attr: string): string;
        /**
         * <p>Returns <code>true</code> if the attribute contains a value that is not
         * null or undefined.</p>
         * @param attr - <p>The string name of the attribute.</p>
         */
        has(attr: string): boolean;
        /**
         * <p>Sets a hash of model attributes on the object.</p>
         * <p>You can call it with an object containing keys and values, with one
         * key and value, or dot notation.  For example:<pre>
         *   gameTurn.set({
         *     player: player1,
         *     diceRoll: 2
         *   }, {
         *     error: function(gameTurnAgain, error) {
         *       // The set failed validation.
         *     }
         *   });
         * <p>game.set(&quot;currentPlayer&quot;, player2, {
         * error: function(gameTurnAgain, error) {
         * // The set failed validation.
         * }
         * });</p>
         * <p>game.set(&quot;finished&quot;, true);</pre></p></p>
         * <p>game.set(&quot;player.score&quot;, 10);</pre></p></p>
         * @param key - <p>The key to set.</p>
         * @param [value] - <p>The value to give it. Optional if <code>key</code> is an object.</p>
         * @param [options] - <p>A set of options for the set.
         * The only supported option is <code>error</code>.</p>
         * @returns <p>true if the set succeeded.</p>
         */
        set(key: string | any, value?: string | any, options?: any): Parse.Object | boolean;
        /**
         * <p>Remove an attribute from the model. This is a noop if the attribute doesn't
         * exist.</p>
         * @param attr - <p>The string name of an attribute.</p>
         */
        unset(attr: string, options?: any): Parse.Object | boolean;
        /**
         * <p>Atomically increments the value of the given attribute the next time the
         * object is saved. If no amount is specified, 1 is used by default.</p>
         * @param attr - <p>The key.</p>
         * @param [amount] - <p>The amount to increment by (optional).</p>
         */
        increment(attr: string, amount?: number): Parse.Object | boolean;
        /**
         * <p>Atomically decrements the value of the given attribute the next time the
         * object is saved. If no amount is specified, 1 is used by default.</p>
         * @param attr - <p>The key.</p>
         * @param [amount] - <p>The amount to decrement by (optional).</p>
         */
        decrement(attr: string, amount?: number): Parse.Object | boolean;
        /**
         * <p>Atomically add an object to the end of the array associated with a given
         * key.</p>
         * @param attr - <p>The key.</p>
         * @param item - <p>The item to add.</p>
         */
        add(attr: string, item: any): Parse.Object | boolean;
        /**
         * <p>Atomically add the objects to the end of the array associated with a given
         * key.</p>
         * @param attr - <p>The key.</p>
         * @param items - <p>The items to add.</p>
         */
        addAll(attr: string, items: any[]): Parse.Object | boolean;
        /**
         * <p>Atomically add an object to the array associated with a given key, only
         * if it is not already present in the array. The position of the insert is
         * not guaranteed.</p>
         * @param attr - <p>The key.</p>
         * @param item - <p>The object to add.</p>
         */
        addUnique(attr: string, item: any): Parse.Object | boolean;
        /**
         * <p>Atomically add the objects to the array associated with a given key, only
         * if it is not already present in the array. The position of the insert is
         * not guaranteed.</p>
         * @param attr - <p>The key.</p>
         * @param items - <p>The objects to add.</p>
         */
        addAllUnique(attr: string, items: any[]): Parse.Object | boolean;
        /**
         * <p>Atomically remove all instances of an object from the array associated
         * with a given key.</p>
         * @param attr - <p>The key.</p>
         * @param item - <p>The object to remove.</p>
         */
        remove(attr: string, item: any): Parse.Object | boolean;
        /**
         * <p>Atomically remove all instances of the objects from the array associated
         * with a given key.</p>
         * @param attr - <p>The key.</p>
         * @param items - <p>The object to remove.</p>
         */
        removeAll(attr: string, items: any[]): Parse.Object | boolean;
        /**
         * <p>Returns an instance of a subclass of Parse.Op describing what kind of
         * modification has been performed on this field since the last time it was
         * saved. For example, after calling object.increment(&quot;x&quot;), calling
         * object.op(&quot;x&quot;) would return an instance of Parse.Op.Increment.</p>
         * @param attr - <p>The key.</p>
         * @returns <p>The operation, or undefined if none.</p>
         */
        op(attr: string): Parse.Op;
        /**
         * <p>Creates a new model with identical attributes to this one.</p>
         */
        clone(): Parse.Object;
        /**
         * <p>Creates a new instance of this object. Not to be confused with clone()</p>
         */
        newInstance(): Parse.Object;
        /**
         * <p>Returns true if this object has never been saved to Parse.</p>
         */
        isNew(): boolean;
        /**
         * <p>Returns true if this object was created by the Parse server when the
         * object might have already been there (e.g. in the case of a Facebook
         * login)</p>
         */
        existed(): boolean;
        /**
         * <p>Returns true if this object exists on the Server</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A boolean promise that is fulfilled if object exists.</p>
         */
        exists(options: any): Promise<boolean>;
        /**
         * <p>Checks if the model is currently in a valid state.</p>
         */
        isValid(): boolean;
        /**
         * <p>You should not call this function directly unless you subclass
         * <code>Parse.Object</code>, in which case you can override this method
         * to provide additional validation on <code>set</code> and
         * <code>save</code>.  Your implementation should return</p>
         * @param attrs - <p>The current data to validate.</p>
         * @returns <p>False if the data is valid.  An error object otherwise.</p>
         */
        validate(attrs: any): Parse.Error | boolean;
        /**
         * <p>Returns the ACL for this object.</p>
         * @returns <p>An instance of Parse.ACL.</p>
         */
        getACL(): Parse.ACL;
        /**
         * <p>Sets the ACL to be used for this object.</p>
         * @param acl - <p>An instance of Parse.ACL.</p>
         * @returns <p>Whether the set passed validation.</p>
         */
        setACL(acl: Parse.ACL, options?: any): Parse.Object | boolean;
        /**
         * <p>Clears any (or specific) changes to this object made since the last call to save()</p>
         * @param keys - <p>specify which fields to revert</p>
         */
        revert(...keys: string[]): void;
        /**
         * <p>Clears all attributes on a model</p>
         */
        clear(): Parse.Object | boolean;
        /**
         * <p>Fetch the model from the server. If the server's representation of the
         * model differs from its current attributes, they will be overriden.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>include: The name(s) of the key(s) to include. Can be a string, an array of strings,
         *       or an array of array of strings.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
         * </ul>
         * @returns <p>A promise that is fulfilled when the fetch
         * completes.</p>
         */
        fetch(options: any): Promise<this>;
        /**
         * <p>Fetch the model from the server. If the server's representation of the
         * model differs from its current attributes, they will be overriden.</p>
         * <p>Includes nested Parse.Objects for the provided key. You can use dot
         * notation to specify which fields in the included object are also fetched.</p>
         * @param keys - <p>The name(s) of the key(s) to include.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that is fulfilled when the fetch
         * completes.</p>
         */
        fetchWithInclude(keys: string | (string | string[])[], options?: any): Promise<this>;
        /**
         * <p>Saves this object to the server at some unspecified time in the future,
         * even if Parse is currently inaccessible.</p>
         * <p>Use this when you may not have a solid network connection, and don't need to know when the save completes.
         * If there is some problem with the object such that it can't be saved, it will be silently discarded.</p>
         * <p>Objects saved with this method will be stored locally in an on-disk cache until they can be delivered to Parse.
         * They will be sent immediately if possible. Otherwise, they will be sent the next time a network connection is
         * available. Objects saved this way will persist even after the app is closed, in which case they will be sent the
         * next time the app is opened.</p>
         * @param [options] - <p>Used to pass option parameters to method if arg1 and arg2 were both passed as strings.
         * Valid options are:</p>
         * <ul>
         * <li>sessionToken: A valid session token, used for making a request on
         * behalf of a specific user.
         * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
         * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
         * </ul>
         * @returns <p>A promise that is fulfilled when the save
         * completes.</p>
         */
        saveEventually(options?: any): Promise<this>;
        /**
         * <p>Set a hash of model attributes, and save the model to the server.
         * updatedAt will be updated when the request returns.
         * You can either call it as:<pre>
         * object.save();</pre>
         * or<pre>
         * object.save(attrs);</pre>
         * or<pre>
         * object.save(null, options);</pre>
         * or<pre>
         * object.save(attrs, options);</pre>
         * or<pre>
         * object.save(key, value);</pre>
         * or<pre>
         * object.save(key, value, options);</pre></p>
         * <p>Example 1: <pre>
         * gameTurn.save({
         * player: &quot;Jake Cutter&quot;,
         * diceRoll: 2
         * }).then(function(gameTurnAgain) {
         * // The save was successful.
         * }, function(error) {
         * // The save failed.  Error is an instance of Parse.Error.
         * });</pre></p>
         * <p>Example 2: <pre>
         * gameTurn.save(&quot;player&quot;, &quot;Jake Cutter&quot;);</pre></p>
         * @param [arg1] - <p>Valid options are:<ul></p>
         * <li>`Object` - Key/value pairs to update on the object.</li>
         * <li>`String` Key - Key of attribute to update (requires arg2 to also be string)</li>
         * <li>`null` - Passing null for arg1 allows you to save the object with options passed in arg2.</li>
         * </ul>
         * @param [arg2] - <ul>
         * <li>`String` Value - If arg1 was passed as a key, arg2 is the value that should be set on that key.</li>
         * <li>`Object` Options - Valid options are:
         * <ul>
         * <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         * be used for this request.
         * <li>sessionToken: A valid session token, used for making a request on
         * behalf of a specific user.
         * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
         * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
         * </ul>
         * </li>
         * </ul>
         * @param [arg3] - <p>Used to pass option parameters to method if arg1 and arg2 were both passed as strings.
         * Valid options are:</p>
         * <ul>
         * <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         * be used for this request.
         * <li>sessionToken: A valid session token, used for making a request on
         * behalf of a specific user.
         * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
         * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
         * </ul>
         * @returns <p>A promise that is fulfilled when the save
         * completes.</p>
         */
        save(arg1?: string | any | null, arg2?: string | any, arg3?: any): Promise<this>;
        /**
         * <p>Deletes this object from the server at some unspecified time in the future,
         * even if Parse is currently inaccessible.</p>
         * <p>Use this when you may not have a solid network connection,
         * and don't need to know when the delete completes. If there is some problem with the object
         * such that it can't be deleted, the request will be silently discarded.</p>
         * <p>Delete instructions made with this method will be stored locally in an on-disk cache until they can be transmitted
         * to Parse. They will be sent immediately if possible. Otherwise, they will be sent the next time a network connection
         * is available. Delete requests will persist even after the app is closed, in which case they will be sent the
         * next time the app is opened.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeDelete` and `afterDelete` triggers.
         * </ul>
         * @returns <p>A promise that is fulfilled when the destroy
         * completes.</p>
         */
        destroyEventually(options?: any): Promise<this>;
        /**
         * <p>Destroy this model on the server if it was already persisted.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeDelete` and `afterDelete` triggers.
         * </ul>
         * @returns <p>A promise that is fulfilled when the destroy
         * completes.</p>
         */
        destroy(options: any): Promise<this>;
        /**
         * <p>Asynchronously stores the object and every object it points to in the local datastore,
         * recursively, using a default pin name: _default.</p>
         * <p>If those other objects have not been fetched from Parse, they will not be stored.
         * However, if they have changed data, all the changes will be retained.</p>
         * <pre>
         * await object.pin();
         * </pre>
         * <p>To retrieve object:
         * <code>query.fromLocalDatastore()</code> or <code>query.fromPin()</code></p>
         * @returns <p>A promise that is fulfilled when the pin completes.</p>
         */
        pin(): Promise<any>;
        /**
         * <p>Asynchronously removes the object and every object it points to in the local datastore,
         * recursively, using a default pin name: _default.</p>
         * <pre>
         * await object.unPin();
         * </pre>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        unPin(): Promise<any>;
        /**
         * <p>Asynchronously returns if the object is pinned</p>
         * <pre>
         * const isPinned = await object.isPinned();
         * </pre>
         * @returns <p>A boolean promise that is fulfilled if object is pinned.</p>
         */
        isPinned(): Promise<boolean>;
        /**
         * <p>Asynchronously stores the objects and every object they point to in the local datastore, recursively.</p>
         * <p>If those other objects have not been fetched from Parse, they will not be stored.
         * However, if they have changed data, all the changes will be retained.</p>
         * <pre>
         * await object.pinWithName(name);
         * </pre>
         * <p>To retrieve object:
         * <code>query.fromLocalDatastore()</code> or <code>query.fromPinWithName(name)</code></p>
         * @param name - <p>Name of Pin.</p>
         * @returns <p>A promise that is fulfilled when the pin completes.</p>
         */
        pinWithName(name: string): Promise<void>;
        /**
         * <p>Asynchronously removes the object and every object it points to in the local datastore, recursively.</p>
         * <pre>
         * await object.unPinWithName(name);
         * </pre>
         * @param name - <p>Name of Pin.</p>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        unPinWithName(name: string): Promise<void>;
        /**
         * <p>Asynchronously loads data from the local datastore into this object.</p>
         * <pre>
         * await object.fetchFromLocalDatastore();
         * </pre>
         * <p>You can create an unfetched pointer with <code>Parse.Object.createWithoutData()</code>
         * and then call <code>fetchFromLocalDatastore()</code> on it.</p>
         * @returns <p>A promise that is fulfilled when the fetch completes.</p>
         */
        fetchFromLocalDatastore(): Promise<this>;
        /**
         * <p>Static methods</p>
         */
        static _clearAllState(): void;
        /**
         * <p>Fetches the given list of Parse.Object.
         * If any error is encountered, stops and calls the error handler.</p>
         * <pre>
         *   Parse.Object.fetchAll([object1, object2, ...])
         *    .then((list) => {
         *      // All the objects were fetched.
         *    }, (error) => {
         *      // An error occurred while fetching one of the objects.
         *    });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>include: The name(s) of the key(s) to include. Can be a string, an array of strings,
         *       or an array of array of strings.
         * </ul>
         */
        static fetchAll(list: any[], options: any): Parse.Object[];
        /**
         * <p>Fetches the given list of Parse.Object.</p>
         * <p>Includes nested Parse.Objects for the provided key. You can use dot
         * notation to specify which fields in the included object are also fetched.</p>
         * <p>If any error is encountered, stops and calls the error handler.</p>
         * <pre>
         *   Parse.Object.fetchAllWithInclude([object1, object2, ...], [pointer1, pointer2, ...])
         *    .then((list) => {
         *      // All the objects were fetched.
         *    }, (error) => {
         *      // An error occurred while fetching one of the objects.
         *    });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         * @param keys - <p>The name(s) of the key(s) to include.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         */
        static fetchAllWithInclude(list: any[], keys: string | (string | string[])[], options?: any): Parse.Object[];
        /**
         * <p>Fetches the given list of Parse.Object if needed.
         * If any error is encountered, stops and calls the error handler.</p>
         * <p>Includes nested Parse.Objects for the provided key. You can use dot
         * notation to specify which fields in the included object are also fetched.</p>
         * <p>If any error is encountered, stops and calls the error handler.</p>
         * <pre>
         *   Parse.Object.fetchAllIfNeededWithInclude([object1, object2, ...], [pointer1, pointer2, ...])
         *    .then((list) => {
         *      // All the objects were fetched.
         *    }, (error) => {
         *      // An error occurred while fetching one of the objects.
         *    });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         * @param keys - <p>The name(s) of the key(s) to include.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         */
        static fetchAllIfNeededWithInclude(list: any[], keys: string | (string | string[])[], options?: any): Parse.Object[];
        /**
         * <p>Fetches the given list of Parse.Object if needed.
         * If any error is encountered, stops and calls the error handler.</p>
         * <pre>
         *   Parse.Object.fetchAllIfNeeded([object1, ...])
         *    .then((list) => {
         *      // Objects were fetched and updated.
         *    }, (error) => {
         *      // An error occurred while fetching one of the objects.
         *    });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         */
        static fetchAllIfNeeded(list: any[], options: any): Parse.Object[];
        /**
         * <p>Destroy the given list of models on the server if it was already persisted.</p>
         * <p>Unlike saveAll, if an error occurs while deleting an individual model,
         * this method will continue trying to delete the rest of the models if
         * possible, except in the case of a fatal error like a connection error.
         * <p>In particular, the Parse.Error object returned in the case of error may
         * be one of two types:
         * <ul>
         * <li>A Parse.Error.AGGREGATE_ERROR. This object's "errors" property is an
         * array of other Parse.Error objects. Each error object in this array
         * has an "object" property that references the object that could not be
         * deleted (for instance, because that object could not be found).</li>
         * <li>A non-aggregate Parse.Error. This indicates a serious error that
         * caused the delete operation to be aborted partway through (for
         * instance, a connection failure in the middle of the delete).</li>
         * </ul>
         * <pre>
         * Parse.Object.destroyAll([object1, object2, ...])
         * .then((list) => {
         * // All the objects were deleted.
         * }, (error) => {
         * // An error occurred while deleting one or more of the objects.
         * // If this is an aggregate error, then we can inspect each error
         * // object individually to determine the reason why a particular
         * // object was not deleted.
         * if (error.code === Parse.Error.AGGREGATE_ERROR) {
         * for (var i = 0; i < error.errors.length; i++) {
         * console.log("Couldn't delete " + error.errors[i].object.id +
         * "due to " + error.errors[i].message);
         * }
         * } else {
         * console.log("Delete aborted because of " + error.message);
         * }
         * });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         * @returns <p>A promise that is fulfilled when the destroyAll
         * completes.</p>
         */
        static destroyAll(list: any[], options: any): Promise<any>;
        /**
         * <p>Saves the given list of Parse.Object.
         * If any error is encountered, stops and calls the error handler.</p>
         * <pre>
         * Parse.Object.saveAll([object1, object2, ...])
         * .then((list) => {
         * // All the objects were saved.
         * }, (error) => {
         * // An error occurred while saving one of the objects.
         * });
         * </pre>
         * @param list - <p>A list of <code>Parse.Object</code>.</p>
         */
        static saveAll<T extends readonly Object[]>(list: T, options?: any): Parse.Object[];
        /**
         * <p>Creates a reference to a subclass of Parse.Object with the given id. This
         * does not exist on Parse.Object, only on subclasses.</p>
         * <p>A shortcut for: <pre>
         *  var Foo = Parse.Object.extend("Foo");
         *  var pointerToFoo = new Foo();
         *  pointerToFoo.id = "myObjectId";
         * </pre>
         * @param id - <p>The ID of the object to create a reference to.</p>
         * @returns <p>A Parse.Object reference.</p>
         */
        static createWithoutData(id: string): Parse.Object;
        /**
         * <p>Creates a new instance of a Parse Object from a JSON representation.</p>
         * @param json - <p>The JSON map of the Object's data</p>
         * @param [override] - <p>In single instance mode, all old server data
         * is overwritten if this is set to true</p>
         * @param [dirty] - <p>Whether the Parse.Object should set JSON keys to dirty</p>
         * @returns <p>A Parse.Object reference</p>
         */
        static fromJSON(json: any, override?: boolean, dirty?: boolean): Parse.Object;
        /**
         * <p>Registers a subclass of Parse.Object with a specific class name.
         * When objects of that class are retrieved from a query, they will be
         * instantiated with this subclass.
         * This is only necessary when using ES6 subclassing.</p>
         * @param className - <p>The class name of the subclass</p>
         * @param constructor - <p>The subclass</p>
         */
        static registerSubclass(className: string, constructor: (...params: any[]) => any): void;
        /**
         * <p>Unegisters a subclass of Parse.Object with a specific class name.</p>
         * @param className - <p>The class name of the subclass</p>
         */
        static unregisterSubclass(className: string): void;
        /**
         * <p>Creates a new subclass of Parse.Object for the given Parse class name.</p>
         * <p>Every extension of a Parse class will inherit from the most recent
         * previous extension of that class. When a Parse.Object is automatically
         * created by parsing JSON, it will use the most recent extension of that
         * class.</p>
         * <p>You should call either:<pre>
         *     var MyClass = Parse.Object.extend("MyClass", {
         *         <i>Instance methods</i>,
         *         initialize: function(attrs, options) {
         *             this.someInstanceProperty = [],
         *             <i>Other instance properties</i>
         *         }
         *     }, {
         *         <i>Class properties</i>
         *     });</pre>
         * or, for Backbone compatibility:<pre>
         *     var MyClass = Parse.Object.extend({
         *         className: "MyClass",
         *         <i>Instance methods</i>,
         *         initialize: function(attrs, options) {
         *             this.someInstanceProperty = [],
         *             <i>Other instance properties</i>
         *         }
         *     }, {
         *         <i>Class properties</i>
         *     });</pre></p>
         * @param className - <p>The name of the Parse class backing this model.</p>
         * @param protoProps - <p>Instance properties to add to instances of the
         * class returned from this method.</p>
         * @param classProps - <p>Class properties to add the class returned from
         * this method.</p>
         * @returns <p>A new subclass of Parse.Object.</p>
         */
        static extend(className: string, protoProps: any, classProps: any): Parse.Object;
        /**
         * <p>Enable single instance objects, where any local objects with the same Id
         * share the same attributes, and stay synchronized with each other.
         * This is disabled by default in server environments, since it can lead to
         * security issues.</p>
         */
        static enableSingleInstance(): void;
        /**
         * <p>Disable single instance objects, where any local objects with the same Id
         * share the same attributes, and stay synchronized with each other.
         * When disabled, you can have two instances of the same object in memory
         * without them sharing attributes.</p>
         */
        static disableSingleInstance(): void;
        /**
         * <p>Asynchronously stores the objects and every object they point to in the local datastore,
         * recursively, using a default pin name: _default.</p>
         * <p>If those other objects have not been fetched from Parse, they will not be stored.
         * However, if they have changed data, all the changes will be retained.</p>
         * <pre>
         * await Parse.Object.pinAll([...]);
         * </pre>
         * <p>To retrieve object:
         * <code>query.fromLocalDatastore()</code> or <code>query.fromPin()</code></p>
         * @param objects - <p>A list of <code>Parse.Object</code>.</p>
         * @returns <p>A promise that is fulfilled when the pin completes.</p>
         */
        static pinAll(objects: any[]): Promise<void>;
        /**
         * <p>Asynchronously stores the objects and every object they point to in the local datastore, recursively.</p>
         * <p>If those other objects have not been fetched from Parse, they will not be stored.
         * However, if they have changed data, all the changes will be retained.</p>
         * <pre>
         * await Parse.Object.pinAllWithName(name, [obj1, obj2, ...]);
         * </pre>
         * <p>To retrieve object:
         * <code>query.fromLocalDatastore()</code> or <code>query.fromPinWithName(name)</code></p>
         * @param name - <p>Name of Pin.</p>
         * @param objects - <p>A list of <code>Parse.Object</code>.</p>
         * @returns <p>A promise that is fulfilled when the pin completes.</p>
         */
        static pinAllWithName(name: string, objects: any[]): Promise<void>;
        /**
         * <p>Asynchronously removes the objects and every object they point to in the local datastore,
         * recursively, using a default pin name: _default.</p>
         * <pre>
         * await Parse.Object.unPinAll([...]);
         * </pre>
         * @param objects - <p>A list of <code>Parse.Object</code>.</p>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        static unPinAll(objects: any[]): Promise<void>;
        /**
         * <p>Asynchronously removes the objects and every object they point to in the local datastore, recursively.</p>
         * <pre>
         * await Parse.Object.unPinAllWithName(name, [obj1, obj2, ...]);
         * </pre>
         * @param name - <p>Name of Pin.</p>
         * @param objects - <p>A list of <code>Parse.Object</code>.</p>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        static unPinAllWithName(name: string, objects: any[]): Promise<void>;
        /**
         * <p>Asynchronously removes all objects in the local datastore using a default pin name: _default.</p>
         * <pre>
         * await Parse.Object.unPinAllObjects();
         * </pre>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        static unPinAllObjects(): Promise<void>;
        /**
         * <p>Asynchronously removes all objects with the specified pin name.
         * Deletes the pin name also.</p>
         * <pre>
         * await Parse.Object.unPinAllObjectsWithName(name);
         * </pre>
         * @param name - <p>Name of Pin.</p>
         * @returns <p>A promise that is fulfilled when the unPin completes.</p>
         */
        static unPinAllObjectsWithName(name: string): Promise<void>;
    }
    /**
     * <p>Creates a new Polygon with any of the following forms:<br></p>
     *   <pre>
     *   new Polygon([[0,0],[0,1],[1,1],[1,0]])
     *   new Polygon([GeoPoint, GeoPoint, GeoPoint])
     *   </pre>
     * <p>Represents a coordinates that may be associated
     * with a key in a ParseObject or used as a reference point for geo queries.
     * This allows proximity-based queries on the key.</p>
     * <p>Example:<pre>
     *   var polygon = new Parse.Polygon([[0,0],[0,1],[1,1],[1,0]]);
     *   var object = new Parse.Object("PlaceObject");
     *   object.set("area", polygon);
     *   object.save();</pre></p>
     * @param coordinates - <p>An Array of coordinate pairs</p>
     */
    class Polygon {
        constructor(coordinates: number[][] | Parse.GeoPoint[]);
        /**
         * <p>Coordinates value for this Polygon.
         * Throws an exception if not valid type.</p>
         * @property coordinates - <p>list of coordinates</p>
         */
        coordinates: {
            coordinates: number[][] | Parse.GeoPoint[];
        };
        /**
         * <p>Returns a JSON representation of the Polygon, suitable for Parse.</p>
         */
        toJSON(): any;
        /**
         * <p>Checks if two polygons are equal</p>
         */
        equals(other: Parse.Polygon | any): boolean;
        /**
         * @returns <p>Returns if the point is contained in the polygon</p>
         */
        containsPoint(point: Parse.GeoPoint): boolean;
        /**
         * <p>Validates that the list of coordinates can form a valid polygon</p>
         * @param coords - <p>the list of coordinates to validate as a polygon</p>
         * @returns <p>Array of coordinates if validated.</p>
         */
        static _validate(coords: any[]): number[][];
    }
    /**
     * <p>Creates a new parse Parse.Query for the given Parse.Object subclass.</p>
     * <p>Parse.Query defines a query that is used to fetch Parse.Objects. The
     * most common use case is finding all objects that match a query through the
     * <code>find</code> method. for example, this sample code fetches all objects
     * of class <code>myclass</code>. it calls a different function depending on
     * whether the fetch succeeded or not.
     * <pre>
     * var query = new Parse.Query(myclass);
     * query.find().then((results) => {
     *   // results is an array of parse.object.
     * }).catch((error) =>  {
     *  // error is an instance of parse.error.
     * });</pre></p>
     * <p>a Parse.Query can also be used to retrieve a single object whose id is
     * known, through the get method. for example, this sample code fetches an
     * object of class <code>myclass</code> and id <code>myid</code>. it calls a
     * different function depending on whether the fetch succeeded or not.
     * <pre>
     * var query = new Parse.Query(myclass);
     * query.get(myid).then((object) => {
     *     // object is an instance of parse.object.
     * }).catch((error) =>  {
     *  // error is an instance of parse.error.
     * });</pre></p>
     * <p>a Parse.Query can also be used to count the number of objects that match
     * the query without retrieving all of those objects. for example, this
     * sample code counts the number of objects of the class <code>myclass</code>
     * <pre>
     * var query = new Parse.Query(myclass);
     * query.count().then((number) => {
     *     // there are number instances of myclass.
     * }).catch((error) => {
     *     // error is an instance of Parse.Error.
     * });</pre></p>
     * @param objectClass - <p>An instance of a subclass of Parse.Object, or a Parse className string.</p>
     */
    class Query<T extends Object = Object, R=(new (...args: any[]) => T | Parse.Object)> {
        constructor(objectClass: string | R);
        /**
         * <p>Adds constraint that at least one of the passed in queries matches.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        _orQuery(queries: any[]): Parse.Query;
        /**
         * <p>Adds constraint that all of the passed in queries match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        _andQuery(queries: any[]): Parse.Query;
        /**
         * <p>Adds constraint that none of the passed in queries match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        _norQuery(queries: any[]): Parse.Query;
        /**
         * <p>Helper for condition queries</p>
         */
        _addCondition(key: any, condition: any, value: any): Parse.Query;
        /**
         * <p>Converts string for regular expression at the beginning</p>
         */
        _regexStartWith(string: any): string;
        /**
         * <p>Returns a JSON representation of this query.</p>
         * @returns <p>The JSON representation of the query.</p>
         */
        toJSON(): any;
        /**
         * <p>Return a query with conditions from json, can be useful to send query from server side to client
         * Not static, all query conditions was set before calling this method will be deleted.
         * For example on the server side we have
         * var query = new Parse.Query(&quot;className&quot;);
         * query.equalTo(key: value);
         * query.limit(100);
         * ... (others queries)
         * Create JSON representation of Query Object
         * var jsonFromServer = query.fromJSON();</p>
         * <p>On client side getting query:
         * var query = new Parse.Query(&quot;className&quot;);
         * query.fromJSON(jsonFromServer);</p>
         * <p>and continue to query...
         * query.skip(100).find().then(...);</p>
         * @param json - <p>from Parse.Query.toJSON() method</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withJSON(json: QueryJSON): Parse.Query;
        /**
         * <p>Static method to restore Parse.Query by json representation
         * Internally calling Parse.Query.withJSON</p>
         * @param json - <p>from Parse.Query.toJSON() method</p>
         * @returns <p>new created query</p>
         */
        static fromJSON(className: string, json: QueryJSON): Parse.Query;
        /**
         * <p>Constructs a Parse.Object whose id is already known by fetching data from
         * the server. Unlike the <code>first</code> method, it never returns undefined.</p>
         * @param objectId - <p>The id of the object to be fetched.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
         *   <li>json: Return raw json without converting to Parse.Object
         * </ul>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        get(objectId: string, options?: any): Promise<Parse.Object>;
        /**
         * <p>Retrieves a list of ParseObjects that satisfy this query.</p>
         * @param [options] - <p>Valid options
         * are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
         *   <li>json: Return raw json without converting to Parse.Object
         * </ul>
         * @returns <p>A promise that is resolved with the results when
         * the query completes.</p>
         */
        find(options?: any): Promise<Parse.Object[]>;
        /**
         * <p>Retrieves a complete list of ParseObjects that satisfy this query.
         * Using <code>eachBatch</code> under the hood to fetch all the valid objects.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>batchSize: How many objects to yield in each batch (default: 100)
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that is resolved with the results when
         * the query completes.</p>
         */
        findAll(options: any): Promise<Parse.Object[]>;
        /**
         * <p>Counts the number of objects that match this query.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that is resolved with the count when
         * the query completes.</p>
         */
        count(options: any): Promise<number>;
        /**
         * <p>Executes a distinct query and returns unique values</p>
         * @param key - <p>A field to find distinct values</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that is resolved with the query completes.</p>
         */
        distinct(key: string, options?: any): Promise<any[]>;
        /**
         * <p>Executes an aggregate query and returns aggregate results</p>
         * @param pipeline - <p>Array or Object of stages to process query</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that is resolved with the query completes.</p>
         */
        aggregate(pipeline: any[] | any, options?: any): Promise<any[]>;
        /**
         * <p>Retrieves at most one Parse.Object that satisfies this query.</p>
         * <p>Returns the object if there is one, otherwise undefined.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
         *   <li>json: Return raw json without converting to Parse.Object
         * </ul>
         * @returns <p>A promise that is resolved with the object when
         * the query completes.</p>
         */
        first(options?: any): Promise<Parse.Object>;
        /**
         * <p>Iterates over objects matching a query, calling a callback for each batch.
         * If the callback returns a promise, the iteration will not continue until
         * that promise has been fulfilled. If the callback returns a rejected
         * promise, then iteration will stop with that error. The items are processed
         * in an unspecified order. The query may not have any sort order, and may
         * not use limit or skip.</p>
         * @param callback - <p>Callback that will be called with each result
         * of the query.</p>
         * @param options - <p>Valid options are:<ul></p>
         *   <li>batchSize: How many objects to yield in each batch (default: 100)
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
         * </ul>
         * @returns <p>A promise that will be fulfilled once the
         * iteration has completed.</p>
         */
        eachBatch(callback: (...params: any[]) => any, options: any): Promise<void>;
        /**
         * <p>Iterates over each result of a query, calling a callback for each one. If
         * the callback returns a promise, the iteration will not continue until
         * that promise has been fulfilled. If the callback returns a rejected
         * promise, then iteration will stop with that error. The items are
         * processed in an unspecified order. The query may not have any sort order,
         * and may not use limit or skip.</p>
         * @param callback - <p>Callback that will be called with each result
         * of the query.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that will be fulfilled once the
         * iteration has completed.</p>
         */
        each(callback: (...params: any[]) => any, options?: any): Promise<void>;
        /**
         * <p>Adds a hint to force index selection. (https://docs.mongodb.com/manual/reference/operator/meta/hint/)</p>
         * @param value - <p>String or Object of index that should be used when executing query</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        hint(value: string | any): Parse.Query;
        /**
         * <p>Investigates the query execution plan. Useful for optimizing queries. (https://docs.mongodb.com/manual/reference/operator/meta/explain/)</p>
         * @param explain - <p>Used to toggle the information on the query plan.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        explain(explain?: boolean): Parse.Query;
        /**
         * <p>Iterates over each result of a query, calling a callback for each one. If
         * the callback returns a promise, the iteration will not continue until
         * that promise has been fulfilled. If the callback returns a rejected
         * promise, then iteration will stop with that error. The items are
         * processed in an unspecified order. The query may not have any sort order,
         * and may not use limit or skip.</p>
         * @param callback - <p>Callback <ul></p>
         *   <li>currentObject: The current Parse.Object being processed in the array.</li>
         *   <li>index: The index of the current Parse.Object being processed in the array.</li>
         *   <li>query: The query map was called upon.</li>
         * </ul>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that will be fulfilled once the
         * iteration has completed.</p>
         */
        map(callback: (...params: any[]) => any, options?: any): Promise<any[]>;
        /**
         * <p>Iterates over each result of a query, calling a callback for each one. If
         * the callback returns a promise, the iteration will not continue until
         * that promise has been fulfilled. If the callback returns a rejected
         * promise, then iteration will stop with that error. The items are
         * processed in an unspecified order. The query may not have any sort order,
         * and may not use limit or skip.</p>
         * @param callback - <p>Callback <ul></p>
         *   <li>accumulator: The accumulator accumulates the callback's return values. It is the accumulated value previously returned in the last invocation of the callback.</li>
         *   <li>currentObject: The current Parse.Object being processed in the array.</li>
         *   <li>index: The index of the current Parse.Object being processed in the array.</li>
         * </ul>
         * @param initialValue - <p>A value to use as the first argument to the first call of the callback. If no initialValue is supplied, the first object in the query will be used and skipped.</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that will be fulfilled once the
         * iteration has completed.</p>
         */
        reduce(callback: (...params: any[]) => any, initialValue: any, options?: any): Promise<any[]>;
        /**
         * <p>Iterates over each result of a query, calling a callback for each one. If
         * the callback returns a promise, the iteration will not continue until
         * that promise has been fulfilled. If the callback returns a rejected
         * promise, then iteration will stop with that error. The items are
         * processed in an unspecified order. The query may not have any sort order,
         * and may not use limit or skip.</p>
         * @param callback - <p>Callback <ul></p>
         *   <li>currentObject: The current Parse.Object being processed in the array.</li>
         *   <li>index: The index of the current Parse.Object being processed in the array.</li>
         *   <li>query: The query filter was called upon.</li>
         * </ul>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         *   <li>sessionToken: A valid session token, used for making a request on
         *       behalf of a specific user.
         * </ul>
         * @returns <p>A promise that will be fulfilled once the
         * iteration has completed.</p>
         */
        filter(callback: (...params: any[]) => any, options?: any): Promise<Parse.Object[]>;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be equal to the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that the Parse.Object must contain.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        equalTo(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be not equal to the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that must not be equalled.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        notEqualTo(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be less than the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that provides an upper bound.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        lessThan(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be greater than the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that provides an lower bound.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        greaterThan(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be less than or equal to the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that provides an upper bound.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        lessThanOrEqualTo(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be greater than or equal to the provided value.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The value that provides an lower bound.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        greaterThanOrEqualTo(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be contained in the provided list of values.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The values that will match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        containedIn(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * not be contained in the provided list of values.</p>
         * @param key - <p>The key to check.</p>
         * @param value - <p>The values that will not match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        notContainedIn(key: string, value: any): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * be contained by the provided list of values. Get objects where all array elements match.</p>
         * @param key - <p>The key to check.</p>
         * @param values - <p>The values that will match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        containedBy(key: string, values: any[]): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * contain each one of the provided list of values.</p>
         * @param key - <p>The key to check.  This key's value must be an array.</p>
         * @param values - <p>The values that will match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        containsAll(key: string, values: any[]): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's value to
         * contain each one of the provided list of values starting with given strings.</p>
         * @param key - <p>The key to check.  This key's value must be an array.</p>
         * @param values - <p>The string values that will match as starting string.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        containsAllStartingWith(key: string, values: string[]): Parse.Query;
        /**
         * <p>Adds a constraint for finding objects that contain the given key.</p>
         * @param key - <p>The key that should exist.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        exists(key: string): Parse.Query;
        /**
         * <p>Adds a constraint for finding objects that do not contain a given key.</p>
         * @param key - <p>The key that should not exist</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        doesNotExist(key: string): Parse.Query;
        /**
         * <p>Adds a regular expression constraint for finding string values that match
         * the provided regular expression.
         * This may be slow for large datasets.</p>
         * @param key - <p>The key that the string to match is stored in.</p>
         * @param regex - <p>The regular expression pattern to match.</p>
         * @param [modifiers] - <p>The regular expression mode.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        matches(key: string, regex: RegExp, modifiers?: string): Parse.Query;
        /**
         * <p>Adds a constraint that requires that a key's value matches a Parse.Query
         * constraint.</p>
         * @param key - <p>The key that the contains the object to match the
         * query.</p>
         * @param query - <p>The query that should match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        matchesQuery(key: string, query: Parse.Query): Parse.Query;
        /**
         * <p>Adds a constraint that requires that a key's value not matches a
         * Parse.Query constraint.</p>
         * @param key - <p>The key that the contains the object to match the
         * query.</p>
         * @param query - <p>The query that should not match.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        doesNotMatchQuery(key: string, query: Parse.Query): Parse.Query;
        /**
         * <p>Adds a constraint that requires that a key's value matches a value in
         * an object returned by a different Parse.Query.</p>
         * @param key - <p>The key that contains the value that is being
         * matched.</p>
         * @param queryKey - <p>The key in the objects returned by the query to
         * match against.</p>
         * @param query - <p>The query to run.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        matchesKeyInQuery(key: string, queryKey: string, query: Parse.Query): Parse.Query;
        /**
         * <p>Adds a constraint that requires that a key's value not match a value in
         * an object returned by a different Parse.Query.</p>
         * @param key - <p>The key that contains the value that is being
         * excluded.</p>
         * @param queryKey - <p>The key in the objects returned by the query to
         * match against.</p>
         * @param query - <p>The query to run.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        doesNotMatchKeyInQuery(key: string, queryKey: string, query: Parse.Query): Parse.Query;
        /**
         * <p>Adds a constraint for finding string values that contain a provided
         * string.  This may be slow for large datasets.</p>
         * @param key - <p>The key that the string to match is stored in.</p>
         * @param substring - <p>The substring that the value must contain.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        contains(key: string, substring: string): Parse.Query;
        /**
         * <p>Adds a constraint for finding string values that contain a provided
         * string. This may be slow for large datasets. Requires Parse-Server &gt; 2.5.0</p>
         * <p>In order to sort you must use select and ascending ($score is required)</p>
         *  <pre>
         *   query.fullText('field', 'term');
         *   query.ascending('$score');
         *   query.select('$score');
         *  </pre>
         * <p>To retrieve the weight / rank</p>
         *  <pre>
         *   object->get('score');
         *  </pre>
         * <p>You can define optionals by providing an object as a third parameter</p>
         *  <pre>
         *   query.fullText('field', 'term', { language: 'es', diacriticSensitive: true });
         *  </pre>
         * @param key - <p>The key that the string to match is stored in.</p>
         * @param value - <p>The string to search</p>
         * @param [options] - <p>(Optional)</p>
         * @param options.language - <p>The language that determines the list of stop words for the search and the rules for the stemmer and tokenizer.</p>
         * @param options.caseSensitive - <p>A boolean flag to enable or disable case sensitive search.</p>
         * @param options.diacriticSensitive - <p>A boolean flag to enable or disable diacritic sensitive search.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        fullText(key: string, value: string, options?: {
            language: string;
            caseSensitive: boolean;
            diacriticSensitive: boolean;
        }): Parse.Query;
        /**
         * <p>Method to sort the full text search by text score</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        sortByTextScore(): Parse.Query;
        /**
         * <p>Adds a constraint for finding string values that start with a provided
         * string.  This query will use the backend index, so it will be fast even
         * for large datasets.</p>
         * @param key - <p>The key that the string to match is stored in.</p>
         * @param prefix - <p>The substring that the value must start with.</p>
         * @param [modifiers] - <p>The regular expression mode.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        startsWith(key: string, prefix: string, modifiers?: string): Parse.Query;
        /**
         * <p>Adds a constraint for finding string values that end with a provided
         * string.  This will be slow for large datasets.</p>
         * @param key - <p>The key that the string to match is stored in.</p>
         * @param suffix - <p>The substring that the value must end with.</p>
         * @param modifiers - <p>The regular expression mode.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        endsWith(key: string, suffix: string, modifiers: string): Parse.Query;
        /**
         * <p>Adds a proximity based constraint for finding objects with key point
         * values near the point given.</p>
         * @param key - <p>The key that the Parse.GeoPoint is stored in.</p>
         * @param point - <p>The reference Parse.GeoPoint that is used.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        near(key: string, point: Parse.GeoPoint): Parse.Query;
        /**
         * <p>Adds a proximity based constraint for finding objects with key point
         * values near the point given and within the maximum distance given.</p>
         * @param key - <p>The key that the Parse.GeoPoint is stored in.</p>
         * @param point - <p>The reference Parse.GeoPoint that is used.</p>
         * @param maxDistance - <p>Maximum distance (in radians) of results to return.</p>
         * @param [sorted] - <p>A Bool value that is true if results should be
         * sorted by distance ascending, false is no sorting is required,
         * defaults to true.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withinRadians(key: string, point: Parse.GeoPoint, maxDistance: number, sorted?: boolean): Parse.Query;
        /**
         * <p>Adds a proximity based constraint for finding objects with key point
         * values near the point given and within the maximum distance given.
         * Radius of earth used is 3958.8 miles.</p>
         * @param key - <p>The key that the Parse.GeoPoint is stored in.</p>
         * @param point - <p>The reference Parse.GeoPoint that is used.</p>
         * @param maxDistance - <p>Maximum distance (in miles) of results to return.</p>
         * @param [sorted] - <p>A Bool value that is true if results should be
         * sorted by distance ascending, false is no sorting is required,
         * defaults to true.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withinMiles(key: string, point: Parse.GeoPoint, maxDistance: number, sorted?: boolean): Parse.Query;
        /**
         * <p>Adds a proximity based constraint for finding objects with key point
         * values near the point given and within the maximum distance given.
         * Radius of earth used is 6371.0 kilometers.</p>
         * @param key - <p>The key that the Parse.GeoPoint is stored in.</p>
         * @param point - <p>The reference Parse.GeoPoint that is used.</p>
         * @param maxDistance - <p>Maximum distance (in kilometers) of results to return.</p>
         * @param [sorted] - <p>A Bool value that is true if results should be
         * sorted by distance ascending, false is no sorting is required,
         * defaults to true.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withinKilometers(key: string, point: Parse.GeoPoint, maxDistance: number, sorted?: boolean): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's
         * coordinates be contained within a given rectangular geographic bounding
         * box.</p>
         * @param key - <p>The key to be constrained.</p>
         * @param southwest - <p>The lower-left inclusive corner of the box.</p>
         * @param northeast - <p>The upper-right inclusive corner of the box.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withinGeoBox(key: string, southwest: Parse.GeoPoint, northeast: Parse.GeoPoint): Parse.Query;
        /**
         * <p>Adds a constraint to the query that requires a particular key's
         * coordinates be contained within and on the bounds of a given polygon.
         * Supports closed and open (last point is connected to first) paths</p>
         * <p>Polygon must have at least 3 points</p>
         * @param key - <p>The key to be constrained.</p>
         * @param points - <p>Array of Coordinates / GeoPoints</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withinPolygon(key: string, points: any[]): Parse.Query;
        /**
         * <p>Add a constraint to the query that requires a particular key's
         * coordinates that contains a ParseGeoPoint</p>
         * @param key - <p>The key to be constrained.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        polygonContains(key: string, point: Parse.GeoPoint): Parse.Query;
        /**
         * <p>Sorts the results in ascending order by the given key.</p>
         * @param keys - <p>The key to order by, which is a
         * string of comma separated values, or an Array of keys, or multiple keys.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        ascending(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Sorts the results in ascending order by the given key,
         * but can also add secondary sort descriptors without overwriting _order.</p>
         * @param keys - <p>The key to order by, which is a
         * string of comma separated values, or an Array of keys, or multiple keys.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        addAscending(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Sorts the results in descending order by the given key.</p>
         * @param keys - <p>The key to order by, which is a
         * string of comma separated values, or an Array of keys, or multiple keys.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        descending(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Sorts the results in descending order by the given key,
         * but can also add secondary sort descriptors without overwriting _order.</p>
         * @param keys - <p>The key to order by, which is a
         * string of comma separated values, or an Array of keys, or multiple keys.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        addDescending(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Sets the number of results to skip before returning any results.
         * This is useful for pagination.
         * Default is to skip zero results.</p>
         * @param n - <p>the number of results to skip.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        skip(n: number): Parse.Query;
        /**
         * <p>Sets the limit of the number of results to return. The default limit is 100.</p>
         * @param n - <p>the number of results to limit to.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        limit(n: number): Parse.Query;
        /**
         * <p>Sets the flag to include with response the total number of objects satisfying this query,
         * despite limits/skip. Might be useful for pagination.
         * Note that result of this query will be wrapped as an object with
         * <code>results</code>: holding {Parse.Object} array and <code>count</code>: integer holding total number</p>
         * @param includeCount - <p>false - disable, true - enable.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        withCount(includeCount?: boolean): Parse.Query;
        /**
         * <p>Includes nested Parse.Objects for the provided key.  You can use dot
         * notation to specify which fields in the included object are also fetched.</p>
         * <p>You can include all nested Parse.Objects by passing in '*'.
         * Requires Parse Server 3.0.0+</p>
         * <pre>query.include('*');</pre>
         * @param keys - <p>The name(s) of the key(s) to include.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        include<K extends keyof T["attributes"] | keyof Attributes>(...keys: (K | string[])[]): this;
        /**
         * <p>Includes all nested Parse.Objects one level deep.</p>
         * <p>Requires Parse Server 3.0.0+</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        includeAll(): Parse.Query;
        /**
         * <p>Restricts the fields of the returned Parse.Objects to include only the
         * provided keys.  If this is called multiple times, then all of the keys
         * specified in each of the calls will be included.</p>
         * @param keys - <p>The name(s) of the key(s) to include.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        select(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Restricts the fields of the returned Parse.Objects to all keys except the
         * provided keys. Exclude takes precedence over select and include.</p>
         * <p>Requires Parse Server 3.6.0+</p>
         * @param keys - <p>The name(s) of the key(s) to exclude.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        exclude(...keys: (string | string[])[]): Parse.Query;
        /**
         * <p>Changes the read preference that the backend will use when performing the query to the database.</p>
         * @param readPreference - <p>The read preference for the main query.</p>
         * @param includeReadPreference - <p>The read preference for the queries to include pointers.</p>
         * @param subqueryReadPreference - <p>The read preference for the sub queries.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        readPreference(readPreference: string, includeReadPreference: string, subqueryReadPreference: string): Parse.Query;
        /**
         * <p>Subscribe this query to get liveQuery updates</p>
         * @param [sessionToken] - <p>(optional) Defaults to the currentUser</p>
         * @returns <p>Returns the liveQuerySubscription, it's an event emitter
         * which can be used to get liveQuery updates.</p>
         */
        subscribe(sessionToken?: string): Promise<LiveQuerySubscription>;
        /**
         * <p>Constructs a Parse.Query that is the OR of the passed in queries.  For
         * example:</p>
         * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
         * <p>will create a compoundQuery that is an or of the query1, query2, and
         * query3.</p>
         * @param queries - <p>The list of queries to OR.</p>
         * @returns <p>The query that is the OR of the passed in queries.</p>
         */
        static or(...queries: Parse.Query[]): Parse.Query;
        /**
         * <p>Constructs a Parse.Query that is the AND of the passed in queries.  For
         * example:</p>
         * <pre>var compoundQuery = Parse.Query.and(query1, query2, query3);</pre>
         * <p>will create a compoundQuery that is an and of the query1, query2, and
         * query3.</p>
         * @param queries - <p>The list of queries to AND.</p>
         * @returns <p>The query that is the AND of the passed in queries.</p>
         */
        static and(...queries: Parse.Query[]): Parse.Query;
        /**
         * <p>Constructs a Parse.Query that is the NOR of the passed in queries.  For
         * example:</p>
         * <pre>const compoundQuery = Parse.Query.nor(query1, query2, query3);</pre>
         * <p>will create a compoundQuery that is a nor of the query1, query2, and
         * query3.</p>
         * @param queries - <p>The list of queries to NOR.</p>
         * @returns <p>The query that is the NOR of the passed in queries.</p>
         */
        static nor(...queries: Parse.Query[]): Parse.Query;
        /**
         * <p>Change the source of this query to the server.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        fromNetwork(): Parse.Query;
        /**
         * <p>Changes the source of this query to all pinned objects.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        fromLocalDatastore(): Parse.Query;
        /**
         * <p>Changes the source of this query to the default group of pinned objects.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        fromPin(): Parse.Query;
        /**
         * <p>Changes the source of this query to a specific group of pinned objects.</p>
         * @param name - <p>The name of query source.</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        fromPinWithName(name: string): Parse.Query;
        /**
         * <p>Cancels the current network request (if any is running).</p>
         * @returns <p>Returns the query, so you can chain this call.</p>
         */
        cancel(): Parse.Query;
    }
    /**
     * <p>Creates a new Relation for the given parent object and key. This
     * constructor should rarely be used directly, but rather created by
     * Parse.Object.relation.</p>
     * <p>
     * A class that is used to access all of the children of a many-to-many
     * relationship.  Each instance of Parse.Relation is associated with a
     * particular parent object and key.
     * </p>
     * @param parent - <p>The parent of this relation.</p>
     * @param key - <p>The key for this relation on the parent.</p>
     */
    class Relation {
        constructor(parent: Parse.Object, key: string);
        /**
         * <p>Adds a Parse.Object or an array of Parse.Objects to the relation.</p>
         * @param objects - <p>The item or items to add.</p>
         * @returns <p>The parent of the relation.</p>
         */
        add(objects: Parse.Object | any[]): Parse.Object;
        /**
         * <p>Removes a Parse.Object or an array of Parse.Objects from this relation.</p>
         * @param objects - <p>The item or items to remove.</p>
         */
        remove(objects: Parse.Object | any[]): void;
        /**
         * <p>Returns a JSON version of the object suitable for saving to disk.</p>
         * @returns <p>JSON representation of Relation</p>
         */
        toJSON(): any;
        /**
         * <p>Returns a Parse.Query that is limited to objects in this
         * relation.</p>
         * @returns <p>Relation Query</p>
         */
        query(): Parse.Query;
    }
    /**
     * <p>Represents a Role on the Parse server. Roles represent groupings of
     * Users for the purposes of granting permissions (e.g. specifying an ACL
     * for an Object). Roles are specified by their sets of child users and
     * child roles, all of which are granted any permissions that the parent
     * role has.</p>
     * <p>Roles must have a name (which cannot be changed after creation of the
     * role), and must specify an ACL.</p>
     * @param name - <p>The name of the Role to create.</p>
     * @param acl - <p>The ACL for this role. Roles must have an ACL.
     * A Parse.Role is a local representation of a role persisted to the Parse
     * cloud.</p>
     */
    class Role<T extends Attributes = Attributes> extends Parse.Object<T> {
        constructor(name: string, acl: Parse.ACL);
        /**
         * <p>Gets the name of the role.  You can alternatively call role.get(&quot;name&quot;)</p>
         * @returns <p>the name of the role.</p>
         */
        getName(): string;
        /**
         * <p>Sets the name for a role. This value must be set before the role has
         * been saved to the server, and cannot be set once the role has been
         * saved.</p>
         * <p>
         *   A role's name can only contain alphanumeric characters, _, -, and
         *   spaces.
         * </p>
         * <p>This is equivalent to calling role.set("name", name)</p>
         * @param name - <p>The name of the role.</p>
         * @param options - <p>Standard options object with success and error
         * callbacks.</p>
         * @returns <p>true if the set succeeded.</p>
         */
        setName(name: string, options: any): Parse.Object | boolean;
        /**
         * <p>Gets the Parse.Relation for the Parse.Users that are direct
         * children of this role. These users are granted any privileges that this
         * role has been granted (e.g. read or write access through ACLs). You can
         * add or remove users from the role through this relation.</p>
         * <p>This is equivalent to calling role.relation("users")</p>
         * @returns <p>the relation for the users belonging to this
         * role.</p>
         */
        getUsers(): Parse.Relation;
        /**
         * <p>Gets the Parse.Relation for the Parse.Roles that are direct
         * children of this role. These roles' users are granted any privileges that
         * this role has been granted (e.g. read or write access through ACLs). You
         * can add or remove child roles from this role through this relation.</p>
         * <p>This is equivalent to calling role.relation("roles")</p>
         * @returns <p>the relation for the roles belonging to this
         * role.</p>
         */
        getRoles(): Parse.Relation;
        /**
         * <p>You should not call this function directly unless you subclass
         * <code>Parse.Object</code>, in which case you can override this method
         * to provide additional validation on <code>set</code> and
         * <code>save</code>.  Your implementation should return</p>
         * @param attrs - <p>The current data to validate.</p>
         * @returns <p>False if the data is valid.  An error object otherwise.</p>
         */
        validate(attrs: any): Parse.Error | boolean;
    }
    /**
     * <p>A Parse.Schema object is for handling schema data from Parse.</p>
     * <p>All the schemas methods require MasterKey.
     * <p>When adding fields, you may set required and default values. (Requires Parse Server 3.7.0+)</p>
     * <pre>
     * const options = { required: true, defaultValue: 'hello world' };
     * const schema = new Parse.Schema('MyClass');
     * schema.addString('field', options);
     * schema.addIndex('index_name', { 'field': 1 });
     * schema.save();
     * </pre>
     * </p>
     * @param className - <p>Parse Class string.</p>
     */
    class Schema {
        constructor(className: string);
        /**
         * <p>Static method to get all schemas</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        static all(): Promise<any>;
        /**
         * <p>Get the Schema from Parse</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        get(): Promise<any>;
        /**
         * <p>Create a new Schema on Parse</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        save(): Promise<any>;
        /**
         * <p>Update a Schema on Parse</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        update(): Promise<any>;
        /**
         * <p>Removing a Schema from Parse
         * Can only be used on Schema without objects</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        delete(): Promise<any>;
        /**
         * <p>Removes all objects from a Schema (class) in Parse.
         * EXERCISE CAUTION, running this will delete all objects for this schema and cannot be reversed</p>
         * @returns <p>A promise that is resolved with the result when
         * the query completes.</p>
         */
        purge(): Promise<any>;
        /**
         * <p>Assert if ClassName has been filled</p>
         */
        private assertClassName(): void;
        /**
         * <p>Sets Class Level Permissions when creating / updating a Schema.
         * EXERCISE CAUTION, running this may override CLP for this schema and cannot be reversed</p>
         * @param clp - <p>Class Level Permissions</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        setCLP(clp: any | Parse.CLP): Parse.Schema;
        /**
         * <p>Adding a Field to Create / Update a Schema</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [type] - <p>Can be a (String|Number|Boolean|Date|Parse.File|Parse.GeoPoint|Array|Object|Pointer|Parse.Relation)</p>
         * @param [options] - <p>Valid options are:<ul></p>
         *   <li>required: If field is not set, save operation fails (Requires Parse Server 3.7.0+)
         *   <li>defaultValue: If field is not set, a default value is selected (Requires Parse Server 3.7.0+)
         *   <li>targetClass: Required if type is Pointer or Parse.Relation
         * </ul>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addField(name: string, type?: string, options?: any): Parse.Schema;
        /**
         * <p>Adding an Index to Create / Update a Schema</p>
         * @param name - <p>Name of the index</p>
         * @param index - <p>{ field: value }</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         * <pre>
         * schema.addIndex('index_name', { 'field': 1 });
         * </pre>
         */
        addIndex(name: string, index: any): Parse.Schema;
        /**
         * <p>Adding String Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addString(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Number Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addNumber(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Boolean Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addBoolean(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Date Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addDate(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding File Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addFile(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding GeoPoint Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addGeoPoint(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Polygon Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addPolygon(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Array Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addArray(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Object Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addObject(name: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Pointer Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param targetClass - <p>Name of the target Pointer Class</p>
         * @param [options] - <p>See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addPointer(name: string, targetClass: string, options?: any): Parse.Schema;
        /**
         * <p>Adding Relation Field</p>
         * @param name - <p>Name of the field that will be created on Parse</p>
         * @param targetClass - <p>Name of the target Pointer Class</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        addRelation(name: string, targetClass: string): Parse.Schema;
        /**
         * <p>Deleting a Field to Update on a Schema</p>
         * @param name - <p>Name of the field</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        deleteField(name: string): Parse.Schema;
        /**
         * <p>Deleting an Index to Update on a Schema</p>
         * @param name - <p>Name of the field</p>
         * @returns <p>Returns the schema, so you can chain this call.</p>
         */
        deleteIndex(name: string): Parse.Schema;
    }
    /**
     * <p>A Parse.Session object is a local representation of a revocable session.
     * This class is a subclass of a Parse.Object, and retains the same
     * functionality of a Parse.Object.</p>
     * @param [attributes] - <p>The initial set of data to store in the user.</p>
     */
    class Session<T extends Attributes = Attributes> extends Parse.Object<T> {
        constructor(attributes?: any);
        /**
         * <p>Returns the session token string.</p>
         */
        getSessionToken(): string;
        /**
         * <p>Retrieves the Session object for the currently logged in session.</p>
         * @param options - <p>useMasterKey</p>
         * @returns <p>A promise that is resolved with the Parse.Session
         * object after it has been fetched. If there is no current user, the
         * promise will be rejected.</p>
         */
        static current(options: any): Promise<Parse.Session>;
        /**
         * <p>Determines whether the current session token is revocable.
         * This method is useful for migrating Express.js or Node.js web apps to
         * use revocable sessions. If you are migrating an app that uses the Parse
         * SDK in the browser only, please use Parse.User.enableRevocableSession()
         * instead, so that sessions can be automatically upgraded.</p>
         */
        static isCurrentSessionRevocable(): boolean;
    }
    /**
     * <p>A Parse.User object is a local representation of a user persisted to the
     * Parse cloud. This class is a subclass of a Parse.Object, and retains the
     * same functionality of a Parse.Object, but also extends it with various
     * user specific methods, like authentication, signing up, and validation of
     * uniqueness.</p>
     * @param [attributes] - <p>The initial set of data to store in the user.</p>
     */
    class User<T extends Attributes = Attributes> extends Parse.Object<T> {
        constructor(attributes?: T);
        /**
         * <p>Request a revocable session token to replace the older style of token.</p>
         * @returns <p>A promise that is resolved when the replacement
         * token has been fetched.</p>
         */
        _upgradeToRevocableSession(options: any): Promise<void>;
        /**
         * <p>Parse allows you to link your users with {@link https://docs.parseplatform.org/parse-server/guide/#oauth-and-3rd-party-authentication 3rd party authentication}, enabling
         * your users to sign up or log into your application using their existing identities.
         * Since 2.9.0</p>
         * @param provider - <p>Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}</p>
         * @param options - <ul>
         *   <li>If provider is string, options is {@link http:\\/\\/docs.parseplatform.org/parse-server/guide/#supported-3rd-party-authentications authData}
         *   <li>If provider is AuthProvider, options is saveOpts
         * </ul>
         * @param saveOpts - <p>useMasterKey / sessionToken</p>
         * @returns <p>A promise that is fulfilled with the user is linked</p>
         */
        linkWith(provider: string | AuthProvider, options: any, saveOpts: any): Promise<Parse.User>;
        _linkWith(provider: any, options: any, saveOpts: any): Promise<Parse.User>;
        /**
         * <p>Synchronizes auth data for a provider (e.g. puts the access token in the
         * right place to be used by the Facebook SDK).</p>
         */
        _synchronizeAuthData(provider: any): void;
        /**
         * <p>Synchronizes authData for all providers.</p>
         */
        _synchronizeAllAuthData(): void;
        /**
         * <p>Removes null values from authData (which exist temporarily for unlinking)</p>
         */
        _cleanupAuthData(): void;
        /**
         * <p>Unlinks a user from a service.</p>
         * @param provider - <p>Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}</p>
         * @param options - <p>MasterKey / SessionToken</p>
         * @returns <p>A promise that is fulfilled when the unlinking
         * finishes.</p>
         */
        _unlinkFrom(provider: string | AuthProvider, options: any): Promise<Parse.User>;
        /**
         * <p>Checks whether a user is linked to a service.</p>
         * @param provider - <p>service to link to</p>
         * @returns <p>true if link was successful</p>
         */
        _isLinked(provider: any): boolean;
        /**
         * <p>Deauthenticates all providers.</p>
         */
        _logOutWithAll(): void;
        /**
         * <p>Deauthenticates a single provider (e.g. removing access tokens from the
         * Facebook SDK).</p>
         * @param provider - <p>service to logout of</p>
         */
        _logOutWith(provider: any): void;
        /**
         * <p>Class instance method used to maintain specific keys when a fetch occurs.
         * Used to ensure that the session token is not lost.</p>
         * @returns <p>sessionToken</p>
         */
        _preserveFieldsOnFetch(): any;
        /**
         * <p>Returns true if <code>current</code> would return this user.</p>
         * @returns <p>true if user is cached on disk</p>
         */
        isCurrent(): boolean;
        /**
         * <p>Returns true if <code>current</code> would return this user.</p>
         * @returns <p>true if user is cached on disk</p>
         */
        isCurrentAsync(): Promise<boolean>;
        /**
         * <p>Returns get(&quot;username&quot;).</p>
         */
        getUsername(): string;
        /**
         * <p>Calls set(&quot;username&quot;, username, options) and returns the result.</p>
         */
        setUsername(username: string): void;
        /**
         * <p>Calls set(&quot;password&quot;, password, options) and returns the result.</p>
         * @param password - <p>User's Password</p>
         */
        setPassword(password: string): void;
        /**
         * <p>Returns get(&quot;email&quot;).</p>
         * @returns <p>User's Email</p>
         */
        getEmail(): string;
        /**
         * <p>Calls set(&quot;email&quot;, email) and returns the result.</p>
         */
        setEmail(email: string): boolean;
        /**
         * <p>Returns the session token for this user, if the user has been logged in,
         * or if it is the result of a query with the master key. Otherwise, returns
         * undefined.</p>
         * @returns <p>the session token, or undefined</p>
         */
        getSessionToken(): string;
        /**
         * <p>Checks whether this user is the current user and has been authenticated.</p>
         * @returns <p>whether this user is the current user and is logged in.</p>
         */
        authenticated(): boolean;
        /**
         * <p>Signs up a new user. You should call this instead of save for
         * new Parse.Users. This will create a new Parse.User on the server, and
         * also persist the session on disk so that you can access the user using
         * <code>current</code>.</p>
         * <p>A username and password must be set before calling signUp.</p>
         * @param attrs - <p>Extra fields to set on the new user, or null.</p>
         * @returns <p>A promise that is fulfilled when the signup
         * finishes.</p>
         */
        signUp(attrs: any, options: any): Promise<Parse.User>;
        /**
         * <p>Logs in a Parse.User. On success, this saves the session to disk,
         * so you can retrieve the currently logged in user using
         * <code>current</code>.</p>
         * <p>A username and password must be set before calling logIn.</p>
         * @returns <p>A promise that is fulfilled with the user when
         * the login is complete.</p>
         */
        logIn(options?: any): Promise<Parse.User>;
        /**
         * <p>Wrap the default save behavior with functionality to save to local
         * storage if this is current user.</p>
         */
        save(...args: any[]): Promise<this>;
        /**
         * <p>Wrap the default destroy behavior with functionality that logs out
         * the current user when it is destroyed</p>
         */
        destroy(...args: any[]): Promise<this>;
        /**
         * <p>Wrap the default fetch behavior with functionality to save to local
         * storage if this is current user.</p>
         */
        fetch(...args: any[]): Promise<this>;
        /**
         * <p>Wrap the default fetchWithInclude behavior with functionality to save to local
         * storage if this is current user.</p>
         */
        fetchWithInclude(...args: any[]): Promise<this>;
        /**
         * <p>Verify whether a given password is the password of the current user.</p>
         * @param password - <p>A password to be verified</p>
         * @returns <p>A promise that is fulfilled with a user
         * when the password is correct.</p>
         */
        verifyPassword(password: string, options: any): Promise<Parse.User>;
        /**
         * <p>Adds functionality to the existing Parse.User class.</p>
         * @param protoProps - <p>A set of properties to add to the prototype</p>
         * @param classProps - <p>A set of static properties to add to the class</p>
         * @returns <p>The newly extended Parse.User class</p>
         */
        static extend(protoProps: any, classProps: any): Parse.User;
        /**
         * <p>Retrieves the currently logged in ParseUser with a valid session,
         * either from memory or localStorage, if necessary.</p>
         * @returns <p>The currently logged in Parse.User.</p>
         */
        static current(): Parse.User;
        /**
         * <p>Retrieves the currently logged in ParseUser from asynchronous Storage.</p>
         * @returns <p>A Promise that is resolved with the currently
         * logged in Parse User</p>
         */
        static currentAsync(): Promise<Parse.User | null>;
        /**
         * <p>Signs up a new user with a username (or email) and password.
         * This will create a new Parse.User on the server, and also persist the
         * session in localStorage so that you can access the user using
         * {@link #current}.</p>
         * @param username - <p>The username (or email) to sign up with.</p>
         * @param password - <p>The password to sign up with.</p>
         * @param attrs - <p>Extra fields to set on the new user.</p>
         * @returns <p>A promise that is fulfilled with the user when
         * the signup completes.</p>
         */
        static signUp(username: string, password: string, attrs: any, options: any): Promise<Parse.User>;
        /**
         * <p>Logs in a user with a username (or email) and password. On success, this
         * saves the session to disk, so you can retrieve the currently logged in
         * user using <code>current</code>.</p>
         * @param username - <p>The username (or email) to log in with.</p>
         * @param password - <p>The password to log in with.</p>
         * @returns <p>A promise that is fulfilled with the user when
         * the login completes.</p>
         */
        static logIn(username: string, password: string, options?: any): Promise<Parse.User>;
        /**
         * <p>Logs in a user with a session token. On success, this saves the session
         * to disk, so you can retrieve the currently logged in user using
         * <code>current</code>.</p>
         * @param sessionToken - <p>The sessionToken to log in with.</p>
         * @returns <p>A promise that is fulfilled with the user when
         * the login completes.</p>
         */
        static become(sessionToken: string, options?: any): Promise<Parse.User>;
        /**
         * <p>Retrieves a user with a session token.</p>
         * @param sessionToken - <p>The sessionToken to get user with.</p>
         * @returns <p>A promise that is fulfilled with the user is fetched.</p>
         */
        static me(sessionToken: string, options: any): Promise<Parse.User>;
        /**
         * <p>Logs in a user with a session token. On success, this saves the session
         * to disk, so you can retrieve the currently logged in user using
         * <code>current</code>. If there is no session token the user will not logged in.</p>
         * @param userJSON - <p>The JSON map of the User's data</p>
         * @returns <p>A promise that is fulfilled with the user when
         * the login completes.</p>
         */
        static hydrate(userJSON: any): Promise<Parse.User>;
        /**
         * <p>Static version of {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith}</p>
         */
        static logInWith(provider: any, options: any, saveOpts: any): Promise<Parse.User>;
        /**
         * <p>Logs out the currently logged in user session. This will remove the
         * session from disk, log out of linked services, and future calls to
         * <code>current</code> will return <code>null</code>.</p>
         * @returns <p>A promise that is resolved when the session is
         * destroyed on the server.</p>
         */
        static logOut(options?: any): Promise<any>;
        /**
         * <p>Requests a password reset email to be sent to the specified email address
         * associated with the user account. This email allows the user to securely
         * reset their password on the Parse site.</p>
         * @param email - <p>The email address associated with the user that
         * forgot their password.</p>
         */
        static requestPasswordReset(email: string, options?: any): Promise<any>;
        /**
         * <p>Request an email verification.</p>
         * @param email - <p>The email address associated with the user that
         * forgot their password.</p>
         */
        static requestEmailVerification(email: string, options?: any): Promise<any>;
        /**
         * <p>Verify whether a given password is the password of the current user.</p>
         * @param username - <p>A username to be used for identificaiton</p>
         * @param password - <p>A password to be verified</p>
         * @returns <p>A promise that is fulfilled with a user
         * when the password is correct.</p>
         */
        static verifyPassword(username: string, password: string, options: any): Promise<void>;
        /**
         * <p>Allow someone to define a custom User class without className
         * being rewritten to _User. The default behavior is to rewrite
         * User to _User for legacy reasons. This allows developers to
         * override that behavior.</p>
         * @param isAllowed - <p>Whether or not to allow custom User class</p>
         */
        static allowCustomUserClass(isAllowed: boolean): void;
        /**
         * <p>Allows a legacy application to start using revocable sessions. If the
         * current session token is not revocable, a request will be made for a new,
         * revocable session.
         * It is not necessary to call this method from cloud code unless you are
         * handling user signup or login from the server side. In a cloud code call,
         * this function will not attempt to upgrade the current token.</p>
         * @returns <p>A promise that is resolved when the process has
         * completed. If a replacement session token is requested, the promise
         * will be resolved after a new token has been fetched.</p>
         */
        static enableRevocableSession(options: any): Promise<void>;
        /**
         * <p>Enables the use of become or the current user in a server
         * environment. These features are disabled by default, since they depend on
         * global objects that are not memory-safe for most servers.</p>
         */
        static enableUnsafeCurrentUser(): void;
        /**
         * <p>Disables the use of become or the current user in any environment.
         * These features are disabled on servers by default, since they depend on
         * global objects that are not memory-safe for most servers.</p>
         */
        static disableUnsafeCurrentUser(): void;
        /**
         * <p>When registering users with {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith} a basic auth provider
         * is automatically created for you.</p>
         * <p>For advanced authentication, you can register an Auth provider to
         * implement custom authentication, deauthentication.</p>
         */
        static _registerAuthenticationProvider(provider: any): void;
        static _logInWith(provider: any, options: any, saveOpts: any): Promise<Parse.User>;
    }
    /**
     * <p>Contains functions to deal with Push in Parse.</p>
     */
    class Push {
        /**
         * <p>Sends a push notification.
         * <strong>Available in Cloud Code only.</strong></p>
         * <p>See {@link https://docs.parseplatform.org/js/guide/#push-notifications Push Notification Guide}</p>
         * @param data - <p>The data of the push notification. Valid fields
         * are:</p>
         *   <ol>
         *     <li>channels - An Array of channels to push to.</li>
         *     <li>push_time - A Date object for when to send the push.</li>
         *     <li>expiration_time -  A Date object for when to expire
         *         the push.</li>
         *     <li>expiration_interval - The seconds from now to expire the push.</li>
         *     <li>where - A Parse.Query over Parse.Installation that is used to match
         *         a set of installations to push to.</li>
         *     <li>data - The data to send as part of the push.</li>
         *   <ol>
         * @param options - <p>Valid options
         * are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         * </ul>
         * @returns <p>A promise that is fulfilled when the push request
         * completes.</p>
         */
        static send(data: any, options: any): Promise<void>;
        /**
         * <p>Gets push status by Id</p>
         * @param pushStatusId - <p>The Id of Push Status.</p>
         * @param options - <p>Valid options
         * are:<ul></p>
         *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
         *     be used for this request.
         * </ul>
         * @returns <p>Status of Push.</p>
         */
        static getPushStatus(pushStatusId: string, options: any): Parse.Object;
    }
}

/**
 * <p>LiveQuery event Callback</p>
 * @param object - <p>LiveQuery event object</p>
 * @param [original] - <p>LiveQuery event original object</p>
 */
declare type LiveQueryEventCallback = (object: Parse.Object, original?: Parse.Object) => void;

/**
 * <p>Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.</p>
 * <p>This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.</p>
 */
declare const DEFAULT_PIN = "_default";

/**
 * <p>contains -- Determines if an object is contained in a list with special handling for Parse pointers.</p>
 */
declare function contains(haystack: any, needle: any): boolean;

/**
 * <p>matchesQuery -- Determines if an object would be returned by a Parse Query
 * It's a lightweight, where-clause only implementation of a full query engine.
 * Since we find queries that match objects, rather than objects that match
 * queries, we can avoid building a full-blown query tool.</p>
 */
declare function matchesQuery(className: any, object: any, objects: any, query: any): boolean;

/**
 * @property status - <p>The conversion status, <code>error</code> if conversion failed or
 * <code>success</code> if conversion succeeded.</p>
 * @property info - <p>The error message if conversion failed, or the relative
 * time indication (<code>past</code>, <code>present</code>, <code>future</code>) if conversion succeeded.</p>
 * @property result - <p>The converted date, or <code>undefined</code> if conversion
 * failed.</p>
 */
declare type RelativeTimeToDateResult = {
    status: string;
    info: string;
    result: Date | undefined;
};

/**
 * <p>Converts human readable relative date string, for example, 'in 10 days' to a date
 * relative to now.</p>
 * @param text - <p>The text to convert.</p>
 * @param [now = new Date()] - <p>The date from which add or subtract. Default is now.</p>
 */
declare function relativeTimeToDate(text: string, now?: Date): RelativeTimeToDateResult;

/**
 * <p>Determines whether an object matches a single key's constraints</p>
 */
declare function matchesKeyConstraints(className: any, object: any, objects: any, key: any, constraints: any): boolean;

/**
 * <p>Contains all Parse API classes and functions.</p>
 */
declare class Parse {
    constructor();
    /**
     * <p>Call this method first to set up your authentication tokens for Parse.</p>
     * @param applicationId - <p>Your Parse Application ID.</p>
     * @param [javaScriptKey] - <p>Your Parse JavaScript Key (Not needed for parse-server)</p>
     * @param [masterKey] - <p>Your Parse Master Key. (Node.js only!)</p>
     */
    static initialize(applicationId: string, javaScriptKey?: string, masterKey?: string): void;
    /**
     * <p>Call this method to set your AsyncStorage engine
     * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
     * is not provided at a stable path and changes over versions.</p>
     * @param storage - <p>a react native async storage.</p>
     */
    static setAsyncStorage(storage: AsyncStorage): void;
    /**
     * <p>Call this method to set your LocalDatastoreStorage engine
     * If using React-Native use {@link Parse.setAsyncStorage Parse.setAsyncStorage()}</p>
     * @param controller - <p>a data storage.</p>
     */
    static setLocalDatastoreController(controller: LocalDatastoreController): void;
    /**
     * <p>Returns information regarding the current server's health</p>
     */
    static getServerHealth(): Promise<any>;
    static applicationId: string;
    static javaScriptKey: string;
    static masterKey: string;
    static serverURL: string;
    static serverAuthToken: string;
    static serverAuthType: string;
    static liveQueryServerURL: string;
    static encryptedUser: boolean;
    static secret: string;
    static idempotency: boolean;
    static allowCustomObjectId: boolean;
    /**
     * <p>Enable pinning in your application.
     * This must be called before your application can use pinning.</p>
     */
    static enableLocalDatastore(): void;
    /**
     * <p>Flag that indicates whether Local Datastore is enabled.</p>
     */
    static isLocalDatastoreEnabled(): boolean;
    /**
     * <p>Gets all contents from Local Datastore</p>
     * <pre>
     * await Parse.dumpLocalDatastore();
     * </pre>
     */
    static dumpLocalDatastore(): any;
    /**
     * <p>Enable the current user encryption.
     * This must be called before login any user.</p>
     */
    static enableEncryptedUser(): void;
    /**
     * <p>Flag that indicates whether Encrypted User is enabled.</p>
     */
    static isEncryptedUserEnabled(): boolean;
}

declare type Attributes = {
    [key: string]: any;
};

/**
 * <p>Converts a string into a regex that matches it.
 * Surrounding with \Q .. \E does this, we just need to escape any \E's in
 * the text separately.</p>
 */
declare function quote(s: any): string;

/**
 * <p>Extracts the class name from queries. If not all queries have the same
 * class name an error will be thrown.</p>
 */
declare function _getClassNameFromQueries(queries: any): string;

declare type QueryJSON = {
    where: Attributes;
    include?: string;
    excludeKeys?: string;
    keys?: string;
    limit?: number;
    skip?: number;
    order?: string;
    className?: string;
    count?: number;
    hint?: any;
    explain?: boolean;
    readPreference?: string;
    includeReadPreference?: string;
    subqueryReadPreference?: string;
};

/**
 * <p>Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.</p>
 * <p>This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.</p>
 */
declare const StorageController: any;

/**
 * <p>Interface declaration for Authentication Providers</p>
 */
declare interface AuthProvider {
    /**
     * <p>Called when _linkWith isn't passed authData.
     * Handle your own authentication here.</p>
     * @param options - <p>options.success(provider, authData) or options.error(provider, error) on completion</p>
     */
    authenticate(options: any): void;
    /**
     * <p>(Optional) Called when service is unlinked.
     * Handle any cleanup here.</p>
     */
    deauthenticate(): void;
    /**
     * <p>Unique identifier for this Auth Provider.</p>
     * @returns <p>identifier</p>
     */
    getAuthType(): string;
    /**
     * <p>Called when auth data is syncronized.
     * Can be used to determine if authData is still valid</p>
     * @param authData - <p>Data used when register provider</p>
     * @returns <p>Indicate if service should continue to be linked</p>
     */
    restoreAuthentication(authData: any): boolean;
}

