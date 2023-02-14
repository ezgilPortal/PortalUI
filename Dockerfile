FROM node:14-alpine as builder
ENV NODE_ENV development

WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . .
RUN npm run build:prod


FROM nginx:1.21.0-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

ENTRYPOINT ["nginx", "-g", "daemon off;"]
