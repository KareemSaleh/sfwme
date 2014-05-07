#!/bin/sh

# Git Update
git pull personal master

# Set ENV variables
export BASE_URL='sfwme.com'
export PORT=80
export MONGO_NODE_DRIVER_HOST='localhost'
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'
export BASE_PATH=$HOME/sfwme

if [ ! -d $HOME/logs ]; then
	mkdir $HOME/logs
fi

# Start the Server using forever
forever start --sourceDir $BASE_PATH app.js >> $HOME/logs/sfwme.log 2>&1
