#!/bin/bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

if [ -z "$1" ]; then
    echo "Please provide the path to the web root directory as the first argument"
    exit 1
fi

bash $SCRIPTPATH/replace_variables.sh $1
exec nginx -g 'daemon off;'