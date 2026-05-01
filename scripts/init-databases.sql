-- ============================================
-- Initialize separate databases per microservice
-- ============================================
-- This script runs automatically when the PostgreSQL
-- container starts for the first time.

CREATE DATABASE ecommerce_users;
CREATE DATABASE ecommerce_products;
CREATE DATABASE ecommerce_orders;
CREATE DATABASE ecommerce_payments;

-- Grant privileges to the default user
GRANT ALL PRIVILEGES ON DATABASE ecommerce_users TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_products TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_orders TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_payments TO ecommerce;
