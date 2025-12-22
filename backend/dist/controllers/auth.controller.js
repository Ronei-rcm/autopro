"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidation = exports.loginValidation = exports.AuthController = void 0;
const user_model_1 = require("../models/user.model");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const express_validator_1 = require("express-validator");
class AuthController {
    static async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email e senha são obrigatórios' });
                return;
            }
            // Buscar usuário com hash da senha
            let userWithPassword;
            try {
                userWithPassword = await user_model_1.UserModel.findByEmailWithPassword(email);
            }
            catch (dbError) {
                console.error('Database error in findByEmailWithPassword:', dbError);
                if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND' || dbError.code === 'ETIMEDOUT') {
                    res.status(500).json({
                        error: 'Erro de conexão com o banco de dados',
                        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
                    });
                    return;
                }
                throw dbError;
            }
            if (!userWithPassword) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }
            // Verificar se usuário está ativo
            let user;
            try {
                user = await user_model_1.UserModel.findById(userWithPassword.id);
            }
            catch (dbError) {
                console.error('Database error in findById:', dbError);
                throw dbError;
            }
            if (!user || !user.active) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }
            const passwordHash = userWithPassword.password_hash;
            if (!passwordHash) {
                console.error('Password hash is null for user:', user.id);
                res.status(500).json({ error: 'Erro ao processar login' });
                return;
            }
            let isValid;
            try {
                isValid = await (0, password_1.comparePassword)(password, passwordHash);
            }
            catch (passwordError) {
                console.error('Password comparison error:', passwordError);
                res.status(500).json({ error: 'Erro ao verificar senha' });
                return;
            }
            if (!isValid) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }
            let token;
            try {
                token = (0, jwt_1.generateToken)({
                    userId: user.id,
                    profile: user.profile,
                });
            }
            catch (tokenError) {
                console.error('Token generation error:', tokenError);
                res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
                return;
            }
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profile: user.profile,
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            console.error('Error stack:', error.stack);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            // Verificar tipo de erro específico
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                res.status(500).json({
                    error: 'Erro de conexão com o banco de dados. Verifique se o banco está rodando.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            else if (error.code === '23505') { // Unique violation
                res.status(500).json({
                    error: 'Erro ao processar login',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            else if (error.message?.includes('JWT_SECRET')) {
                res.status(500).json({
                    error: 'Erro de configuração do servidor',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            else {
                res.status(500).json({
                    error: 'Erro ao fazer login',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }
    }
    static async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password, name, profile } = req.body;
            const existingUser = await user_model_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }
            const passwordHash = await (0, password_1.hashPassword)(password);
            const user = await user_model_1.UserModel.create(email, passwordHash, name, profile);
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                profile: user.profile,
            });
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profile: user.profile,
                },
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }
    static async me(req, res) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const user = await user_model_1.UserModel.findById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            console.error('Me error:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
}
exports.AuthController = AuthController;
// Validações
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Senha é obrigatória'),
];
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter no mínimo 6 caracteres'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('profile')
        .isIn(['admin', 'mechanic', 'financial', 'attendant'])
        .withMessage('Perfil inválido'),
];
//# sourceMappingURL=auth.controller.js.map