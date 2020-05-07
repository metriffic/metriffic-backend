#!/usr/bin/env bash
rm metriffic-backend.sqlite
touch metriffic-backend.sqlite
node_modules/.bin/sequelize db:migrate
