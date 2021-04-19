const Order = require('../../models/order')
const Product = require('../../models/product')

module.exports = {
    getOrders : (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product','name')
        .exec()
        .then(docs => res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        }))
        .catch(err => {
            res.status(404).json({
                error: err
            })
        })
    },
    postOrders:(req, res, next) => {
        Product.findById(req.body.productId)
            .then(product => {
                if(!product){
                    return res.status(404).json({
                        massage:"Product not found"
                    })
                }
                const order = new Order({
                    quantity: req.body.quantity,
                    product: req.body.productId
                })
                return order.save()
            })
            .then(result => {
                console.log(result)
                res.status(201).json({
                    massage: "order added",
                    request: {
                        type: "GET",
                        url: 'http://localhost:3000/orders'
                    }
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Product not found',
                    error: err
                })
            })
    }
}