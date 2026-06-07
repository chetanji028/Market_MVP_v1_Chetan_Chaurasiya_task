const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = async () => {
    const options = { useNewUrlParser: true, useUnifiedTopology: true };

    if (!MONGO_URI) {
        console.warn('MONGO_URI is not set. Database features will be unavailable.');
        return;
    }

    try {
        await mongoose.connect(MONGO_URI, options);
        console.log('Mongoose Connected');
        return;
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
    }

    if (process.env.NODE_ENV === 'production') {
        return;
    }

    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        await mongoose.connect(memoryServer.getUri(), options);
        console.log('Mongoose Connected (in-memory fallback for development)');
    } catch (memoryError) {
        console.error(`In-memory MongoDB fallback failed: ${memoryError.message}`);
    }
};

module.exports = connectDatabase;
