const HttpError = require('../models/http-error')

const DUMMY_PLACES = [
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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(place => place.id === placeId)
    if(!place) {
        throw new HttpError('Could not find a place.', 404)
    }
    res.json({place})
}

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid
    const place = DUMMY_PLACES.find(place => place.creator === userId)
    if(!place) {
        return next(new HttpError('Could not find a place for given user id.', 404))
    }
    res.json({place})
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId