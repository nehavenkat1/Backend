const uuid = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Neha',
        email: 'test@test.com',
        password: 'test'
    }
]

const getUsers = (req, res, next) => {
    res.json({ users: DUMMY_USERS })
}

const signup = (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        throw new HttpError('Please enter proper values.', 422)
    }
    const { name, email, password } = req.body

    const hasUser = DUMMY_USERS.find(u => u.email === email)
    if(hasUser) {
        throw new HttpError('Could not create user, email already exists.', 422)
    }

    const createdUser = {
        id: uuid.v4(),
        name,
        email,
        password
    }
    res.status(201).json({users: createdUser})
}

const login = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)

    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user', 401)
    }

    res.json({message: 'Logged In!'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login