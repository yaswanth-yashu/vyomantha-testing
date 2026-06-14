#!/bin/bash

# Exit immediately if any command fails
set -e

if [ -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo "Bench already exists, starting bench..."
    cd frappe-bench
    # Restore Procfile web service to default (no host arguments, only port)
    sed -i 's/bench serve.*/bench serve --port 8000/g' ./Procfile
    bench start
    exit 0
fi

echo "Creating new bench..."

# Wait for MariaDB to be fully ready
echo "Waiting for MariaDB database to be ready..."
python3 -c "
import socket
import time
while True:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            s.connect(('mariadb', 3306))
            print('MariaDB is up!')
            break
    except Exception:
        print('Waiting for MariaDB to start...')
        time.sleep(2)
"

export PATH="${NVM_DIR}/versions/node/v${NODE_VERSION_DEVELOP}/bin/:${PATH}"

# Initialize the main bench framework
bench init --skip-redis-config-generation frappe-bench

cd frappe-bench

# Use containers instead of localhost for services
bench set-mariadb-host mariadb
bench set-redis-cache-host redis://redis:6379
bench set-redis-queue-host redis://redis:6379
bench set-redis-socketio-host redis://redis:6379

# Set global configuration rules (applicable to all sites)
bench set-config -g allow_cors "http://localhost:3000"
bench set-config -g ignore_csrf 1

# Remove redis and watch from Procfile since Docker handles them separately
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

# Keep default bench serve --port 8000 (no host modification needed)

# --- HEADLESS APP INSTALLATION (No Frontend Node Modules/Assets) ---

echo "Cloning and registering 'payments' app (headless)..."
git clone https://github.com/frappe/payments.git apps/payments --depth 1
rm -f apps/payments/package.json
./env/bin/pip install -e ./apps/payments

echo "Cloning and registering 'lms' app (headless)..."
git clone https://github.com/frappe/lms.git apps/lms --depth 1
# Remove package.json and frontend folder to completely bypass Vue/yarn installations
rm -rf apps/lms/frontend apps/lms/package.json
./env/bin/pip install -e ./apps/lms

# Re-write sites/apps.txt cleanly with proper newlines so they don't concatenate
printf "frappe\npayments\nlms\n" > sites/apps.txt

# --- DATABASE SETUP ---

bench new-site lms.localhost \
--force \
--mariadb-root-password 123 \
--admin-password admin \
--no-mariadb-socket

bench --site lms.localhost install-app payments
bench --site lms.localhost install-app lms
bench --site lms.localhost set-config developer_mode 1
bench --site lms.localhost set-config allow_cors "http://localhost:3000"
bench --site lms.localhost clear-cache
bench use lms.localhost

# Start the headless backend server
bench start
