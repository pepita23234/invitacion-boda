import { Pool, QueryResult, QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL connection.");
  }

  const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);

  pool = new Pool({
    connectionString,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
    max: 5,
  });

  return pool;
}

export async function ensureSchema() {
  if (schemaReady) return;

  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id BIGSERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      invitation_type VARCHAR(20) NOT NULL DEFAULT 'individual',
      partner_name VARCHAR(255) NULL,
      seats INT NOT NULL DEFAULT 1,
      rsvp VARCHAR(20) NOT NULL DEFAULT 'pending',
      attendees INT NOT NULL DEFAULT 0,
      responded_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_guests_full_name UNIQUE (full_name),
      CONSTRAINT uq_guests_slug UNIQUE (slug)
    )
  `);

  await p.query(`CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests (slug)`);

  schemaReady = true;
}

export async function dbQuery<T extends QueryResultRow = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<[T[], QueryResult<T>]> {
  await ensureSchema();
  const p = getPool();
  const result = await p.query<T>(sql, params);
  return [result.rows, result];
}

