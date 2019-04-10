var express = require('express'),
    router = express.Router();

    // Importing  models
    var Product = require('../models/product');
    var Category = require('../models/category');

    // Getting all products
    router.get('/', (req, res) => {
        Product.find({}, (err, products) => {
            if(err) console.log(err);
                res.render('all_products', {
                    title: "All Products",
                    products: products,
                });
        });
    });

    // Get products by categories

    router.get('/:category', (req, res) => {

        let categorySlug = req.params.category;
        Category.findOne({slug: categorySlug}, (err, c) => {
            Product.find({category: categorySlug}, (err, products) => {
                if(err) console.log(err);
                    res.render('cat_products', {
                        title: c.title,
                        products: products,
                    });
            });
        });
    });

module.exports = router;