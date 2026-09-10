#FROM node:18.13-alpine
#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build -- --configuration production
#EXPOSE 4200
#CMD ["npm", "run", "start:prod"]


# --------- 1️⃣ Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# --------- 2️⃣ Runtime stage ----------
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/lingo-leap-fe/browser ./dist
EXPOSE 4200
CMD ["serve", "-s", "dist", "-l", "4200"]
