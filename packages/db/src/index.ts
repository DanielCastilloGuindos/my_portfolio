// packages/db/src/index.ts

export { client, db } from './libsql';
export type { DbSchema } from './libsql';
export * from './schema';
export { DrizzlePortfolioRepository } from './repositories/portfolio-repository.impl';
