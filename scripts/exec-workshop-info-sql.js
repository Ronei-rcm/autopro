#!/usr/bin/env node

/**
 * Script Node.js para executar a migration workshop_info diretamente
 * Uso: node scripts/exec-workshop-info-sql.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mec_poa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(config);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Executando migration da tabela workshop_info...');
    console.log(`📊 Conectado ao banco: ${config.user}@${config.host}:${config.port}/${config.database}`);
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../backend/migrations/008_add_workshop_info.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration executada com sucesso!');
    console.log('🔄 Recarregue a página /informacoes-oficina no navegador.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migration:', error.message);
    
    if (error.code === '42P01') {
      console.error('💡 A tabela já existe ou há um problema com o SQL.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Não foi possível conectar ao banco de dados.');
      console.error('💡 Verifique as configurações em backend/.env');
    } else {
      console.error('💡 Detalhes:', error);
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
