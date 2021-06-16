const {Router} = require('express')
const User = require('../models/User')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const  config = require('config')
const router = Router()

// /api/auth/register
router.post(
    '/register',
    [
        // check('email', 'Incorrect email').isEmail(),
        // check('password', 'Minimum password length is 6 chars')
        //     .isLength({min: 6})
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect data on the registration'
                })
            }
            const {email, password} = req.body

            const candidate = await User.findOne({email})
            if (candidate) {
                return res.status(400).json({message: 'Such user already exist'})
            }
           // const hashedPassword = bcrypt.hash(password, 12)
          //  const user = new User({email, password: hashedPassword})
            const user = new User({email, password: password})

            await user.save()
            res.status(201).json({message: 'User created successfully'})

        } catch (e) {
            res.status(500).json({message: 'Something goes wrong (reg)'})
        }
    })

// /api/auth/login
router.post('/login',[
    // check('email', 'Type correct email').normalizeEmail().isEmail(),
    // check('password', 'Type password').exists()
    ],
    async (req, res) => {
     try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
       return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data when logging in system'
       })
      }

      const {email, password} = req.body
      const user = await User.findOne({email})

      if (!user){
       return res.status(400).json({message:'User not found'})
      }

     // const isMatch = await bcrypt.compare(password, user.password)
         const isMatch = password==user.password

      if(!isMatch){
       return res.status(400).json({message:'Wrong password, try again'})
      }

      const token = jwt.sign(
          {userId:user.id},
          config.get('jwtSecret')
      )

      res.json({token, userId: user.id})


     } catch (e) {
      res.status(500).json({message: 'Something goes wrong (log)'})
     }
    })


module.exports = router