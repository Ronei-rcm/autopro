import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'), // Porta padrão 5433 para Docker
  database: process.env.DB_NAME || 'mec_poa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentado para 10 segundos
  // Configurações adicionais para melhor diagnóstico
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Log de configuração (sem senha) para debug
if (process.env.NODE_ENV === 'development') {
  console.log('Database config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    // password: '***' // Não logar senha
  });
}

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

