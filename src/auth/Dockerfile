FROM node:18-alpine
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install dotenv express cors firebase-admin firebase mariadb
CMD ["node", "src/index.js"]