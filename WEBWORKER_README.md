## Webworkers support

To make Parse work in a webworker, it needs access to the localStorage object on the main/browser thread. This small patch to Parse allows clients to provide a custom asyncLocalStorage implementation.

How to use:

- define self.asyncLocalStorage, in the worker thread, BEFORE requiring parse.js
- asyncLocalStorage should support: `getItem, setItem, removeItem and clear`
- asyncLocalStorage should take exactly the same inputs as localStorage
- asyncLocalStorage should return promises (ES6 or Parse compatible) for all four functions which resolve to the same results localStorage would return.
