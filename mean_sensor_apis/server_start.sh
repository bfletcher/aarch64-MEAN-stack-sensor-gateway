#!/bin/bash

if [ "$1" = 'sensor-api' ]; then
   node sensor-api.js
elif [ "$1" = 'admin-api' ]; then
   node admin-api.js
elif [ "$1" = 'ui-api' ]; then
   node ui-api.js
else
   echo "usage: choose a server (admin-api, sensor-api, ui-api) to start"
fi

