"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.userId = decoded.userId;
        req.userProfile = decoded.profile;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedProfiles) => {
    return (req, res, next) => {
        if (!req.userProfile) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        if (!allowedProfiles.includes(req.userProfile)) {
            res.status(403).json({ error: 'Acesso negado' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map