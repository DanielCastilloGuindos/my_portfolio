// packages/db/src/libsql.ts

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const getDbUrl = () => {
  // Production: Turso remote URL
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }
  // Local development: SQLite file
  return { url: 'file:./local.db' };
};

export const client = createClient(getDbUrl());
export const db = drizzle(client, { schema });

export type DbSchema = typeof schema;
