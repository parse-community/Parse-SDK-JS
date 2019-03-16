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
    }, 3000);
  });
});

Parse.Cloud.job('CloudJobFailing', function() {
  throw 'cloud job failed';
});
