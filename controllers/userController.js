const user = require('../models/User');
const asyncHandler = require('express-async-handler')
const bcrypt =  require('bcrypt');
const User = require('../models/User');

//READ METHOD from CRUD 
//controllers don't have a next, unlike middleware

const getAllUsers = asyncHandler(async (req, res) => {

    const users = await user.find().select('-password').lean()
    //exclude password
    if (!users) {
        return res.status(400).json({ message: 'No users found' })    
    }

    res.json(users)
})

//CREATE METHOD from CRUD 
//controllers don't have a next, unlike middleware

const createNewUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body

    //confirm data has been entered
    if (!username || !password) {
        return res.status(400).json({ message: 'All input fields are required' })
    }

    //check for duplicate user

    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'This username already exists.' })
    }

    //hash password and add 10 salt rounds for better security

    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashedPwd }

    //create and store new user

    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ message: `New user ${username} created.`})
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }

})

//READ PATCH/PUT/UPDATE from CRUD 
//controllers don't have a next, unlike middleware

const updateUser = asyncHandler(async (req, res) => {

})

//DELETE METHOD from CRUD 
//controllers don't have a next, unlike middleware

const deleteUser = asyncHandler(async (req, res) => {

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
