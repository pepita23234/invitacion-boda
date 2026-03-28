const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

let pool;

function getMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "invitacion_boda",
  };
}

async function ensureDatabaseExists(config) {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  const [executedRows] = await query("SELECT name FROM schema_migrations");
  const executed = new Set(executedRows.map((row) => row.name));

  const migrationsDir = path.join(__dirname, "..", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    if (executed.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await query(sql);
    await query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
    console.log(`Migracion aplicada: ${file}`);
  }
}

async function connectDB() {
  const config = getMysqlConfig();

  await ensureDatabaseExists(config);

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });

  await query("SELECT 1");
  await runMigrations();
  console.log(`Conexion a MySQL establecida en ${config.host}:${config.port}/${config.database}`);
}

function getPool() {
  if (!pool) {
    throw new Error("La conexion MySQL no ha sido inicializada.");
  }
  return pool;
}

async function query(sql, params = []) {
  return getPool().query(sql, params);
}

module.exports = {
  connectDB,
  query,
};
