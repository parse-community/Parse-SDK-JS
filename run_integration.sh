#!/bin/sh

cd integration
node server.js &
PID=$!
npm test
C=$!
kill -9 $PID
exit $C