var express = require('express'),
    router = express.Router();

    // Importing page models
    var Page = require('../models/page');

    /* Below route if just for the home page and for 
    all the others next route is the get route */
    router.get('/', (req, res) => {
        Page.findOne({slug: 'home'}, (err, page) => {
            if(err) console.log(err);
                res.render('index', {
                    title: page.title,
                    content: page.content,
                });
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
                res.render('index', {
                    title: page.title,
                    content: page.content,
                });
            }
        });
    });

module.exports = router;