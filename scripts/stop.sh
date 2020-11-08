#!/bin/bash
docker-compose -f /ci-cd-node/docker-compose.production.yml down
docker stop $(docker ps -a -q)