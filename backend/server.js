// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const path = require('path');
// const colors = require('colors');

// // Load environment variables
// require('dotenv').config();

// // Import database connection
// const { connectDB, checkDatabaseHealth } = require('./config/database');

// // Import routes
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/products');
// const orderRoutes = require('./routes/orders');
// const customerRoutes = require('./routes/customers');
// const dashboardRoutes = require('./routes/dashboard');

// // Import middleware
// const errorHandler = require('./middleware/errorHandler');
// const notFound = require('./middleware/notFound');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Trust proxy (for deployment)
// app.set('trust proxy', 1);

// // ===================================
// // SECURITY MIDDLEWARE
// // ===================================

// // Set security headers
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             defaultSrc: ["'self'"],
//             styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
//             scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
//             imgSrc: ["'self'", "data:", "https:"],
//         },
//     },
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // extra code 
// // backend/middleware/notFound.js
// const notFound = (req, res, next) => {
//     const error = new Error(`Not Found - ${req.originalUrl}`);
//     res.status(404);
//     next(error);
//   };
  
//   module.exports = notFound;
// // backend/middleware/errorHandler.js
// const errorHandler = (err, req, res, next) => {
//     const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//     res.status(statusCode);
  
//     res.json({
//       message: err.message,
//       stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//     });
//   };
  
//   module.exports = errorHandler;
    

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP
//     message: {
//         error: 'Too many requests from this IP, please try again later.',
//         retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use('/api/', limiter);

// // CORS configuration
// const corsOptions = {
//     origin: function (origin, callback) {
//         const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
//         if (process.env.NODE_ENV === 'development') {
//             return callback(null, true);
//         }
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// };
// app.use(cors(corsOptions));

// // ===================================
// // PARSING MIDDLEWARE
// // ===================================

// // Body parsing middleware with limits
// app.use(express.json({ 
//     limit: '10mb',
//     verify: (req, res, buf) => {
//         req.rawBody = buf;
//     }
// }));
// app.use(express.urlencoded({ 
//     extended: true, 
//     limit: '10mb',
//     parameterLimit: 50
// }));

// // Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// // Data sanitization against XSS
// app.use(xss());

// // ===================================
// // PERFORMANCE MIDDLEWARE
// // ===================================

// // Compression middleware
// app.use(compression({
//     level: 6,
//     threshold: 1024,
//     filter: (req, res) => {
//         if (req.headers['x-no-compression']) {
//             return false;
//         }
//         return compression.filter(req, res);
//     }
// }));

// // ===================================
// // LOGGING MIDDLEWARE
// // ===================================

// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('combined'));
// } else {
//     app.use(morgan('common'));
// }

// // ===================================
// // STATIC FILES
// // ===================================

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//     maxAge: '7d',
//     etag: true,
//     lastModified: true,
//     setHeaders: (res, filePath) => {
//         if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
//             res.setHeader('Cache-Control', 'public, max-age=604800');
//         }
//     }
// }));

// // Serve frontend
// app.use('/frontend', express.static(path.join(__dirname, '../frontend'), {
//     maxAge: '1d',
//     etag: true
// }));

// // ===================================
// // HEALTH CHECK ENDPOINTS
// // ===================================

// // Basic health check
// app.get('/health', (req, res) => {
//     res.status(200).json({
//         status: 'OK',
//         message: 'Server is running',
//         timestamp: new Date().toISOString(),
//         uptime: `${Math.floor(process.uptime())} seconds`,
//         memory: {
//             used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
//             total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
//         }
//     });
// });

// // Database health check
// app.get('/api/health/database', async (req, res) => {
//     try {
//         const dbHealth = await checkDatabaseHealth();
//         res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
//             database: dbHealth,
//             connection: {
//                 state: mongoose.connection.readyState,
//                 host: mongoose.connection.host,
//                 name: mongoose.connection.name
//             }
//         });
//     } catch (error) {
//         res.status(503).json({
//             database: {
//                 status: 'error',
//                 message: error.message,
//                 timestamp: new Date().toISOString()
//             }
//         });
//     }
// });

// // API info endpoint
// app.get('/api', (req, res) => {
//     res.status(200).json({
//         name: 'Ecommerce Dashboard API',
//         version: '1.0.0',
//         description: 'Complete ecommerce dashboard backend with MongoDB Atlas',
//         endpoints: {
//             auth: '/api/auth',
//             products: '/api/products',
//             orders: '/api/orders',
//             customers: '/api/customers',
//             dashboard: '/api/dashboard'
//         },
//         documentation: '/api/docs',
//         health: '/api/health/database'
//     });
// });

// // ===================================
// // API ROUTES
// // ===================================

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/customers', customerRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// // ===================================
// // FRONTEND ROUTE
// // ===================================

// // Serve main frontend file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// // ===================================
// // ERROR HANDLING
// // ===================================

// // 404 handler
// app.use(notFound);

// // Global error handler
// app.use(errorHandler);

// // ===================================
// // SERVER STARTUP
// // ===================================

// const startServer = async () => {
//     try {
//         // Connect to database
//         await connectDB();
        
//         // Start server
//         const server = app.listen(PORT, () => {
//             console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold);
//             console.log(`🌐 Frontend: http://localhost:${PORT}`.cyan);
//             console.log(`🔧 API: http://localhost:${PORT}/api`.cyan);
//             console.log(`💊 Health Check: http://localhost:${PORT}/health`.cyan);
//             console.log(`📊 Database Health: http://localhost:${PORT}/api/health/database`.cyan);
//         });

//         // Handle server shutdown gracefully
//         const gracefulShutdown = (signal) => {
//             console.log(`\n🛑 ${signal} received. Shutting down gracefully...`.yellow);
            
//             server.close(async () => {
//                 console.log('🔒 HTTP server closed.'.yellow);
                
//                 try {
//                     await mongoose.connection.close();
//                     console.log('📊 Database connection closed.'.yellow);
//                     process.exit(0);
//                 } catch (error) {
//                     console.error('❌ Error during shutdown:'.red, error);
//                     process.exit(1);
//                 }
//             });

//             // Force close after 30 seconds
//             setTimeout(() => {
//                 console.error('⏰ Could not close connections in time, forcefully shutting down'.red);
//                 process.exit(1);
//             }, 30000);
//         };

//         // Listen for shutdown signals
//         process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//         process.on('SIGINT', () => gracefulShutdown('SIGINT'));

//     } catch (error) {
//         console.error('❌ Failed to start server:'.red.bold, error);
//         process.exit(1);
//     }
// };

// // Start the server
// startServer();

// module.exports = app;



const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// JSON parsing middleware
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

// Schema & Model
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// POST route
app.post('/api', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ status: 'Error', message: 'All fields required' });
    }

    const saved = await Message.create({ name, email, message });
    console.log('Saved to DB:', saved);
    res.status(201).json({ status: 'OK', message: 'Data saved', data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error', message: 'Server error' });
  }
});

// Simple GET route
app.get('/', (req, res) => {
  res.send('🚀 Server is running...');
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
};

startServer();
