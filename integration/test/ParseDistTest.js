const puppeteer = require('puppeteer');
let browser = null;
let page = null;
for (const fileName of ['parse.js', 'parse.min.js']) {
  describe(`Parse Dist Test ${fileName}`, () => {
    beforeEach(async () => {
      browser = await puppeteer.launch();
      page = await browser.newPage();
      await page.goto(`http://localhost:1337/${fileName}`);
    });

    afterEach(async () => {
      await page.close();
      await browser.close();
    });

    it('can save an object', async () => {
      const response = await page.evaluate(async () => {
        const object = await new Parse.Object('TestObject').save();
        return object.id;
      });
      expect(response).toBeDefined();
      const obj = await new Parse.Query('TestObject').first();
      expect(obj).toBeDefined();
      expect(obj.id).toEqual(response);
    });

    it('can query an object', async () => {
      const obj = await new Parse.Object('TestObject').save();
      const response = await page.evaluate(async () => {
        const object = await new Parse.Query('TestObject').first();
        return object.id;
      });
      expect(response).toBeDefined();
      expect(obj).toBeDefined();
      expect(obj.id).toEqual(response);
    });
  });
}
