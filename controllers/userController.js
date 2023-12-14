const user = require('../models/User');
const asyncHandler = require('express-async-handler')
const bcrypt =  require('bcrypt');
const User = require('../models/User');

//Controllers are responsible for handling incoming requests and retuning responses to the client. 

//READ METHOD from CRUD 
//controllers don't have a next, unlike middleware

const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find().select('-password').lean()
    //exclude password
    if (!users?.length) {
        //optional chaining here. this is checking if users exists before looking at the length property
        return res.status(400).json({ message: 'No users found' })    
    }

    res.json(users)
})

//CREATE METHOD from CRUD 

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

const updateUser = asyncHandler(async (req, res) => {

    const { id, username, password } = req.body

    //confirm data has been enteres

    if (!id || !username || !password) {
        return res.status(400).json({ message: 'All input fields are required.' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const duplicate = await User.findOne({ username }).lean().exec()
    //allow updates to the original user

    if (duplicate && duplicate?.id.toString() !== id) {
        //then you have a duplicate 
        return res.status(409).json({ message: 'This username already exists.' })
    }

    user.username = username

    if (password) {
        //hash passward
        user.password = await bcrypt.hash(password, 10) //10 salt rounds
    }

    const updateUser = await user.save()

    res.json({  message: `${updateUser.username} updated.`})

})

//DELETE METHOD from CRUD 

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({ message: 'User ID is required.' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted.`

    res.json(reply)

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
