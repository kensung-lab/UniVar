FROM python:3.9.18-alpine

USER root

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app
RUN pip install -r ./requirements.txt