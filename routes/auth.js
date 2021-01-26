const express = require('express')
const { protect } = require('../middleware/auth')

const { register,
        login,
        getMe,
        forgotPassword,
        resetPassword, 
        updateDetails,
        updatePassword,
        logout} = require('../controllers/auth')

const userRouter = require('./users')
const router = express.Router()

router.use('/users', userRouter)

router.post('/register', register)
router.post('/login', login)
router.get('/logout', protect, logout)

router.get('/me', protect, getMe)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resetToken', resetPassword)
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, updatePassword)


module.exports = router