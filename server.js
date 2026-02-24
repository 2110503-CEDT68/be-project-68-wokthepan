const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const dentists = require('./routes/dentists');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

const app = express();

// Body parser
app.use(express.json());

// Query parser
app.set('query parser', 'extended');

// Cookie parser
app.use(cookieParser());

app.use('/dentists', dentists);
app.use('/auth', auth);
app.use('/bookings', bookings);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log( `Error: ${err.message}` ); 
    //Close server & exit process 
    server.close(() => process.exit(1));
});