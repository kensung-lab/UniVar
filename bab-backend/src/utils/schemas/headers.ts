import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IncomingHttpHeaders } from 'http';

export type HeadersDocument = HydratedDocument<Headers>;

@Schema({ collection: 'headers' })
export class Headers implements IncomingHttpHeaders {
  [key: string]: string | string[];

  @Prop()
  accept?: string;

  @Prop()
  accept_language?: string;

  @Prop()
  accept_patch?: string;

  @Prop()
  accept_ranges?: string;

  @Prop()
  access_control_allow_credentials?: string;

  @Prop()
  access_control_allow_headers?: string;

  @Prop()
  access_control_allow_methods?: string;

  @Prop()
  access_control_allow_origin?: string;

  @Prop()
  access_control_expose_headers?: string;

  @Prop()
  access_control_max_age?: string;

  @Prop()
  access_control_request_headers?: string;

  @Prop()
  access_control_request_method?: string;

  @Prop()
  age?: string;

  @Prop()
  allow?: string;

  @Prop()
  alt_svc?: string;

  @Prop()
  authorization?: string;

  @Prop()
  cache_control?: string;

  @Prop()
  connection?: string;

  @Prop()
  content_disposition?: string;

  @Prop()
  content_encoding?: string;

  @Prop()
  content_language?: string;

  @Prop()
  content_length?: string;

  @Prop()
  content_location?: string;

  @Prop()
  content_range?: string;

  @Prop()
  content_type?: string;

  @Prop()
  cookie?: string;

  @Prop()
  date?: string;

  @Prop()
  etag?: string;

  @Prop()
  expect?: string;

  @Prop()
  expires?: string;

  @Prop()
  forwarded?: string;

  @Prop()
  from?: string;

  @Prop()
  host?: string;

  @Prop()
  if_match?: string;

  @Prop()
  if_modified_since?: string;

  @Prop()
  if_none_match?: string;

  @Prop()
  if_unmodified_since?: string;

  @Prop()
  last_modified?: string;

  @Prop()
  location?: string;

  @Prop()
  origin?: string;

  @Prop()
  pragma?: string;

  @Prop()
  proxy_authenticate?: string;

  @Prop()
  proxy_authorization?: string;

  @Prop()
  public_key_pins?: string;

  @Prop()
  range?: string;

  @Prop()
  referer?: string;

  @Prop()
  retry_after?: string;

  @Prop()
  sec_websocket_accept?: string;

  @Prop()
  sec_websocket_extensions?: string;

  @Prop()
  sec_websocket_key?: string;

  @Prop()
  sec_websocket_protocol?: string;

  @Prop()
  sec_websocket_version?: string;

  @Prop()
  set_cookie?: string[];

  @Prop()
  strict_transport_security?: string;

  @Prop()
  tk?: string;

  @Prop()
  trailer?: string;

  @Prop()
  transfer_encoding?: string;

  @Prop()
  upgrade?: string;

  @Prop()
  user_agent?: string;

  @Prop()
  vary?: string;

  @Prop()
  via?: string;

  @Prop()
  warning?: string;

  @Prop()
  www_authenticate?: string;

  constructor(incomingHttpHeaders: IncomingHttpHeaders) {
    this.accept = incomingHttpHeaders.accept;
    this.accept_language = incomingHttpHeaders['accept-language'];
    this.accept_patch = incomingHttpHeaders['accept-patch'];
    this.accept_ranges = incomingHttpHeaders['accept-ranges'];
    this.access_control_allow_credentials =
      incomingHttpHeaders['access-control-allow-credentials'];
    this.access_control_allow_headers =
      incomingHttpHeaders['access-control-allow-headers'];
    this.access_control_allow_methods =
      incomingHttpHeaders['access-control-allow-methods'];
    this.access_control_allow_origin =
      incomingHttpHeaders['access-control-allow-origin'];
    this.access_control_expose_headers =
      incomingHttpHeaders['access-control-expose-headers'];
    this.access_control_max_age = incomingHttpHeaders['access-control-max-age'];
    this.access_control_request_headers =
      incomingHttpHeaders['access-control-request-headers'];
    this.access_control_request_method =
      incomingHttpHeaders['access-control-request-method'];
    this.age = incomingHttpHeaders['age'];
    this.allow = incomingHttpHeaders['allow'];
    this.alt_svc = incomingHttpHeaders['alt-svc'];
    this.authorization = incomingHttpHeaders['authorization'];
    this.cache_control = incomingHttpHeaders['cache-control'];
    this.connection = incomingHttpHeaders['connection'];
    this.content_disposition = incomingHttpHeaders['content-disposition'];
    this.content_encoding = incomingHttpHeaders['content-encoding'];
    this.content_language = incomingHttpHeaders['content-language'];
    this.content_length = incomingHttpHeaders['content-length'];
    this.content_location = incomingHttpHeaders['content-location'];
    this.content_range = incomingHttpHeaders['content-range'];
    this.content_type = incomingHttpHeaders['content-type'];
    this.cookie = incomingHttpHeaders['cookie'];
    this.date = incomingHttpHeaders['date'];
    this.etag = incomingHttpHeaders['etag'];
    this.expect = incomingHttpHeaders['expect'];
    this.expires = incomingHttpHeaders['expires'];
    this.forwarded = incomingHttpHeaders['forwarded'];
    this.from = incomingHttpHeaders['from'];
    this.host = incomingHttpHeaders['host'];
    this.if_match = incomingHttpHeaders['if-match'];
    this.if_modified_since = incomingHttpHeaders['if-modified-since'];
    this.if_none_match = incomingHttpHeaders['if-none-match'];
    this.if_unmodified_since = incomingHttpHeaders['if-unmodified-since'];
    this.last_modified = incomingHttpHeaders['last-modified'];
    this.location = incomingHttpHeaders['location'];
    this.origin = incomingHttpHeaders['origin'];
    this.pragma = incomingHttpHeaders['pragma'];
    this.proxy_authenticate = incomingHttpHeaders['proxy-authenticate'];
    this.proxy_authorization = incomingHttpHeaders['proxy-authorization'];
    this.public_key_pins = incomingHttpHeaders['public-key-pins'];
    this.range = incomingHttpHeaders['range'];
    this.referer = incomingHttpHeaders['referer'];
    this.retry_after = incomingHttpHeaders['retry-after'];
    this.sec_websocket_accept = incomingHttpHeaders['sec-websocket-accept'];
    this.sec_websocket_extensions =
      incomingHttpHeaders['sec-websocket-extensions'];
    this.sec_websocket_key = incomingHttpHeaders['sec-websocket-key'];
    this.sec_websocket_protocol = incomingHttpHeaders['sec-websocket-protocol'];
    this.sec_websocket_version = incomingHttpHeaders['sec-websocket-version'];
    this.set_cookie = incomingHttpHeaders['set-cookie'];
    this.strict_transport_security =
      incomingHttpHeaders['strict-transport-security'];
    this.tk = incomingHttpHeaders['tk'];
    this.trailer = incomingHttpHeaders['trailer'];
    this.transfer_encoding = incomingHttpHeaders['transfer-encoding'];
    this.upgrade = incomingHttpHeaders['upgrade'];
    this.user_agent = incomingHttpHeaders['user-agent'];
    this.vary = incomingHttpHeaders['vary'];
    this.via = incomingHttpHeaders['via'];
    this.warning = incomingHttpHeaders['warning'];
    this.www_authenticate = incomingHttpHeaders['www-authenticate'];
  }
}

export const HeadersSchema = SchemaFactory.createForClass(Headers);
