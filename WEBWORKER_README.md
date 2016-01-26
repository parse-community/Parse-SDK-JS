## THIS FORK: Webworkers support

This fork was created to add support for Webworkers. The only problem is webworkers can't access the localStorage object, which Parse requires.

How to use:

- define self.asyncLocalStorage, in the worker thread, BEFORE requiring parse.js
- asyncLocalStorage should support: `getItem, setItem, removeItem and clear`
- asyncLocalStorage should take exactly the same inputs as localStorage
- asyncLocalStorage should return promises (ES6 or Parse compatible) for all four functions which resolve to the same results localStorage would return.
