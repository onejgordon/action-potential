#!/bin/bash


if [ "$1" == "kill" ]
then
	echo "Killing server..."
	lsof -P | grep ':8080' | awk '{print $2}' | xargs kill -9
else
	echo "Starting server..."
	dev_appserver.py app.yaml --log_level=debug
fi