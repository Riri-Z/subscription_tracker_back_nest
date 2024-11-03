FROM node:20.15-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

RUN npm install

COPY src/ ./src

RUN npm run build

EXPOSE 3001

CMD [ "node", "dist/main.js" ]
