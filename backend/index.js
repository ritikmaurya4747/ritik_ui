import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { error, log } from 'console';

const app = express();

dotenv.config();
const PORT  = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI

const corsOptions = {
    origin: ['https://styleboom-frontend.onrender.com', 'https://styleboom-admin.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions)); // Apply CORS globally

app.use(express.json());


// Database Connection With MongoDB
try {
    await mongoose.connect(MONGODB_URI,{
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        tls: true,  // Enable TLS/SSL
        tlsAllowInvalidCertificates: true ,
    })
    console.log("Connected to mongoDB")
} catch (error) {
    console.log("Error :" + error);
    
}

// API Creation 

app.get('/', (req,res)=>{
    res.send("Express App is Running At 4000")
})

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req,file,cb) => {
        return cb(null,`${file.fieldname}${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

// Creating Upload Endpoint for images
app.use('/images',express.static('upload/images'))

app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `https://styleboom-c.onrender.com/images/${req.file.filename}`
    });
});


// Schema for creating products   ( 05:30:10 )
const Product = mongoose.model('Product',{
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
})

app.post('/addproduct', async (req,res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }else{
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    })
    console.log(product);
    await product.save()
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API For deleting Products
app.post('/removeproduct', async (req,res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API fro getting all products 
app.get('/allproducts', async (req,res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products)
})

// Schema creating for User Model
const Users = mongoose.model("Users",{
    name:{
        type: "String"
    },
    email:{
        type: "String",
        unique: true
    },
    password:{
        type: "String"
    },
    cartData:{
        type: Object
    },
    date:{
        type: Date,
        default: Date.now
    }
})

// Creating Endpoint for registering the user
app.post('/signup', async (req,res) =>{
    // Agar pahale se user hai to use signup mat karne do
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
       cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData: cart
    })
    // Save the user into databse
    await user.save();

    // JWT authentication
    const data = {
        user:{
            id:user.id
        }
    }

    // Creating Token id
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

// Creating endpoint for user login 
app.post('/login', async (req,res) => {
    // Agar user hain to use login karne do email se check kar rahe hain ham
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

// Creating endpoint for newcolletions data
app.get('/newcollection',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection fatched");
    res.send(newcollection);
})

// Creating endpoint for popular in women section
app.get('/popularinwomen',async (req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log(popular_in_women);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
    console.log(popular_in_women);
    
})


//Creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }else{
        try {
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({error:"please authenticate using valid token"})
        }
    }
}

// Creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser , async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added")
})

// Creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if( userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed")
})

// Creating endpoint to get cartdata
app.post('/getcartdata', fetchUser, async(req,res)=> {
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})


app.listen(PORT,(error)=>{
    if(!error){
        console.log(`Server is listening on ${PORT}`);
    }
    else{
        console.log("Error : " + error); 
    }
})
