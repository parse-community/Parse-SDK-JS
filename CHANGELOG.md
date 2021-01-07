# Parse-SDK-JS

### master
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.19.0...master)

## 2.19.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.18.0...2.19.0)

**Features**
- New error code 210 (MFA_ERROR) ([#1268](https://github.com/parse-community/Parse-SDK-JS/pull/1268))
- New error code 211 (MFA_TOKEN_REQUIRED) ([#1268](https://github.com/parse-community/Parse-SDK-JS/pull/1268))
- New error code 161 (FILE_DELETE_UNNAMED_ERROR) ([#1257](https://github.com/parse-community/Parse-SDK-JS/pull/1257))

**Improvements**
- Parse.File.destroy without name error message ([#1257](https://github.com/parse-community/Parse-SDK-JS/pull/1257))

**Fixes**
- Remove unnecessary object reference and comment from AddUniqueOp ([#1253](https://github.com/parse-community/Parse-SDK-JS/pull/1253))
- Internal Referencing for Increment Dot Notation ([#1255](https://github.com/parse-community/Parse-SDK-JS/pull/1255))
- Saving for Increment Dot Notation ([#1219](https://github.com/parse-community/Parse-SDK-JS/pull/1219))

## 2.18.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.17.0...2.18.0)

**Features**
- Support query.findAll() ([#1233](https://github.com/parse-community/Parse-SDK-JS/pull/1233))

**Improvements**
- Pass objects into query.equalTo / query.notEqualTo ([#1235](https://github.com/parse-community/Parse-SDK-JS/pull/1235))
- Improving legacy initialization setters/getters ([#1237](https://github.com/parse-community/Parse-SDK-JS/pull/1237))
- Remove deprecated backbone options from Parse.Push ([#1238](https://github.com/parse-community/Parse-SDK-JS/pull/1238))
- Code Coverage and Unit Tests ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))

**Fixes**
- Prevent crashing LiveQueryClient if emitter error is not set ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Handle LiveQuery subscription socket error ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Set WeChat socket handlers before connecting ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Parse.Installation validating attribute error ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))

## 2.17.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.16.0...2.17.0)

**Improvements**
- User LogIn with usePost option ([#1229](https://github.com/parse-community/Parse-SDK-JS/pull/1229))

## 2.16.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.15.0...2.16.0)

Idempotency enforcement for client requests. This deduplicates requests where the client intends to send one request to Parse Server but due to network issues the server receives the request multiple times. (Parse-Server 4.3.0+)
**Caution, this is an experimental feature that may not be appropriate for production.**

To enable use either of the following:
* `Parse.CoreManager.set('IDEMPOTENCY', true)`
* `Parse.idempotency = true`

**Features**
- Idempotency Request ([#1210](https://github.com/parse-community/Parse-SDK-JS/pull/1210))

**Improvements**
- Allow Pin of unsaved objects in LocalDatastore ([#1225](https://github.com/parse-community/Parse-SDK-JS/pull/1225))

**Fixes**
- crypto-js crashing React Native ([#1218](https://github.com/parse-community/Parse-SDK-JS/pull/1218))
- Schema mismatch error on add / remove empty array on Relation  ([#1222](https://github.com/parse-community/Parse-SDK-JS/pull/1222))
- query.select error on null fields ([#1223](https://github.com/parse-community/Parse-SDK-JS/pull/1223))

## 2.15.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.14.0...2.15.0)

**Features**
- New Parse.Error 159 DUPLICATE_REQUEST ([#1189](https://github.com/parse-community/Parse-SDK-JS/pull/1189))

**Fixes**
- Live Query Subscription Error Event ([#1193](https://github.com/parse-community/Parse-SDK-JS/pull/1193))

## 2.14.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.13.0...2.14.0)

**New Features**
- Passing context in destroy, saveAll, get, find hooks. ([#1159](https://github.com/parse-community/Parse-SDK-JS/pull/1159))
- Support using aggregate on top of constructed query ([#1170](https://github.com/parse-community/Parse-SDK-JS/pull/1170))

**Improvements**
- Performance improvement for Query.eachBatch ([#1179](https://github.com/parse-community/Parse-SDK-JS/pull/1179))

**Fixes**
- Fix context for cascade saving ([#1186](https://github.com/parse-community/Parse-SDK-JS/pull/1186))

## 2.13.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.12.0...2.13.0)

**New Features**
- Add Email Verification to Parse.User ([#1144](https://github.com/parse-community/Parse-SDK-JS/pull/1144))
- Add Verify Password to Parse.User ([#1144](https://github.com/parse-community/Parse-SDK-JS/pull/1144))

**Improvements**
- Add read preference for aggregate query ([#1143](https://github.com/parse-community/Parse-SDK-JS/pull/1143))
- Add file progress type (upload/download) ([#1140](https://github.com/parse-community/Parse-SDK-JS/pull/1140))
- Add context to Parse.Object.save ([#1150](https://github.com/parse-community/Parse-SDK-JS/pull/1150))

**Fixes**
- File upload progress ([#1133](https://github.com/parse-community/Parse-SDK-JS/pull/1133))
- Live Query Subscription Open Event ([#1151](https://github.com/parse-community/Parse-SDK-JS/pull/1151))

## 2.12.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.11.0...2.12.0)

**New Features**
- Support Parse.Query hint ([#1054](https://github.com/parse-community/Parse-SDK-JS/pull/1054))
- Support Parse.Query eachBatch ([#1114](https://github.com/parse-community/Parse-SDK-JS/pull/1114))
- Support Parse.Object decrement ([#1069](https://github.com/parse-community/Parse-SDK-JS/pull/1069))
- Support deleting Parse.File ([#1067](https://github.com/parse-community/Parse-SDK-JS/pull/1067))
- Support File Metadata ([#1065](https://github.com/parse-community/Parse-SDK-JS/pull/1065)) ([#1070](https://github.com/parse-community/Parse-SDK-JS/pull/1070))

**Improvements**
- Support global request batch size ([#1053](https://github.com/parse-community/Parse-SDK-JS/pull/1053))
- Username signup error ([#1080](https://github.com/parse-community/Parse-SDK-JS/pull/1080))
- Pass SaveAll options to Files ([#1107](https://github.com/parse-community/Parse-SDK-JS/pull/1107))
- Make iteration query methods (map, filter, reduce) returned promises ([#1112](https://github.com/parse-community/Parse-SDK-JS/pull/1112))

**Fixes**
- Fix user.become for AsyncStorage ([#1056](https://github.com/parse-community/Parse-SDK-JS/pull/1056))
- Subscribing to query with null sessionToken ([#1058](https://github.com/parse-community/Parse-SDK-JS/pull/1058))
- Fix addIndex annotation in Parse.Schema ([#1071](https://github.com/parse-community/Parse-SDK-JS/pull/1071))
- Fix cascadeSave=false bug for SingleInstance objects ([#1078](https://github.com/parse-community/Parse-SDK-JS/pull/1078))
- Fix react-native build ([#1094](https://github.com/parse-community/Parse-SDK-JS/pull/1094))

## 2.11.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.10.0...2.11.0)

**New Features**
- Support encrypting current user ([#1036](https://github.com/parse-community/Parse-SDK-JS/pull/1036))
- File Upload Progress on Wechat ([#1029](https://github.com/parse-community/Parse-SDK-JS/pull/1029))

**Improvements**
- Support query.cancel() on Node ([#1030](https://github.com/parse-community/Parse-SDK-JS/pull/1030))

**Fixes**
- File Upload Progress on browser ([#1029](https://github.com/parse-community/Parse-SDK-JS/pull/1029))
- User signup with installationId ([#1031](https://github.com/parse-community/Parse-SDK-JS/pull/1031))

## 2.10.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.9.1...2.10.0)

**New Features**
- Add query.fromNetwork() ([#1002](https://github.com/parse-community/Parse-SDK-JS/pull/1002))
- Add query.cancel() (browser only) ([#1003](https://github.com/parse-community/Parse-SDK-JS/pull/1003))
- Support custom request headers ([#1019](https://github.com/parse-community/Parse-SDK-JS/pull/1019))

**Fixes**
- To subclass Parse.User: `Parse.Object.registerSubclass('_User', CustomUser);`

**Security**
Address Security Advisory of possible leak of sensitive user info. ([#d110617](https://github.com/parse-community/Parse-SDK-JS/commit/d1106174571b699f972929dd7cbb8e45b5283cbb)), big thanks to [Colin Ulin](https://github.com/pocketcolin) for identifying the problem, following the vulnerability disclosure guidelines

## 2.9.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.9.0...2.9.1)

**Fixes**
- Storing user to disk ([#992](https://github.com/parse-community/Parse-SDK-JS/issues/992)) ([#999](https://github.com/parse-community/Parse-SDK-JS/pull/999))

## 2.9.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.8.0...2.9.0)

**Deprecation**
`_linkWith` and `_logInWith` are deprecated. Replace with `linkWith` and `logInWith` respectively. ([#963](https://github.com/parse-community/Parse-SDK-JS/pull/963))

**New Features**
- Set Class Level Permission via Parse.Schema ([#960](https://github.com/parse-community/Parse-SDK-JS/pull/960))
- Set required fields and default values via Parse.Schema ([#961](https://github.com/parse-community/Parse-SDK-JS/pull/961))
- Add installationId to LiveQuery ([#977](https://github.com/parse-community/Parse-SDK-JS/pull/977))
- Add response object to LiveQuery ([#979](https://github.com/parse-community/Parse-SDK-JS/pull/979))
- Support query.map, query.filter, query.reduce ([#987](https://github.com/parse-community/Parse-SDK-JS/pull/987))

**Fixes**
- Can unlink without provider in cloud code ([#971](https://github.com/parse-community/Parse-SDK-JS/pull/971))
- Properly store User Subclass in Storage ([#978](https://github.com/parse-community/Parse-SDK-JS/pull/978))

**Improvements**
- User subclass support for logInWith, hydrate, me, current ([#968](https://github.com/parse-community/Parse-SDK-JS/pull/968))
- Remove unused options from Parse.Schema ([#959](https://github.com/parse-community/Parse-SDK-JS/pull/959))
- Documentation for linking users and custom auth ([#963](https://github.com/parse-community/Parse-SDK-JS/pull/963))
- Generate installationId as uuid v4 ([#972](https://github.com/parse-community/Parse-SDK-JS/pull/972))
- Reuse StorageController for LDS ([#984](https://github.com/parse-community/Parse-SDK-JS/pull/984))

## 2.8.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.7.1...2.8.0)

**New Features**
- Parse.File save cancel ([#948](https://github.com/parse-community/Parse-SDK-JS/pull/948))
- Parse.File getData cancel ([#951](https://github.com/parse-community/Parse-SDK-JS/pull/951))

**Fixes**
- React Native Emitter module ([#946](https://github.com/parse-community/Parse-SDK-JS/pull/946))
- Parse.Schema deleteIndex, deleteField returns Parse.Schema ([#949](https://github.com/parse-community/Parse-SDK-JS/pull/949))

**Improvements**
- Compiling on Windows ([#947](https://github.com/parse-community/Parse-SDK-JS/pull/947))
- Generate _localId as UUID ([#956](https://github.com/parse-community/Parse-SDK-JS/pull/956))

## 2.7.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.7.0...2.7.1)

**New Features**
- Support for `ParseConfig.save` with `masterKeyOnlyFlags` option ([#910](https://github.com/parse-community/Parse-SDK-JS/pull/910)) (Requires Parse-Server 3.8.0+)
- Support for `ParseConfig.get` with `useMasterKey` option ([#907](https://github.com/parse-community/Parse-SDK-JS/pull/907))

## 2.7.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.6.0...2.7.0)

**New Features**
- Support for `ParseObject.fetchAllIfNeededWithInclude` ([#900](https://github.com/parse-community/Parse-SDK-JS/pull/900))
- Support for `ParseObject.exists` ([#898](https://github.com/parse-community/Parse-SDK-JS/pull/898))
- Support for `ParseObject.save` with `cascadeSave` option ([#881](https://github.com/parse-community/Parse-SDK-JS/pull/881))

**Fixes**
- `ParseUser.become` should return subclass ([#897](https://github.com/parse-community/Parse-SDK-JS/pull/897))
- Ensure LiveQuery subscribes before returning subscription ([#878](https://github.com/parse-community/Parse-SDK-JS/pull/878))

**Improvements**
- Remove deprecated `@babel/polyfill` ([#877](https://github.com/parse-community/Parse-SDK-JS/pull/877))

## 2.6.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.5.1...2.6.0)

**New Features**:
- Support configurable WebSocketController ([#64f359a](https://github.com/parse-community/Parse-SDK-JS/commit/64f359af251ccb9473f4464d09bf3ba8a0d12dc9))
- Support for Wechat Mini Program ([#874](https://github.com/parse-community/Parse-SDK-JS/pull/874))
- Support withCount query constraint ([#868](https://github.com/parse-community/Parse-SDK-JS/pull/868))

**Improvements**:
- Fix SERVER_RENDERING environment variable ([#873](https://github.com/parse-community/Parse-SDK-JS/pull/873))

## 2.5.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.5.0...2.5.1)

- FIX: NPM credentials

## 2.5.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.4.0...2.5.0)

**New Features**:
- Support query exclude keys ([#857](https://github.com/parse-community/Parse-SDK-JS/pull/857))
- Support query read preference ([#855](https://github.com/parse-community/Parse-SDK-JS/pull/855))
- Support object isDataAvailable ([#856](https://github.com/parse-community/Parse-SDK-JS/pull/856))

**Improvements**:
- Add options for AnonymousUtils ([#860](https://github.com/parse-community/Parse-SDK-JS/pull/860))
- Stateless UserController ([#846](https://github.com/parse-community/Parse-SDK-JS/pull/846))
- Fix Facebook login isExisted ([#845](https://github.com/parse-community/Parse-SDK-JS/pull/845))
- Allow any Blob to be uploaded ([#837](https://github.com/parse-community/Parse-SDK-JS/pull/837))
- Support _linkWith if no provider ([#810](https://github.com/parse-community/Parse-SDK-JS/pull/810))
- LDS: Improve querying dates ([#808](https://github.com/parse-community/Parse-SDK-JS/pull/808))
- Support testing on Windows ([#808](https://github.com/parse-community/Parse-SDK-JS/pull/820))
- Support installing SDK from branch ([#821](https://github.com/parse-community/Parse-SDK-JS/pull/821))

## 2.4.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.3.2...2.4.0)

**New Features**:
- LocalDatastore: Support Users ([#801](https://github.com/parse-community/Parse-SDK-JS/pull/801))
- LiveQuery subscribe with sessionToken ([#791](https://github.com/parse-community/Parse-SDK-JS/pull/791))

**Improvements**:
- LocalDatastore: Improve pinning unsaved objects ([#795](https://github.com/parse-community/Parse-SDK-JS/pull/795))
- LocalDatastore: Improve error handling ([#803](https://github.com/parse-community/Parse-SDK-JS/pull/803))

## 2.3.2
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.3.1...2.3.2)

- Support `getData` from Parse.File ([#780](https://github.com/parse-community/Parse-SDK-JS/pull/780))
- Parse.FacebookUtils `logIn` and `link` support MasterKey and SessionToken options ([#779](https://github.com/parse-community/Parse-SDK-JS/pull/779))
- Remove node modules `http` and `https` from React-Native build ([#776](https://github.com/parse-community/Parse-SDK-JS/pull/776))

## 2.3.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.3.0...2.3.1)

- `_linkWith` and `_unlinkFrom` support MasterKey and SessionToken options ([#767](https://github.com/parse-community/Parse-SDK-JS/pull/767))
- Correct homepage in package.json ([#9e198b3](https://github.com/parse-community/Parse-SDK-JS/commit/9e198b368862925025737aa725e9a2e8b3d4205a))
- Add Issues template for opening GitHub Issue ([#760](https://github.com/parse-community/Parse-SDK-JS/pull/760))
- Add Public email address to satisfy an npmjs requirement ([#764](https://github.com/parse-community/Parse-SDK-JS/pull/764))
- File uri upload for Browser / React-Native ([#765](https://github.com/parse-community/Parse-SDK-JS/pull/765))

## 2.3.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.2.1...2.3.0)

- LocalDatastore fixes for React-Native ([#753](https://github.com/parse-community/Parse-SDK-JS/pull/753))
- LocalDatastore update from Server ([#734](https://github.com/parse-community/Parse-SDK-JS/pull/734))
- Support for Anonymous Users ([#750](https://github.com/parse-community/Parse-SDK-JS/pull/750))
- File upload via uri ([#749](https://github.com/parse-community/Parse-SDK-JS/pull/749))
- Add support to secured endpoints throught Authorization header ([#358](https://github.com/parse-community/Parse-SDK-JS/pull/358))
- Remove authResponse in FacebookUtils ([#728](https://github.com/parse-community/Parse-SDK-JS/pull/728))
- UserSubclass.logIn and UserSubclass.signUp returns subclass ([#756](https://github.com/parse-community/Parse-SDK-JS/pull/756))
- Subscribe to multiple LiveQuery subscriptions ([#758](https://github.com/parse-community/Parse-SDK-JS/pull/758))

## 2.2.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.2.0...2.2.1)

- Addresses issue with babel runtime regenerator ([#740](https://github.com/parse-community/Parse-SDK-JS/pull/740))

## 2.2.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.1.0...2.2.0)

- Support for Local Datastore ([#612](https://github.com/parse-community/Parse-SDK-JS/pull/612))
- LiveQuery override data on update ([#718](https://github.com/parse-community/Parse-SDK-JS/pull/718)) (Requires Parse-Server 3.1.3+)
- Support setting user from JSON (hydrate) ([#730](https://github.com/parse-community/Parse-SDK-JS/pull/730))
- Improve dot notation for updating nested objects ([#729](https://github.com/parse-community/Parse-SDK-JS/pull/729))
- LiveQuery handle unset operation ([#714](https://github.com/parse-community/Parse-SDK-JS/pull/714)) (Requires Parse-Server 3.1.3+)
- Add original object to LiveQuery events ([#712](https://github.com/parse-community/Parse-SDK-JS/pull/712)) (Requires Parse-Server 3.1.3+)
- Add support for providing file upload progress. ([#373](https://github.com/parse-community/Parse-SDK-JS/pull/373)) (Browser Only)
- Support clone with relation ([#382](https://github.com/parse-community/Parse-SDK-JS/pull/382))
- Add batchSize to saveAll / destroyAll ([#701](https://github.com/parse-community/Parse-SDK-JS/pull/701))
- Add save Method for Parse.Config ([#684](https://github.com/parse-community/Parse-SDK-JS/pull/684))
- Allow specific keys to be reverted in unsaved objects ([#565](https://github.com/parse-community/Parse-SDK-JS/pull/565))
- Handle undefined in Cloud Code ([#682](https://github.com/parse-community/Parse-SDK-JS/pull/682))
- Validate if geopoint values is number ([#671](https://github.com/parse-community/Parse-SDK-JS/pull/671))
- LiveQuery Support for Subclasses ([#662](https://github.com/parse-community/Parse-SDK-JS/pull/662))

## 2.1.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/v2.0.2...2.1.0)

- Parse.Error now inherits from Error ([#658](https://github.com/parse-community/Parse-SDK-JS/pull/658))

## 2.0.2
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/v2.0.1...v2.0.2)

- Fixes issue affecting unsubscribing from liveQueries ([#640](https://github.com/parse-community/Parse-SDK-JS/pull/640))
- Adds support for aggregate stages with identical names ([#637](https://github.com/parse-community/Parse-SDK-JS/pull/637))
- Adds ability to fetch an object with includes ([#631](https://github.com/parse-community/Parse-SDK-JS/pull/631))
- Adds support for $nor operator in queries ([#634](https://github.com/parse-community/Parse-SDK-JS/pull/634))
- Adds support for containedBy operator in queries ([#633](https://github.com/parse-community/Parse-SDK-JS/pull/633))
- Adds support for includeAll ([#632](https://github.com/parse-community/Parse-SDK-JS/pull/632))

## 2.0.1

- Ensure we only read the job status id header if present. ([#623](https://github.com/parse-community/Parse-SDK-JS/pull/623))

## 2.0.0

- Parse.Promise has been replaced by native Promises ([#620](https://github.com/parse-community/Parse-SDK-JS/pull/620))
- Backbone style callbacks are removed ([#620](https://github.com/parse-community/Parse-SDK-JS/pull/620))
