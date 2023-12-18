const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const login = asyncHandler(async(req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    //if there is user exists, verify password
    const match = await bcrypt.compare(password, foundUser.password)

    //if the password isn't valid, return error
    if (!match) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s'}
    )

    const refreshToken = jwt.sign(
        {
            "username": foundUser.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    )

    //create secure cookie with refresh token

    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: 'None', //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry set to match refresh token
    })

    //The client application receives the access token. 
    //The server sets the cookie. 
    //The client application with react never handles the refresh token inside of this cookie, but this ensures that when react sends a request to the refresh endpoint, the cookie is sent along with it. 
    res.json({ accessToken }) 
})

const refresh = (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    //now you need to verify the token

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET, 
        asyncHandler(async(err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const foundUser = await User.findOne({ username: decoded.username })

            if(!foundUser) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s'}
            )

            res.json({ accessToken })
        })
    )

}

const logout = (req, res) => {

}