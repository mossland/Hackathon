FROM nginx:stable

ARG NODE_ENV

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/site-enabled/default
COPY web.$NODE_ENV.conf /etc/nginx/site-enabled/default
COPY . /usr/src/nginx

WORKDIR /usr/src/nginx
RUN ["chmod", "+x", "./run.sh"]
CMD ./run.sh
