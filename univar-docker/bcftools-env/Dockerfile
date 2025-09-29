FROM alpine:3.21

WORKDIR /usr/src

RUN apk update && apk upgrade

RUN apk add git autoconf automake make gcc musl-dev perl bash zlib-dev bzip2-dev xz-dev curl-dev openssl-dev gsl-dev perl-dev

RUN git clone https://github.com/samtools/htslib.git

RUN git clone https://github.com/samtools/bcftools.git

WORKDIR /usr/src/htslib

RUN autoreconf -i

RUN git submodule update --init --recursive

RUN ./configure

RUN make

RUN make install

WORKDIR /usr/src/bcftools

RUN autoheader && autoconf && ./configure --enable-libgsl --enable-perl-filters

RUN make

RUN make install

WORKDIR /usr/src/

# clean up

RUN rm -rf bcftools && rm -rf htslib

RUN apk del git autoconf automake make

CMD ["/bin/sh"]