const puppeteer = require('puppeteer');
const { resolvingPromise } = require('../../lib/node/promiseUtils');

let browser = null;
let page = null;
for (const fileName of ['parse.js', 'parse.min.js']) {
  describe(`Parse Dist Test ${fileName}`, () => {
    beforeEach(async () => {
      browser = await puppeteer.launch({
        args: ['--disable-web-security', '--incognito', '--no-sandbox'],
        devtools: false,
      });
      const context = await browser.createBrowserContext();
      page = await context.newPage();
      await page.setCacheEnabled(false);
      await page.goto(`http://localhost:1337/${fileName}`);
    });

    afterEach(async () => {
      await page.close();
      await browser.close();
    });

    it('can save an object', async () => {
      const objectId = await page.evaluate(async () => {
        const object = await new Parse.Object('TestObject').save();
        return object.id;
      });
      expect(objectId).toBeDefined();
      const obj = await new Parse.Query('TestObject').get(objectId);
      expect(obj).toBeDefined();
      expect(obj.id).toEqual(objectId);
    });

    it('can query an object', async () => {
      const obj = await new Parse.Object('TestObjects').save();
      const response = await page.evaluate(async () => {
        const object = await new Parse.Query('TestObjects').first();
        return object.id;
      });
      expect(response).toBeDefined();
      expect(obj).toBeDefined();
      expect(obj.id).toEqual(response);
    });

    it('can cancel save file', async () => {
      let requestsCount = 0;
      let abortedCount = 0;
      const promise = resolvingPromise();
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (!request.url().includes('favicon.ico')) {
          requestsCount += 1;
        }
        request.continue();
      });
      page.on('requestfailed', request => {
        if (
          request.failure().errorText === 'net::ERR_ABORTED' &&
          !request.url().includes('favicon.ico')
        ) {
          abortedCount += 1;
          promise.resolve();
        }
      });
      await page.evaluate(async () => {
        const SIZE_10_MB = 10 * 1024 * 1024;
        const file = new Parse.File('test_file.txt', new Uint8Array(SIZE_10_MB));
        file.save().then(() => {
          fail('should not save');
        });
        return new Promise(resolve => {
          const intervalId = setInterval(() => {
            if (file._requestTask && typeof file._requestTask.abort === 'function') {
              file.cancel();
              clearInterval(intervalId);
              resolve();
            }
          }, 1);
        });
      });
      await promise;
      expect(requestsCount).toBe(1);
      expect(abortedCount).toBe(1);
    });
  });
}
