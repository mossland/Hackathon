FROM node:lts-buster

ARG NODE_ENV

RUN echo node -v
RUN mkdir -p /usr/src/metaverse_game
COPY . /usr/src/metaverse_game
WORKDIR /usr/src/metaverse_game

ENV NODE_ENV_BAK $NODE_ENV
ENV NODE_ENV development
ENV VERSION $CODEBUILD_BUILD_NUMBER

RUN echo $CODEBUILD_BUILD_NUMBER

EXPOSE 3000

RUN yarn install
ENV NODE_ENV $NODE_ENV_BAK
RUN yarn run build

CMD [ "yarn", "start" ]
