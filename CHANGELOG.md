# Parse-SDK-JS

## 2.1.0

- Parse.Error now inherits from Error

## 2.0.2

- Fixes issue affecting unsubscribing from liveQueries (#640)
- Adds support for aggregate stages with identical names (#637)
- Adds ability to fetch an object with includes (#631)
- Adds support for $nor operator in queries (#634)
- Adds support for containedBy operator in queries (#633)
- Adds support for includeAll (#632)

## 2.0.1

- Ensure we only read the job status id header if present.

## 2.0.0

- Parse.Promise has been replaced by native Promises
- Backbone style callbacks are removed
