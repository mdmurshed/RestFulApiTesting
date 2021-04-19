const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Order = require('../models/order')
const Product = require('../models/product')
const checkAuth = require('../middleware/chackAuth')

const OrderController  = require('../controllers/order/orders')

router.get('/',checkAuth,OrderController.getOrders)

router.post('/',checkAuth, OrderController.postOrders)
router.get('/:orderId',checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({
                message:'Order id not found'
            })
        }
        res.status(200).json({
            order:order,
            request:{
                type: "GET",
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err=>{
        res.status(404).json({
            error: err
        })
    })
})
router.delete('/:orderId',checkAuth, (req, res, next) => {
    Order.remove({_id:req.params.orderId})
    .exec()
    .then(result=>{
        res.status(200).json({
            massage:'Order deleted',
            request:{
                type:"POST",
                url: "http://localhost:3000/orders",
                body:{
                    productId:"ID" , quantity : "Number"
                }
            }
        })
    })
    .catch(err=>{
        res.status(404).json({
            error: err
        })
    })
})


module.exports = router