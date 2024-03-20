FROM node:latest
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./
CMD ["sh", "-c", "node src/test.js"]