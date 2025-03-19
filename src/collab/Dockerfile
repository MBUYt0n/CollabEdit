FROM node:18-alpine
RUN apk add --no-cache openjdk11
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install ws websocket kafkajs express http-server codemirror redis mariadb dotenv jsonwebtoken
CMD ["node", "src/server.js"]
