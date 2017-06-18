var jasmineReporters = require('jasmine-reporters');
var reporter = new jasmineReporters.JUnitXmlReporter('test_output/');
jasmine.getEnv().addReporter(reporter);
