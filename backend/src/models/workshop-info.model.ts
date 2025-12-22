import pool from '../config/database';

export interface WorkshopInfo {
  id: number;
  name: string;
  trade_name?: string | null;
  cnpj?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zipcode?: string | null;
  logo_path?: string | null;
  logo_base64?: string | null;
  notes?: string | null;
  terms_and_conditions?: string | null;
  footer_text?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export class WorkshopInfoModel {
  static async ensureTableExists(): Promise<void> {
    try {
      // Verificar se a tabela existe
      const checkTable = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'workshop_info'
        );
      `);

      if (!checkTable.rows[0].exists) {
        console.log('Tabela workshop_info não existe. Criando automaticamente...');
        
        // Criar a tabela
        await pool.query(`
          CREATE TABLE workshop_info (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            trade_name VARCHAR(255),
            cnpj VARCHAR(18),
            state_registration VARCHAR(50),
            municipal_registration VARCHAR(50),
            phone VARCHAR(20),
            email VARCHAR(255),
            website VARCHAR(255),
            address_street VARCHAR(255),
            address_number VARCHAR(20),
            address_complement VARCHAR(100),
            address_neighborhood VARCHAR(100),
            address_city VARCHAR(100),
            address_state VARCHAR(2),
            address_zipcode VARCHAR(10),
            logo_path VARCHAR(500),
            logo_base64 TEXT,
            notes TEXT,
            terms_and_conditions TEXT,
            footer_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_workshop_info CHECK (id = 1)
          );
        `);

        // Adicionar constraint UNIQUE no id
        await pool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'workshop_info_id_key'
            ) THEN
              ALTER TABLE workshop_info ADD CONSTRAINT workshop_info_id_key UNIQUE (id);
            END IF;
          END $$;
        `);

        // Inserir registro padrão
        await pool.query(`
          INSERT INTO workshop_info (
            id, name, trade_name, footer_text
          ) VALUES (
            1,
            'Oficina Mecânica',
            'Oficina Mecânica',
            'Este documento foi gerado automaticamente pelo sistema de gestão.'
          ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
        `);

        console.log('✅ Tabela workshop_info criada automaticamente!');
      }
    } catch (error: any) {
      console.error('Erro ao criar tabela workshop_info:', error);
      throw error;
    }
  }

  static async find(): Promise<WorkshopInfo | null> {
    // Garantir que a tabela existe antes de buscar
    await this.ensureTableExists();
    
    const result = await pool.query(
      'SELECT * FROM workshop_info WHERE id = 1 LIMIT 1'
    );
    return result.rows[0] || null;
  }

  static async update(data: Partial<Omit<WorkshopInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<WorkshopInfo> {
    // Garantir que a tabela existe antes de atualizar
    await this.ensureTableExists();
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'name',
      'trade_name',
      'cnpj',
      'state_registration',
      'municipal_registration',
      'phone',
      'email',
      'website',
      'address_street',
      'address_number',
      'address_complement',
      'address_neighborhood',
      'address_city',
      'address_state',
      'address_zipcode',
      'logo_path',
      'logo_base64',
      'notes',
      'terms_and_conditions',
      'footer_text',
    ];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.find() as Promise<WorkshopInfo>;
    }

    // Sempre atualizar o registro com id = 1
    values.push(1);
    const result = await pool.query(
      `UPDATE workshop_info 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      // Se não existe, criar
      return this.create(data);
    }

    return result.rows[0];
  }

  static async create(data: Partial<Omit<WorkshopInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<WorkshopInfo> {
    // Garantir que a tabela existe antes de criar
    await this.ensureTableExists();
    
    const result = await pool.query(
      `INSERT INTO workshop_info (
        id, name, trade_name, cnpj, state_registration, municipal_registration,
        phone, email, website, address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state, address_zipcode,
        logo_path, logo_base64, notes, terms_and_conditions, footer_text
      ) VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING *`,
      [
        data.name || 'Oficina Mecânica',
        data.trade_name || null,
        data.cnpj || null,
        data.state_registration || null,
        data.municipal_registration || null,
        data.phone || null,
        data.email || null,
        data.website || null,
        data.address_street || null,
        data.address_number || null,
        data.address_complement || null,
        data.address_neighborhood || null,
        data.address_city || null,
        data.address_state || null,
        data.address_zipcode || null,
        data.logo_path || null,
        data.logo_base64 || null,
        data.notes || null,
        data.terms_and_conditions || null,
        data.footer_text || null,
      ]
    );
    return result.rows[0];
  }
}
