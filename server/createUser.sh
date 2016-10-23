#!/bin/bash

psql -c "CREATE USER knp PASSWORD 'fsatqe95oo2'"
psql -c "GRANT ALL PRIVILEGES ON DATABASE knp_praha TO knp"
psql -d 'knp_praha' -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO knp"

