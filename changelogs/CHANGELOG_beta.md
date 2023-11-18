## [4.3.1-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0...4.3.1-beta.1) (2023-11-16)


### Bug Fixes

* Connection failure in `Parse.Object.saveEventually` and `Parse.Object.destroyEventually` not handled on custom `Parse.Error.CONNECTION_FAILURE` message ([#2032](https://github.com/parse-community/Parse-SDK-JS/issues/2032)) ([4da3ebc](https://github.com/parse-community/Parse-SDK-JS/commit/4da3ebcc28b903a499c07bb194baae738de21d6f))
* Docs fail with `Cannot find module 'taffydb'` ([#2036](https://github.com/parse-community/Parse-SDK-JS/issues/2036)) ([dc91d0f](https://github.com/parse-community/Parse-SDK-JS/commit/dc91d0fc4f69639ba762f5af841477e8836c6927))
* Error in web context when `window.indexedDB` API is available but protected ([#2039](https://github.com/parse-community/Parse-SDK-JS/issues/2039)) ([360981f](https://github.com/parse-community/Parse-SDK-JS/commit/360981f8a529f3e10243413c8114373271bb6f43))
* Security upgrade browserify-sign from 4.2.1 to 4.2.2 ([#2043](https://github.com/parse-community/Parse-SDK-JS/issues/2043)) ([fd50b9d](https://github.com/parse-community/Parse-SDK-JS/commit/fd50b9dbc9feb8b51eedfcdddce37ea1882ac438))
* Security upgrade crypto-js from 4.1.1 to 4.2.0 ([#2042](https://github.com/parse-community/Parse-SDK-JS/issues/2042)) ([681fbdf](https://github.com/parse-community/Parse-SDK-JS/commit/681fbdfcdd2e6d351e00400eccf41fe732b053ba))

# [4.3.0-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0...4.3.0-beta.1) (2023-09-16)


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

# [4.2.0-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0...4.2.0-beta.1) (2023-05-01)


### Bug Fixes

* `Parse.File.cancel` starts new attempt to save file ([#1781](https://github.com/parse-community/Parse-SDK-JS/issues/1781)) ([b755e42](https://github.com/parse-community/Parse-SDK-JS/commit/b755e42394db8b94b87b0dbefc6cf6f18189c46d))

### Features

* Add `Parse.User.loginAs` ([#1875](https://github.com/parse-community/Parse-SDK-JS/issues/1875)) ([381fcfc](https://github.com/parse-community/Parse-SDK-JS/commit/381fcfc7f9cfda70af7c6dc3a35de59b82b72258))
* Add `ParseQuery.watch` to trigger LiveQuery only on update of specific fields ([#1839](https://github.com/parse-community/Parse-SDK-JS/issues/1839)) ([7479343](https://github.com/parse-community/Parse-SDK-JS/commit/7479343abd8739fe03558ff9b2ce610c34c568ae))

# [4.1.0-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.1...4.1.0-beta.1) (2023-03-01)


### Bug Fixes

* `LiveQuerySubscription.unsubscribe` resolves promise before unsubscribing completes ([#1727](https://github.com/parse-community/Parse-SDK-JS/issues/1727)) ([1c96205](https://github.com/parse-community/Parse-SDK-JS/commit/1c96205cb3c162b21bf4508f7783400a28a99868))
* Node engine version upper range is <19 despite Node 19 support ([#1732](https://github.com/parse-community/Parse-SDK-JS/issues/1732)) ([febe187](https://github.com/parse-community/Parse-SDK-JS/commit/febe187a24fb56e83542c00ae39148575fc57c4b))
* Saving a new `Parse.Object` with an unsaved `Parse.File` fails ([#1662](https://github.com/parse-community/Parse-SDK-JS/issues/1662)) ([16535a4](https://github.com/parse-community/Parse-SDK-JS/commit/16535a43f6c762983460aa837102a4c692de70bb))

### Features

* `LiveQueryClient.close` returns promise when WebSocket closes ([#1735](https://github.com/parse-community/Parse-SDK-JS/issues/1735)) ([979d660](https://github.com/parse-community/Parse-SDK-JS/commit/979d6607d5449dd3d3c5e51f36119bd05b25feaa))
* Upgrade Node Package Manager lock file `package-lock.json` to version 2 ([#1729](https://github.com/parse-community/Parse-SDK-JS/issues/1729)) ([e993786](https://github.com/parse-community/Parse-SDK-JS/commit/e993786cf0299b1150bf36afee1bc516e23e349a))

## [4.0.1-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0...4.0.1-beta.1) (2023-01-31)


### Bug Fixes

* Local datastore query with `containedIn` not working when field is an array ([#1666](https://github.com/parse-community/Parse-SDK-JS/issues/1666)) ([2391bff](https://github.com/parse-community/Parse-SDK-JS/commit/2391bff36bd8b3f5357f069916375b979cde15b2))
* Request execution time keeps increasing over time when using `Parse.Object.extend` ([#1682](https://github.com/parse-community/Parse-SDK-JS/issues/1682)) ([f555c43](https://github.com/parse-community/Parse-SDK-JS/commit/f555c43841c95c2ae759342ea28cd69f7fd232a4))

# [4.0.0-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.1...4.0.0-beta.1) (2023-01-23)


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

## [3.5.1-beta.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.1-beta.1...3.5.1-beta.2) (2022-11-26)


### Bug Fixes

* SDK builds incorrectly since release 3.5.0 causing various bugs ([#1600](https://github.com/parse-community/Parse-SDK-JS/issues/1600)) ([f15154f](https://github.com/parse-community/Parse-SDK-JS/commit/f15154f903478f997bf127be198097a58c602594))

## [3.5.1-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0...3.5.1-beta.1) (2022-11-03)


### Bug Fixes

* File upload fails when uploading base64 data ([#1578](https://github.com/parse-community/Parse-SDK-JS/issues/1578)) ([03ee3ff](https://github.com/parse-community/Parse-SDK-JS/commit/03ee3ffd3e4798f9dd958ddc24b9f774cb875507))
* React Native build does not maintain arrow functions and causes error with AsyncStorage ([#1587](https://github.com/parse-community/Parse-SDK-JS/issues/1587)) ([8aeaa4f](https://github.com/parse-community/Parse-SDK-JS/commit/8aeaa4f51e01f5763c497b5e86dca73835e2144b))

# [3.5.0-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.4...3.5.0-beta.1) (2022-10-25)


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

## [3.4.4-beta.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.3...3.4.4-beta.1) (2022-07-02)


### Bug Fixes

* subscription to a LiveQuery containing `ParseQuery.select` overrides properties ([#1488](https://github.com/parse-community/Parse-SDK-JS/issues/1488)) ([b80eee4](https://github.com/parse-community/Parse-SDK-JS/commit/b80eee4b010b60d37b34b566880ed19f05d4c801))
