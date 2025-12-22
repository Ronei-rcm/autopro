import pool from '../config/database';

export interface ModuleSettings {
  id: number;
  module: string;
  hidden: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ModuleSettingsModel {
  // Buscar todas as configurações de módulos
  static async findAll(): Promise<ModuleSettings[]> {
    const exists = await this.tableExists();
    if (!exists) {
      return [];
    }
    
    const result = await pool.query(
      'SELECT id, module, hidden, created_at, updated_at FROM module_settings ORDER BY module'
    );
    return result.rows;
  }

  // Verificar se a tabela existe
  static async tableExists(): Promise<boolean> {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'module_settings'
        );
      `);
      return result.rows[0]?.exists || false;
    } catch (error) {
      return false;
    }
  }

  // Buscar configuração de um módulo específico
  static async findByModule(module: string): Promise<ModuleSettings | null> {
    const exists = await this.tableExists();
    if (!exists) {
      return null;
    }
    
    const result = await pool.query(
      'SELECT id, module, hidden, created_at, updated_at FROM module_settings WHERE module = $1',
      [module]
    );
    return result.rows[0] || null;
  }

  // Buscar módulos ocultos
  static async findHiddenModules(): Promise<string[]> {
    const exists = await this.tableExists();
    if (!exists) {
      return [];
    }
    
    const result = await pool.query(
      'SELECT module FROM module_settings WHERE hidden = true'
    );
    return result.rows.map(row => row.module);
  }

  // Buscar módulos visíveis
  static async findVisibleModules(): Promise<string[]> {
    const exists = await this.tableExists();
    if (!exists) {
      // Se a tabela não existe, todos os módulos são visíveis por padrão
      // Retornar array vazio (será tratado como "todos visíveis")
      return [];
    }
    
    const result = await pool.query(
      'SELECT module FROM module_settings WHERE hidden = false'
    );
    return result.rows.map(row => row.module);
  }

  // Atualizar visibilidade de um módulo
  static async updateVisibility(module: string, hidden: boolean): Promise<void> {
    const exists = await this.tableExists();
    if (!exists) {
      throw new Error('Tabela module_settings não existe. Execute a migration 011_add_module_visibility.sql primeiro.');
    }
    
    const existing = await this.findByModule(module);
    
    if (existing) {
      // Atualizar
      await pool.query(
        'UPDATE module_settings SET hidden = $1 WHERE module = $2',
        [hidden, module]
      );
    } else {
      // Criar se não existir
      await pool.query(
        'INSERT INTO module_settings (module, hidden) VALUES ($1, $2)',
        [module, hidden]
      );
    }
  }

  // Atualizar visibilidade de múltiplos módulos
  static async updateMultipleVisibility(
    updates: Array<{ module: string; hidden: boolean }>
  ): Promise<void> {
    const exists = await this.tableExists();
    if (!exists) {
      throw new Error('Tabela module_settings não existe. Execute a migration 011_add_module_visibility.sql primeiro.');
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const update of updates) {
        const existing = await this.findByModule(update.module);
        
        if (existing) {
          await client.query(
            'UPDATE module_settings SET hidden = $1 WHERE module = $2',
            [update.hidden, update.module]
          );
        } else {
          await client.query(
            'INSERT INTO module_settings (module, hidden) VALUES ($1, $2)',
            [update.module, update.hidden]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Verificar se módulo está oculto
  static async isHidden(module: string): Promise<boolean> {
    const exists = await this.tableExists();
    if (!exists) {
      return false; // Se a tabela não existe, nenhum módulo está oculto
    }
    
    const settings = await this.findByModule(module);
    return settings?.hidden || false;
  }
}

