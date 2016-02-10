FROM node:4

RUN mkdir /app && npm install -g bower ember-cli@2.3.0-beta.2

WORKDIR /app

COPY *.json /app/
RUN npm install && bower install --allow-root