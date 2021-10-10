const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const userRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')


const app = express()

app.use(bodyParser.json())

app.use('/api/places',placesRoutes)
app.use('/api/users', userRoutes)

app.use((req, res, next) => {
    throw new HttpError('could not find this route', 404)
})

app.use((error, req, res, next) => {
    if(res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500).json({message: error.message || 'An unknown error occured!'})
})

mongoose
.connect('mongodb+srv://neha123:neha123@cluster0.21ldn.mongodb.net/places?retryWrites=true&w=majority')
.then(() => {
    //console.log('connected')
    app.listen(5000)
})
.catch(err => {
    console.log(err)
})

