# [5.3.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/5.3.0-alpha.3...5.3.0-alpha.4) (2024-10-14)


### Features

* Add transaction to save and destroy on `Parse.Object` ([#2265](https://github.com/parse-community/Parse-SDK-JS/issues/2265)) ([2b55bdf](https://github.com/parse-community/Parse-SDK-JS/commit/2b55bdf74d8338688765f27b14826e527d0aeb53))

# [5.3.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/5.3.0-alpha.2...5.3.0-alpha.3) (2024-09-25)


### Bug Fixes

* Security upgrade dset from 3.1.3 to 3.1.4 ([#2277](https://github.com/parse-community/Parse-SDK-JS/issues/2277)) ([058f8e4](https://github.com/parse-community/Parse-SDK-JS/commit/058f8e4d3f8113cd8e81f6e58d2d6bba579b1000))

# [5.3.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/5.3.0-alpha.1...5.3.0-alpha.2) (2024-07-07)


### Bug Fixes

* `Parse.Object.get` returns array instead of object if key name is number-like ([#2201](https://github.com/parse-community/Parse-SDK-JS/issues/2201)) ([5921ba2](https://github.com/parse-community/Parse-SDK-JS/commit/5921ba248431b197ee1592eae39376132be454a3))

# [5.3.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/5.2.0...5.3.0-alpha.1) (2024-07-07)


### Features

* Add support for Node 22 ([#2209](https://github.com/parse-community/Parse-SDK-JS/issues/2209)) ([c74fd4c](https://github.com/parse-community/Parse-SDK-JS/commit/c74fd4ce2aa7b0618c3027e1936103d24f2987a7))

# [5.2.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/5.2.0-alpha.3...5.2.0-alpha.4) (2024-06-28)


### Bug Fixes

* Dot notation on JSON arrays doesn't work on `PushStatus` offset fields ([#2194](https://github.com/parse-community/Parse-SDK-JS/issues/2194)) ([e0eb6f0](https://github.com/parse-community/Parse-SDK-JS/commit/e0eb6f04e086da4628a9706b17909d11e5f06210))

# [5.2.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/5.2.0-alpha.2...5.2.0-alpha.3) (2024-06-24)


### Bug Fixes

* `LiveQueryClient.resubscribe` with Parse Server 7 causes many open connections ([#2184](https://github.com/parse-community/Parse-SDK-JS/issues/2184)) ([71b4d17](https://github.com/parse-community/Parse-SDK-JS/commit/71b4d17efa197f6f0bb94105809f32a9adc86ea6))

# [5.2.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/5.2.0-alpha.1...5.2.0-alpha.2) (2024-06-07)


### Bug Fixes

* Duplicate pending operations on nested fields ([#2162](https://github.com/parse-community/Parse-SDK-JS/issues/2162)) ([df6df7c](https://github.com/parse-community/Parse-SDK-JS/commit/df6df7c68b9871f0b744958a489a54f1623943a9))

# [5.2.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.1-alpha.1...5.2.0-alpha.1) (2024-05-17)


### Features

* Support dot notation on array fields ([#2120](https://github.com/parse-community/Parse-SDK-JS/issues/2120)) ([25ec684](https://github.com/parse-community/Parse-SDK-JS/commit/25ec684bf01cf9cd616ceff6f5d30e2e7fb83a5a))

## [5.1.1-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0...5.1.1-alpha.1) (2024-05-16)


### Bug Fixes

* `Parse.Installation` not working when installation is deleted on server ([#2126](https://github.com/parse-community/Parse-SDK-JS/issues/2126)) ([22360b4](https://github.com/parse-community/Parse-SDK-JS/commit/22360b4dc96ca7ebfcc2441855456b241bf450ac))

# [5.1.0-alpha.11](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.10...5.1.0-alpha.11) (2024-05-16)


### Bug Fixes

* `Parse.GeoPoint.current` returns `undefined` ([#2127](https://github.com/parse-community/Parse-SDK-JS/issues/2127)) ([3860535](https://github.com/parse-community/Parse-SDK-JS/commit/3860535f5257b7b5edbf7ebfd286e2a4a7fd2769))

# [5.1.0-alpha.10](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.9...5.1.0-alpha.10) (2024-05-15)


### Bug Fixes

* Remove circular dependencies ([#2125](https://github.com/parse-community/Parse-SDK-JS/issues/2125)) ([b415165](https://github.com/parse-community/Parse-SDK-JS/commit/b415165486f0328e0f9fb2d949d7b11abf363435))

# [5.1.0-alpha.9](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.8...5.1.0-alpha.9) (2024-05-04)


### Features

* Improve installation object `Parse.Installation.currentInstallation` to support web push notifications ([#2119](https://github.com/parse-community/Parse-SDK-JS/issues/2119)) ([4fc62ce](https://github.com/parse-community/Parse-SDK-JS/commit/4fc62cec0c4ea704f48ec501a5f0182836de45d1))

# [5.1.0-alpha.8](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.7...5.1.0-alpha.8) (2024-05-02)


### Bug Fixes

* Pending updates to nested field causes `ParseObject.toJSON()` to return incorrect object ([#1453](https://github.com/parse-community/Parse-SDK-JS/issues/1453)) ([23cc573](https://github.com/parse-community/Parse-SDK-JS/commit/23cc573ccae9e11288aaeff61f478e59bf9bae0c))

# [5.1.0-alpha.7](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.6...5.1.0-alpha.7) (2024-05-01)


### Bug Fixes

* Multiple object updates of nested keys overwrite each other ([#1451](https://github.com/parse-community/Parse-SDK-JS/issues/1451)) ([fa4341a](https://github.com/parse-community/Parse-SDK-JS/commit/fa4341a8c0ce5a9c478435250b4af6ea020a45bd))

# [5.1.0-alpha.6](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.5...5.1.0-alpha.6) (2024-04-25)


### Features

* Allow setting custom queue for handling offline operations via `Parse.EventuallyQueue` ([#2106](https://github.com/parse-community/Parse-SDK-JS/issues/2106)) ([f92e4d4](https://github.com/parse-community/Parse-SDK-JS/commit/f92e4d42afdc1e55bcfff1ba9d0658d39943f3f0))

# [5.1.0-alpha.5](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.4...5.1.0-alpha.5) (2024-04-22)


### Bug Fixes

* Chrome browser console warning about unsafe header `access-control-expose-headers` when calling Cloud Function ([#2095](https://github.com/parse-community/Parse-SDK-JS/issues/2095)) ([7b73c03](https://github.com/parse-community/Parse-SDK-JS/commit/7b73c033eef8977c3e6c7e4af7146ffa74deed0c))

# [5.1.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.3...5.1.0-alpha.4) (2024-04-15)


### Bug Fixes

* Live Query not working on Expo React Native ([#2109](https://github.com/parse-community/Parse-SDK-JS/issues/2109)) ([7a89665](https://github.com/parse-community/Parse-SDK-JS/commit/7a8966522f06efb3f0303b2a3c6fd08f41d8aff9))

# [5.1.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.2...5.1.0-alpha.3) (2024-04-14)


### Features

* Lazy load `Parse.CoreManager` controllers to add support for swappable `CryptoController`, `LocalDatastoreController`, `StorageController`, `WebSocketController`, `ParseLiveQuery` ([#2100](https://github.com/parse-community/Parse-SDK-JS/issues/2100)) ([fbd0ab1](https://github.com/parse-community/Parse-SDK-JS/commit/fbd0ab1402792e241c4d9d6496b451e4cc268b8b))

# [5.1.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/5.1.0-alpha.1...5.1.0-alpha.2) (2024-04-13)


### Bug Fixes

* Local datastore throws error when `Parse.Query.notEqualTo` is set to `null` ([#2102](https://github.com/parse-community/Parse-SDK-JS/issues/2102)) ([6afd32a](https://github.com/parse-community/Parse-SDK-JS/commit/6afd32af3517c88b570505d5cb25bd5ab449f039))

# [5.1.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/5.0.0...5.1.0-alpha.1) (2024-03-31)


### Features

* Add password validation for user with unverified email via `Parse.User.verifyPassword` using master key and option `ignoreEmailVerification: true` ([#2076](https://github.com/parse-community/Parse-SDK-JS/issues/2076)) ([b0adf7e](https://github.com/parse-community/Parse-SDK-JS/commit/b0adf7e02ab0beea2cd9b759d0f788c69d291491))
* Add support for setting `Parse.ACL` from json ([#2097](https://github.com/parse-community/Parse-SDK-JS/issues/2097)) ([72bc9ac](https://github.com/parse-community/Parse-SDK-JS/commit/72bc9ac3bfb23443a03742fe47a3b1b2713f8c96))

# [5.0.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/5.0.0-alpha.3...5.0.0-alpha.4) (2024-03-23)


### Features

* Add password validation for user with unverified email via `Parse.User.verifyPassword` using master key and option `ignoreEmailVerification: true` ([#2076](https://github.com/parse-community/Parse-SDK-JS/issues/2076)) ([b0adf7e](https://github.com/parse-community/Parse-SDK-JS/commit/b0adf7e02ab0beea2cd9b759d0f788c69d291491))

# [5.0.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/5.0.0-alpha.2...5.0.0-alpha.3) (2024-03-11)


### Features

* Add comment to MongoDB query via `Parse.Query.comment` ([#2088](https://github.com/parse-community/Parse-SDK-JS/issues/2088)) ([a970913](https://github.com/parse-community/Parse-SDK-JS/commit/a9709136983b3c90ca88a8721b9cc54593c245cc))

# [5.0.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/5.0.0-alpha.1...5.0.0-alpha.2) (2024-03-10)


### Features

* Add compatibility with Parse Server 7 ([#2089](https://github.com/parse-community/Parse-SDK-JS/issues/2089)) ([86600bc](https://github.com/parse-community/Parse-SDK-JS/commit/86600bc5abc4ca705b7e252b3714579b2e4c1598))


### BREAKING CHANGES

* Parse JS SDK 5 requires Parse Server 7 and is incompatible with Parse Server 6. ([86600bc](86600bc))

# [5.0.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.1-alpha.2...5.0.0-alpha.1) (2024-03-09)


### Features

* Add support for Node 20, remove support for Node 14 and 16 ([#2063](https://github.com/parse-community/Parse-SDK-JS/issues/2063)) ([74eb4d5](https://github.com/parse-community/Parse-SDK-JS/commit/74eb4d5f7d255f0f4e5d69758067f2a7d3caf014))


### BREAKING CHANGES

* Removes support for Node 14 and 16. ([74eb4d5](74eb4d5))

## [4.3.1-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.1-alpha.1...4.3.1-alpha.2) (2024-02-15)


### Bug Fixes

* Calling `Parse.Object.relation.add` multiple times adds only the first object ([#2078](https://github.com/parse-community/Parse-SDK-JS/issues/2078)) ([0f98117](https://github.com/parse-community/Parse-SDK-JS/commit/0f981175c8f5155a631a0fcf9837ef5b285b2f55))

## [4.3.1-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0...4.3.1-alpha.1) (2023-11-18)


### Bug Fixes

* Connection failure in `Parse.Object.saveEventually` and `Parse.Object.destroyEventually` not handled on custom `Parse.Error.CONNECTION_FAILURE` message ([#2032](https://github.com/parse-community/Parse-SDK-JS/issues/2032)) ([4da3ebc](https://github.com/parse-community/Parse-SDK-JS/commit/4da3ebcc28b903a499c07bb194baae738de21d6f))
* Docs fail with `Cannot find module 'taffydb'` ([#2036](https://github.com/parse-community/Parse-SDK-JS/issues/2036)) ([dc91d0f](https://github.com/parse-community/Parse-SDK-JS/commit/dc91d0fc4f69639ba762f5af841477e8836c6927))
* Error in web context when `window.indexedDB` API is available but protected ([#2039](https://github.com/parse-community/Parse-SDK-JS/issues/2039)) ([360981f](https://github.com/parse-community/Parse-SDK-JS/commit/360981f8a529f3e10243413c8114373271bb6f43))
* Security upgrade browserify-sign from 4.2.1 to 4.2.2 ([#2043](https://github.com/parse-community/Parse-SDK-JS/issues/2043)) ([fd50b9d](https://github.com/parse-community/Parse-SDK-JS/commit/fd50b9dbc9feb8b51eedfcdddce37ea1882ac438))
* Security upgrade crypto-js from 4.1.1 to 4.2.0 ([#2042](https://github.com/parse-community/Parse-SDK-JS/issues/2042)) ([681fbdf](https://github.com/parse-community/Parse-SDK-JS/commit/681fbdfcdd2e6d351e00400eccf41fe732b053ba))

# [4.3.0-alpha.6](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0-alpha.5...4.3.0-alpha.6) (2023-10-28)


### Bug Fixes

* Security upgrade browserify-sign from 4.2.1 to 4.2.2 ([#2043](https://github.com/parse-community/Parse-SDK-JS/issues/2043)) ([fd50b9d](https://github.com/parse-community/Parse-SDK-JS/commit/fd50b9dbc9feb8b51eedfcdddce37ea1882ac438))

# [4.3.0-alpha.5](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0-alpha.4...4.3.0-alpha.5) (2023-10-26)


### Bug Fixes

* Security upgrade crypto-js from 4.1.1 to 4.2.0 ([#2042](https://github.com/parse-community/Parse-SDK-JS/issues/2042)) ([681fbdf](https://github.com/parse-community/Parse-SDK-JS/commit/681fbdfcdd2e6d351e00400eccf41fe732b053ba))

# [4.3.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0-alpha.3...4.3.0-alpha.4) (2023-10-07)


### Bug Fixes

* Error in web context when `window.indexedDB` API is available but protected ([#2039](https://github.com/parse-community/Parse-SDK-JS/issues/2039)) ([360981f](https://github.com/parse-community/Parse-SDK-JS/commit/360981f8a529f3e10243413c8114373271bb6f43))

# [4.3.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0-alpha.2...4.3.0-alpha.3) (2023-10-04)


### Bug Fixes

* Connection failure in `Parse.Object.saveEventually` and `Parse.Object.destroyEventually` not handled on custom `Parse.Error.CONNECTION_FAILURE` message ([#2032](https://github.com/parse-community/Parse-SDK-JS/issues/2032)) ([4da3ebc](https://github.com/parse-community/Parse-SDK-JS/commit/4da3ebcc28b903a499c07bb194baae738de21d6f))

# [4.3.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/4.3.0-alpha.1...4.3.0-alpha.2) (2023-10-03)


### Bug Fixes

* Docs fail with `Cannot find module 'taffydb'` ([#2036](https://github.com/parse-community/Parse-SDK-JS/issues/2036)) ([dc91d0f](https://github.com/parse-community/Parse-SDK-JS/commit/dc91d0fc4f69639ba762f5af841477e8836c6927))

# [4.3.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0...4.3.0-alpha.1) (2023-09-26)


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

# [4.2.0-alpha.10](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.9...4.2.0-alpha.10) (2023-09-03)


### Features

* Add support for custom EventEmitter ([#1999](https://github.com/parse-community/Parse-SDK-JS/issues/1999)) ([ca568a6](https://github.com/parse-community/Parse-SDK-JS/commit/ca568a61771e15afe67c9001f2a728205059f2ae))

# [4.2.0-alpha.9](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.8...4.2.0-alpha.9) (2023-09-01)


### Features

* Allow overriding `Parse.Error` message with custom message via new Core Manager option `PARSE_ERRORS` ([#2014](https://github.com/parse-community/Parse-SDK-JS/issues/2014)) ([be0c8a6](https://github.com/parse-community/Parse-SDK-JS/commit/be0c8a6ff90a7714487ae793e2b68ae04d0c8d0c))

# [4.2.0-alpha.8](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.7...4.2.0-alpha.8) (2023-08-30)


### Features

* Add Cloud Code context accessibility to `ParseUser.logIn` ([#2010](https://github.com/parse-community/Parse-SDK-JS/issues/2010)) ([2446007](https://github.com/parse-community/Parse-SDK-JS/commit/2446007ede4cc5af79e34f27dc1fbcc574d5f717))

# [4.2.0-alpha.7](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.6...4.2.0-alpha.7) (2023-08-29)


### Bug Fixes

* `ParseUser.linkWith` doesn't remove anonymous auth data ([#2007](https://github.com/parse-community/Parse-SDK-JS/issues/2007)) ([7e2585c](https://github.com/parse-community/Parse-SDK-JS/commit/7e2585c5eb84a396900553d55d6a919de4d9a2c0))

# [4.2.0-alpha.6](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.5...4.2.0-alpha.6) (2023-08-27)


### Features

* Add Bytes type to `Parse.Schema` ([#2001](https://github.com/parse-community/Parse-SDK-JS/issues/2001)) ([343d0d7](https://github.com/parse-community/Parse-SDK-JS/commit/343d0d729a57acdd3c9ba5c1dbe5738b3916ea04))

# [4.2.0-alpha.5](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.4...4.2.0-alpha.5) (2023-08-27)


### Features

* Add support for excluding keys in `ParseQuery.findAll` ([#2000](https://github.com/parse-community/Parse-SDK-JS/issues/2000)) ([012ba4c](https://github.com/parse-community/Parse-SDK-JS/commit/012ba4cdab1e3f853625f507c713cef2264a40dd))

# [4.2.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.3...4.2.0-alpha.4) (2023-07-23)


### Features

* Login with username, password and additional authentication data via `ParseUser.logInWithAdditionalAuth` ([#1955](https://github.com/parse-community/Parse-SDK-JS/issues/1955)) ([2bad411](https://github.com/parse-community/Parse-SDK-JS/commit/2bad4119c23372d1b38c811c4b4bb3d06b1b62f0))

# [4.2.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.2...4.2.0-alpha.3) (2023-06-11)


### Features

* Add support to invoke a Cloud Function with a custom `installationId` via `Parse.Cloud.run` ([#1939](https://github.com/parse-community/Parse-SDK-JS/issues/1939)) ([eb70b93](https://github.com/parse-community/Parse-SDK-JS/commit/eb70b934b798cb37722c1ac36796596f5373f67d))

# [4.2.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/4.2.0-alpha.1...4.2.0-alpha.2) (2023-06-08)


### Bug Fixes

* Hard-coding of `react-native` path does not work for workspace builds ([#1930](https://github.com/parse-community/Parse-SDK-JS/issues/1930)) ([8222f3c](https://github.com/parse-community/Parse-SDK-JS/commit/8222f3cc2a4a4ee0cdcaf30dd0f9a17e46de7d88))

# [4.2.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0...4.2.0-alpha.1) (2023-05-01)


### Bug Fixes

* `Parse.File.cancel` starts new attempt to save file ([#1781](https://github.com/parse-community/Parse-SDK-JS/issues/1781)) ([b755e42](https://github.com/parse-community/Parse-SDK-JS/commit/b755e42394db8b94b87b0dbefc6cf6f18189c46d))

### Features

* Add `Parse.User.loginAs` ([#1875](https://github.com/parse-community/Parse-SDK-JS/issues/1875)) ([381fcfc](https://github.com/parse-community/Parse-SDK-JS/commit/381fcfc7f9cfda70af7c6dc3a35de59b82b72258))
* Add `ParseQuery.watch` to trigger LiveQuery only on update of specific fields ([#1839](https://github.com/parse-community/Parse-SDK-JS/issues/1839)) ([7479343](https://github.com/parse-community/Parse-SDK-JS/commit/7479343abd8739fe03558ff9b2ce610c34c568ae))

# [4.1.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0-alpha.3...4.1.0-alpha.4) (2023-04-28)


### Features

* Add `Parse.User.loginAs` ([#1875](https://github.com/parse-community/Parse-SDK-JS/issues/1875)) ([381fcfc](https://github.com/parse-community/Parse-SDK-JS/commit/381fcfc7f9cfda70af7c6dc3a35de59b82b72258))

# [4.1.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0-alpha.2...4.1.0-alpha.3) (2023-04-02)


### Features

* Add `ParseQuery.watch` to trigger LiveQuery only on update of specific fields ([#1839](https://github.com/parse-community/Parse-SDK-JS/issues/1839)) ([7479343](https://github.com/parse-community/Parse-SDK-JS/commit/7479343abd8739fe03558ff9b2ce610c34c568ae))

# [4.1.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/4.1.0-alpha.1...4.1.0-alpha.2) (2023-03-01)


### Bug Fixes

* `Parse.File.cancel` starts new attempt to save file ([#1781](https://github.com/parse-community/Parse-SDK-JS/issues/1781)) ([b755e42](https://github.com/parse-community/Parse-SDK-JS/commit/b755e42394db8b94b87b0dbefc6cf6f18189c46d))

# [4.1.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.1...4.1.0-alpha.1) (2023-03-01)


### Bug Fixes

* `LiveQuerySubscription.unsubscribe` resolves promise before unsubscribing completes ([#1727](https://github.com/parse-community/Parse-SDK-JS/issues/1727)) ([1c96205](https://github.com/parse-community/Parse-SDK-JS/commit/1c96205cb3c162b21bf4508f7783400a28a99868))
* Node engine version upper range is <19 despite Node 19 support ([#1732](https://github.com/parse-community/Parse-SDK-JS/issues/1732)) ([febe187](https://github.com/parse-community/Parse-SDK-JS/commit/febe187a24fb56e83542c00ae39148575fc57c4b))
* Saving a new `Parse.Object` with an unsaved `Parse.File` fails ([#1662](https://github.com/parse-community/Parse-SDK-JS/issues/1662)) ([16535a4](https://github.com/parse-community/Parse-SDK-JS/commit/16535a43f6c762983460aa837102a4c692de70bb))

### Features

* `LiveQueryClient.close` returns promise when WebSocket closes ([#1735](https://github.com/parse-community/Parse-SDK-JS/issues/1735)) ([979d660](https://github.com/parse-community/Parse-SDK-JS/commit/979d6607d5449dd3d3c5e51f36119bd05b25feaa))
* Upgrade Node Package Manager lock file `package-lock.json` to version 2 ([#1729](https://github.com/parse-community/Parse-SDK-JS/issues/1729)) ([e993786](https://github.com/parse-community/Parse-SDK-JS/commit/e993786cf0299b1150bf36afee1bc516e23e349a))

# [4.0.0-alpha.12](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.11...4.0.0-alpha.12) (2023-02-06)


### Features

* `LiveQueryClient.close` returns promise when WebSocket closes ([#1735](https://github.com/parse-community/Parse-SDK-JS/issues/1735)) ([979d660](https://github.com/parse-community/Parse-SDK-JS/commit/979d6607d5449dd3d3c5e51f36119bd05b25feaa))

# [4.0.0-alpha.11](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.10...4.0.0-alpha.11) (2023-02-04)


### Bug Fixes

* Node engine version upper range is <19 despite Node 19 support ([#1732](https://github.com/parse-community/Parse-SDK-JS/issues/1732)) ([febe187](https://github.com/parse-community/Parse-SDK-JS/commit/febe187a24fb56e83542c00ae39148575fc57c4b))

# [4.0.0-alpha.10](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.9...4.0.0-alpha.10) (2023-02-04)


### Features

* Upgrade Node Package Manager lock file `package-lock.json` to version 2 ([#1729](https://github.com/parse-community/Parse-SDK-JS/issues/1729)) ([e993786](https://github.com/parse-community/Parse-SDK-JS/commit/e993786cf0299b1150bf36afee1bc516e23e349a))

# [4.0.0-alpha.9](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.8...4.0.0-alpha.9) (2023-02-04)


### Bug Fixes

* Saving a new `Parse.Object` with an unsaved `Parse.File` fails ([#1662](https://github.com/parse-community/Parse-SDK-JS/issues/1662)) ([16535a4](https://github.com/parse-community/Parse-SDK-JS/commit/16535a43f6c762983460aa837102a4c692de70bb))

# [4.0.0-alpha.8](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.7...4.0.0-alpha.8) (2023-02-04)


### Bug Fixes

* `LiveQuerySubscription.unsubscribe` resolves promise before unsubscribing completes ([#1727](https://github.com/parse-community/Parse-SDK-JS/issues/1727)) ([1c96205](https://github.com/parse-community/Parse-SDK-JS/commit/1c96205cb3c162b21bf4508f7783400a28a99868))

# [4.0.0-alpha.7](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.6...4.0.0-alpha.7) (2023-01-30)


### Bug Fixes

* Request execution time keeps increasing over time when using `Parse.Object.extend` ([#1682](https://github.com/parse-community/Parse-SDK-JS/issues/1682)) ([f555c43](https://github.com/parse-community/Parse-SDK-JS/commit/f555c43841c95c2ae759342ea28cd69f7fd232a4))

# [4.0.0-alpha.6](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.5...4.0.0-alpha.6) (2023-01-27)


### Bug Fixes

* Local datastore query with `containedIn` not working when field is an array ([#1666](https://github.com/parse-community/Parse-SDK-JS/issues/1666)) ([2391bff](https://github.com/parse-community/Parse-SDK-JS/commit/2391bff36bd8b3f5357f069916375b979cde15b2))

# [4.0.0-alpha.5](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.4...4.0.0-alpha.5) (2023-01-06)


### Features

* Add node 19 support ([8ed0fab](https://github.com/parse-community/Parse-SDK-JS/commit/8ed0faba400642571ff90b9645a6e4fcef16c475))
* Add Node 19 support ([#1643](https://github.com/parse-community/Parse-SDK-JS/issues/1643)) ([dfb5196](https://github.com/parse-community/Parse-SDK-JS/commit/dfb5196ea135e2e7bfbfa9df443162a144ec9ee4))

# [4.0.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.3...4.0.0-alpha.4) (2022-12-21)


### Features

* Add Node 16 and 18 support ([#1598](https://github.com/parse-community/Parse-SDK-JS/issues/1598)) ([2c79a31](https://github.com/parse-community/Parse-SDK-JS/commit/2c79a31201d569b645eea475290c9ed0266227fc))

# [4.0.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.2...4.0.0-alpha.3) (2022-11-18)


### Performance Improvements

* Avoid CORS preflight request by removing upload listener when not used ([#1610](https://github.com/parse-community/Parse-SDK-JS/issues/1610)) ([6125419](https://github.com/parse-community/Parse-SDK-JS/commit/6125419e749866ffa814a4a3e696382206d5da09))

# [4.0.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/4.0.0-alpha.1...4.0.0-alpha.2) (2022-11-15)


### Bug Fixes

* `Parse.Query.subscribe()` does not return a rejected promise on error in Cloud Code Triggers `beforeConnect` or `beforeSubscribe` ([#1490](https://github.com/parse-community/Parse-SDK-JS/issues/1490)) ([96d7174](https://github.com/parse-community/Parse-SDK-JS/commit/96d71744e4a12088f98ad33a5f7a0c06c90a0a4c))


### BREAKING CHANGES

* Calling `Parse.Query.subscribe()` will now return a rejected promise if an error is thrown in Cloud Code Triggers `beforeConnect` or `beforeSubscribe`; in previous releases a resolved promise was returned, even if subscribing failed and it was necessary to create an `error.on` listener to handle these errors (#1490) ([96d7174](96d7174))

# [4.0.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.1-alpha.2...4.0.0-alpha.1) (2022-11-10)


### Bug Fixes

* Remove support for Node <14 ([#1603](https://github.com/parse-community/Parse-SDK-JS/issues/1603)) ([bc04b4b](https://github.com/parse-community/Parse-SDK-JS/commit/bc04b4bc0c27d2f517b388dd2dfc17d463faf207))


### BREAKING CHANGES

* This release removes support for Node versions <14 ([bc04b4b](bc04b4b))

## [3.5.1-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.1-alpha.1...3.5.1-alpha.2) (2022-11-07)


### Bug Fixes

* SDK builds incorrectly since release 3.5.0 causing various bugs ([#1600](https://github.com/parse-community/Parse-SDK-JS/issues/1600)) ([f15154f](https://github.com/parse-community/Parse-SDK-JS/commit/f15154f903478f997bf127be198097a58c602594))

## [3.5.1-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0...3.5.1-alpha.1) (2022-11-03)


### Bug Fixes

* File upload fails when uploading base64 data ([#1578](https://github.com/parse-community/Parse-SDK-JS/issues/1578)) ([03ee3ff](https://github.com/parse-community/Parse-SDK-JS/commit/03ee3ffd3e4798f9dd958ddc24b9f774cb875507))
* React Native build does not maintain arrow functions and causes error with AsyncStorage ([#1587](https://github.com/parse-community/Parse-SDK-JS/issues/1587)) ([8aeaa4f](https://github.com/parse-community/Parse-SDK-JS/commit/8aeaa4f51e01f5763c497b5e86dca73835e2144b))

# [3.5.0-alpha.8](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.7...3.5.0-alpha.8) (2022-11-03)


### Bug Fixes

* File upload fails when uploading base64 data ([#1578](https://github.com/parse-community/Parse-SDK-JS/issues/1578)) ([03ee3ff](https://github.com/parse-community/Parse-SDK-JS/commit/03ee3ffd3e4798f9dd958ddc24b9f774cb875507))

# [3.5.0-alpha.7](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.6...3.5.0-alpha.7) (2022-11-01)


### Bug Fixes

* React Native build does not maintain arrow functions and causes error with AsyncStorage ([#1587](https://github.com/parse-community/Parse-SDK-JS/issues/1587)) ([8aeaa4f](https://github.com/parse-community/Parse-SDK-JS/commit/8aeaa4f51e01f5763c497b5e86dca73835e2144b))

# [3.5.0-alpha.6](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.5...3.5.0-alpha.6) (2022-10-13)


### Bug Fixes

* initialization fails in non-browser environment that doesn't support `indexedDB` ([#1569](https://github.com/parse-community/Parse-SDK-JS/issues/1569)) ([3560a5e](https://github.com/parse-community/Parse-SDK-JS/commit/3560a5e422f8e97aa55c1c238d333248bac7f7d6))

# [3.5.0-alpha.5](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.4...3.5.0-alpha.5) (2022-10-11)


### Features

* localDatastore support for unsorted distance queries ([#1570](https://github.com/parse-community/Parse-SDK-JS/issues/1570)) ([ea3e75f](https://github.com/parse-community/Parse-SDK-JS/commit/ea3e75f1bdeb6e8c3b3e46c909f827daef1978f0))

# [3.5.0-alpha.4](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.3...3.5.0-alpha.4) (2022-09-21)


### Features

* generate `Parse.Object.objectId` automatically when `allowCustomObjectId` is enabled and no `objectId` is passed ([#1540](https://github.com/parse-community/Parse-SDK-JS/issues/1540)) ([68f3ff5](https://github.com/parse-community/Parse-SDK-JS/commit/68f3ff5b9a471648dcd07d35c706004eaaa173ec))

# [3.5.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.2...3.5.0-alpha.3) (2022-09-14)


### Bug Fixes

* `Schema.addField` does not correctly add value of type `Date` ([#1544](https://github.com/parse-community/Parse-SDK-JS/issues/1544)) ([15111f7](https://github.com/parse-community/Parse-SDK-JS/commit/15111f74a658eefc71a50b6bfb3d25c7997d26a2))

# [3.5.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.5.0-alpha.1...3.5.0-alpha.2) (2022-09-12)


### Bug Fixes

* remove base64 validation due to validation inefficiency ([#1543](https://github.com/parse-community/Parse-SDK-JS/issues/1543)) ([473949d](https://github.com/parse-community/Parse-SDK-JS/commit/473949d514a395cf3656b03e083e30fff6e2f22c))

# [3.5.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.4-alpha.2...3.5.0-alpha.1) (2022-09-08)


### Features

* add `json` option to `Parse.Query.each()` ([#1539](https://github.com/parse-community/Parse-SDK-JS/issues/1539)) ([89fd5ec](https://github.com/parse-community/Parse-SDK-JS/commit/89fd5ec6a8e210de3946434c6c88d6de87b6635c))
* add json option to query.each ([299fb0d](https://github.com/parse-community/Parse-SDK-JS/commit/299fb0d49cbbd3c95c2e8a61744bd03e93c33d36))

## [3.4.4-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.4-alpha.1...3.4.4-alpha.2) (2022-08-16)


### Bug Fixes

* `Parse.User.signUp()` does not pass context to Cloud Code  ([#1527](https://github.com/parse-community/Parse-SDK-JS/issues/1527)) ([53edcfd](https://github.com/parse-community/Parse-SDK-JS/commit/53edcfd7ad1bd075a6097ba3c129c5f0998ffbfa))

## [3.4.4-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.3...3.4.4-alpha.1) (2022-07-28)


### Bug Fixes

* creating a Parse.File with base64 string fails for some encodings ([#1517](https://github.com/parse-community/Parse-SDK-JS/issues/1517)) ([0439862](https://github.com/parse-community/Parse-SDK-JS/commit/0439862cd83dc37f8f3571b68fdaccb6b11b540d))
* subscription to a LiveQuery containing `ParseQuery.select` overrides properties ([#1488](https://github.com/parse-community/Parse-SDK-JS/issues/1488)) ([b80eee4](https://github.com/parse-community/Parse-SDK-JS/commit/b80eee4b010b60d37b34b566880ed19f05d4c801))

## [3.4.3-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.3-alpha.2...3.4.3-alpha.3) (2022-07-02)


### Bug Fixes

* subscription to a LiveQuery containing `ParseQuery.select` overrides properties ([#1488](https://github.com/parse-community/Parse-SDK-JS/issues/1488)) ([b80eee4](https://github.com/parse-community/Parse-SDK-JS/commit/b80eee4b010b60d37b34b566880ed19f05d4c801))

## [3.4.3-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.3-alpha.1...3.4.3-alpha.2) (2022-05-29)


### Bug Fixes

* invalid name for `Parse.Role` throws incorrect error ([#1481](https://github.com/parse-community/Parse-SDK-JS/issues/1481)) ([8326a6f](https://github.com/parse-community/Parse-SDK-JS/commit/8326a6f1d7cda0ca8c6f1a3a7ea82448881e118e))

## [3.4.3-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.2...3.4.3-alpha.1) (2022-05-02)


### Bug Fixes

* creating a Parse.File with base64 string fails for some file types ([#1467](https://github.com/parse-community/Parse-SDK-JS/issues/1467)) ([c07d6c9](https://github.com/parse-community/Parse-SDK-JS/commit/c07d6c99968163a72b6ab46e7970b7a5ca4ed540))

## [3.4.2-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.1...3.4.2-alpha.1) (2022-04-09)


### Bug Fixes

* security upgrade moment from 2.29.1 to 2.29.2 ([#1472](https://github.com/parse-community/Parse-SDK-JS/issues/1472)) ([893c2a5](https://github.com/parse-community/Parse-SDK-JS/commit/893c2a5b0504740d5001e5674b8eefbaab081764))

# [3.4.0-alpha.3](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.0-alpha.2...3.4.0-alpha.3) (2021-12-05)


### Bug Fixes

* upgrade idb-keyval from 5.0.6 to 6.0.3 ([#1397](https://github.com/parse-community/Parse-SDK-JS/issues/1397)) ([922a6db](https://github.com/parse-community/Parse-SDK-JS/commit/922a6dbb8e8208d18d0759543962cbb4c1ae6d96))

# [3.4.0-alpha.2](https://github.com/parse-community/Parse-SDK-JS/compare/3.4.0-alpha.1...3.4.0-alpha.2) (2021-10-29)


### Bug Fixes

* upgrade @babel/runtime from 7.14.8 to 7.15.3 ([#1404](https://github.com/parse-community/Parse-SDK-JS/issues/1404)) ([8cb321c](https://github.com/parse-community/Parse-SDK-JS/commit/8cb321cbe81d51d4bbf94c2ac2638c14a0826bf4))

# [3.4.0-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.3.2-alpha.1...3.4.0-alpha.1) (2021-10-27)


### Features

* add options to enable polling and set the polling interval; fixes excessive polling ([#1419](https://github.com/parse-community/Parse-SDK-JS/issues/1419)) ([0f804b8](https://github.com/parse-community/Parse-SDK-JS/commit/0f804b8760bba619080a79da5c6d3641f112b211))

## [3.3.2-alpha.1](https://github.com/parse-community/Parse-SDK-JS/compare/3.3.1...3.3.2-alpha.1) (2021-10-26)


### Bug Fixes

* update parse server dependency branch; recreate package lock ([#1424](https://github.com/parse-community/Parse-SDK-JS/issues/1424)) ([38455ef](https://github.com/parse-community/Parse-SDK-JS/commit/38455ef6770d108dbf2f34604dade6dc0d63a201))
