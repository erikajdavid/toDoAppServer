const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT);

router.route('/') // CRUD
// direct to controller
    .get(userController.getAllUsers) //read
    .post(userController.createNewUser) //create
    .patch(userController.updateUser) //update
    .delete(userController.deleteUser) //delete

module.exports = router;