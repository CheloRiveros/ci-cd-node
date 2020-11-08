#!/bin/bash
echo "stop"
docker-compose -f /ci-cd-node/docker-compose.prod.yml down
docker stop $(docker ps -a -q)