# Contributing to the Parse JavaScript SDK <!-- omit in toc -->

- [Preparation for Contributing](#preparation-for-contributing)
  - [Recommended Tools](#recommended-tools)
  - [Set-up Your Local Machine](#set-up-your-local-machine)
  - [Building the SDK](#building-the-sdk)
  - [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [Integration Tests](#integration-tests)
    - [TypeScript Tests](#typescript-tests)
  - [Pull Requests](#pull-requests)
- [Issues](#issues)
  - [Known Issues](#known-issues)
  - [Report New Issue](#report-new-issue)
  - [Security Bugs](#security-bugs)
- [Coding Style](#coding-style)
- [Code of Conduct](#code-of-conduct)

We want to make contributing to this project as easy and transparent as possible. If you're looking to get started, but want to ease yourself into the codebase, look for [open issues](https://github.com/parse-community/Parse-SDK-JS/issues).

## Preparation for Contributing

### Recommended Tools

- [Visual Studio Code](https://code.visualstudio.com), a popular IDE.
- [Jest Extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) the Jest extension for VSC to run the tests inline and debug quicky.
- [Jasmine Test Explorer Extension](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer), a very practical test exploration plugin which let you run, debug and see the test results inline.
- [mongodb-runner](https://github.com/mongodb-js/runner) Easily install and run MongoDB to test your code against it. Install with `npm install -g mongodb-runner`.

### Set-up Your Local Machine

- [Fork](https://github.com/parse-community/Parse-SDK-JS) this repository and clone it on your local machine:

```sh
$ git clone https://github.com/parse-community/Parse-SDK-JS
$ cd Parse-SDK-JS
$ npm install
$ code .
```

### Building the SDK

The Parse JS SDK is built for three platforms:

- Browser
- NodeJS
- React Native

When developing the SDK run `npm run watch` in order to rebuild your changes automatically upon each save. By default, the watch command will rebuild the SDK only for the browser platform. The following commands will rebuild changes for a specific platform:

- `npm run watch:node`
- `npm run watch:browser`
- `npm run watch:react-native`

### Testing

The SDK is tested through two lenses. unit tests are run with jest and integration tests with jasmine. Two different frameworks are used as the integration tests leverage a stateful server, with the data saved into the database, and Jest is running many tests in parallel, which makes it incompatible with our integration tests.

#### Unit Tests

Those tests are located in [/src/\_\_tests\_\_](/src/__tests__) and are responsible for ensuring each class is behaving as expected, without considering the rest of the system. For example, adding a new query helper function would probably require to add relevant tests that ensure the query is properly serialized to a valid Parse REST query object. Unit tests heavily leverage mocking and are an essential part of our testing harness.

To run unit tests, run `npm test`. If you have the vscode Jest plugin extension (as recommended), you can run your tests by clicking the *Debug* lens that appears near by the test.

#### Integration Tests

Those tests are located in [/integration/test](/integration/test) and are responsible for ensuring a proper communication with parse-server. With the integration tests, we ensure all communications between the SDK and the server are behaving accordingly.

To run the integration tests, you will need a valid mongodb running on your local machine. You can get easily mongodb running with `mongodb-runner` (see [Recommended setup](#recommended-setup)). 

Use `npm run integration` in order to run the integration tests. If you have the vscode Jasmine extension installed (as recommended), you can run your tests by clicking the *Run* or the *Debug* lens that appears near by the test.

#### TypeScript Tests

Type tests are located in [/types/tests.ts](/types/tests.ts) and are responsible for ensure types generated for each class is behaving as expected. Types must be generated using `npm run build:types` and should not be manually changed. These types are `.d.ts` files located in [/types](/types).

When developing type definitions you can use `npm run watch:ts` in order to rebuild your changes automatically upon each save.

Use `npm run test:types` in order to run types tests against generated `.d.ts` files.

### Pull Requests

We appreciate your contribution and welcome your pull requests. When submitting a pull request, the CI will run some automated tests on it. From here, we'll need to get a core member to sign off on the changes and then merge the pull request. We'll do our best to provide updates and feedback throughout the process.

1. Fork the repo and create your branch from `alpha`.
2. Add unit tests for any new code you add.
3. If you've changed public APIs, update the documentation.
4. Ensure the test suite passes by running `npm test && npm run integration`.
5. Make sure your code lints by running `npm run lint`.

## Issues

### Known Issues

We use GitHub issues to track public bugs. We will keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new issue, try to make sure your problem doesn't already exist.

### Report New Issue

If you're unsure whether your bug is with the Pare JS SDK or Parse Server, you can test to see if it reproduces with the Parse Server [REST API](https://docs.parseplatform.org/rest/guide).

### Security Bugs

Parse Community has a [responsible Vulnerability Disclosure Program](https://github.com/parse-community/parse-server/blob/master/SECURITY.md) for the safe disclosure of security bugs. In those cases, please go through the process outlined on that page and do not file a public issue.

## Coding Style

- Most importantly, match the existing code style as much as possible.
- We use ES6 for this codebase. Use modern syntax whenever possible.
- Keep lines within 80 characters.
- Always end lines with semicolons.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://github.com/parse-community/parse-server/blob/master/CODE_OF_CONDUCT.md). By participating, you are expected to honor this code.
