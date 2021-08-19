const {Product} = require('../models/product.js');
const {Category} = require('../models/category.js');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

// ALLOWED IMAGE FILE TYPES
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
};


// STORAGE FOR IMAGES
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if(isValid) {
            uploadError= null
        };
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })


// router.get('/', async (req, res) => {
//     const productList = await Product.find().populate('category');

//     if (!productList) {
//         res.status(500).json({success: false})
//     }
//     res.status(200).json(productList)
// });

router.get('/', async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({success: false})
    }
    res.status(200).json(productList)
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');


    if (!product) {
        res.status(500).json({success: false});
    };

    res.status(200).json({ product: product})

});


router.post('/', uploadOptions.single('image'), async (req, res) => {
    let category = ''
    await Category.findById(req.body.category)
        .then((c) => {
            console.log(c)
            category = c._id
        })
        .catch(err => res.status(400).json({message: "invalid category", err}))
    
    
    const file = req.file;
    if(!file) return res.status(400).json({message: 'No image in the request'})
    const fileName = req.file.filename;

    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.descrption,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body. numReviews,
        isFeatured: req.body.isFeatured
    });

    await product.save()
        .then((product) => {
            res.status(201).json(product)
        })
        .catch(err => res.status(500).json({message: "The product cannot be created", err}))
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({message: "Invalid Product Id"})
    };

    let category = ''
    await Category.findById(req.body.category)
        .then((c) => {
            category = c._id
        })
        .catch(err => res.status(400).json({message: "invalid category", err}));


    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).json({message: 'Invalid Product'});

    const file = req.file;
    let imagepath;

    if(file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = product.image
    }

    Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.descrption,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body. numReviews,
            isFeatured: req.body.isFeatured
        },
        {new: true}
    )
        .then(product => {
            res.status(201).json(product)
        })
        .catch(err => res.status(500).json({error: err, message: 'The product cannot be modified'}))

});

router.delete('/:id', async (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then(product => {
            res.status(200).json({success: true, message: 'The product has been removed'})
        })
        .catch(err => res.status(500).json({message: 'server error', error: err}))
});

router.get('/get/count', (req, res) => {
    Product.countDocuments(count => count)
        .then(count => {
            res.status(200).json({count: count});
        })
        .catch(err => res.status(500).json({message: 'cannot get count'}))
});

router.get('/get/featured/:count', (req, res) => {
    Product.find({isFeatured: true}).limit(req.params.count? +req.params.count : 0)
        .then(featured => {
            res.status(200).json({featured: featured});
        })
        .catch(err => res.status(500).json({message: 'cannot get featured'}))
});

router.put('/gallery-images/:id', uploadOptions.array('images',10), async (req,res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({message: "Invalid Product Id"})
    };

    const files = req.files
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    console.log(files)
    if(files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }
    

    Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new: true}
    )
        .then(product => {
            res.status(201).json(product)
        })
        .catch(err => res.status(500).json({error: err, message: 'The product cannot be modified'}))


})

module.exports = router;

