const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require ('../models/Bootcamp')
const Course = require('../models/Course')

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults)
})

// @desc      Get a single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }    
    res.status(200).json({success: true, data: bootcamp})
})



// @desc      Create a new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user._id
    // A publisher or admin can add only one bootcamp
    const published_bootcamp = await Bootcamp.find({user: req.body.user}).countDocuments()
    if(published_bootcamp !== 0 && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Can only create one bootcamp, already published a bootcamp`, 400))
    }
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).send({success: true, data: bootcamp})
})

// @desc      Update a single bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Publisher

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    // Make sure user is bootcamp owner 
    if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.iid } is not authorized to update this bootcamp`, 401))
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,  req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({success: true, data: bootcamp})  
})

// @desc      Delete a single bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private

exports.deleteBootcamp = async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

     // Make sure user is bootcamp owner 
     if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id } is not authorized to delete this bootcamp`, 401))
    }

    bootcamp.remove()
    res.status(200).json({success: true, data: {}})  
}

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Public

exports.getBootcampsInRadius = async (req, res, next) => {
    const {zipcode, distance} = req.params
    // Get the latitude and longitude from the geocoder 
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calculate radius using radians
    // Divide distance by radius of Earth
    // Earth radius = 3,963 mi / 6,378.1 km

    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({location: {
        $geoWithin: {
            $centerSphere: [[lng, lat], radius]
        }
    }})

    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})

}

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private

exports.bootcampPhotoUpload = async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    // Make sure user is bootcamp owner 
    if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id } is not authorized to upload a photo on this bootcamp`, 401))
    }

    // Check if file was uploaded
    if(!req.files) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    const file = req.files.file

    // Check if the file is an image
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    // Check if the image size is within the limit
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD/1024} ko`, 400))
    }

    // Create custom file name

    const file_extension = file.mimetype.split('/')[1]
    file.name = `photo_${bootcamp._id}.${file_extension}`
    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async(err) => {
        if(err) {
            console.error(err)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }
        await Bootcamp.findByIdAndUpdate(bootcamp._id, {
            photo: file.name
        })
    })
    res.status(200).json({success: true, data: file.name})  
}