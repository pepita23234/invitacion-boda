import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;
let schemaReady = false;

function getConfig() {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "invitacion_boda",
  };
}

export function getPool() {
  if (pool) {
    return pool;
  }

  const cfg = getConfig();
  pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      invitation_type ENUM('individual', 'pareja', 'cupos') NOT NULL DEFAULT 'individual',
      partner_name VARCHAR(255) NULL,
      seats INT NOT NULL DEFAULT 1,
      rsvp ENUM('pending', 'confirmed', 'declined') NOT NULL DEFAULT 'pending',
      attendees INT NOT NULL DEFAULT 0,
      responded_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT uq_guests_full_name UNIQUE (full_name),
      CONSTRAINT uq_guests_slug UNIQUE (slug),
      INDEX idx_guests_slug (slug)
    ) ENGINE=InnoDB
  `);

  schemaReady = true;
}

export async function dbQuery(sql: string, params: unknown[] = []) {
  await ensureSchema();
  const p = getPool();
  return p.query(sql, params);
}
