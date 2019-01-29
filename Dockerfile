FROM node:latest AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx AS deploy
COPY --from=build /app/dist /usr/share/nginx/html