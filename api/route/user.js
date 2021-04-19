const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {
    User.find()
        .exec()
        .then(doc => {
            res.status(200).json({
                NumberOfUser: doc.length,
                doc: doc
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(usr => {
            if (usr.length >= 1) {
                return res.status(409).json({
                    massage: "Mail exists",
                    user: usr
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            email: req.body.email,
                            password: hash
                        })
                        user.save()
                            .then(result => {
                                res.status(200).json({
                                    massage: 'Create a user',
                                    result: result
                                })
                            })
                            .catch(err => {
                                res.status(404).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    massage: "Auth failed"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, "secret" ,
                        {
                            expiresIn: "1h"
                        });
                    return res.status(200).json({
                        massage: 'Auth successful',
                        token: token
                    })
                }
                res.status(401).json({
                    massage: 'Auth failed'
                })
            })
        })
        .catch(err => {
            res.status(404).json({
                error: err
            })
        })
})

router.delete('/:userId', (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                massage: 'user deleted',
                result: result
            })
        })
        .catch(err => {
            res.status(404).json({
                error: err
            })
        })
})

module.exports = router