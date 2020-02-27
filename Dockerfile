FROM node:alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN apt-get install libpq-dev g++ make
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS deploy
COPY --from=build /app/dist /usr/share/nginx/html