const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rmDir = function(dirPath) {
  if(fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(function(file) {
      const curPath = path.join(dirPath, file);
      if(fs.lstatSync(curPath).isDirectory()) { 
        rmDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

const exec = function(cmd) {
  execSync(cmd, { stdio: 'inherit' });
};

console.log(`Building JavaScript SDK v${pkg.version}...\n`)

console.log('Cleaning up old builds...\n');

rmDir(path.join(__dirname, 'dist'));
rmDir(path.join(__dirname, 'lib'));

const crossEnv = 'npm run cross-env';
const gulp = 'npm run gulp';

console.log('Browser Release:');
exec(`${crossEnv} PARSE_BUILD=browser ${gulp} compile`);

console.log('Weapp Release:');
exec(`${crossEnv} PARSE_BUILD=weapp ${gulp} compile`);

console.log('Node.js Release:');
exec(`${crossEnv} PARSE_BUILD=node ${gulp} compile`);

console.log('React Native Release:');
exec(`${crossEnv} PARSE_BUILD=react-native ${gulp} compile`);

console.log('Bundling and minifying for CDN distribution:');
exec(`${gulp} browserify`);
exec(`${gulp} browserify-weapp`);
exec(`${gulp} minify`);
exec(`${gulp} minify-weapp`);
