#FROM node:8.10-alpine
FROM sitespeedio/node:ubuntu-18.04-nodejs8.11.1

ENV NPM_CONFIG_LOGLEVEL=http
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_PATH /app/node_modules

WORKDIR /app

COPY package.json /app/package.json

# Enable sudo
#RUN apk update
## Install TC
#RUN apk add --no-cache iproute2
#RUN apk add --no-cache net-tools
RUN apt-get update && apt-get install libnss3-tools iproute2 sudo net-tools -y

WORKDIR /app
COPY . /app/


STOPSIGNAL SIGINT
