"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = exports.createUserValidation = exports.UserController = void 0;
const user_model_1 = require("../models/user.model");
const password_1 = require("../utils/password");
const express_validator_1 = require("express-validator");
class UserController {
    // Listar todos os usuários (apenas admin)
    static async getAll(req, res) {
        try {
            const users = await user_model_1.UserModel.findAll();
            res.json(users);
        }
        catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    }
    // Buscar usuário por ID
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = await user_model_1.UserModel.findById(id);
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            console.error('Get user by id error:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
    // Criar novo usuário (apenas admin)
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password, name, profile } = req.body;
            // Verificar se email já existe
            const existingUser = await user_model_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }
            const passwordHash = await (0, password_1.hashPassword)(password);
            const user = await user_model_1.UserModel.create(email, passwordHash, name, profile);
            res.status(201).json(user);
        }
        catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }
    // Atualizar usuário
    static async update(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const id = parseInt(req.params.id);
            const { name, profile, active, email } = req.body;
            // Verificar se usuário existe
            const existingUser = await user_model_1.UserModel.findById(id);
            if (!existingUser) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            // Apenas admin pode alterar perfil e status ativo de outros usuários
            const isAdmin = req.userProfile === 'admin';
            const isSelfUpdate = req.userId === id;
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            // Perfil e active só podem ser alterados por admin (exceto próprio perfil)
            if (profile !== undefined) {
                if (isAdmin || isSelfUpdate) {
                    updateData.profile = profile;
                }
                else {
                    res.status(403).json({ error: 'Sem permissão para alterar perfil' });
                    return;
                }
            }
            if (active !== undefined) {
                if (isAdmin) {
                    updateData.active = active;
                }
                else {
                    res.status(403).json({ error: 'Apenas administradores podem alterar status do usuário' });
                    return;
                }
            }
            // Email não pode ser alterado
            if (email !== undefined && email !== existingUser.email) {
                res.status(400).json({ error: 'Email não pode ser alterado' });
                return;
            }
            const user = await user_model_1.UserModel.update(id, updateData);
            res.json(user);
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }
    // Deletar usuário (apenas admin, não pode deletar a si mesmo)
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            // Não pode deletar a si mesmo
            if (req.userId === id) {
                res.status(400).json({ error: 'Você não pode deletar seu próprio usuário' });
                return;
            }
            const user = await user_model_1.UserModel.findById(id);
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            // Em vez de deletar, desativar o usuário
            await user_model_1.UserModel.update(id, { active: false });
            res.json({ message: 'Usuário desativado com sucesso' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Erro ao desativar usuário' });
        }
    }
}
exports.UserController = UserController;
// Validações
exports.createUserValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter no mínimo 6 caracteres'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('profile')
        .isIn(['admin', 'mechanic', 'financial', 'attendant'])
        .withMessage('Perfil inválido'),
];
exports.updateUserValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('profile')
        .optional()
        .isIn(['admin', 'mechanic', 'financial', 'attendant'])
        .withMessage('Perfil inválido'),
    (0, express_validator_1.body)('active').optional().isBoolean().withMessage('Status deve ser boolean'),
];
//# sourceMappingURL=user.controller.js.map