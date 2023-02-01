![parse-repository-header-sdk-js](https://user-images.githubusercontent.com/5673677/138293960-641c96bf-1293-4061-99a5-a4ed09868e1c.png)

---

[![Build Status CI alpha](https://github.com/parse-community/Parse-SDK-JS/workflows/ci/badge.svg?branch=alpha&subject=alpha)](https://github.com/parse-community/Parse-SDK-JS/actions?query=workflow%3Aci+branch%3Aalpha)
[![Build Status CI beta](https://github.com/parse-community/Parse-SDK-JS/workflows/ci/badge.svg?branch=beta)](https://github.com/parse-community/Parse-SDK-JS/actions?query=workflow%3Aci+branch%3Abeta)
[![Build Status CI release](https://github.com/parse-community/Parse-SDK-JS/workflows/ci/badge.svg?branch=release)](https://github.com/parse-community/Parse-SDK-JS/actions?query=workflow%3Aci+branch%3Arelease)
[![Snyk Badge](https://snyk.io/test/github/parse-community/Parse-SDK-JS/badge.svg)](https://snyk.io/test/github/parse-community/Parse-SDK-JS)
[![Coverage](http://codecov.io/github/parse-community/Parse-SDK-JS/coverage.svg?branch=alpha)](http://codecov.io/github/parse-community/Parse-SDK-JS?branch=alpha)

[![Node Version](https://img.shields.io/badge/nodejs-14,_16,_18-green.svg?logo=node.js&style=flat)](https://nodejs.org/)
[![auto-release](https://img.shields.io/badge/%F0%9F%9A%80-auto--release-9e34eb.svg)](https://github.com/parse-community/parse-dashboard/releases)

[![npm latest version](https://img.shields.io/npm/v/parse/latest.svg)](https://www.npmjs.com/package/parse)
[![npm beta version](https://img.shields.io/npm/v/parse/beta.svg)](https://www.npmjs.com/package/parse)
[![npm alpha version](https://img.shields.io/npm/v/parse/alpha.svg)](https://www.npmjs.com/package/parse)

[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)][open-collective-link]
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)][open-collective-link]
[![Forum](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/client-sdks/javascript-sdk)
[![Twitter](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)

---

A library that gives you access to the powerful Parse Server backend from your JavaScript app. For more information on Parse and its features, see [the website](https://parseplatform.org), [the JavaScript guide](https://docs.parseplatform.org/js/guide/), [the Cloud Code guide](https://docs.parseplatform.org/cloudcode/guide/) or [API Reference](https://parseplatform.org/Parse-SDK-JS/api/).

---

- [Getting Started](#getting-started)
  - [Using Parse on Different Platforms](#using-parse-on-different-platforms)
- [Compatibility](#compatibility)
  - [Node.js](#nodejs)
- [Upgrading to Parse SDK 2.0.0](#upgrading-to-parse-sdk-200)
- [3rd Party Authentications](#3rd-party-authentications)
  - [Experimenting](#experimenting)
- [Contributing](#contributing)

## Getting Started

The easiest way to integrate the Parse SDK into your JavaScript project is through the [npm module](https://npmjs.org/parse).
However, if you want to use a pre-compiled file, you can fetch it from [unpkg](https://unpkg.com). The development version is available at [https://unpkg.com/parse/dist/parse.js](https://unpkg.com/parse/dist/parse.js), and the minified production version is at [https://unpkg.com/parse/dist/parse.min.js](https://unpkg.com/parse/dist/parse.min.js).

### Using Parse on Different Platforms

The JavaScript ecosystem is wide and incorporates a large number of platforms and execution environments. To handle this, the Parse npm module contains special versions of the SDK tailored to use in Node.js and [React Native](https://facebook.github.io/react-native/) environments. Not all features make sense in all environments, so using the appropriate package will ensure that items like local storage, user sessions, and HTTP requests use appropriate dependencies. For server side rendered applications, you may set the `SERVER_RENDERING` variable to prevent warnings at runtime.

To use the npm modules for a browser based application, include it as you normally would:

```js
const Parse = require('parse');
// ES6 Minimized
import Parse from 'parse/dist/parse.min.js';
```

For web worker or browser applications, indexedDB storage is available:

```js
Parse.CoreManager.setStorageController(Parse.IndexedDB);
```

For server-side applications or Node.js command line tools, include `'parse/node'`:

```js
// In a node.js environment
const Parse = require('parse/node');
```

For React Native applications, include `'parse/react-native.js'`:
```js
// In a React Native application
const Parse = require('parse/react-native.js');

// On React Native >= 0.50 and Parse >= 1.11.0, set the Async
const AsyncStorage = require('@react-native-async-storage/async-storage');
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

## Compatibility

### Node.js

Parse JS SDK is continuously tested with the most recent releases of Node.js to ensure compatibility. We follow the [Node.js Long Term Support plan](https://github.com/nodejs/Release) and only test against versions that are officially supported and have not reached their end-of-life date.

| Version    | Latest Version | End-of-Life | Compatible |
|------------|----------------|-------------|------------|
| Node.js 14 | 14.19.1        | April 2023  | ✅ Yes      |
| Node.js 16 | 16.19.0        | September 2023  | ✅ Yes      |
| Node.js 18 | 18.12.1        | April 2025  | ✅ Yes      |
| Node.js 19 | 19.3.0        | June 2023  | ✅ Yes      |


## Upgrading to Parse SDK 2.0.0

With Parse SDK 2.0.0, gone are the backbone style callbacks and Parse.Promises.

We have curated a [migration guide][migration] that should help you migrate your code.

## 3rd Party Authentications

Parse Server supports many [3rd Party Authenications][3rd-party-auth]. It is possible to [linkWith][link-with] any 3rd Party Authentication by creating a [custom authentication module][custom-auth-module].

### Experimenting

You can also use your own forks, and work in progress branches by specifying them:

```
npm install github:myUsername/Parse-SDK-JS#my-awesome-feature
```

And don't forget, if you plan to deploy it remotely, you should run `npm install` with the `--save` option.

## Contributing

We really want Parse to be yours, to see it grow and thrive in the open source community. Please see the [Contributing to Parse Javascript SDK guide][contributing].


[3rd-party-auth]: http://docs.parseplatform.org/parse-server/guide/#oauth-and-3rd-party-authentication
[contributing]: https://github.com/parse-community/Parse-SDK-JS/blob/master/CONTRIBUTING.md
[custom-auth-module]: https://docs.parseplatform.org/js/guide/#custom-authentication-module
[link-with]: https://docs.parseplatform.org/js/guide/#linking-users
[migration]: https://github.com/parse-community/Parse-SDK-JS/blob/master/2.0.0.md
[open-collective-link]: https://opencollective.com/parse-server
[types-parse]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/parse
