FROM nginx:1.29.1-alpine3.22-perl
LABEL org.opencontainers.image.title="univar-frontend"
LABEL org.opencontainers.image.description="Contain the runtime environment and scripts for univar-frontend"
ENV TZ=Asia/Hong_Kong
COPY dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
