#!/bin/bash
docker-compose -f /ci-cd-node/docker-compose.pord.yml down
docker stop $(docker ps -a -q)