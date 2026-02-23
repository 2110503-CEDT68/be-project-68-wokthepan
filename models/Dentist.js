const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    yearsOfExperience: {
        type: Number,
        required: [true, 'Please add years of experience']
    },
    areaOfExpertise: {
        type: [String],
        required: [true, 'Please add at least one area of expertise']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Dentist', DentistSchema)