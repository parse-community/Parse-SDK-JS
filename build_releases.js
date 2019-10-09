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

console.log(`Building JavaScript SDK v${pkg.version}...\n`)

console.log('Cleaning up old builds...\n');

rmDir(path.join(__dirname, 'dist'));
rmDir(path.join(__dirname, 'lib'));

const crossEnv = 'npm run cross-env';
const gulp = 'npm run gulp';

console.log('Browser Release:');
execSync(`${crossEnv} PARSE_BUILD=browser ${gulp} compile`, { stdio: 'inherit' });

console.log('Weapp Release:');
execSync(`${crossEnv} PARSE_BUILD=weapp ${gulp} compile`, { stdio: 'inherit' });

console.log('Node.js Release:');
execSync(`${crossEnv} PARSE_BUILD=node ${gulp} compile`, { stdio: 'inherit' });

console.log('React Native Release:');
execSync(`${crossEnv} PARSE_BUILD=react-native ${gulp} compile`, { stdio: 'inherit' });

console.log('Bundling and minifying for CDN distribution:');
execSync(`${gulp} browserify`, { stdio: 'inherit' });
execSync(`${gulp} browserify-weapp`, { stdio: 'inherit' });
execSync(`${gulp} minify`, { stdio: 'inherit' });
execSync(`${gulp} minify-weapp`, { stdio: 'inherit' });
