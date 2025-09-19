const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
//const mongoURL = 'mongodb://localhost:27017/voting' // Replace 'mydatabase' with your database name
const mongoURL = 'mongodb+srv://raniyajaved4:QWERTY2025@voting.gm5etfp.mongodb.net/'

// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Define event listeners for database connection

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;