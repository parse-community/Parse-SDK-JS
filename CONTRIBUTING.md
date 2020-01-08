# Contributing to the Parse JavaScript SDK
We want to make contributing to this project as easy and transparent as possible.

If you're looking to get started, but want to ease yourself into the codebase, look for issues tagged [good first task](https://github.com/parse-community/Parse-SDK-JS/labels/good%20first%20task). These are simple yet valuable tasks that should be easy to get started.

## `master` is unsafe
Our goal is to keep `master` stable, but there may be changes that your application may not be compatible with. We'll do our best to publicize any breaking changes, but try to use our specific releases in any production environment.

## Setting up the project for debugging and contributing:

### Recommended setup:

* [vscode](https://code.visualstudio.com), the popular IDE.
* [Jest Extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) the Jest extension for vscode to run the tests inline and debug quicky.
* [Jasmine Test Explorer Extension](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer), a very practical test exploration plugin which let you run, debug and see the test results inline.
* [mongodb-runner](https://github.com/mongodb-js/runner) Easily install and run MongoDB to test your code against it. (install with `npm install -g mongodb-runner`)

### Setting up you local machine:

* [Fork](https://github.com/parse-community/Parse-SDK-JS) this project and clone the fork on your local machine:

```sh
$ git clone https://github.com/parse-community/Parse-SDK-JS
$ cd Parse-SDK-JS # go into the clone directory
$ npm install # install all the node dependencies
$ code . # launch vscode
```

### Building the SDK

The Parse JS SDK is built for three platforms:

- The browser
- nodejs
- react-native

When developing the SDK you can use `npm run watch` in order to rebuild your changes upon each save.

By default, the watch command will rebuild the SDK for the browser platform. The following commands will rebuild changes for a specific platform.

- `npm run watch:node`
- `npm run watch:browser`
- `npm run watch:react-native`

### Testing the code

The SDK is tested through two lenses. unit tests are run with jest and integration tests with jasmine.

Two different frameworks are used as the integration tests leverage a stateful server, with the data saved into the database, and Jest is running many tests in parallel, which makes it incompatible with our integration tests.

#### Unit tests

Those tests are located in [/src/__tests__](/src/__tests__) and are responsible for ensuring each class is behaving as expected, without considering the rest of the system. For example, adding a new query helper function would probably require to add relevant tests that ensure the query is properly serialized to a valid Parse REST query object. Unit tests heavily leverage mocking and are an essential part of our testing harness.

To run unit tests, run `npm test`. If you have the vscode Jest plugin extension (as recommended), you can run your tests by clicking the *Debug* lens that appears near by the test.

#### Integration tests

Those tests are located in [/integration/test](/integration/test) and are responsible for ensuring a proper communication with parse-server. With the integration tests, we ensure all communications between the SDK and the server are behaving accordingly.

To run the integration tests, you will need a valid mongodb running on your local machine. You can get easily mongodb running with `mongodb-runner` (see [Recommended setup](#recommended-setup)). 

Use `npm run integration` in order to run the integration tests. If you have the vscode Jasmine extension installed (as recommended), you can run your tests by clicking the *Run* or the *Debug* lens that appears near by the test.

### Pull Requests
We actively welcome your pull requests. When we get one, we'll run some Parse-specific integration tests on it first. From here, we'll need to get a core member to sign off on the changes and then merge the pull request. For API changes we may need to fix internal uses, which could cause some delay. We'll do our best to provide updates and feedback throughout the process.

1. Fork the repo and create your branch from `master`.
2. Add unit tests for any new code you add.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes. (run `npm test && npm run integration`)
5. Make sure your code lints.

### Known Issues
We use GitHub issues to track public bugs. We will keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new issue, try to make sure your problem doesn't already exist.

### Reporting New Issues
Not all issues are SDK issues. If you're unsure whether your bug is with the SDK or backend, you can test to see if it reproduces with our [REST API][rest-api] and [Parse API Console][parse-api-console]. If it does, you can report backend bugs [here][bug-reports].
If the issue only reproduces with the JS SDK, you can [open an issue](https://github.com/parse-community/parse-server/issues) on this repository.

Details are key. The more information you provide us the easier it'll be for us to debug and the faster you'll receive a fix. Some examples of useful tidbits:

* A description. What did you expect to happen and what actually happened? Why do you think that was wrong?
* A simple unit test that fails. Refer [here][tests-dir] for examples of existing unit tests and [here][integration-test-dir] for integration tests examples. See for how to setup your machine and run unit tests in [this](#setting-up-the-project-for-debugging-and-contributing) guide. You can submit a pull request with your failing unit test so that our CI verifies that the test fails.
* What version does this reproduce on? What version did it last work on?
* [Stacktrace or GTFO][stacktrace-or-gtfo]. In all honesty, full stacktraces with line numbers make a happy developer.
* Anything else you find relevant.

### Security Bugs
Parse Community has a [responsible Vulnerability Disclosure Program](https://github.com/parse-community/parse-server/blob/master/SECURITY.md) for the safe disclosure of security bugs. In those cases, please go through the process outlined on that page and do not file a public issue.

## Coding Style
* Most importantly, match the existing code style as much as possible.
* We use [Flow](http://flowtype.org/) and ES6 for this codebase. Use modern syntax whenever possible.
* Keep lines within 80 characters.
* Always end lines with semicolons.

### Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://github.com/parse-community/parse-server/blob/master/CODE_OF_CONDUCT.md). By participating, you are expected to honor this code.

## License
By contributing to the Parse JavaScript SDK, you agree that your contributions will be licensed under its license.

 [google-group]: https://groups.google.com/forum/#!forum/parse-developers
 [stack-overflow]: http://stackoverflow.com/tags/parse-server
 [bug-reports]: https://github.com/parse-community/parse-server/issues
 [rest-api]: https://docs.parseplatform.org/rest/guide
 [parse-api-console]: http://blog.parseplatform.org/announcements/introducing-the-parse-api-console/
 [stacktrace-or-gtfo]: http://i.imgur.com/jacoj.jpg
 [tests-dir]: /src/__tests__
 [integration-test-dir]: /integration/test
