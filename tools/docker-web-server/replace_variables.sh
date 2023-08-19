#!/bin/sh

# Script to write NX_ environment variables to a file
# and replace the reference in index.html
# Script assumes index.html loads file variables.js

# This script need to run after the container is started
# as the environment variables can change between starts

if [ -z "$1" ]; then
  echo "Usage: $0 [web root]"
  exit 1
fi

# path to web root
WEB_ROOT=$1
VARIABLES_FILE_NAME=variables-$(date +"%s").js
VARIABLES_FULL_PATH=$WEB_ROOT/assets/$VARIABLES_FILE_NAME

echo $VARIABLES_FULL_PATH

echo "" > $VARIABLES_FULL_PATH
env | while IFS= read -r line; do
  value=${line#*=}
  name=${line%%=*}
  if [[ $name == NX_* ]] ;
  then
    echo "window.$name = '$value';" >> $VARIABLES_FULL_PATH
  fi
done

# replace variables file reference in index.html
sed -i "s/variables\.js/$VARIABLES_FILE_NAME/g" $WEB_ROOT/index.html