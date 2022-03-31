FROM node:latest
 
ARG service_src
 
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
CMD ["node", "dist/app.js"]