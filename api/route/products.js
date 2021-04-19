const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const chackAuth = require('../middleware/chackAuth')
// image uplode the server 
// store the files in server 
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null, file.originalname);
    }
});
const fileFilter = (req,file,cb)=>{
    // reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        return cb(null,true);
    }
    cb(null,false);
}
const uplode = multer({
    storage: storage,
    limits:{fileSize:1024 * 1024 * 5},
    fileFilter:fileFilter
})

router.get('/',(req,res,next)=>{
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs=>{
        console.log(docs)
        const responce = {
            count: docs.length,
            product:docs.map(doc => {
                return {
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    _id:doc._id,
                    request:{
                        type: 'GET',
                        url:"http://localhost:3000/products/" + doc._id
                    }
                }
            })
        }
        res.status(200).json(responce)
    }).catch(err=>{
        consol.log(err)
        res.status(404).json({
            error: err
        })
    })
})
router.post('/',chackAuth,uplode.single('productImage'),(req,res,next)=>{
    // const product = { 
    //     name : req.body.name,
    //     price: req.body.price,
    // }
    console.log(req.file)
    const product = new Product({
        name:req.body.name,
        price:req.body.price,
        productImage: req.file.path
    })
    product
        .save()
        .then(result=>{
         console.log(result),
         res.status(200).json({
            massage:'Post request to /products',
            product: product,
        })
        })
        .catch(err=>{
            console.log(err) 
        })
})
router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc=>{
            console.log("From database",doc)
            if(doc) {res.status(200).json(doc)}
            else {res.status(404).json({message:"no valid entry found"})}
        })
        .catch(err=>{
            console.log(err)
            res.status(500).json({error:err})
        })
    // if(id === 'special'){
    //     res.status(200).json({
    //         massage:'You discovered the special id',
    //         id : id
    //     })
    // }
    // else{
    //     res.status(200).json({
    //         massage:'You id is not matched'
    //     })
    // }
})
router.patch('/:productId',chackAuth,(req,res,next)=>{
    // update data 
    const id = req.params.productId
    const updateOps = req.body
    Product.update({_id:id},{
        $set:updateOps
        
    }).exec()
    .then(result=>{
        console.log(result)
        res.status(200).json(result)
    })
    .catch(err=>{
        console.log(err)
        res.status(404).json({error:err})
    })
})
router.delete('/:productId',chackAuth,(req,res,next)=>{
    const id = req.params.productId;
    // console.log("id : " + id)
    Product.remove({_id:id}).exec()
    .then(result=>{
        res.status(200).json({
            massage:"Product deleted",
            request:{
                url: 'http://localhost:3000/products',
                type:'POST',
                body:{
                    name:'String',
                    price:'Number'
                }
            }
        });
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})



module.exports = router
