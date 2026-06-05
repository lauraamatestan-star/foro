FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl libzip-dev libpng-dev libpq-dev libsqlite3-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite zip gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction

COPY . .

RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && composer dump-autoload --optimize \
    && php artisan package:discover --ansi \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

# Migraciones + servidor (Render inyecta $PORT)
CMD mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && php artisan migrate --force \
    && php artisan db:seed --force \
    && php artisan storage:link 2>/dev/null || true \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
