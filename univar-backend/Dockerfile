FROM node:23-alpine

LABEL org.opencontainers.image.title="univar-backend"

LABEL org.opencontainers.image.description="Contain the runtime environment and scripts for univar-backend"

LABEL org.opencontainers.image.source="https://github.com/kensung-lab/univar-frontend-i.git"

WORKDIR /usr/src/app 

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV PATH=$PATH:/home/node/.npm-global/bin

RUN chown -R node:node /usr/src/app

USER node

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod --ignore-scripts
# RUN pnpm install

COPY --chown=node:node dist ./

ENV NODE_ENV=production

EXPOSE 8080

CMD [ "node", "main.js" ]