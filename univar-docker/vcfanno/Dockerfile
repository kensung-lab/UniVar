FROM alpine:3.22 AS source

ENV VCFANNO_URL="https://github.com/brentp/vcfanno/releases/download/v0.3.5/vcfanno_linux64" 
RUN mkdir -p /usr/local/bin
RUN wget -O /usr/local/bin/vcfanno "$VCFANNO_URL" && chmod +x /usr/local/bin/vcfanno

FROM alpine:3.22
COPY --from=source /usr/local/bin/vcfanno /usr/local/bin/vcfanno
RUN apk update && apk upgrade && apk add htslib-tools --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing
ENTRYPOINT ["/usr/local/bin/vcfanno"]
CMD ["--help"]