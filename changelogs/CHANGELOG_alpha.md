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
