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

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
});

app.listen(env.port, () => {
  console.log(`🚀 Servidor rodando na porta ${env.port}`);
  console.log(`📝 Ambiente: ${env.nodeEnv}`);
});

export default app;

