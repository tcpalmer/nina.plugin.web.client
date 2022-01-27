#!/bin/bash

# This script first starts superstatic in the background to serve session history json in development mode.
# It than starts webpack devServer as usual.

echo 'starting superstatic web server on port 9001 ...'
superstatic test/webroot --port 9001 &

echo 'starting camouflage on port 9002 ...'
camouflage --config test/mockapi/config.yml &

echo 'starting webpack devServer on port 9000 ...'
npx webpack serve --config config/webpack.dev.js
