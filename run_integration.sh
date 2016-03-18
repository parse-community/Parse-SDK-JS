#!/bin/sh

npm run build
cd integration
npm install
node server.js &
PID=$!
npm test
C=$?
kill -9 $PID
exit $C