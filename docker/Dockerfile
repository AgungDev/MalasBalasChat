FROM node:20-alpine

WORKDIR /app

COPY node-whatsapp/package*.json ./
RUN npm install --production

COPY node-whatsapp ./

EXPOSE 9092
CMD ["npm", "start"]
