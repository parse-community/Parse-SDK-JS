#!/bin/sh -e
jsdoc -a all -c ./jsdoc-ts-conf.json ./src -p
cd types
mv types.d.ts index.d.ts
cat interfaces.ts >> index.d.ts
node ./types.js
prettier --write 'index.d.ts'