# [4.3.0](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0...4.3.0) (2023-11-16)


### Bug Fixes

* `ParseUser.linkWith` doesn't remove anonymous auth data ([#2007](https://github.com/parse-community/Parse-SDK-JS/issues/2007)) ([7e2585c](https://github.com/parse-community/Parse-SDK-JS/commit/7e2585c5eb84a396900553d55d6a919de4d9a2c0))
* Hard-coding of `react-native` path does not work for workspace builds ([#1930](https://github.com/parse-community/Parse-SDK-JS/issues/1930)) ([8222f3c](https://github.com/parse-community/Parse-SDK-JS/commit/8222f3cc2a4a4ee0cdcaf30dd0f9a17e46de7d88))

### Features

* Add Bytes type to `Parse.Schema` ([#2001](https://github.com/parse-community/Parse-SDK-JS/issues/2001)) ([343d0d7](https://github.com/parse-community/Parse-SDK-JS/commit/343d0d729a57acdd3c9ba5c1dbe5738b3916ea04))
* Add Cloud Code context accessibility to `ParseUser.logIn` ([#2010](https://github.com/parse-community/Parse-SDK-JS/issues/2010)) ([2446007](https://github.com/parse-community/Parse-SDK-JS/commit/2446007ede4cc5af79e34f27dc1fbcc574d5f717))
* Add support for custom EventEmitter ([#1999](https://github.com/parse-community/Parse-SDK-JS/issues/1999)) ([ca568a6](https://github.com/parse-community/Parse-SDK-JS/commit/ca568a61771e15afe67c9001f2a728205059f2ae))
* Add support for excluding keys in `ParseQuery.findAll` ([#2000](https://github.com/parse-community/Parse-SDK-JS/issues/2000)) ([012ba4c](https://github.com/parse-community/Parse-SDK-JS/commit/012ba4cdab1e3f853625f507c713cef2264a40dd))
* Add support to invoke a Cloud Function with a custom `installationId` via `Parse.Cloud.run` ([#1939](https://github.com/parse-community/Parse-SDK-JS/issues/1939)) ([eb70b93](https://github.com/parse-community/Parse-SDK-JS/commit/eb70b934b798cb37722c1ac36796596f5373f67d))
* Allow overriding `Parse.Error` message with custom message via new Core Manager option `PARSE_ERRORS` ([#2014](https://github.com/parse-community/Parse-SDK-JS/issues/2014)) ([be0c8a6](https://github.com/parse-community/Parse-SDK-JS/commit/be0c8a6ff90a7714487ae793e2b68ae04d0c8d0c))
* Login with username, password and additional authentication data via `ParseUser.logInWithAdditionalAuth` ([#1955](https://github.com/parse-community/Parse-SDK-JS/issues/1955)) ([2bad411](https://github.com/parse-community/Parse-SDK-JS/commit/2bad4119c23372d1b38c811c4b4bb3d06b1b62f0))

# [4.2.0](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0...4.2.0) (2023-09-15)


### Bug Fixes

* `Parse.File.cancel` starts new attempt to save file ([#1781](https://github.com/parse-community/Parse-SDK-JS/issues/1781)) ([b755e42](https://github.com/parse-community/Parse-SDK-JS/commit/b755e42394db8b94b87b0dbefc6cf6f18189c46d))

### Features

* Add `Parse.User.loginAs` ([#1875](https://github.com/parse-community/Parse-SDK-JS/issues/1875)) ([381fcfc](https://github.com/parse-community/Parse-SDK-JS/commit/381fcfc7f9cfda70af7c6dc3a35de59b82b72258))
* Add `ParseQuery.watch` to trigger LiveQuery only on update of specific fields ([#1839](https://github.com/parse-community/Parse-SDK-JS/issues/1839)) ([7479343](https://github.com/parse-community/Parse-SDK-JS/commit/7479343abd8739fe03558ff9b2ce610c34c568ae))

# [4.1.0](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.1...4.1.0) (2023-05-01)


### Bug Fixes

* `LiveQuerySubscription.unsubscribe` resolves promise before unsubscribing completes ([#1727](https://github.com/parse-community/Parse-SDK-JS/issues/1727)) ([1c96205](https://github.com/parse-community/Parse-SDK-JS/commit/1c96205cb3c162b21bf4508f7783400a28a99868))
* Node engine version upper range is <19 despite Node 19 support ([#1732](https://github.com/parse-community/Parse-SDK-JS/issues/1732)) ([febe187](https://github.com/parse-community/Parse-SDK-JS/commit/febe187a24fb56e83542c00ae39148575fc57c4b))
* Saving a new `Parse.Object` with an unsaved `Parse.File` fails ([#1662](https://github.com/parse-community/Parse-SDK-JS/issues/1662)) ([16535a4](https://github.com/parse-community/Parse-SDK-JS/commit/16535a43f6c762983460aa837102a4c692de70bb))

### Features

* `LiveQueryClient.close` returns promise when WebSocket closes ([#1735](https://github.com/parse-community/Parse-SDK-JS/issues/1735)) ([979d660](https://github.com/parse-community/Parse-SDK-JS/commit/979d6607d5449dd3d3c5e51f36119bd05b25feaa))
* Upgrade Node Package Manager lock file `package-lock.json` to version 2 ([#1729](https://github.com/parse-community/Parse-SDK-JS/issues/1729)) ([e993786](https://github.com/parse-community/Parse-SDK-JS/commit/e993786cf0299b1150bf36afee1bc516e23e349a))

## [4.0.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0...4.0.1) (2023-01-31)


### Bug Fixes

* Local datastore query with `containedIn` not working when field is an array ([#1666](https://github.com/parse-community/Parse-SDK-JS/issues/1666)) ([2391bff](https://github.com/parse-community/Parse-SDK-JS/commit/2391bff36bd8b3f5357f069916375b979cde15b2))
* Request execution time keeps increasing over time when using `Parse.Object.extend` ([#1682](https://github.com/parse-community/Parse-SDK-JS/issues/1682)) ([f555c43](https://github.com/parse-community/Parse-SDK-JS/commit/f555c43841c95c2ae759342ea28cd69f7fd232a4))

# [4.0.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.1...4.0.0) (2023-01-23)


### Bug Fixes

* `Parse.Query.subscribe()` does not return a rejected promise on error in Cloud Code Triggers `beforeConnect` or `beforeSubscribe` ([#1490](https://github.com/parse-community/Parse-SDK-JS/issues/1490)) ([96d7174](https://github.com/parse-community/Parse-SDK-JS/commit/96d71744e4a12088f98ad33a5f7a0c06c90a0a4c))
* Remove support for Node <14 ([#1603](https://github.com/parse-community/Parse-SDK-JS/issues/1603)) ([bc04b4b](https://github.com/parse-community/Parse-SDK-JS/commit/bc04b4bc0c27d2f517b388dd2dfc17d463faf207))

### Features

* Add Node 16 and 18 support ([#1598](https://github.com/parse-community/Parse-SDK-JS/issues/1598)) ([2c79a31](https://github.com/parse-community/Parse-SDK-JS/commit/2c79a31201d569b645eea475290c9ed0266227fc))
* Add node 19 support ([8ed0fab](https://github.com/parse-community/Parse-SDK-JS/commit/8ed0faba400642571ff90b9645a6e4fcef16c475))
* Add Node 19 support ([#1643](https://github.com/parse-community/Parse-SDK-JS/issues/1643)) ([dfb5196](https://github.com/parse-community/Parse-SDK-JS/commit/dfb5196ea135e2e7bfbfa9df443162a144ec9ee4))

### Performance Improvements

* Avoid CORS preflight request by removing upload listener when not used ([#1610](https://github.com/parse-community/Parse-SDK-JS/issues/1610)) ([6125419](https://github.com/parse-community/Parse-SDK-JS/commit/6125419e749866ffa814a4a3e696382206d5da09))


### BREAKING CHANGES

* Calling `Parse.Query.subscribe()` will now return a rejected promise if an error is thrown in Cloud Code Triggers `beforeConnect` or `beforeSubscribe`; in previous releases a resolved promise was returned, even if subscribing failed and it was necessary to create an `error.on` listener to handle these errors (#1490) ([96d7174](96d7174))
* This release removes support for Node versions <14 ([bc04b4b](bc04b4b))

## [3.5.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0...3.5.1) (2022-11-26)


### Bug Fixes

* File upload fails when uploading base64 data ([#1578](https://github.com/parse-community/Parse-SDK-JS/issues/1578)) ([03ee3ff](https://github.com/parse-community/Parse-SDK-JS/commit/03ee3ffd3e4798f9dd958ddc24b9f774cb875507))
* React Native build does not maintain arrow functions and causes error with AsyncStorage ([#1587](https://github.com/parse-community/Parse-SDK-JS/issues/1587)) ([8aeaa4f](https://github.com/parse-community/Parse-SDK-JS/commit/8aeaa4f51e01f5763c497b5e86dca73835e2144b))
* SDK builds incorrectly since release 3.5.0 causing various bugs ([#1600](https://github.com/parse-community/Parse-SDK-JS/issues/1600)) ([f15154f](https://github.com/parse-community/Parse-SDK-JS/commit/f15154f903478f997bf127be198097a58c602594))

# [3.5.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.4...3.5.0) (2022-11-01)


### Bug Fixes

* `Parse.User.signUp()` does not pass context to Cloud Code  ([#1527](https://github.com/parse-community/Parse-SDK-JS/issues/1527)) ([53edcfd](https://github.com/parse-community/Parse-SDK-JS/commit/53edcfd7ad1bd075a6097ba3c129c5f0998ffbfa))
* `Schema.addField` does not correctly add value of type `Date` ([#1544](https://github.com/parse-community/Parse-SDK-JS/issues/1544)) ([15111f7](https://github.com/parse-community/Parse-SDK-JS/commit/15111f74a658eefc71a50b6bfb3d25c7997d26a2))
* creating a Parse.File with base64 string fails for some encodings ([#1517](https://github.com/parse-community/Parse-SDK-JS/issues/1517)) ([0439862](https://github.com/parse-community/Parse-SDK-JS/commit/0439862cd83dc37f8f3571b68fdaccb6b11b540d))
* initialization fails in non-browser environment that doesn't support `indexedDB` ([#1569](https://github.com/parse-community/Parse-SDK-JS/issues/1569)) ([3560a5e](https://github.com/parse-community/Parse-SDK-JS/commit/3560a5e422f8e97aa55c1c238d333248bac7f7d6))
* remove base64 validation due to validation inefficiency ([#1543](https://github.com/parse-community/Parse-SDK-JS/issues/1543)) ([473949d](https://github.com/parse-community/Parse-SDK-JS/commit/473949d514a395cf3656b03e083e30fff6e2f22c))

### Features

* add `json` option to `Parse.Query.each()` ([#1539](https://github.com/parse-community/Parse-SDK-JS/issues/1539)) ([89fd5ec](https://github.com/parse-community/Parse-SDK-JS/commit/89fd5ec6a8e210de3946434c6c88d6de87b6635c))
* add json option to query.each ([299fb0d](https://github.com/parse-community/Parse-SDK-JS/commit/299fb0d49cbbd3c95c2e8a61744bd03e93c33d36))
* generate `Parse.Object.objectId` automatically when `allowCustomObjectId` is enabled and no `objectId` is passed ([#1540](https://github.com/parse-community/Parse-SDK-JS/issues/1540)) ([68f3ff5](https://github.com/parse-community/Parse-SDK-JS/commit/68f3ff5b9a471648dcd07d35c706004eaaa173ec))
* localDatastore support for unsorted distance queries ([#1570](https://github.com/parse-community/Parse-SDK-JS/issues/1570)) ([ea3e75f](https://github.com/parse-community/Parse-SDK-JS/commit/ea3e75f1bdeb6e8c3b3e46c909f827daef1978f0))

## [3.4.4](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.3...3.4.4) (2022-09-02)


### Bug Fixes

* subscription to a LiveQuery containing `ParseQuery.select` overrides properties ([#1488](https://github.com/parse-community/Parse-SDK-JS/issues/1488)) ([b80eee4](https://github.com/parse-community/Parse-SDK-JS/commit/b80eee4b010b60d37b34b566880ed19f05d4c801))

## [3.4.3](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.2...3.4.3) (2022-07-02)


### Bug Fixes

* creating a Parse.File with base64 string fails for some file types ([#1467](https://github.com/parse-community/Parse-SDK-JS/issues/1467)) ([c07d6c9](https://github.com/parse-community/Parse-SDK-JS/commit/c07d6c99968163a72b6ab46e7970b7a5ca4ed540))
* invalid name for `Parse.Role` throws incorrect error ([#1481](https://github.com/parse-community/Parse-SDK-JS/issues/1481)) ([8326a6f](https://github.com/parse-community/Parse-SDK-JS/commit/8326a6f1d7cda0ca8c6f1a3a7ea82448881e118e))

## [3.4.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.1...3.4.2) (2022-05-02)


### Bug Fixes

* security upgrade moment from 2.29.1 to 2.29.2 ([#1472](https://github.com/parse-community/Parse-SDK-JS/issues/1472)) ([893c2a5](https://github.com/parse-community/Parse-SDK-JS/commit/893c2a5b0504740d5001e5674b8eefbaab081764))

## [3.4.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.0...3.4.1) (2022-01-01)


### Bug Fixes

* upgrade idb-keyval from 5.0.6 to 6.0.3 ([#1397](https://github.com/parse-community/Parse-SDK-JS/issues/1397)) ([922a6db](https://github.com/parse-community/Parse-SDK-JS/commit/922a6dbb8e8208d18d0759543962cbb4c1ae6d96))

# [3.4.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.3.1...3.4.0) (2021-11-01)


### Bug Fixes

* update parse server dependency branch; recreate package lock ([#1424](https://github.com/parse-community/Parse-SDK-JS/issues/1424)) ([38455ef](https://github.com/parse-community/Parse-SDK-JS/commit/38455ef6770d108dbf2f34604dade6dc0d63a201))
* upgrade @babel/runtime from 7.14.8 to 7.15.3 ([#1404](https://github.com/parse-community/Parse-SDK-JS/issues/1404)) ([8cb321c](https://github.com/parse-community/Parse-SDK-JS/commit/8cb321cbe81d51d4bbf94c2ac2638c14a0826bf4))

### Features

* add options to enable polling and set the polling interval; fixes excessive polling ([#1419](https://github.com/parse-community/Parse-SDK-JS/issues/1419)) ([0f804b8](https://github.com/parse-community/Parse-SDK-JS/commit/0f804b8760bba619080a79da5c6d3641f112b211))

# [3.3.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.3.0...3.3.1)

### Bug Fixes
- Upgraded crypto-js dependency for compatibility with webpack in Parse Dashboard

# [3.3.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.2.0...3.3.0)

### Improvements
- Improve support for nested keys ([#1364](https://github.com/parse-community/Parse-SDK-JS/pull/1364))
- Doc improvement ([#1349](https://github.com/parse-community/Parse-SDK-JS/pull/1349))
- Add npm version ci check ([#1345](https://github.com/parse-community/Parse-SDK-JS/pull/1345))
- Added an error code for geospatial index failures ([#1342](https://github.com/parse-community/Parse-SDK-JS/pull/1342))
- Added date support to OfflineQuery class ([#1344](https://github.com/parse-community/Parse-SDK-JS/pull/1344))

### Bug Fixes
- Fix react native build ([#1381](https://github.com/parse-community/Parse-SDK-JS/pull/1381))
- Fix weapp uuid error ([#1356](https://github.com/parse-community/Parse-SDK-JS/pull/1356))
- Fix EventEmitter undefined on React Native 0.64 ([#1351](https://github.com/parse-community/Parse-SDK-JS/pull/1351))

# [3.2.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.1.0...3.2.0)

### Breaking Changes
- Remove deletion of Anonymous User on logout ([#1324](https://github.com/parse-community/Parse-SDK-JS/pull/1324))
See https://community.parseplatform.org/t/anonymous-user-destroyed-on-logout/1425

### Improvements
- Allow multiple classNames for `Parse.Object.registerSubclass` ([#1315](https://github.com/parse-community/Parse-SDK-JS/pull/1315))
```
const classNames = ['ClassOne', 'ClassTwo', 'ClassThree'];
for (const className of classNames) {
  Parse.Object.registerSubclass(className, CustomClass);
}
```

### Bug Fixes
- Fixes build for WeChat WeApp, to reduce package size, see [issue/#1331](https://github.com/parse-community/Parse-SDK-JS/issues/1331)

# [3.1.0](https://github.com/parse-community/Parse-SDK-JS/compare/3.0.0...3.1.0)

### Breaking Changes
`Parse.Push.send` will now return the pushStatusId instead of `{ result: true }`

### Features
- Add Server Health Check `Parse.getServerHealth()` ([#1307](https://github.com/parse-community/Parse-SDK-JS/pull/1307))
- Allow saving with custom objectId `Parse.allowCustomObjectId = true` ([#1309](https://github.com/parse-community/Parse-SDK-JS/pull/1309))
- `Parse.Push.send` now returns pushStatusId ([#1302](https://github.com/parse-community/Parse-SDK-JS/pull/1302))
- Add `Parse.Push.getPushStatus` ([#1302](https://github.com/parse-community/Parse-SDK-JS/pull/1302))

### Improvements
- Add modifiers to `query.startsWith` ([#1306](https://github.com/parse-community/Parse-SDK-JS/pull/1306))
- Add modifiers to `query.endsWith` ([#1306](https://github.com/parse-community/Parse-SDK-JS/pull/1306))

### Bug Fixes
- EventuallyQueue now polls against `/health` endpoint, caused 403 forbidden side effect ([#1305](https://github.com/parse-community/Parse-SDK-JS/pull/1305))
- Allow nested increment on undefined fields ([#1303](https://github.com/parse-community/Parse-SDK-JS/pull/1303))
- Handle increment on nested fields any level deep ([#1301](https://github.com/parse-community/Parse-SDK-JS/pull/1301))

# [3.0.0](https://github.com/parse-community/Parse-SDK-JS/compare/2.19.0...3.0.0)

### Breaking Changes
For security purposes, logIn will default to `POST` instead of `GET` method. ([#1284](https://github.com/parse-community/Parse-SDK-JS/pull/1284))

If you need to use `GET` set the `usePost` option to false.

`Parse.User.logIn('username', 'password', { usePost: false })`

### Features
- Add EventuallyQueue API, object.saveEventually, object.destroyEventually ([#1291](https://github.com/parse-community/Parse-SDK-JS/pull/1291))
- Add Parse.CLP Object to control ClassLevelPermissions ([#1145](https://github.com/parse-community/Parse-SDK-JS/pull/1145))
- Add option `{ json: true }` on queries ([#1294](https://github.com/parse-community/Parse-SDK-JS/pull/1294))
- Add IndexedDB Storage Controller ([#1297](https://github.com/parse-community/Parse-SDK-JS/pull/1297))
- Parse.User.isCurrentAsync() for async storage ([#1298](https://github.com/parse-community/Parse-SDK-JS/pull/1298))

### Improvements
- Add useMasterKey option to Parse.File.destroy() ([#1285](https://github.com/parse-community/Parse-SDK-JS/pull/1285))
- User management on React-Native ([#1298](https://github.com/parse-community/Parse-SDK-JS/pull/1298))

### Bug Fixes
- Allow connect to LiveQuery with null fields ([#1282](https://github.com/parse-community/Parse-SDK-JS/pull/1282))
- fromJSON: Return date if value is type `Date` ([#1293](https://github.com/parse-community/Parse-SDK-JS/pull/1293))
- fromJSON: Allow keys to dirty, allows save fromJSON ([#1295](https://github.com/parse-community/Parse-SDK-JS/pull/1295))
- Parse.Schema.addField accepts Pointer and Relation types ([#1281](https://github.com/parse-community/Parse-SDK-JS/pull/1281))

# 2.19.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.18.0...2.19.0)

### Features
- New error code 210 (MFA_ERROR) ([#1268](https://github.com/parse-community/Parse-SDK-JS/pull/1268))
- New error code 211 (MFA_TOKEN_REQUIRED) ([#1268](https://github.com/parse-community/Parse-SDK-JS/pull/1268))
- New error code 161 (FILE_DELETE_UNNAMED_ERROR) ([#1257](https://github.com/parse-community/Parse-SDK-JS/pull/1257))

### Improvements
- Parse.File.destroy without name error message ([#1257](https://github.com/parse-community/Parse-SDK-JS/pull/1257))

### Bug Fixes
- Remove unnecessary object reference and comment from AddUniqueOp ([#1253](https://github.com/parse-community/Parse-SDK-JS/pull/1253))
- Internal Referencing for Increment Dot Notation ([#1255](https://github.com/parse-community/Parse-SDK-JS/pull/1255))
- Saving for Increment Dot Notation ([#1219](https://github.com/parse-community/Parse-SDK-JS/pull/1219))

# 2.18.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.17.0...2.18.0)

### Features
- Support query.findAll() ([#1233](https://github.com/parse-community/Parse-SDK-JS/pull/1233))

### Improvements
- Pass objects into query.equalTo / query.notEqualTo ([#1235](https://github.com/parse-community/Parse-SDK-JS/pull/1235))
- Improving legacy initialization setters/getters ([#1237](https://github.com/parse-community/Parse-SDK-JS/pull/1237))
- Remove deprecated backbone options from Parse.Push ([#1238](https://github.com/parse-community/Parse-SDK-JS/pull/1238))
- Code Coverage and Unit Tests ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))

### Bug Fixes
- Prevent crashing LiveQueryClient if emitter error is not set ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Handle LiveQuery subscription socket error ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Set WeChat socket handlers before connecting ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))
- Parse.Installation validating attribute error ([#1241](https://github.com/parse-community/Parse-SDK-JS/pull/1241))

# 2.17.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.16.0...2.17.0)

### Improvements
- User LogIn with usePost option ([#1229](https://github.com/parse-community/Parse-SDK-JS/pull/1229))

# 2.16.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.15.0...2.16.0)

Idempotency enforcement for client requests. This deduplicates requests where the client intends to send one request to Parse Server but due to network issues the server receives the request multiple times. (Parse-Server 4.3.0+)
**Caution, this is an experimental feature that may not be appropriate for production.**

To enable use either of the following:
* `Parse.CoreManager.set('IDEMPOTENCY', true)`
* `Parse.idempotency = true`

### Features
- Idempotency Request ([#1210](https://github.com/parse-community/Parse-SDK-JS/pull/1210))

### Improvements
- Allow Pin of unsaved objects in LocalDatastore ([#1225](https://github.com/parse-community/Parse-SDK-JS/pull/1225))

### Bug Fixes
- crypto-js crashing React Native ([#1218](https://github.com/parse-community/Parse-SDK-JS/pull/1218))
- Schema mismatch error on add / remove empty array on Relation  ([#1222](https://github.com/parse-community/Parse-SDK-JS/pull/1222))
- query.select error on null fields ([#1223](https://github.com/parse-community/Parse-SDK-JS/pull/1223))

# 2.15.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.14.0...2.15.0)

### Features
- New Parse.Error 159 DUPLICATE_REQUEST ([#1189](https://github.com/parse-community/Parse-SDK-JS/pull/1189))

### Bug Fixes
- Live Query Subscription Error Event ([#1193](https://github.com/parse-community/Parse-SDK-JS/pull/1193))

# 2.14.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.13.0...2.14.0)

### Features
- Passing context in destroy, saveAll, get, find hooks. ([#1159](https://github.com/parse-community/Parse-SDK-JS/pull/1159))
- Support using aggregate on top of constructed query ([#1170](https://github.com/parse-community/Parse-SDK-JS/pull/1170))

### Improvements
- Performance improvement for Query.eachBatch ([#1179](https://github.com/parse-community/Parse-SDK-JS/pull/1179))

### Bug Fixes
- Fix context for cascade saving ([#1186](https://github.com/parse-community/Parse-SDK-JS/pull/1186))

# 2.13.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.12.0...2.13.0)

### Features
- Add Email Verification to Parse.User ([#1144](https://github.com/parse-community/Parse-SDK-JS/pull/1144))
- Add Verify Password to Parse.User ([#1144](https://github.com/parse-community/Parse-SDK-JS/pull/1144))

### Improvements
- Add read preference for aggregate query ([#1143](https://github.com/parse-community/Parse-SDK-JS/pull/1143))
- Add file progress type (upload/download) ([#1140](https://github.com/parse-community/Parse-SDK-JS/pull/1140))
- Add context to Parse.Object.save ([#1150](https://github.com/parse-community/Parse-SDK-JS/pull/1150))

### Bug Fixes
- File upload progress ([#1133](https://github.com/parse-community/Parse-SDK-JS/pull/1133))
- Live Query Subscription Open Event ([#1151](https://github.com/parse-community/Parse-SDK-JS/pull/1151))

# 2.12.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.11.0...2.12.0)

### Features
- Support Parse.Query hint ([#1054](https://github.com/parse-community/Parse-SDK-JS/pull/1054))
- Support Parse.Query eachBatch ([#1114](https://github.com/parse-community/Parse-SDK-JS/pull/1114))
- Support Parse.Object decrement ([#1069](https://github.com/parse-community/Parse-SDK-JS/pull/1069))
- Support deleting Parse.File ([#1067](https://github.com/parse-community/Parse-SDK-JS/pull/1067))
- Support File Metadata ([#1065](https://github.com/parse-community/Parse-SDK-JS/pull/1065)) ([#1070](https://github.com/parse-community/Parse-SDK-JS/pull/1070))

### Improvements
- Support global request batch size ([#1053](https://github.com/parse-community/Parse-SDK-JS/pull/1053))
- Username signup error ([#1080](https://github.com/parse-community/Parse-SDK-JS/pull/1080))
- Pass SaveAll options to Files ([#1107](https://github.com/parse-community/Parse-SDK-JS/pull/1107))
- Make iteration query methods (map, filter, reduce) returned promises ([#1112](https://github.com/parse-community/Parse-SDK-JS/pull/1112))

### Bug Fixes
- Fix user.become for AsyncStorage ([#1056](https://github.com/parse-community/Parse-SDK-JS/pull/1056))
- Subscribing to query with null sessionToken ([#1058](https://github.com/parse-community/Parse-SDK-JS/pull/1058))
- Fix addIndex annotation in Parse.Schema ([#1071](https://github.com/parse-community/Parse-SDK-JS/pull/1071))
- Fix cascadeSave=false bug for SingleInstance objects ([#1078](https://github.com/parse-community/Parse-SDK-JS/pull/1078))
- Fix react-native build ([#1094](https://github.com/parse-community/Parse-SDK-JS/pull/1094))

# 2.11.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.10.0...2.11.0)

### Features
- Support encrypting current user ([#1036](https://github.com/parse-community/Parse-SDK-JS/pull/1036))
- File Upload Progress on Wechat ([#1029](https://github.com/parse-community/Parse-SDK-JS/pull/1029))

### Improvements
- Support query.cancel() on Node ([#1030](https://github.com/parse-community/Parse-SDK-JS/pull/1030))

### Bug Fixes
- File Upload Progress on browser ([#1029](https://github.com/parse-community/Parse-SDK-JS/pull/1029))
- User signup with installationId ([#1031](https://github.com/parse-community/Parse-SDK-JS/pull/1031))

# 2.10.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.9.1...2.10.0)

### Features
- Add query.fromNetwork() ([#1002](https://github.com/parse-community/Parse-SDK-JS/pull/1002))
- Add query.cancel() (browser only) ([#1003](https://github.com/parse-community/Parse-SDK-JS/pull/1003))
- Support custom request headers ([#1019](https://github.com/parse-community/Parse-SDK-JS/pull/1019))

### Bug Fixes
- To subclass Parse.User: `Parse.Object.registerSubclass('_User', CustomUser);`

**Security**
Address Security Advisory of possible leak of sensitive user info. ([#d110617](https://github.com/parse-community/Parse-SDK-JS/commit/d1106174571b699f972929dd7cbb8e45b5283cbb)), big thanks to [Colin Ulin](https://github.com/pocketcolin) for identifying the problem, following the vulnerability disclosure guidelines

# 2.9.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.9.0...2.9.1)

### Bug Fixes
- Storing user to disk ([#992](https://github.com/parse-community/Parse-SDK-JS/issues/992)) ([#999](https://github.com/parse-community/Parse-SDK-JS/pull/999))

# 2.9.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.8.0...2.9.0)

**Deprecation**
`_linkWith` and `_logInWith` are deprecated. Replace with `linkWith` and `logInWith` respectively. ([#963](https://github.com/parse-community/Parse-SDK-JS/pull/963))

### Features
- Set Class Level Permission via Parse.Schema ([#960](https://github.com/parse-community/Parse-SDK-JS/pull/960))
- Set required fields and default values via Parse.Schema ([#961](https://github.com/parse-community/Parse-SDK-JS/pull/961))
- Add installationId to LiveQuery ([#977](https://github.com/parse-community/Parse-SDK-JS/pull/977))
- Add response object to LiveQuery ([#979](https://github.com/parse-community/Parse-SDK-JS/pull/979))
- Support query.map, query.filter, query.reduce ([#987](https://github.com/parse-community/Parse-SDK-JS/pull/987))

### Bug Fixes
- Can unlink without provider in cloud code ([#971](https://github.com/parse-community/Parse-SDK-JS/pull/971))
- Properly store User Subclass in Storage ([#978](https://github.com/parse-community/Parse-SDK-JS/pull/978))

### Improvements
- User subclass support for logInWith, hydrate, me, current ([#968](https://github.com/parse-community/Parse-SDK-JS/pull/968))
- Remove unused options from Parse.Schema ([#959](https://github.com/parse-community/Parse-SDK-JS/pull/959))
- Documentation for linking users and custom auth ([#963](https://github.com/parse-community/Parse-SDK-JS/pull/963))
- Generate installationId as uuid v4 ([#972](https://github.com/parse-community/Parse-SDK-JS/pull/972))
- Reuse StorageController for LDS ([#984](https://github.com/parse-community/Parse-SDK-JS/pull/984))

# 2.8.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.7.1...2.8.0)

### Features
- Parse.File save cancel ([#948](https://github.com/parse-community/Parse-SDK-JS/pull/948))
- Parse.File getData cancel ([#951](https://github.com/parse-community/Parse-SDK-JS/pull/951))

### Bug Fixes
- React Native Emitter module ([#946](https://github.com/parse-community/Parse-SDK-JS/pull/946))
- Parse.Schema deleteIndex, deleteField returns Parse.Schema ([#949](https://github.com/parse-community/Parse-SDK-JS/pull/949))

### Improvements
- Compiling on Windows ([#947](https://github.com/parse-community/Parse-SDK-JS/pull/947))
- Generate _localId as UUID ([#956](https://github.com/parse-community/Parse-SDK-JS/pull/956))

# 2.7.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.7.0...2.7.1)

### Features
- Support for `ParseConfig.save` with `masterKeyOnlyFlags` option ([#910](https://github.com/parse-community/Parse-SDK-JS/pull/910)) (Requires Parse-Server 3.8.0+)
- Support for `ParseConfig.get` with `useMasterKey` option ([#907](https://github.com/parse-community/Parse-SDK-JS/pull/907))

# 2.7.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.6.0...2.7.0)

### Features
- Support for `ParseObject.fetchAllIfNeededWithInclude` ([#900](https://github.com/parse-community/Parse-SDK-JS/pull/900))
- Support for `ParseObject.exists` ([#898](https://github.com/parse-community/Parse-SDK-JS/pull/898))
- Support for `ParseObject.save` with `cascadeSave` option ([#881](https://github.com/parse-community/Parse-SDK-JS/pull/881))

### Bug Fixes
- `ParseUser.become` should return subclass ([#897](https://github.com/parse-community/Parse-SDK-JS/pull/897))
- Ensure LiveQuery subscribes before returning subscription ([#878](https://github.com/parse-community/Parse-SDK-JS/pull/878))

### Improvements
- Remove deprecated `@babel/polyfill` ([#877](https://github.com/parse-community/Parse-SDK-JS/pull/877))

# 2.6.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.5.1...2.6.0)

### Features
- Support configurable WebSocketController ([#64f359a](https://github.com/parse-community/Parse-SDK-JS/commit/64f359af251ccb9473f4464d09bf3ba8a0d12dc9))
- Support for Wechat Mini Program ([#874](https://github.com/parse-community/Parse-SDK-JS/pull/874))
- Support withCount query constraint ([#868](https://github.com/parse-community/Parse-SDK-JS/pull/868))

### Improvements
- Fix SERVER_RENDERING environment variable ([#873](https://github.com/parse-community/Parse-SDK-JS/pull/873))

# 2.5.1
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.5.0...2.5.1)

- FIX: NPM credentials

# 2.5.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.4.0...2.5.0)

### Features
- Support query exclude keys ([#857](https://github.com/parse-community/Parse-SDK-JS/pull/857))
- Support query read preference ([#855](https://github.com/parse-community/Parse-SDK-JS/pull/855))
- Support object isDataAvailable ([#856](https://github.com/parse-community/Parse-SDK-JS/pull/856))

### Improvements
- Add options for AnonymousUtils ([#860](https://github.com/parse-community/Parse-SDK-JS/pull/860))
- Stateless UserController ([#846](https://github.com/parse-community/Parse-SDK-JS/pull/846))
- Fix Facebook login isExisted ([#845](https://github.com/parse-community/Parse-SDK-JS/pull/845))
- Allow any Blob to be uploaded ([#837](https://github.com/parse-community/Parse-SDK-JS/pull/837))
- Support _linkWith if no provider ([#810](https://github.com/parse-community/Parse-SDK-JS/pull/810))
- LDS: Improve querying dates ([#808](https://github.com/parse-community/Parse-SDK-JS/pull/808))
- Support testing on Windows ([#808](https://github.com/parse-community/Parse-SDK-JS/pull/820))
- Support installing SDK from branch ([#821](https://github.com/parse-community/Parse-SDK-JS/pull/821))

# 2.4.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.3.2...2.4.0)

### Features
- LocalDatastore: Support Users ([#801](https://github.com/parse-community/Parse-SDK-JS/pull/801))
- LiveQuery subscribe with sessionToken ([#791](https://github.com/parse-community/Parse-SDK-JS/pull/791))

### Improvements
- LocalDatastore: Improve pinning unsaved objects ([#795](https://github.com/parse-community/Parse-SDK-JS/pull/795))
- LocalDatastore: Improve error handling ([#803](https://github.com/parse-community/Parse-SDK-JS/pull/803))

# 2.3.2
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.3.1...2.3.2)

- Support `getData` from Parse.File ([#780](https://github.com/parse-community/Parse-SDK-JS/pull/780))
- Parse.FacebookUtils `logIn` and `link` support MasterKey and SessionToken options ([#779](https://github.com/parse-community/Parse-SDK-JS/pull/779))
- Remove node modules `http` and `https` from React-Native build ([#776](https://github.com/parse-community/Parse-SDK-JS/pull/776))

# 2.3.1
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

# 2.2.0
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

# 2.1.0
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/v2.0.2...2.1.0)

- Parse.Error now inherits from Error ([#658](https://github.com/parse-community/Parse-SDK-JS/pull/658))

# 2.0.2
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/v2.0.1...v2.0.2)

- Fixes issue affecting unsubscribing from liveQueries ([#640](https://github.com/parse-community/Parse-SDK-JS/pull/640))
- Adds support for aggregate stages with identical names ([#637](https://github.com/parse-community/Parse-SDK-JS/pull/637))
- Adds ability to fetch an object with includes ([#631](https://github.com/parse-community/Parse-SDK-JS/pull/631))
- Adds support for $nor operator in queries ([#634](https://github.com/parse-community/Parse-SDK-JS/pull/634))
- Adds support for containedBy operator in queries ([#633](https://github.com/parse-community/Parse-SDK-JS/pull/633))
- Adds support for includeAll ([#632](https://github.com/parse-community/Parse-SDK-JS/pull/632))

# 2.0.1

- Ensure we only read the job status id header if present. ([#623](https://github.com/parse-community/Parse-SDK-JS/pull/623))

# 2.0.0

- Parse.Promise has been replaced by native Promises ([#620](https://github.com/parse-community/Parse-SDK-JS/pull/620))
- Backbone style callbacks are removed ([#620](https://github.com/parse-community/Parse-SDK-JS/pull/620))
