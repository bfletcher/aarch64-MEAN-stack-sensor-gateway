#!/bin/bash

if [ "$1" = 'sensor-api' ]; then
   node sensor-api.js
elif [ "$1" = 'admin-api' ]; then
   node admin-api.js
else
   echo "usage: choose a server (admin-api, sensor-api) to start"
fi

