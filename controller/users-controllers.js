const uuid = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')

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

const signup = async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return next(new HttpError('Please enter proper values.', 422)) 
    }
    const { name, email, password, places } = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch(err) {
        const error = new HttpError('Could not sign up . Looks like something went wrong.', 500)
        return next(error)
    }

    if(existingUser) {
        const error = new HttpError('User exist already, please log in.', 422)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.vectorstock.com%2Fi%2F1000x1000%2F30%2F97%2Fflat-business-man-user-profile-avatar-icon-vector-4333097.jpg&imgrefurl=https%3A%2F%2Fwww.vectorstock.com%2Froyalty-free-vector%2Fflat-business-man-user-profile-avatar-icon-vector-4333097&tbnid=4kXGls3qUNG46M&vet=12ahUKEwjIkcTK6MPzAhUMkksFHcaXDLgQMygMegUIARDkAQ..i&docid=u1SY3va6wsUW9M&w=1000&h=1080&q=user%20image&ved=2ahUKEwjIkcTK6MPzAhUMkksFHcaXDLgQMygMegUIARDkAQ',
        password,
        places
    })

    try {
        await createdUser.save()
    } catch(err) {
        const error = new HttpError('Signing up user failed.', 500)
        return next(error)
    }
    res.status(201).json({users: createdUser.toObject({getters: true})})
}

const login = (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        throw new HttpError('Could not login.', 422)
    }
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)

    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user. Looks like there is no such user available.', 401)
    }

    res.json({message: 'Logged In!'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login