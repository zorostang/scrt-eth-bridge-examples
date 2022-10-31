FROM node:current-alpine
WORKDIR /app
COPY . .

RUN npm i
RUN npm run build

EXPOSE 3000

CMD ["node", "build/index.js"]