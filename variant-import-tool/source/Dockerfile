FROM python:3.13.2-alpine

USER root

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app
RUN apk update
RUN apk add cmake build-base apache-arrow-dev
RUN pip install -r ./requirements.txt