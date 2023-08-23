#!/bin/sh
# line endings must be \n, not \r\n !
echo "window._env_ = {" > ../share/nginx/html/env-config.js
awk -F '=' '{ print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' ./env.list >> ../share/nginx/html/env-config.js
echo "}" >> ../share/nginx/html/env-config.js
