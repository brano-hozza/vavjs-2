FROM node:lts

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY package*.json ./
RUN npm install
COPY ./ ./

EXPOSE 8080 8082

CMD ["node", "index.js"]