/* global Parse */
Parse.Cloud.define("bar", function(request) {
  if (request.params.key2 === "value1") {
    return 'Foo';
  } else {
    throw "bad stuff happened";
  }
});

Parse.Cloud.define('TestFetchFromLocalDatastore', function (request) {
  const object = new Parse.Object('Item');
  object.id = request.params.id;
  object.set('foo', 'changed');
  return object.save();
});

Parse.Cloud.define('UpdateUser', function (request) {
  const user = new Parse.User();
  user.id = request.params.id;
  user.set('foo', 'changed');
  return user.save(null, { useMasterKey: true });
});

Parse.Cloud.define('CloudFunctionIdempotency', function () {
  const object = new Parse.Object('IdempotencyItem');
  return object.save(null, { useMasterKey: true });
});

Parse.Cloud.define('CloudFunctionUndefined', function() {
  return undefined;
});

Parse.Cloud.job('CloudJob1', function() {
  return {
    status: 'cloud job completed'
  };
});

Parse.Cloud.job('CloudJob2', function() {
  return new Promise((resolve) => {
    setTimeout(function() {
      resolve({
        status: 'cloud job completed'
      })
    }, 1000);
  });
});

Parse.Cloud.job('CloudJobFailing', function() {
  throw 'cloud job failed';
});

//ugly patch. Should not stay here, but I don't know how to test changes in Cloud Code otherwise
//parse-server uses the published parse SDK version, but we want to test the patched version via cloud code
const PatchedParse = require('../../node').Parse;
//FunctionsRouter.js 104 calls Parse._encode directly, so it must be patched.
Parse._encode = PatchedParse._encode;
//Parse.Object calls encode, so it must be patched.
Parse.Object = PatchedParse.Object;

Parse.Cloud.define('getUnsavedObject', function(){
  const parent = new Parse.Object("Unsaved");
  const child = new Parse.Object("secondUnsaved");
  const childOfChild = new Parse.Object("thirdUnsaved");
  child.set("foz", "baz");
  child.set("child", childOfChild);
  parent.set("foo", "bar");
  parent.set("child", child);
  return parent;
});