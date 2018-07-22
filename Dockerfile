FROM node:8.10-alpine

ENV NPM_CONFIG_LOGLEVEL=http
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_PATH /app/node_modules

WORKDIR /app

# GOTCHA: https://github.com/moby/moby/issues/18611
#   docker build and docker-compose build produce different tarballs
#   This invalidates the cache
# Be sure to use either docker or docker-compose NOT BOTH when building
COPY package.json /app/package.json

# Enable sudo
RUN apk update
# Install TC
RUN apk add --no-cache iproute2
RUN apk add --no-cache net-tools

WORKDIR /app
COPY . /app/


STOPSIGNAL SIGINT
