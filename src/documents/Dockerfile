FROM node:18-alpine
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install mariadb axios dotenv express cors firebase-admin firebase
CMD ["node", "src/index.js"]