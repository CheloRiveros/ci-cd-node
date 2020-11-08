#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
npx sequelize-cli db:migrate

# Start server
echo "Starting server"
npm start