import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();

dotenv.config();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

const corsOptions = {
    origin: ['https://styleboom-frontend.onrender.com', 'https://styleboom-admin.onrender.com'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection With MongoDB
try {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

// API Creation 
app.get('/', (req, res) => {
    res.send("Express App is Running At 4000");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Creating Upload Endpoint for images
app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `https://styleboom-c.onrender.com/images/${req.file.filename}`
    });
});

// Rest of the code (Products, Users schema, other endpoints, etc.)

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`Server is listening on ${PORT}`);
    } else {
        console.log("Error:", error);
    }
});
