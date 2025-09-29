# syntax=docker/dockerfile:1
######################################
# Build Stage                        #
######################################

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /usr/src

RUN git clone https://github.com/Illumina/Nirvana.git

RUN cd Nirvana && dotnet build Nirvana.sln

######################################
# Image                              #
######################################
FROM mcr.microsoft.com/dotnet/runtime:6.0

WORKDIR /usr/src

COPY --from=build \
    /usr/src/Nirvana/bin/Debug/net6.0 \
    /usr/src/Nirvana

RUN apt-get update && apt-get install -y procps

ENV PATH="${PATH}:/usr/src/Nirvana"

CMD ["/bin/sh"]