const path = require('path')
const dotenv = require('dotenv')
const colors = require('colors')
const express = require('express')
const morgan = require('morgan')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')



// Load env vars 
dotenv.config({path: './config/config.env'})

// Connect to database
connectDB()


// Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const reviews = require('./routes/reviews')

const app = express()

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// File uploading
app.use(fileupload())

// To remove data, mongo injections
app.use(mongoSanitize());

// Security headers
app.use(helmet());

// XSS protection
app.use(xss())

// Rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 100,

})

app.use(limiter)

// Protection from http parameter polution
app.use(hpp())

// Cross origin resource sharing
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname,'public')))

// Mount the router to a specific URL
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/reviews', reviews)

app.use(errorHandler)

const PORT = process.env.PORT || 5000


const server = app.listen(PORT, () => {
    console.log('App listening on port'.yellow.bold, PORT);
});

// Handle unhandled promise rejections 
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err}`.red)
    // Close server and exist process
    server.close(() => process.exit(1))
})