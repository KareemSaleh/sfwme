#!/bin/sh

# Update our dependencies
npm update

# Set ENV variables
export BASE_URL='sfwme.com'
export PORT=80
export MONGO_NODE_DRIVER_HOST=$BASE_URL
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'
export BASE_PATH=~/sfwme

# Start the Server using forever
forever -a start -l $BASE_PATH/logs/forever.log -o $BASE_PATH/logs/sfwme.log -e $BASE_PATH/logs/err.log app.js