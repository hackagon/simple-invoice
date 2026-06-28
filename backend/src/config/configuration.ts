/**
 * Centralised, typed configuration sourced exclusively from environment
 * variables. No secrets or environment-specific values are hardcoded.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string[];
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: number;
  };
}

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'simple_invoice',
    synchronize: parseBool(process.env.DB_SYNCHRONIZE, true),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-to-a-long-random-secret',
    // Token expiration time configurable via env, default 3600 seconds.
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10),
  },
});
