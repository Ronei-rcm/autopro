"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTemplateModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class OrderTemplateModel {
    static async findAll(activeOnly = false) {
        let query = `
      SELECT t.*
      FROM order_templates t
      WHERE 1=1
    `;
        const params = [];
        if (activeOnly) {
            query += ` AND t.active = true`;
        }
        query += ` ORDER BY t.name ASC`;
        const result = await database_1.default.query(query, params);
        const templates = result.rows;
        // Buscar itens para cada template
        const templatesWithItems = await Promise.all(templates.map(async (template) => {
            const itemsResult = await database_1.default.query(`SELECT ti.*, p.name as product_name, p.code as product_code, lt.name as labor_name
           FROM order_template_items ti
           LEFT JOIN products p ON ti.product_id = p.id
           LEFT JOIN labor_types lt ON ti.labor_id = lt.id
           WHERE ti.template_id = $1
           ORDER BY ti.sort_order ASC, ti.id ASC`, [template.id]);
            return {
                ...template,
                items: itemsResult.rows,
            };
        }));
        return templatesWithItems;
    }
    static async findById(id, includeItems = true) {
        const result = await database_1.default.query('SELECT * FROM order_templates WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const template = result.rows[0];
        if (includeItems) {
            const itemsResult = await database_1.default.query(`SELECT ti.*, p.name as product_name, p.code as product_code, lt.name as labor_name
         FROM order_template_items ti
         LEFT JOIN products p ON ti.product_id = p.id
         LEFT JOIN labor_types lt ON ti.labor_id = lt.id
         WHERE ti.template_id = $1
         ORDER BY ti.sort_order ASC, ti.id ASC`, [id]);
            return {
                ...template,
                items: itemsResult.rows,
            };
        }
        return template;
    }
    static async create(data, items) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Criar template
            const templateResult = await client.query(`INSERT INTO order_templates (name, description, category, active, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`, [data.name, data.description || null, data.category || null, data.active !== undefined ? data.active : true, data.created_by || null]);
            const template = templateResult.rows[0];
            // Criar itens se fornecidos
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    await client.query(`INSERT INTO order_template_items (template_id, product_id, labor_id, description, quantity, unit_price, item_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                        template.id,
                        item.product_id || null,
                        item.labor_id || null,
                        item.description,
                        item.quantity,
                        item.unit_price,
                        item.item_type,
                        item.sort_order || i,
                    ]);
                }
            }
            await client.query('COMMIT');
            // Retornar template com itens
            return this.findById(template.id);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    static async update(id, data, items) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const fields = [];
            const values = [];
            let paramCount = 1;
            const allowedFields = ['name', 'description', 'category', 'active'];
            allowedFields.forEach((field) => {
                if (data[field] !== undefined) {
                    fields.push(`${field} = $${paramCount}`);
                    values.push(data[field]);
                    paramCount++;
                }
            });
            if (fields.length > 0) {
                values.push(id);
                await client.query(`UPDATE order_templates SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`, values);
            }
            // Se items foram fornecidos, substituir todos os itens
            if (items !== undefined) {
                // Deletar itens existentes
                await client.query('DELETE FROM order_template_items WHERE template_id = $1', [id]);
                // Criar novos itens
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    await client.query(`INSERT INTO order_template_items (template_id, product_id, labor_id, description, quantity, unit_price, item_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                        id,
                        item.product_id || null,
                        item.labor_id || null,
                        item.description,
                        item.quantity,
                        item.unit_price,
                        item.item_type,
                        item.sort_order || i,
                    ]);
                }
            }
            await client.query('COMMIT');
            return this.findById(id);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM order_templates WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.OrderTemplateModel = OrderTemplateModel;
//# sourceMappingURL=order-template.model.js.map