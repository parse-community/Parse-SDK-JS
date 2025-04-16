const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');

async function getTypes(files) {
  const types = {};
  const promise = files.map((file) => {
    if (file.includes('.d.ts')) {
      return fs.readFile(`./types/${file}`, 'utf8').then((content) => {
        types[file] = content;
      });
    }
  });
  await Promise.all(promise);
  return types;
}

(async () => {
  const execute = util.promisify(exec);
  const currentFiles = await fs.readdir('./types');
  const currentTypes = await getTypes(currentFiles);
  await execute('npm run build:types');
  const newFiles = await fs.readdir('./types');
  const newTypes = await getTypes(newFiles);
  for (const file of newFiles) {
    if (currentTypes[file] !== newTypes[file]) {
      console.error(
        '\x1b[31m%s\x1b[0m',
        'Type definitions files cannot be updated manually. Use `npm run build:types` to generate type definitions.'
      );
      process.exit(1);
    }
  }
  process.exit(0);
})();
