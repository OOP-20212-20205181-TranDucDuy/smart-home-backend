export const configDb = () => {
    const dbConfig = {
      development: {
        type: process.env.DATABASE_TYPE || 'postgres',
        host: process.env.DATABASE_HOST || 'db',
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '123456789',
        database: process.env.DATABASE_NAME || 'postgres',
        port: process.env.DATABASE_PORT || 6000,
        synchronize: true,
        autoLoadEntities: true,
      },
      production: {
        type: process.env.DATABASE_TYPE || 'postgres',
        host: process.env.DATABASE_HOST || 'db',
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '123456789',
        database: process.env.DATABASE_NAME || 'postgres',
        port: process.env.DATABASE_PORT || 6000,
        synchronize: false,
        autoLoadEntities: true,
      },
    };
  
    const environment = process.env.ENV || 'development';
  
    return dbConfig[environment];
  };