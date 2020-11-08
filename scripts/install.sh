#!/bin/bash
pwd=$( aws ecr get-login-password )
docker container stop $(docker container ls -aq)
docker login -u AWS -p $pwd https://197979423491.dkr.ecr.us-east-2.amazonaws.com
docker pull 197979423491.dkr.ecr.us-east-2.amazonaws.com/chat
