# Parse-SDK-JS

## 2.2.1

- Addresses issue with babel runtime regenerator ([#740](https://github.com/parse-community/Parse-SDK-JS/pull/740))

## 2.2.0

- Support for Local Datastore ([#612](https://github.com/parse-community/parse-server/pull/612))
- LiveQuery override data on update ([#718](https://github.com/parse-community/parse-server/pull/718)) (Requires Parse-Server 3.1.3+)
- Support setting user from JSON (hydrate) ([#730](https://github.com/parse-community/parse-server/pull/730))
- Improve dot notation for updating nested objects ([#729](https://github.com/parse-community/parse-server/pull/729))
- LiveQuery handle unset operation ([#714](https://github.com/parse-community/parse-server/pull/714)) (Requires Parse-Server 3.1.3+)
- Add original object to LiveQuery events ([#712](https://github.com/parse-community/parse-server/pull/712)) (Requires Parse-Server 3.1.3+)
- Add support for providing file upload progress. ([#373](https://github.com/parse-community/parse-server/pull/373)) (Browser Only)
- Support clone with relation ([#382](https://github.com/parse-community/parse-server/pull/382))
- Add batchSize to saveAll / destroyAll ([#701](https://github.com/parse-community/parse-server/pull/701))
- Add save Method for Parse.Config ([#684](https://github.com/parse-community/parse-server/pull/684))
- Allow specific keys to be reverted in unsaved objects ([#565](https://github.com/parse-community/parse-server/pull/565))
- Handle undefined in Cloud Code ([#682](https://github.com/parse-community/parse-server/pull/682))
- Validate if geopoint values is number ([#671](https://github.com/parse-community/parse-server/pull/671))
- LiveQuery Support for Subclasses ([#662](https://github.com/parse-community/parse-server/pull/662))

## 2.1.0

- Parse.Error now inherits from Error ([#658](https://github.com/parse-community/parse-server/pull/658))

## 2.0.2

- Fixes issue affecting unsubscribing from liveQueries ([#640](https://github.com/parse-community/parse-server/pull/640))
- Adds support for aggregate stages with identical names ([#637](https://github.com/parse-community/parse-server/pull/637))
- Adds ability to fetch an object with includes ([#631](https://github.com/parse-community/parse-server/pull/631))
- Adds support for $nor operator in queries ([#634](https://github.com/parse-community/parse-server/pull/634))
- Adds support for containedBy operator in queries ([#633](https://github.com/parse-community/parse-server/pull/633))
- Adds support for includeAll ([#632](https://github.com/parse-community/parse-server/pull/632))

## 2.0.1

- Ensure we only read the job status id header if present. ([#623](https://github.com/parse-community/parse-server/pull/623))

## 2.0.0

- Parse.Promise has been replaced by native Promises ([#620](https://github.com/parse-community/parse-server/pull/620))
- Backbone style callbacks are removed ([#620](https://github.com/parse-community/parse-server/pull/620))
