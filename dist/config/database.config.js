"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'whatsapp_automation'),
    entities: [__dirname + '/../database/entities/**/*{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', true),
    logging: configService.get('DB_LOGGING', false),
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: true,
});
exports.getDatabaseConfig = getDatabaseConfig;
