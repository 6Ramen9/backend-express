const { Pool } = require('pg');

const pool = new Pool({
    user: "node_dev",
    host: "localhost",
    database: "obs_management_db",
    password: "demo",
    port: 5432
});

module.exports = pool;