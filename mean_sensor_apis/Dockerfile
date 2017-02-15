FROM aarch64/ubuntu:xenial

ENV DEBIAN_FRONTEND noninteractive

# get OS dependencies
RUN apt-get update
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends build-essential
RUN apt-get install -y --no-install-recommends libkrb5-dev
RUN apt-get install -y --no-install-recommends nodejs
RUN apt-get install -y --no-install-recommends npm

RUN ln -s /usr/bin/nodejs /usr/bin/node

# create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install npm dependencies
COPY package.json /usr/src/app
RUN npm install

# app source
COPY . /usr/src/app

# api port for sensors is 3000
EXPOSE 3000
# api port for admin is 3001
EXPOSE 3001

# bash entrypoint script takes either sensor-api or admin-api 
# as argument in docker run command line
# usage: ./server_start.sh [sensor-api,admin-api]
RUN ["chmod","+x","server_start.sh"]
ENTRYPOINT [ "./server_start.sh" ]

ENV DEBIAN_FRONTEND teletype




