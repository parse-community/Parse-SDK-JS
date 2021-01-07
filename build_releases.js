const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rmDir = function(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(function(file) {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

const execCommand = function(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        return reject(error);
      }
      const output = stdout ? stdout : stderr;
      console.log(output);
      resolve(output);
    });
  });
};

console.log(`Building JavaScript SDK v${pkg.version}...\n`)

console.log('Cleaning up old builds...\n');

rmDir(path.join(__dirname, 'dist'));
rmDir(path.join(__dirname, 'lib'));

const crossEnv = 'npm run cross-env';
const gulp = 'npm run gulp';

(async function() {
  console.log('Browser Release:');
  console.log('Weapp Release:');
  console.log('Node.js Release:');
  console.log('React Native Release:');
  await Promise.all([
    execCommand(`${crossEnv} PARSE_BUILD=browser ${gulp} compile`),
    execCommand(`${crossEnv} PARSE_BUILD=weapp ${gulp} compile`),
    execCommand(`${crossEnv} PARSE_BUILD=node ${gulp} compile`),
    execCommand(`${crossEnv} PARSE_BUILD=react-native ${gulp} compile`),
  ]);

  console.log('Bundling and minifying for CDN distribution:');
  await Promise.all([
    execCommand(`${gulp} browserify`),
    execCommand(`${gulp} browserify-weapp`),
  ]);
  await Promise.all([
    execCommand(`${gulp} minify`),
    execCommand(`${gulp} minify-weapp`),
  ]);
}());
