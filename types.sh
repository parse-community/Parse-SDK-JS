#!/bin/sh -e
jsdoc -a all -c ./jsdoc-ts-conf.json ./src
sed -i -e 's/Parameters<T<0>>/Parameters<T>[0]/g' types/types.d.ts
sed -i -e 's/private //g' types/types.d.ts
rm types/types.d.ts-e
mv types/types.d.ts types/index.d.ts