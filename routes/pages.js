var express = require('express'),
    router = express.Router();

    // Importing page models
    var Page = require('../models/page');
    var Product = require('../models/product');

    /* Below route if just for the home page and for 
    all the others next route is the get route */
    router.get('/', (req, res) => {
        Page.findOne({slug: 'home'}, (err, page) => {
            if(err) console.log(err);
            if(page) {
                Product.find({}, (e, products) => {
                    if(e) {console.log(e)};
                    res.render('index', {
                        title: page.title,
                        products: products
                    });
                });
            }
        });
    });

    // Below is the get route for all the other pages
    // Get page
    router.get('/:slug', (req, res) => {
        var slug = req.params.slug;
        Page.findOne({slug: slug}, (err, page) => {
            if(err) console.log(err);
            if(!page) {
                res.redirect('/');
            }else {
                res.render('otherPages', {
                    title: page.title,
                    content: page.content,
                });
            }
        });
    });

module.exports = router;