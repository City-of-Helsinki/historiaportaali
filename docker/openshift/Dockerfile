ARG DRUPAL_DOCKER_TAG=8.2
FROM ghcr.io/city-of-helsinki/drupal-docker-base:${DRUPAL_DOCKER_TAG}

# Override upload max filesize and post max size
RUN { \
		echo 'memory_limit=512M'; \
		echo 'upload_max_filesize=64M'; \
		echo 'post_max_size=64M'; \
    echo 'max_execution_time=240'; \
	} > /etc/php81/conf.d/php-overrides.ini

COPY / /var/www/html/
WORKDIR /var/www/html
RUN composer install --no-progress --profile --prefer-dist --no-interaction --no-dev --optimize-autoloader

# Copy ALL deploy scripts
COPY docker/openshift/entrypoints/ /entrypoints
RUN chmod +x /entrypoints/*


# Copy cron scripts
RUN mkdir /crons
COPY docker/openshift/crons/ /crons
RUN chmod +x /crons/*

# Copy nginx overrides.
COPY docker/openshift/custom.locations /etc/nginx/conf.d/custom.locations
