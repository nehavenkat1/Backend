const uuid = require('uuid')
const  { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the tallest buildings in the world.',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: 'some address',
        creator: 'u1'
    }
]

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError(
            'Something went wrong. Could not find place',
            500
        )
        return next(error)
    }
    
    
    if(!place) {
        const error = new HttpError('Could not find a place.', 404)
        return next(error)
    }
    res.json({place : place.toObject({getters: true})})
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    
    let places
    try {
        places = await Place.find({ creator: userId })
    } catch (err) {
        const error = new HttpError('Fetching places problem.', 500)
        return next(error)
    }
   
    if(!places || places.length === 0) {
        return next(new HttpError('Could not find places for given user id.', 404))
    }
    res.json({places: places.map(place => place.toObject({ getters: true }))})
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid input. Please check your data.', 422)
    }
    const { title, description, address, creator } = req.body
    let coordinates = getCoordsForAddress(address)
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.history.com%2F.image%2Far_4%3A3%252Cc_fill%252Ccs_srgb%252Cfl_progressive%252Cq_auto%3Agood%252Cw_1200%2FMTU3ODc3NjU2NzUxNTgwODk1%2Fthis-day-in-history-05011931---empire-state-building-dedicated.jpg&imgrefurl=https%3A%2F%2Fwww.history.com%2Fthis-day-in-history%2Fempire-state-building-dedicated&tbnid=rtrjrk49tcC3iM&vet=12ahUKEwilj6OWjb3zAhVGALcAHTylBggQMygDegUIARDTAQ..i&docid=5nQp3KfRr6LG2M&w=1200&h=900&q=empire%20state%20building&ved=2ahUKEwilj6OWjb3zAhVGALcAHTylBggQMygDegUIARDTAQ',
        creator
    })

    try {
        await createdPlace.save()
    } catch(err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        )
        return next(error)
    }
    

    res.status(201).json({place: createdPlace})
}

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid input.', 422)) 
    }
    const { title, description } = req.body
    const placeId = req.params.pid

    let place

    try {
        place = await Place.findById(placeId)
    } catch(err) {
        const error = new HttpError('Something went wrong. Could not update', 500)
        return next(error)
    }
    place.title = title
    place.description = description

    try {
        await place.save()
    } catch(err) {
        const error = new HttpError('Something went wrong. Could not update place', 500)
        return next(error)
    }

    res.status(200).json({place: place.toObject({ getters: true })})
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid
    
    let place
    try {
        place = await Place.findById(placeId)
    } catch(err) {
        const error = new HttpError('Could not find the place', 500)
        return next(error)
    }

    try {
        await place.remove()
    } catch(err) {
        const error = new HttpError('Could not delete the place.', 500) 
        return next(error)
    }

    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlace = deletePlace