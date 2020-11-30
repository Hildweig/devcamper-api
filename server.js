const express = require('express')
const dotenv = require('dotenv')

// Load dotenv file content into process.env
dotenv.config({path: './config/config.env'})

// Initialize our app variable with express : create an express application
let app = express()

const PORT = process.env.PORT || 5000
//run server
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))