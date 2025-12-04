FROM node:18-alpine
WORKDIR /app
# Kopieer alleen package.json en package-lock/yarn.lock als aanwezig
COPY package.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node","server.js"]
