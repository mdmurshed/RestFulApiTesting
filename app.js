const express = require('express');

const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
  

// mongodb connection
var url = 'mongodb+srv://murshed:'+process.env.MONGO_ATLAS_PW+ '@cluster0.kqai4.mongodb.net/'+process.env.DATABASE_NAME+'?retryWrites=true&w=majority';
// console.log(url)
mongoose.connect(url,{
     useNewUrlParser:true,
     useCreateIndex:true,
     useUnifiedTopology:true,
})
// if onec connected
// const connection = mongoose.connection;
// connection.once('open',()=>{
//      console.log("Database conncected ")
// })
// every routing logs
app.use(morgan('dev'));
//static function 
app.use('/uploads',express.static('uploads'))
// body parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// desable the port 
app.use((req,res,next)=>{
     res.header('Access-Control-Allow-Origin','*')
     res.header('Access-Contorl-Allow-Headers','Origin,X-Requested-With, Content-Type,Accept,Authorization')
     if(req.method === 'OPTIONS'){
          res.header('Access-Control-Allow-Methods','PUT, POST, DELETE, PATCH, GET')
          return res.status(200).json({})
     }
     next();
})


// Router which should handle requests
app.use('/user',require('./api/route/user'))
app.use('/products',require('./api/route/products'))
app.use('/orders',require('./api/route/orders'))

//  Error handeling
app.use((req,res,next)=>{
     const error = new Error('M.D Not Found');
     error.status = 404;
     next(error);  
})
app.use((error,req,res,next)=>{
     res.status(error.status || 500)
     res.json({
          error:{
               message:error.message
          }
     })
})

module.exports = app;