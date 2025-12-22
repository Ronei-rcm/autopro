"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
async function seed() {
    try {
        console.log('🌱 Iniciando seed...');
        // Criar usuário admin padrão
        const adminPassword = await (0, password_1.hashPassword)('admin123');
        const adminEmail = 'admin@oficina.com';
        // Verificar se já existe
        const existingAdmin = await database_1.default.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (existingAdmin.rows.length === 0) {
            await database_1.default.query(`INSERT INTO users (email, password_hash, name, profile)
         VALUES ($1, $2, $3, $4)`, [adminEmail, adminPassword, 'Administrador', 'admin']);
            console.log('✅ Usuário admin criado: admin@oficina.com / admin123');
        }
        else {
            console.log('ℹ️  Usuário admin já existe');
        }
        // Criar alguns tipos de mão de obra padrão
        const laborTypes = [
            { name: 'Troca de Óleo', price: 50.00, estimated_hours: 0.5 },
            { name: 'Alinhamento e Balanceamento', price: 120.00, estimated_hours: 1.0 },
            { name: 'Revisão Completa', price: 300.00, estimated_hours: 2.0 },
            { name: 'Troca de Pastilhas', price: 150.00, estimated_hours: 1.5 },
        ];
        for (const labor of laborTypes) {
            const existing = await database_1.default.query('SELECT id FROM labor_types WHERE name = $1', [labor.name]);
            if (existing.rows.length === 0) {
                await database_1.default.query(`INSERT INTO labor_types (name, price, estimated_hours)
           VALUES ($1, $2, $3)`, [labor.name, labor.price, labor.estimated_hours]);
                console.log(`✅ Tipo de mão de obra criado: ${labor.name}`);
            }
        }
        console.log('✅ Seed concluído com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map