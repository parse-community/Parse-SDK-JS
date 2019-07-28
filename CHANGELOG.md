# Parse-SDK-JS

### master
[Full Changelog](https://github.com/parse-community/Parse-SDK-JS/compare/2.6.0...master)

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
