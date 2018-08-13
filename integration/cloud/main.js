/* global Parse */
Parse.Cloud.define("bar", function(request, response) {
  if (request.params.key2 === "value1") {
    response.success('Foo');
  } else {
    response.error("bad stuff happened");
  }
});

Parse.Cloud.job('CloudJob1', function(request, response) {
  response.success({
    status: 'cloud job completed'
  });
});

Parse.Cloud.job('CloudJob2', function(request, response) {
  setTimeout(function() {
    response.success({
      status: 'cloud job completed'
    })
  }, 3000);
});

Parse.Cloud.job('CloudJobFailing', function(request, response) {
  response.error('cloud job failed');
});
