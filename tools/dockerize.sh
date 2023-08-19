#!/bin/bash
#set -x

# Build docker images of components for server and upload them to Docker Hub

what=$1
if [ -z "$what" ]; then
  echo "Usage: $0 [all|server|client]"
  exit 1
fi

echo "Building docker images for $what"

npm run build
if [ $? -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

function docker_build {
  name=$1
  tag=$2
  docker_file=$3
  docker build -t $name:$tag -t $name:latest -f ./$docker_file .
  if [ $? -ne 0 ]; then
    echo "Building of docker image $name failed"
    exit 1
  fi
  docker push $name 
  if [ $? -ne 0 ]; then
    echo "Pushing of docker image $name failed"
    exit 1
  fi
  docker push $name:$tag 
  if [ $? -ne 0 ]; then
    echo "Pushing of docker image $name:$tag failed"
    exit 1
  fi
}

if [ "$what" == "all" ] || [ "$what" == "server" ]; then
  # build docker image for server ---------------------------
  name=spv99build/sedma-server
  tag=`git rev-parse --short HEAD`
  docker_file=Dockerfile.server
  docker_build $name $tag $docker_file
  if [ $? -ne 0 ]; then
    echo "Building of docker image $name failed"
    exit 1
  fi
fi

if [ "$what" == "all" ] || [ "$what" == "client" ]; then
  # build docker image for app ---------------------------
  name=spv99build/sedma-client
  tag=`git rev-parse --short HEAD`
  docker_file=Dockerfile.client
  docker_build $name $tag $docker_file
  if [ $? -ne 0 ]; then
    echo "Building of docker image $name failed"
    exit 1
  fi
fi