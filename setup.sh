#!/bin/sh

# Update our dependencies
npm update

# Set ENV variables
export BASE_URL='sfwme.com'
export PORT=80
export MONGO_NODE_DRIVER_HOST=$BASE_URL
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'

# Start the Server using forever
forever -a start -l logs/forever.log -o logs/sfwme.log -e logs/err.log app.js