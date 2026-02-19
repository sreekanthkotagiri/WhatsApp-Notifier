import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL (or DB_URL) is required for database connection');
  }
  const dbSsl = toBoolean(process.env.DB_SSL, false);
  const dbSynchronize = toBoolean(process.env.DB_SYNCHRONIZE, false);
  const dbLogging = toBoolean(process.env.DB_LOGGING, false);

  return {
    type: 'postgres',
    url: databaseUrl,
    synchronize: dbSynchronize,
    logging: dbLogging,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: toBoolean(process.env.DB_MIGRATIONS_RUN, false),
    ...(dbSsl
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  };
};
