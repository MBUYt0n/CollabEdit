FROM node:18-alpine
RUN apk add --no-cache curl fish openjdk11
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install ws websocket kafkajs express http-server codemirror redis
EXPOSE 9092 3000
