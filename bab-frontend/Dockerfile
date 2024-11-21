FROM docker.io/nginx:1.21.6
LABEL org.opencontainers.image.title "bab-frontend"
LABEL org.opencontainers.image.description "Contain the runtime enviornment and scripts for bab-frontend"
LABEL org.opencontainers.image.source "https://github.com/hkgi-bioinformatics/bab-frontend.git"
ENV TZ=Asia/Hong_Kong
COPY dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
