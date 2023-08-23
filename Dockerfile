FROM node:16.14.2-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY . ./
RUN npm install && npm run build:prod && npm prune --production

FROM nginx:stable-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

# Static build
COPY --from=builder /app/build /usr/share/nginx/html/

# Copy font files to root folder
WORKDIR /usr/share/nginx/html
COPY ./public/Poppins.ttf .

# Default port exposure
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/env-config
COPY ./env.sh .
COPY env.list .

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/sh", "-c", "/usr/env-config/env.sh && nginx -g \"daemon off;\""] 