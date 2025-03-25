FROM node:18-alpine
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install mariadb bcryptjs jsonwebtoken dotenv express cors 
CMD ["node", "src/index.js"]