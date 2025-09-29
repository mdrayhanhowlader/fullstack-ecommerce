const mongoose = require('mongoose');
const colors = require('colors');

// Database connection configuration
const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...'.yellow);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        });

        console.log(`✅ MongoDB Atlas Connected Successfully!`.green.bold);
        console.log(`📊 Database: ${conn.connection.name}`.cyan);
        console.log(`🌐 Host: ${conn.connection.host}`.cyan);
        console.log(`📡 Port: ${conn.connection.port}`.cyan);
        console.log(`🔗 Connection State: ${getConnectionState(conn.connection.readyState)}`.cyan);

    } catch (error) {
        console.error('❌ MongoDB Atlas Connection Error:'.red.bold);
        console.error(error.message.red);
        
        // Enhanced error handling
        if (error.message.includes('authentication failed')) {
            console.error('🔑 Authentication Error: Check your username and password'.red);
        } else if (error.message.includes('network')) {
            console.error('🌐 Network Error: Check your internet connection'.red);
        } else if (error.message.includes('timeout')) {
            console.error('⏰ Timeout Error: Database connection timed out'.red);
        }
        
        process.exit(1);
    }
};

// Get readable connection state
const getConnectionState = (state) => {
    const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    return states[state] || 'Unknown';
};

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB Atlas'.green);
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose connection error: ${err}`.red);
});

mongoose.connection.on('disconnected', () => {
    console.log('📡 Mongoose disconnected from MongoDB Atlas'.yellow);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB Atlas connection closed through app termination'.yellow);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during MongoDB disconnection:'.red, error);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:'.red.bold, error);
    await mongoose.connection.close();
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
    console.error('💥 Unhandled Promise Rejection:'.red.bold, error);
    await mongoose.connection.close();
    process.exit(1);
});

// Database health check
const checkDatabaseHealth = async () => {
    try {
        await mongoose.connection.db.admin().ping();
        return {
            status: 'healthy',
            message: 'Database is responding',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Get database statistics
const getDatabaseStats = async () => {
    try {
        const stats = await mongoose.connection.db.stats();
        return {
            database: mongoose.connection.name,
            collections: stats.collections,
            dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
            storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
            indexes: stats.indexes,
            objects: stats.objects
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
};

module.exports = {
    connectDB,
    checkDatabaseHealth,
    getDatabaseStats
};