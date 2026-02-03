FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev
RUN npm install pm2 -g

COPY . .

EXPOSE 8080

CMD ["pm2-runtime", "Server.js", "--name", "inaivserver"]
