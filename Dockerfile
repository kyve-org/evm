FROM node:14-alpine

COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
