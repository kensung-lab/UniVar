import { ExecutionContext } from '@nestjs/common';
import * as client from 'openid-client';

export const buildOpenIdClient = async () => {
  return await client.discovery(
    new URL(
      `${process.env.KEYCLOAK_AUTH_SERVER_URL}/.well-known/openid-configuration`,
    ),
    process.env.KEYCLOAK_CLIENT_ID,
    undefined,
    client.ClientSecretPost(process.env.KEYCLOAK_CLIENT_SECRET),
    {
      execute: [client.allowInsecureRequests],
    },
  );
};

export const extractRequest = (context: ExecutionContext): [any, any] => {
  let request: any, response: any;

  // Check if request is coming from graphql or http
  if (context.getType() === 'http') {
    // http request
    const httpContext = context.switchToHttp();

    request = httpContext.getRequest();
    response = httpContext.getResponse();
  }

  return [request, response];
};
