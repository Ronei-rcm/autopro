import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import supplierRoutes from './routes/supplier.routes';
import vehicleRoutes from './routes/vehicle.routes';
import productRoutes from './routes/product.routes';
import quoteRoutes from './routes/quote.routes';
import orderRoutes from './routes/order.routes';
import financialRoutes from './routes/financial.routes';
import appointmentRoutes from './routes/appointment.routes';
import reportRoutes from './routes/report.routes';
import laborTypeRoutes from './routes/labor-type.routes';
import categoryRoutes from './routes/category.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import warrantyRoutes from './routes/warranty.routes';
import orderTemplateRoutes from './routes/order-template.routes';
import checklistRoutes from './routes/checklist.routes';

const app = express();

// Middlewares de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado para aceitar múltiplas origens em desenvolvimento
app.use(cors({
  origin: (origin, callback) => {
    // Em desenvolvimento, aceita qualquer origem
    if (env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      // Em produção, valida apenas origens permitidas
      const allowedOrigins = env.corsOrigin.split(',').map(o => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - aumentado para evitar 429 em desenvolvimento
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests * 5, // Aumenta limite em 5x para desenvolvimento
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Não contar requisições de health check
  skip: (req) => req.path === '/health' || req.path === '/api/health',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/labor-types', laborTypeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/order-templates', orderTemplateRoutes);
app.use('/api/checklists', checklistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
});

const host = process.env.HOST || '0.0.0.0';
app.listen(env.port, host, () => {
  console.log(`🚀 Servidor rodando em http://${host}:${env.port}`);
  console.log(`📝 Ambiente: ${env.nodeEnv}`);
  console.log(`🌐 Acessível externamente: http://${host === '0.0.0.0' ? 'localhost' : host}:${env.port}`);
});

export default app;

