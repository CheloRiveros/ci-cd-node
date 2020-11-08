#!/bin/bash
echo "stop"
docker-compose -f /home/ec2-user/ci-cd-node/docker-compose.prod.yml down
docker stop $(docker ps -a -q)