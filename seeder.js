const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// load env variables
dotenv.config({path: './config/config.env'})

// Load our models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

// Read JSON files
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

// Import into DBs
const importData = async () => {
    try {
        await User.create(users)
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await Review.create(reviews)
        console.log(`Data imported`.green.inverse)
        process.exit()
    }
    catch(err) {
        console.log(err)
        process.exit()
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Review.deleteMany()
        await Course.deleteMany()
        await Bootcamp.deleteMany()
        await User.deleteMany()
        console.log(`Data destroyed`.red.inverse)
        process.exit()
    }
    catch(err) {
        console.log(err)
        process.exit()
    }
}

// Execute one of the two methods by checking the arguments passed 
console.log(process.argv)
if(process.argv[2] === '-i') {
    importData()
}
else if (process.argv[2] === '-d') {
    deleteData()
}