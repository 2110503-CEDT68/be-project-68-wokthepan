const mongoose = require('mongoose');
const Dentist = require('./Dentist');

const BookingSchema = new mongoose.Schema({
    bookDate: {
        type: Date,
        required: [true, 'Please add a date for the booking']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dentist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dentist',
        required: [true, 'Please specify the preferred dentist']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);