const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require ('../models/Course')
const Bootcamp = require('../models/Bootcamp')


// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async(req, res, next) => {
    const bootcampId = req.params.bootcampId

    if(bootcampId) {
        const courses =  Course.find({'bootcamp': bootcampId}) 
        res.status(200).json({success: true, count: courses.length, data: courses})
    }
    else {
    res.status(200).json(res.advancedResults)
    }
   
})

// @desc      Get single course
// @route     GET /api/v1/courses/:courseId
// @access    Public
exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.courseId).populate({
        path:'bootcamp',
        select: 'name description'
    })
    if(!course) {
        return new ErrorResponse(`Course with id ${req.params.courseId} not found`, 404)
    }
    res.status(200).json({success: true, data: course})
})

// @desc      Create a new course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private

exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next( new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`, 404))}

    if(bootcamp.user.toString()!== req.user.id && req.user.role!== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to create a course in bootcamp ${bootcamp._id}`,401))
    }
    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    })

})


// @desc      Update a single course
// @route     PUT /api/v1/courses/:courseId
// @access    Publisher

exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.courseId)
    if(!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404))
    }
    if(course.user.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to update course ${course._id}`,401))
    }
    res.status(200).json({success: true, data: course})
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
})

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId)
    if(!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404))
    }
    if(course.user.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to delete course ${course._id}`,401))
    }

    await course.remove()
    res.status(200).json({success: true, data: {}})
})

