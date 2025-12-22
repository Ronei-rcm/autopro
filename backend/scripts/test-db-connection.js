const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mec_poa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
};

console.log('Testando conexão com banco de dados...');
console.log('Configuração:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password ? '***' : 'não definida',
});

const pool = new Pool(config);

pool.query('SELECT NOW() as current_time, version() as pg_version')
  .then((result) => {
    console.log('✅ Conexão bem-sucedida!');
    console.log('Hora do servidor:', result.rows[0].current_time);
    console.log('Versão PostgreSQL:', result.rows[0].pg_version.split(',')[0]);
    
    // Testar se a tabela users existe
    return pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')");
  })
  .then((result) => {
    if (result.rows[0].exists) {
      console.log('✅ Tabela "users" existe');
    } else {
      console.log('⚠️  Tabela "users" não existe');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Código do erro:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solução: O PostgreSQL não está rodando ou não está acessível.');
      console.error('   Verifique se o banco está rodando na porta', config.port);
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Solução: Host do banco não encontrado.');
      console.error('   Verifique a variável DB_HOST:', config.host);
    } else if (error.code === '28P01') {
      console.error('\n💡 Solução: Credenciais inválidas.');
      console.error('   Verifique DB_USER e DB_PASSWORD');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solução: Banco de dados não existe.');
      console.error('   Crie o banco:', config.database);
    }
    
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
