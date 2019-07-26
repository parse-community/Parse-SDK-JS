# Parse SDK for JavaScript

[![Build Status][build-status-svg]][build-status-link]
[![Test Coverage][coverage-status-svg]][coverage-status-link]
[![Npm Version][npm-svg]][npm-link]
[![CDNJS version][cdn-svg]][cdn-link]
[![Join The Conversation][discourse-svg]][discourse-link]
[![Greenkeeper badge][greenkeeper-svg]][greenkeeper-link]
[![License][license-svg]][license-link]
[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)][open-collective-link]
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)][open-collective-link]
[![Twitter Follow](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow%20us%20on%20Twitter&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)

A library that gives you access to the powerful Parse cloud platform from your JavaScript app. For more information on Parse and its features, see [the website](http://parseplatform.org), [the JavaScript guide](http://docs.parseplatform.org/js/guide/) or [API Reference](http://parseplatform.org/Parse-SDK-JS/api/).

## Getting Started

The easiest way to integrate the Parse SDK into your JavaScript project is through the [npm module](https://npmjs.org/parse).
However, if you want to use a pre-compiled file, you can fetch it from [unpkg](https://unpkg.com). The development version is available at [https://unpkg.com/parse/dist/parse.js](https://unpkg.com/parse/dist/parse.js), and the minified production version is at [https://unpkg.com/parse/dist/parse.min.js](https://unpkg.com/parse/dist/parse.min.js).

### Using Parse on Different Platforms

The JavaScript ecosystem is wide and incorporates a large number of platforms and execution environments. To handle this, the Parse npm module contains special versions of the SDK tailored to use in Node.js and [React Native](https://facebook.github.io/react-native/) environments. Not all features make sense in all environments, so using the appropriate package will ensure that items like local storage, user sessions, and HTTP requests use appropriate dependencies. For server side rendered applications, you may set the `SERVER_RENDERING` variable to prevent warnings at runtime.

To use the npm modules for a browser based application, include it as you normally would:

```js
const Parse = require('parse');
```

For server-side applications or Node.js command line tools, include `'parse/node'`:

```js
// In a node.js environment
const Parse = require('parse/node');
```

For React Native applications, include `'parse/react-native'`:
```js
// In a React Native application
const Parse = require('parse/react-native');

// On React Native >= 0.50 and Parse >= 1.11.0, set the Async
const AsyncStorage = require('react-native').AsyncStorage;
Parse.setAsyncStorage(AsyncStorage);
```

For WeChat miniprogram, include `'parse/weapp'`:
```js
// In a WeChat miniprogram
const Parse = require('parse/weapp');
```
If you want to use a pre-compiled file, you can fetch it from [unpkg](https://unpkg.com). The development version is available at [https://unpkg.com/parse/dist/parse.weapp.js](https://unpkg.com/parse/dist/parse.weapp.js), and the minified production version is at [https://unpkg.com/parse/dist/parse.weapp.min.js](https://unpkg.com/parse/dist/parse.weapp.min.js).

For TypeScript applications, install `'@types/parse'`:
```
$ npm install @types/parse
```

Types are updated manually after every release. If a definition doesn't exist, please submit a pull request to [@types/parse][types-parse]

## Upgrading to Parse SDK 2.0.0

With Parse SDK 2.0.0, gone are the backbone style callbacks and Parse.Promises.

We have curated a [migration guide](2.0.0.md) that should help you migrate your code.

## Want to ride the bleeding edge?

We recommend using the most recent tagged build published to npm for production. However, you can test not-yet-released versions of the Parse-SDK-JS by referencing specific branches in your `package.json`. For example, to use the master branch:

```
npm install parse-community/Parse-SDK-JS.git#master
```

### Experimenting

You can also use your own forks, and work in progress branches by specifying them:

```
npm install github:myUsername/Parse-SDK-JS#my-awesome-feature
```

And don't forget, if you plan to deploy it remotely, you should run `npm install` with the `--save` option.

## Contributing

We really want Parse to be yours, to see it grow and thrive in the open source community. Please see the [Contributing to Parse Javascript SDK guide](CONTRIBUTING.md).

## License

```
Copyright (c) 2015-present, Parse, LLC.
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree. An additional grant
of patent rights can be found in the PATENTS file in the same directory.
```

-----
As of April 5, 2017, Parse, LLC has transferred this code to the parse-community organization, and will no longer be contributing to or distributing this code.

 [build-status-svg]: https://travis-ci.org/parse-community/Parse-SDK-JS.svg?branch=master
 [build-status-link]: https://travis-ci.org/parse-community/Parse-SDK-JS
 [coverage-status-svg]: http://codecov.io/github/parse-community/Parse-SDK-JS/coverage.svg?branch=master
 [coverage-status-link]: http://codecov.io/github/parse-community/Parse-SDK-JS?branch=master
 [npm-svg]: https://badge.fury.io/js/parse.svg
 [npm-link]: https://npmjs.org/parse
 [cdn-svg]: https://img.shields.io/cdnjs/v/parse.svg
 [cdn-link]: https://cdnjs.com/libraries/parse
 [discourse-svg]: https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg
 [discourse-link]: https://community.parseplatform.org/c/sdk/js
 [license-svg]: https://img.shields.io/badge/license-BSD-lightgrey.svg
 [license-link]: https://github.com/parse-community/Parse-SDK-JS/blob/master/LICENSE
 [greenkeeper-svg]: https://badges.greenkeeper.io/parse-community/Parse-SDK-JS.svg
 [greenkeeper-link]: https://greenkeeper.io/
 [types-parse]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/parse
 [open-collective-link]: https://opencollective.com/parse-server
