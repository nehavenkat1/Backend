const express = require('express')
const { check } = require('express-validator')

const usersControllers = require('../controller/users-controllers')

const router = express.Router()

router.get('/', usersControllers.getUsers)

router.post(
    '/signup', 
    [
        check('name')
        .not()
        .isEmpty(),
        check('email')
        .normalizeEmail()
        .isEmail(),
        check('password')
        .isLength({ min: 6})
    ],
    usersControllers.signup)

router.post(
    '/login', 
    [
        check('email')
        .normalizeEmail()
        .isEmail(),
        check('password')
        .not()
        .isEmpty()
    ],
    usersControllers.login)

module.exports = router