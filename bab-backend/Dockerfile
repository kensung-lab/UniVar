FROM node:18-alpine

LABEL org.opencontainers.image.title="bab-backend"

LABEL org.opencontainers.image.description="Contain the runtime enviornment and scripts for bab-backend"

LABEL org.opencontainers.image.source="https://github.com/hkgi-bioinformatics/bab-backend.git"

WORKDIR /usr/src/app 

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV PATH=$PATH:/home/node/.npm-global/bin

RUN chown -R node:node /usr/src/app

USER node

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

# RUN pnpm install --prod --ignore-scripts
RUN pnpm install

COPY --chown=node:node dist ./

ENV NODE_ENV production

# Create necessary directories and set ownership
RUN mkdir -p /usr/src/app/upload_data && chown -R node:node /usr/src/app/upload_data && chmod -R 777 /usr/src/app/upload_data
RUN mkdir -p /usr/src/app/upload_data/123 && chown -R node:node /usr/src/app/upload_data/123 && chmod -R 777 /usr/src/app/upload_data/123

EXPOSE 8081

CMD [ "node", "main.js" ]