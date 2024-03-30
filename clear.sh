#!/bin/bash
docker-compose down --volumes
docker image rm mysql:8.0
docker image rm aoj-searcher-frontend
docker image rm aoj-searcher-backend
