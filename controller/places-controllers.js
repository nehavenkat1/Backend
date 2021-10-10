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

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(place => place.creator === userId)
   
    if(!places || places.length === 0) {
        return next(new HttpError('Could not find places for given user id.', 404))
    }
    res.json({places})
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

const updatePlaceById = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid input.', 422)
    }
    const { title, description } = req.body
    const placeId = req.params.pid

    const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)}
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid
    if(!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404)
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlace = deletePlace