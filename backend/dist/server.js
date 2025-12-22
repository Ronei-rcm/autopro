"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const quote_routes_1 = __importDefault(require("./routes/quote.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const financial_routes_1 = __importDefault(require("./routes/financial.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const labor_type_routes_1 = __importDefault(require("./routes/labor-type.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const warranty_routes_1 = __importDefault(require("./routes/warranty.routes"));
const order_template_routes_1 = __importDefault(require("./routes/order-template.routes"));
const checklist_routes_1 = __importDefault(require("./routes/checklist.routes"));
const workshop_info_routes_1 = __importDefault(require("./routes/workshop-info.routes"));
const permission_routes_1 = __importDefault(require("./routes/permission.routes"));
const module_settings_routes_1 = __importDefault(require("./routes/module-settings.routes"));
const app = (0, express_1.default)();
// Trust proxy - necessário para rate limiting funcionar corretamente com proxies/reverse proxies
app.set('trust proxy', 1);
// Middlewares de segurança
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS configurado para aceitar múltiplas origens em desenvolvimento
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Em desenvolvimento, aceita qualquer origem
        if (env_1.env.nodeEnv === 'development') {
            callback(null, true);
        }
        else {
            // Em produção, valida apenas origens permitidas
            const allowedOrigins = env_1.env.corsOrigin.split(',').map(o => o.trim());
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting - aumentado para evitar 429 em desenvolvimento
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimitWindowMs,
    max: env_1.env.rateLimitMaxRequests * 5, // Aumenta limite em 5x para desenvolvimento
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    // Não contar requisições de health check
    skip: (req) => req.path === '/health' || req.path === '/api/health',
});
app.use('/api/', limiter);
// Body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/suppliers', supplier_routes_1.default);
app.use('/api/vehicles', vehicle_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/quotes', quote_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/financial', financial_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/labor-types', labor_type_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/warranties', warranty_routes_1.default);
app.use('/api/order-templates', order_template_routes_1.default);
app.use('/api/checklists', checklist_routes_1.default);
app.use('/api/workshop-info', workshop_info_routes_1.default);
app.use('/api/permissions', permission_routes_1.default);
app.use('/api/module-settings', module_settings_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        ...(env_1.env.nodeEnv === 'development' && { stack: err.stack }),
    });
});
const host = process.env.HOST || '0.0.0.0';
app.listen(env_1.env.port, host, () => {
    console.log(`🚀 Servidor rodando em http://${host}:${env_1.env.port}`);
    console.log(`📝 Ambiente: ${env_1.env.nodeEnv}`);
    console.log(`🌐 Acessível externamente: http://${host === '0.0.0.0' ? 'localhost' : host}:${env_1.env.port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map