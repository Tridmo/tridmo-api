FROM --platform=linux/amd64 node:16.17.0-bullseye-slim
WORKDIR /home/src/app
COPY package*.json .
RUN npm i
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "dev" ]