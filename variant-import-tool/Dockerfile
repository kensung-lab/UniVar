FROM python:3.13-alpine

USER root

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app
RUN apk update
RUN apk add cmake build-base apache-arrow-dev bash zlib-dev bzip2-dev xz-dev curl-dev
RUN pip install --upgrade pip
RUN pip install -r ./requirements.txt