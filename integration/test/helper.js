jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
beforeAll((done) => {
  const { app } = require('../server');
  const server = app.listen(1337, () => {
    console.log('parse-server running on port 1337.');
    done();
  });  
});
