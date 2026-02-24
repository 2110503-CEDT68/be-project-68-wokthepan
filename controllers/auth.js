const User = require('../models/User');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const {name, email, tel, password, role} = req.body;

        // Create user
        const user = await User.create({
            name,
            telephone,
            email,
            tel,
            password,
            role
        });

        // Create token for user
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success: true, token});
        sendTokenResponse(user, 200, res);
    } catch(err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//access    Public
exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    // Valideate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false, 
            message: 'Please provide an email and password'
        });
    }

    const user = await User.findOne({email}).select('+password');

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credential'
        });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credential'
        });
    }

    // const token = user.getSignedJwtToken();
    // res.status(200).json({success: true, token});
    sendTokenResponse(user, 200, res);
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
}

//@desc      Get current Logged in user
//@route     GET /api/v1/auth/me
//@access    Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
};