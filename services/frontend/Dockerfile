FROM node:20.18.0-alpine

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app

COPY --chown=appuser:appuser . .

USER appuser

CMD ["npm", "run", "dev"]
