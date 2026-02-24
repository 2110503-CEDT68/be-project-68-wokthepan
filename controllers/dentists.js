const Booking = require('../models/Booking')
const Dentist = require('../models/Dentist');

//@desc     Get all dentists 
//@route    GET /dentists
//@access   Public
exports.getDentists = async (req, res, next) => {
    let query;

    // Copy req.query and extract to array of key value
    const reqQuery = {...req.query};
    
    // Field to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over remove field
    removeFields.forEach(param => delete reqQuery[param]);

    // Create quert string
    let queryStr = JSON.stringify(reqQuery); 
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    console.log(queryStr);

    query = Dentist.find(JSON.parse(queryStr)).populate('bookings');

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Dentist.countDocuments();
        query = query.skip(startIndex).limit(limit);
        // Execute query
        const dentists = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        res.status(200).json({
            success:true, 
            count: dentists.length,
            data: dentists
        });
    } catch(err) {
        console.log(err.stack);
        res.status(400).json({success: false});
    }
};

//@desc     Get a hospital 
//@route    GET /api/v1/hospitals/:id
//@access   Public
exports.getDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id).populate('bookings');

        if (!dentist) {
            return res.status(400).json({success: false});
        }
        res.status(200).json({success:true, data: dentist});
    } catch(err) {
        console.log(err.stack);
        res.status(400).json({success: false});
    }
};

//@desc     Create a new hospital 
//@route    POST /api/v1/hospitals
//@access   Private
exports.createDentist = async (req, res, next) => {
    const dentist = await Dentist.create(req.body);
    res.status(201).json({
        success: true,
        data: dentist
    });
};

//@desc     Update a hospital 
//@route    PUT /api/v1/hospitals/:id
//@access   Private
exports.updateDentist = async (req, res, next) => { 
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({success: false});
        }
        res.status(200).json({success:true, data: dentist});
    } catch(err) {
        console.log(err.stack);
        res.status(400).json({success: false});
    }
    
};

//@desc     Delete a hospital 
//@route    DELETE /api/v1/hospitals/:id
//@access   Private
exports.deleteDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            res.status(400).json({
                success: false,
                message: `Dentist not found with id of ${req.params.id}`
            });
        }
        await Booking.deleteMany({dentist: req.params.id});
        await Dentist.deleteOne({_id: req.params.id});

        res.status(200).json({success:true, data: {}});
    } catch(err) {
        console.log(err.stack);
        res.status(400).json({success: false});
    }
    
};
