const {User} = require('../models/user.js')
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();


router.get('/', (req, res) => {
    User.find().select('-passwordHash')
        .then(users => {
            res.status(200).json({users})
        })
        .catch(err => res.status(500).json({message: "Server Error", error: err}))
});

router.get('/:id', async (req, res) => {
    User.findById(req.params.id).select('-passwordHash')
        .then(user => {
            res.status(200).json(user)
        })
        .catch(err => res.status(500).json({message: 'Server Error', error: err}))

});

router.get('/get/count', (req, res) => {
    User.countDocuments((count) => count)
        .then(count => {
            res.status(200).json({userCount: count})
        })
        .catch(errr => res.status(500).json({error: err}))
});

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user =>{
            if (user) {
                res.status(200).json({message: 'user deleted'})
            } else {
                res.status(404).json({message: 'user not found'})
            }
        })
        .catch(err => res.status(500).json({message: 'server error', error: err}))
})

router.post('/register', (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user.save()
        .then(user => {
            res.status(201).json({user: user})
        })
        .catch(err => res.status(500).json({message: 'Server Error', error: err}))
});

router.post('/login', (req, res) => {
    const user = {}
    User.findOne({email: req.body.email})
        .then((user) => {
            if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
                const token = jwt.sign(
                    {
                        user:user.id,
                        isAdmin: user.isAdmin
                    },
                    process.env.SECRET,
                    {expiresIn: '1d'}
                )
                res.status(200).json({user: user.email, token: token})
            } else {
                res.status(400).json({message: 'wrong password'})
            }
        })
        .catch(err => res.status(400).json({message: 'cannot find user', error: err}))
})


module.exports = router;

