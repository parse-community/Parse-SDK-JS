/* global Parse */
Parse.Cloud.define("bar", function(request) {
  if (request.params.key2 === "value1") {
    return 'Foo';
  } else {
    throw "bad stuff happened";
  }
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
