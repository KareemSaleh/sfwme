#!/bin/sh

# Set ENV variables
export BASE_URL='sfwme.com'
export PORT=3000
export MONGO_NODE_DRIVER_HOST='localhost'
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'
export BASE_PATH=$HOME/sfwme

if [ ! -d $HOME/logs ]; then
	mkdir $HOME/logs
fi

# Start the Server using forever
export PATH=/usr/local/bin:$PATH
forever start -a -l $HOME/logs/sfwme.log --sourceDir $BASE_PATH app.js