const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');

//@desc     Get all bookings
//@route    GET /bookings
//@access   Public
exports.getBookings = async (req, res, next) => {
    let query;

    // Users can only see their bookings!
    if (req.user.role !== 'admin') {
        query = Booking.find({user: req.user.id}).populate({
            path: 'dentist',
            select: 'name yearsOfExperience areaOfExpertise'
        });
    } else { // Admin can see all
        if (req.params.dentistId) {
            console.log(req.params.dentistId);
            query = Booking.find({ dentist: req.params.dentistId }).populate({
                path: "dentist",
                select: "name yearsOfExperience areaOfExpertise",
            });
        } else {
            query = Booking.find().populate({
                path: 'dentist',
                select: 'name yearsOfExperience areaOfExpertise'
            });
        }
    }

    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: 'Can not find Booking'
        });
    }
};

//@desc     Get single booking
//@route    GET /bookings/:id
//@access   Public
exports.getBooking = async (req, res, next) => {
    let query= Booking.findById(req.params.id).populate({
        path: 'dentist',
        select: 'name yearsOfExperience areaOfExpertise'
    });

    try {
        const booking = await query;

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: 'Can not find booking'
        });
    }
};

//@desc     Add single booking
//@route    POST /dentists/:dentistId/bookings/
//@access   Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.dentist = req.params.dentistId;

        const dentist = await Dentist.findById(req.params.dentistId);

        if (!dentist) {
             return res.status(404).json({
                success: false,
                message: `No dentist with the id of ${req.params.dentistId}`
            });
        }

        // Add user id to req body
        req.body.user = req.user.id;

        const existedBooking = await Booking.find({user: req.user.id});
        if (existedBooking.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 1 booking`
            });
        }

        // Check if dentist have appointment with other user
        const dentistSchedule = await Booking.find({ dentist: req.params.dentistId, bookDate: req.body.bookDate });
        if (dentistSchedule.length > 0) {
            return res.status(400).json({
                success: false,
                message: `The dentist ${dentist.name} is already booked on ${req.body.bookDate}. Please choose other.`
            });
        }

        const booking = await Booking.create(req.body);
        res.status(201).json({
            success: true,
            data: booking
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: 'Can not create booking'
        });
    }
};

//@desc     Update booking
//@route    PUT /bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
             return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: "Can not update appointment"
        });
    }
};

//@desc     Delete booking
//@route    DELETE /bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);
        
        if (!booking) {
             return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`
            });
        }
        
        await booking.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: "Can not delete booking"
        });
    }
};