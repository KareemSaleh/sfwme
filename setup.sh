#!/bin/sh

# Set ENV variables
export BASE_URL='sfwme.com'
export PORT=80
export MONGO_NODE_DRIVER_HOST=$BASE_URL
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'

# Update our dependencies
npm update

# Start the Server using forever
forever start -l forever.log -o sfwme.log -e err.log app.js