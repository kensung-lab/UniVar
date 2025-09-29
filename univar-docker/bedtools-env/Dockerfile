FROM alpine:3.21

WORKDIR /usr/src

RUN apk update && apk upgrade

RUN apk add git autoconf automake make gcc musl-dev perl bash zlib-dev bzip2-dev xz-dev curl-dev openssl-dev gsl-dev perl-dev

RUN git clone https://github.com/samtools/htslib.git

RUN wget -c https://github.com/arq5x/bedtools2/releases/download/v2.31.0/bedtools.static

WORKDIR /usr/src/htslib

RUN autoreconf -i

RUN git submodule update --init --recursive

RUN ./configure

RUN make

RUN make install

WORKDIR /usr/src/

RUN mkdir bin

RUN mv bedtools.static bin/bedtools

RUN chmod +x bin/bedtools

ENV PATH="$PATH:/usr/src/bin"

# clean up

RUN rm -rf bcftools && rm -rf htslib

RUN apk del git autoconf automake make

CMD ["/bin/sh"]