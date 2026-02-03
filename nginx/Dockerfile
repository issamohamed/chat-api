FROM nginx:alpine

# Remove the default "Welcome to Nginx" config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config as a TEMPLATE (not the final config yet)
COPY nginx.conf /etc/nginx/nginx.conf.template

# At container startup:
# 1. envsubst reads the template and replaces ${API_HOST} and ${API_PORT}
#    with real values from environment variables
# 2. Writes the result to the real Nginx config path
# 3. Starts Nginx in the foreground (required for Docker — containers exit
#    when their main process exits, so Nginx can't daemonize)
CMD ["/bin/sh", "-c", "envsubst '${API_HOST} ${API_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]