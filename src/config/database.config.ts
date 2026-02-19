import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbUsername = process.env.DB_USERNAME || 'postgres';
  const dbPassword = String(process.env.DB_PASSWORD ?? 'postgres');
  const dbName = process.env.DB_NAME || 'whatsapp_automation';
  const dbSsl = toBoolean(process.env.DB_SSL, false);
  const dbSynchronize = toBoolean(process.env.DB_SYNCHRONIZE, false);
  const dbLogging = toBoolean(process.env.DB_LOGGING, false);

  return {
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
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
