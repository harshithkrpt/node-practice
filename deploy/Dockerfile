FROM redis:7.4-alpine

# Set the Working Directory
WORKDIR /usr/local/etc/redis

# copy custom redis config from local to the container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose the redis default port
EXPOSE 6379

# command to start the redis
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]


