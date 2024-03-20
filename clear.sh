#!/bin/bash
docker-compose down --volumes
docker image rm mysql
docker image rm aoj-searcher-frontend
docker image rm aoj-searcher-backend
