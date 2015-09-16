require('jasmine-reporters');
var reporter = new jasmine.JUnitXmlReporter('test_output/');
jasmine.getEnv().addReporter(reporter);
