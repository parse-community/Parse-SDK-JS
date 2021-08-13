#!/bin/sh -e
jsdoc -a all -c ./jsdoc-ts-conf.json ./src -p
mv types/types.d.ts types/index.d.ts
