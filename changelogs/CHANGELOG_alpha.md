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
