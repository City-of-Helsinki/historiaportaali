FROM ghcr.io/city-of-helsinki/drupal-docker-base:8.0

COPY / /var/www/html/
WORKDIR /var/www/html
RUN composer install --no-progress --profile --prefer-dist --no-interaction --no-dev --optimize-autoloader
RUN composer dump-autoload --optimize

# Copy deploy script
COPY docker/openshift/entrypoints/20-deploy.sh /entrypoints
RUN chmod +x /entrypoints/20-deploy.sh

# Copy cron scripts
RUN mkdir /crons
COPY docker/openshift/crons/ /crons
RUN chmod +x /crons/*

# Install theme packages
WORKDIR /var/www/html/public/themes/custom/hdbt_subtheme
RUN mkdir -p /var/www/html/.nvm
ENV NVM_DIR /var/www/html/.nvm
ENV NODE_VERSION 0.10.33
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default \
    && npm install
