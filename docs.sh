#!/bin/sh -e
find ./ -type f -exec sed -i '' 's#@generic#@ignore generic#' *.js {} \;
jsdoc -c ./jsdoc-conf.json ./src
find ./ -type f -exec sed -i '' 's#@ignore generic#@generic#' *.js {} \;